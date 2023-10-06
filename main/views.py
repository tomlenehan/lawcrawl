import os
import time
from uuid import uuid4
import tempfile
import shutil
import json
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.contrib.auth import get_user_model
from django.forms.models import model_to_dict
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from lawcrawl import settings
from .models import CaseConversation, UploadedFile
from lawcrawl.storages import UploadStorage
import jwt
from functools import wraps

import pinecone
import tiktoken
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.callbacks import get_openai_callback
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import (
    ConversationBufferMemory,
    ConversationSummaryMemory,
    ConversationBufferWindowMemory,
)
from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage
)
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.chat_models import ChatOpenAI


# from langchain.chains.conversation.memory import ConversationBufferWindowMemory
from langchain.chains import RetrievalQA

# from langchain.agents import Tool
# from langchain.agents import initialize_agent
import pinecone
import PyPDF2

from main.models import Case
from main.serializers import CaseSerializer
from django.contrib.auth.models import User
from uuid import UUID
from django.core.exceptions import ObjectDoesNotExist


# global progress store
PROGRESS_STORE = {}


def access_token_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        access_token = request.META.get("HTTP_AUTHORIZATION")
        if not access_token or not access_token.startswith("Bearer "):
            return JsonResponse({"error": "Access token required"}, status=401)

        access_token = access_token[7:]

        try:
            decoded_token = jwt.decode(
                access_token, settings.SECRET_KEY, algorithms=["HS256"]
            )
            user_id = decoded_token["user_id"]
            User = get_user_model()
            user = User.objects.get(pk=user_id)
            request.user = user
        except (jwt.InvalidTokenError, User.DoesNotExist, NameError):
            return JsonResponse({"error": "Invalid access token"}, status=401)

        return view_func(request, *args, **kwargs)

    return _wrapped_view


@csrf_exempt
@access_token_required
def get_user_cases(request):
    if request.method == "GET" and request.user.is_authenticated:
        cases = Case.objects.filter(user=request.user).order_by("-uploaded_at")
        serializer = CaseSerializer(cases, many=True)
        return JsonResponse(serializer.data, safe=False)


@csrf_exempt
@access_token_required
def upload_file(request):
    if request.method == "POST" and request.user.is_authenticated:
        # setting progress
        user_id = request.user.id

        uploaded_file_obj = request.FILES["file"]
        case_name = request.POST.get("case_name", None)

        # Create a temporary directory to store the uploaded file
        temp_dir = tempfile.mkdtemp()
        temp_file_path = os.path.join(temp_dir, uploaded_file_obj.name)

        # Save the uploaded file to the temporary location
        with open(temp_file_path, "wb+") as destination:
            for chunk in uploaded_file_obj.chunks():
                destination.write(chunk)

        # Handle case creation
        case, created = Case.objects.get_or_create(name=case_name, user=request.user)

        try:
            # Create embeddings using the file saved in the temporary location
            create_embeddings(file=temp_file_path, case=case, user=request.user)
        except ValueError as e:
            # Clean up: Remove the temporary directory and file
            shutil.rmtree(temp_dir)
            return JsonResponse({"error": str(e)}, status=400)

        # Save the file from the temp location to S3
        case_document_storage = UploadStorage()

        with open(temp_file_path, "rb") as f:
            file_name = case_document_storage.save(uploaded_file_obj.name, f)
        file_url = case_document_storage.url(file_name)

        # Save the URL in the database
        uploaded_file = UploadedFile(case=case, file_url=file_url)
        uploaded_file.save()

        # Clean up: Remove the temporary directory and file
        shutil.rmtree(temp_dir)

        case_dict = model_to_dict(case)

        return JsonResponse(
            {"message": "Success", "case": case_dict, "file_url": file_url}, status=201
        )

    return JsonResponse({"error": "Bad request or not authenticated"}, status=400)


def tiktoken_len(text):
    tokenizer = tiktoken.get_encoding("cl100k_base")
    tokens = tokenizer.encode(text)
    return len(tokens)


def extract_text_from_pdf(pdf_path):
    with open(pdf_path, "rb") as file:
        try:
            # Create a PDF reader
            pdf_reader = PyPDF2.PdfReader(file)
        except PyPDF2.utils.PdfReadError:
            raise ValueError("Invalid PDF file")

        # Check the number of pages
        if len(pdf_reader.pages) > 100:
            raise ValueError("PDF has more than 5 pages!")

        # Extract text from each page
        text = ""
        for page_num in range(len(pdf_reader.pages)):
            text += pdf_reader.pages[page_num].extract_text()
    return text


def create_embeddings(file, case, user):
    openai_api_key = settings.OPENAI_API_KEY
    model_name = "text-embedding-ada-002"

    pinecone_api_key = settings.PINECONE_API_KEY
    pinecone_env = settings.PINECONE_ENV
    index_name = "lawcrawl"
    namespace = "lawcrawl_cases"

    embed = OpenAIEmbeddings(
        model=model_name,
        openai_api_key=openai_api_key,
    )

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=100,
        length_function=tiktoken_len,
        separators=["\n\n", "\n", " ", ""],
    )

    # create embeddings and track tokens
    def create_embeds(texts):
        tokens = sum(tiktoken_len(text) for text in texts)
        embeds = embed.embed_documents(texts)
        return embeds, tokens

    # create/initialize pinecone index
    pinecone.init(api_key=pinecone_api_key, environment=pinecone_env)
    if index_name not in pinecone.list_indexes():
        pinecone.create_index(
            name=index_name,
            metric="cosine",
            dimension=1536,  # 1536 dim of text-embedding-ada-002
        )
    index = pinecone.Index(index_name)

    # Function to upsert embeddings to Pinecone
    def upsert_to_pinecone(texts_to_upsert, metadatas_to_upsert):
        if texts_to_upsert:
            ids = [str(uuid4()) for _ in range(len(texts_to_upsert))]
            embeds, tokens = create_embeds(texts_to_upsert)
            vectors = list(zip(ids, embeds, metadatas_to_upsert))
            index.upsert(vectors=vectors, namespace=namespace, batch_size=batch_limit)
            return sum(tiktoken_len(text) for text in texts_to_upsert)
        return 0

    metadata = {
        "id": str(uuid4()),
        "created_at": str(timezone.now()),
        "case_id": str(case.id),
        "case_uid": str(case.uid),
        "case_name": case.name,
        "user_id": str(user.id),
        "user_email": user.email,
    }

    # get PDF text and check page number limit
    try:
        pdf_text = extract_text_from_pdf(file)
    except ValueError as e:
        print(e)
        raise e

    # split the text
    pdf_texts = text_splitter.split_text(pdf_text)

    pdf_metadatas = [
        {"chunk": j, "text": text, **metadata} for j, text in enumerate(pdf_texts)
    ]

    total_tokens = 0
    start = time.time()
    batch_limit = 50

    # Process and upsert embeddings in batches
    for i in range(0, len(pdf_texts), batch_limit):
        batch_texts = pdf_texts[i : i + batch_limit]
        batch_metadatas = pdf_metadatas[i : i + batch_limit]
        total_tokens += upsert_to_pinecone(batch_texts, batch_metadatas)

    end = time.time()
    duration = end - start
    cost_per_token = 0.0004 * 0.001  # $0.0004 per 1K tokens for text-embedding-ada-002
    total_cost = total_tokens * cost_per_token

    print("total_cost=", total_cost)
    print("duration=", duration)
    print(index.describe_index_stats())


@csrf_exempt
def chat_message(request):
    if request.method == "POST":
        body_unicode = request.body.decode("utf-8")
        body = json.loads(body_unicode)
        message = body.get("message")
        case_uid = body.get("case_uid")
        chat_log = body.get("chat_log")

        try:
            case = Case.objects.get(uid=UUID(case_uid))
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Invalid case UID"}, status=400)

        openai_api_key = settings.OPENAI_API_KEY
        model_name = "text-embedding-ada-002"

        pinecone_api_key = settings.PINECONE_API_KEY
        pinecone_env = settings.PINECONE_ENV
        index_name = "lawcrawl"
        namespace = "lawcrawl_cases"

        llm = ChatOpenAI(
            openai_api_key=openai_api_key,
            model_name="gpt-3.5-turbo",
            temperature=0.7,
            streaming=True
        )

        embed = OpenAIEmbeddings(model=model_name,
                                 openai_api_key=openai_api_key)

        pinecone.init(api_key=pinecone_api_key,
                      environment=pinecone_env)
        index = pinecone.Index(index_name)

        text_field = "text"

        vectorstore = Pinecone(index,
                               embed.embed_query,
                               text_field,
                               namespace)

        # filter the index by case_uid, return top K documents
        filter_query = {"case_uid": case_uid}
        retriever = vectorstore.as_retriever(
            search_kwargs={"filter": filter_query, "k": 4},
            retriever_kwargs={"search_kwargs": {"filter": filter_query}},
            include_values=True,
        )

        qa = ConversationalRetrievalChain.from_llm(
            llm,
            retriever,
            # memory=memory
        )

        # Truncate chat_log to only the last 8 entries (4 Q&A pairs)
        truncated_chat_log = chat_log[-8:]
        
        # Transforming to the expected format
        chat_history = [
            (entry["message"], truncated_chat_log[i + 1]["message"])
            for i, entry in enumerate(truncated_chat_log)
            if entry["user"] == "me" and i + 1 < len(truncated_chat_log)
        ]

        qa = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever
        )
        with get_openai_callback() as cb:
            # response = qa({"question": message, "chat_history": []})
            response = qa(message)
            print(f"Spent a total of {cb.total_tokens} tokens")

        # Append the response to the chat_log
        if chat_log is None:
            chat_log = []

        chat_log.extend(
            [{"user": "me", "message": message}, {"user": "gpt", "message": response}]
        )

        conversation, created = CaseConversation.objects.update_or_create(
            case=case,
            defaults={
                "conversation": chat_log,
                "is_active": True,
                "updated_at": timezone.now(),
            },
        )

        return JsonResponse({"message": response['answer']})


@csrf_exempt
@access_token_required
def fetch_case_conversation(request, case_uid):
    case = get_object_or_404(Case, uid=case_uid)
    # Check if the requested case belongs to the logged-in user
    if request.user != case.user:
        return JsonResponse({"error": "Unauthorized access"}, status=401)

    try:
        conversation = CaseConversation.objects.get(case=case)
        return JsonResponse({"conversation": conversation.conversation})
    except CaseConversation.DoesNotExist:
        return JsonResponse({"error": "Conversation does not exist"}, status=404)
