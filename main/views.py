import os
import time
import uuid
import datetime
from uuid import uuid4
import requests
import tempfile

import tempfile
import shutil
import json
import fitz
from django.urls import reverse
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.forms.models import model_to_dict
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.core import serializers
from django.http import FileResponse

from langchain.chains.question_answering import load_qa_chain
from langchain.llms.openai import OpenAI
from langchain.prompts import PromptTemplate

from lawcrawl import settings
from .models import CaseConversation, UploadedFile, Case
from lawcrawl.storages import UploadStorage
import jwt
from functools import wraps

import pinecone
import tiktoken
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.callbacks import get_openai_callback
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter,
)
from langchain.document_loaders import PyPDFLoader
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.chat_models import ChatOpenAI
from langchain.chains.summarize import load_summarize_chain
from langchain.chains import RetrievalQA, ConversationalRetrievalChain, LLMChain
import pinecone

import boto3

from main.serializers import CaseSerializer
from uuid import UUID
from django.core.exceptions import ObjectDoesNotExist


# global progress store
PROGRESS_STORE = {}


def access_token_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        access_token = request.META.get(
            "HTTP_AUTHORIZATION"
        )  # Get the 'Authorization' header
        if not access_token or not access_token.startswith("Bearer "):
            return JsonResponse({"error": "Access token required"}, status=401)

        access_token = access_token[7:]  # Remove the 'Bearer '
        user = get_user_model()

        try:
            decoded_token = jwt.decode(
                access_token, settings.SECRET_KEY, algorithms=["HS256"]
            )
            user_id = decoded_token["user_id"]
            user = user.objects.get(pk=user_id)
            request.user = user
        except (jwt.InvalidTokenError, user.DoesNotExist):
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
        temp_dir = settings.TMP_DIR
        uploaded_file_obj = request.FILES["file"]
        case_name = request.POST.get("case_name", None)

        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)

        # Generate a unique filename with the same extension as the uploaded file
        file_extension = os.path.splitext(uploaded_file_obj.name)[
            1
        ]  # Extract the file extension
        obfuscated_filename = f"{uuid.uuid4()}{file_extension}"
        temp_file_path = os.path.join(temp_dir, obfuscated_filename)

        try:
            # Save the uploaded file to the temporary location
            with open(temp_file_path, "wb+") as destination:
                for chunk in uploaded_file_obj.chunks():
                    destination.write(chunk)

        except FileNotFoundError as e:
            return JsonResponse(
                {"error": f"An error occurred while saving the file: {str(e)}"},
                status=500,
            )

        # Handle case creation
        case = Case.objects.create(name=case_name, user=request.user)

        try:
            # Create embeddings from the pdf
            store_vectors(file=temp_file_path, case=case, user=request.user)
        except ValueError as e:
            # Clean up: Remove the temporary directory and file
            shutil.rmtree(temp_dir)
            return JsonResponse({"error": str(e)}, status=400)

        # Save the file from the temp location to S3
        case_document_storage = UploadStorage()

        summary = generate_case_summary(temp_file_path, case.uid)

        # Save the file from the temp location to S3
        with open(temp_file_path, "rb") as f:
            file_name = case_document_storage.save(uploaded_file_obj.name, f)
        file_url = case_document_storage.url(file_name)

        uploaded_file = UploadedFile(case=case, object_key=file_name)
        uploaded_file.save()

        # Clean up: Remove the temporary directory and file
        # shutil.rmtree(temp_dir)

        case_dict = model_to_dict(case)

        return JsonResponse(
            {"message": "Success", "case": case_dict, "file_url": file_url}, status=201
        )

    return JsonResponse({"error": "Bad request or not authenticated"}, status=400)


def fetch_pdf(object_key):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )
    bucket_name = UploadStorage.bucket_name
    signed_url = s3_client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket_name, "Key": object_key},
        ExpiresIn=3600,  # expires in 1 hour
    )

    # Fetch the document from S3 using the signed URL
    response = requests.get(signed_url)
    response.raise_for_status()

    # Save the fetched content as a temporary file
    temp_dir = tempfile.mkdtemp()
    temp_file_path = os.path.join(temp_dir, os.path.basename(object_key))
    with open(temp_file_path, "wb") as temp_file:
        temp_file.write(response.content)

    return temp_file_path


def tiktoken_len(text):
    tokenizer = tiktoken.get_encoding("cl100k_base")
    tokens = tokenizer.encode(text)
    return len(tokens)


# def extract_text_from_pdf(pdf_path):
#     with open(pdf_path, "rb") as file:
#         try:
#             # Create a PDF reader
#             pdf_reader = PyPDF2.PdfReader(file)
#         except PyPDF2.PdfReadError:
#             raise ValueError("Invalid PDF file")
#
#         # Check the number of pages
#         if len(pdf_reader.pages) > 5:
#             if len(pdf_reader.pages) > 100:
#                 raise ValueError("PDF has more than 5 pages!")
#
#         # Extract text from each page
#         text = ""
#         for page_num in range(len(pdf_reader.pages)):
#             text += pdf_reader.pages[page_num].extract_text()
#     return text


def pdf_to_text(pdf_path):
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        raise ValueError("Invalid PDF file")

    if len(doc) > 100:
        raise ValueError("Your file exceeds the 100 page limit!")

    text = ""
    page_texts = []
    for page in doc:
        page_text = page.get_text("text")
        text += page_text
        page_texts.append({"text": page_text, "page_number": page.number})
    # return text, page_texts
    return text


def store_vectors(file, case, user):
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
        chunk_size=256,
        chunk_overlap=0,
        length_function=tiktoken_len,
        separators=["\n\n", "\n", " ", ""],
    )

    # create embeddings and track tokens
    def generate_vectors(texts):
        tokens = sum(tiktoken_len(text) for text in texts)
        vectors = embed.embed_documents(texts)
        return vectors, tokens

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
            vectors, tokens = generate_vectors(texts_to_upsert)
            vector_pkg = list(zip(ids, vectors, metadatas_to_upsert))
            index.upsert(
                vectors=vector_pkg, namespace=namespace, batch_size=batch_limit
            )
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
        pdf_text = pdf_to_text(file)
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


def chat_message(request):
    if request.method == "POST":
        body_unicode = request.body.decode("utf-8")
        body = json.loads(body_unicode)
        message = body.get("message")
        case_uid = body.get("case_uid")
        chat_log = body.get("chat_log")
        tmp_file_path = body.get("tmp_file_path")

        try:
            result = process_chat_message(message, case_uid, tmp_file_path, chat_log)
            return JsonResponse({"message": result})
        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=400)


class ChatProcessor:
    def __init__(self, case_uid):
        self.case_uid = case_uid
        self.openai_api_key = settings.OPENAI_API_KEY
        self.model_name = "text-embedding-ada-002"
        self.pinecone_api_key = settings.PINECONE_API_KEY
        self.pinecone_env = settings.PINECONE_ENV
        self.index_name = "lawcrawl"
        self.namespace = "lawcrawl_cases"

        self.llm = ChatOpenAI(
            openai_api_key=self.openai_api_key,
            model_name="gpt-4",
            temperature=0.7,
        )

        self.embed = OpenAIEmbeddings(
            model=self.model_name,
            openai_api_key=self.openai_api_key
        )

        pinecone.init(api_key=self.pinecone_api_key, environment=self.pinecone_env)
        self.index = pinecone.Index(self.index_name)
        self.vectorstore = Pinecone(self.index, self.embed, "text", self.namespace)
        self.filter_query = {"case_uid": str(self.case_uid)}


    @csrf_exempt
    def process_chat_message(message, case_uid, tmp_file_path, chat_log):
        try:
            case = Case.objects.get(uid=case_uid)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Invalid case UID"}, status=400)

        openai_api_key = settings.OPENAI_API_KEY
        model_name = "text-embedding-ada-002"

        pinecone_api_key = settings.PINECONE_API_KEY
        pinecone_env = settings.PINECONE_ENV
        index_name = "lawcrawl"
        namespace = "lawcrawl_cases"

        # extractionFunctionSchema = {...}

        llm = ChatOpenAI(
            openai_api_key=openai_api_key,
            # model_name="gpt-3.5-turbo",
            model_name="gpt-4",
            temperature=0.7,
        )

        embed = OpenAIEmbeddings(model=model_name, openai_api_key=openai_api_key)

        pinecone.init(api_key=pinecone_api_key, environment=pinecone_env)
        index = pinecone.Index(index_name)

        # vectorstore = Pinecone(index, embed.embed_query, "text", namespace)
        vectorstore = Pinecone(index, embed, "text", namespace)

        # filter the index by case_uid, return top K documents
        filter_query = {"case_uid": str(case_uid)}

        retriever = vectorstore.as_retriever(
            search_kwargs={"filter": filter_query, "k": 4},
            retriever_kwargs={
                "search_kwargs": {"filter": filter_query},
            },
            include_values=True,
        )

        template = (
            "You are friendly AI legal assistant tasked with giving "
            "helpful answers to questions about the user's legal matter "
            "Combine the chat history and follow up question into "
            "a standalone question. Chat History: {chat_history}"
            "Follow up question: {question}"
        )
        prompt = PromptTemplate.from_template(template)
        # llm = OpenAI()
        question_generator_chain = LLMChain(llm=llm, prompt=prompt)
        doc_chain = load_qa_chain(llm, chain_type="stuff")

        qa = ConversationalRetrievalChain(
            combine_docs_chain=doc_chain,
            retriever=retriever,
            question_generator=question_generator_chain,
            return_source_documents=True,
        )

        # Truncate chat_log to only the last 4 entries (4 Q&A pairs) but always include the first entry
        truncated_chat_log = chat_log
        if len(chat_log) > 6:
            truncated_chat_log = [chat_log[0]] + chat_log[-6:]

        # Transforming chat history to the expected format
        chat_history = []
        for i, entry in enumerate(
            truncated_chat_log[:-1]
        ):  # Exclude the last entry for pairing
            chat_history.append((entry["message"], truncated_chat_log[i + 1]["message"]))

        # response = qa({"query": message, "chat_history": chat_history})
        response = qa({"question": message, "chat_history": chat_history})

        # Highlight the relevant text in the PDF
        docs_and_scores = vectorstore.similarity_search_with_score(message, k=3)

        for doc in response["source_documents"]:
            highlight_text(doc.page_content, tmp_file_path)

        if chat_log is None:
            chat_log = []

        chat_log.extend(
            [
                # {"user": "me", "message": message},
                {"user": "gpt", "message": response["answer"]},
            ]
        )

        conversation = CaseConversation.objects.update_or_create(
            case=case,
            defaults={
                "conversation": chat_log,
                "temp_file_path": tmp_file_path,
                "is_active": True,
                "updated_at": timezone.now(),
            },
        )

        return chat_log


    def update_document(case_uid, tmp_file_path, message, response):
        openai_api_key = settings.OPENAI_API_KEY
        model_name = "text-embedding-ada-002"

        pinecone_api_key = settings.PINECONE_API_KEY
        pinecone_env = settings.PINECONE_ENV
        index_name = "lawcrawl"
        namespace = "lawcrawl_cases"

        embed = OpenAIEmbeddings(model=model_name, openai_api_key=openai_api_key)

        pinecone.init(api_key=pinecone_api_key, environment=pinecone_env)
        index = pinecone.Index(index_name)

        # vectorstore = Pinecone(index, embed.embed_query, "text", namespace)
        vectorstore = Pinecone(index, embed, "text", namespace)

        # filter the index by case_uid, return top K documents
        filter_query = {"case_uid": str(case_uid)}

        docs_and_scores = vectorstore.similarity_search_with_score(message, k=3)

        for doc in response["source_documents"]:
            highlight_text(doc.page_content, tmp_file_path)


    def highlight_text(text_to_highlight, file_path):
        if not isinstance(text_to_highlight, str):
            raise ValueError("text_to_highlight must be a string")

        phrases = text_to_highlight.split("\n")

        # Open the original PDF
        doc = fitz.open(file_path)

        for page in doc:
            for phrase in phrases:
                areas = page.search_for(phrase)
                if areas:
                    for area in areas:
                        highlight = page.add_highlight_annot(area)
                        highlight.set_colors(
                            # {"stroke": (0.149, 0.650, 0.603), "fill": (0.501, 0.796, 0.768)}
                            # {"fill": (0.501, 0.796, 0.768)}
                            {"stroke": (0.149, 0.650, 0.603)}
                        )
                        # highlight.set_colors(fill=(0.5, 0.7, 0.7))
                        highlight.update()

        doc.save(file_path, incremental=1, encryption=0)


def generate_case_summary(tmp_file_path, case_uid):
    message = """
    You are an AI legal assistant tasked with giving answers to the user's legal document.
    Please give a numbered list of the key points of the document delimited by triple backquotes.
    ```{text}```
    SUMMARY:
    """

    # answer = process_chat_message(message, case_uid, tmp_file_path, [])
    chat_log = process_chat_message(message, case_uid, tmp_file_path, [])

    # remove the initally summary message from the chat log
    # conversation = CaseConversation.objects.get(case=case_uid)
    # chat_log = conversation.conversation
    # chat_log.pop(0)

    chat_log.append(
        {
            "user": "gpt",
            "message": "I highlighted some of the key point in your doc. "
            "I'm happy to answer any question you may have.",
        }
    )
    conversation = CaseConversation.objects.get(uid=case_uid)
    conversation.conversation = chat_log
    conversation.save()

    return JsonResponse({"message": chat_log})


@csrf_exempt
@access_token_required
def fetch_case_conversation(request, case_uid):
    case = get_object_or_404(Case, uid=case_uid)
    # Check if the requested case belongs to the logged-in user
    if request.user != case.user:
        return JsonResponse({"error": "Unauthorized access"}, status=401)

    try:
        conversation = CaseConversation.objects.get(case=case)
        uploaded_file = UploadedFile.objects.filter(case=case).first()
        tmp_file_url = fetch_pdf(uploaded_file.object_key)
        file_url = reverse("serve_pdf_file", args=[os.path.basename(tmp_file_url)])

        return JsonResponse(
            {"conversation": conversation.conversation, "file_url": file_url}
        )
    except CaseConversation.DoesNotExist:
        return JsonResponse({"error": "Conversation does not exist"}, status=404)


def serve_pdf_file(request, file_path):
    return FileResponse(open(file_path, "rb"), content_type="application/pdf")


# @csrf_exempt
# def ad_view(request):
#     if request.method == "GET":
#         ads = Ad.objects.all()
#         data = [
#             {
#                 'id': ad.id,
#                 'title': ad.title,
#                 'text': ad.text,
#                 'url': ad.url,
#                 'user': ad.user_id
#             }
#             for ad in ads
#         ]
#         return JsonResponse(data, safe=False)
