from lawcrawl import settings
import os
import re
import time
import uuid
from uuid import uuid4
import requests
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
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from django.http import HttpResponseForbidden
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from langchain.document_loaders import PyMuPDFLoader
from .models import CaseConversation, UploadedFile, Case
from lawcrawl.storages import UploadStorage
import jwt
from functools import wraps
import tiktoken
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter,
)
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from langchain.chat_models import ChatOpenAI
from langchain.chains.summarize import load_summarize_chain
from langchain.chains import RetrievalQA, ConversationalRetrievalChain, LLMChain
import pinecone
import boto3
from main.serializers import CaseSerializer
from django.core.exceptions import ObjectDoesNotExist


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
        file_extension = os.path.splitext(uploaded_file_obj.name)[1]
        temp_filename = f"{uuid.uuid4()}{file_extension}"
        temp_file_path = os.path.join(temp_dir, temp_filename)

        # store the file locally
        try:
            with open(temp_file_path, "wb+") as temp_file:
                for chunk in uploaded_file_obj.chunks():
                    temp_file.write(chunk)
            # File has been written to disk at this point
        except IOError as e:
            # Handle the error, e.g., return an error response or raise an exception
            return JsonResponse(
                {"error": f"An error occurred while saving the file: {str(e)}"},
                status=500,
            )

        # sanitize_pdf(temp_file_path, ocred_pdf_path)
        case = Case.objects.create(name=case_name, user=request.user)

        try:
            # Create embeddings from the pdf
            processor = DocumentProcessor(case.uid)
            processor.store_vectors(case, request.user, temp_file_path)
        except ValueError as e:
            # Clean up: Remove the temporary file
            shutil.rmtree(temp_file_path)
            return JsonResponse({"error": str(e)}, status=400)

        # Generate a summary of the doc
        generate_doc_summary(temp_filename, case.uid)

        # Save the file from the temp location to S3
        case_document_storage = UploadStorage()
        # Save the file from the temp location to S3
        with open(temp_file_path, "rb") as f:
            file_name = case_document_storage.save(uploaded_file_obj.name, f)
        file_url = case_document_storage.url(file_name)

        uploaded_file = UploadedFile(case=case, object_key=file_name)
        uploaded_file.save()

        case_dict = model_to_dict(case)

        return JsonResponse({"message": "Success", "case": case_dict}, status=201)

    return JsonResponse({"error": "Bad request or not authenticated"}, status=400)


def tiktoken_len(text):
    tokenizer = tiktoken.get_encoding("cl100k_base")
    tokens = tokenizer.encode(text)
    return len(tokens)


@csrf_exempt
@access_token_required
def chat_message(request):
    if request.method == "POST":
        body_unicode = request.body.decode("utf-8")
        body = json.loads(body_unicode)
        message = body.get("message")
        case_uid = body.get("case_uid")
        chat_log = body.get("chat_log")

        conversation = CaseConversation.objects.get(case__uid=case_uid)
        tmp_file = conversation.temp_file

        try:
            processor = DocumentProcessor(case_uid)
            result = processor.process_chat_message(
                case_uid, message, tmp_file, chat_log
            )
            return JsonResponse({"message": result["answer"]})
        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=400)


# start the chat by highlighting the key points of the doc
def generate_doc_summary(tmp_file, case_uid):
    # message = """Analyze the provided legal document delimited by triple backquotes and summarize the key points. Instead of numbering key points, create new lines. Identify any clauses that are non-standard for this type of agreement and highlight any sections that require further review or clarification."
    message = """Analyze the provided legal document delimited by triple backquotes and summarize the key points. Instead of numbering key points, create new lines. Identify any clauses that are non-standard for this type of agreement and highlight any sections that require further review or clarification. Your response should be less than 200 words."
                   ```{text}```
                SUMMARY:
                """

    # process the summary and save the new convo
    processor = DocumentProcessor(case_uid)
    result = processor.process_chat_message(case_uid, message, tmp_file, [])
    conversation = result["conversation"]

    chat_log = conversation.conversation
    chat_log.append(
        {
            "user": "gpt",
            "message": "I highlighted some items of interest in your doc. "
            "I'm happy to answer any further questions that you may have.",
        }
    )
    conversation.conversation = chat_log
    conversation.save()

    return conversation


@csrf_exempt
@access_token_required
def fetch_conversation(request, case_uid):
    case = get_object_or_404(Case, uid=case_uid)
    # Check if the requested case belongs to the logged-in user
    if request.user != case.user:
        return JsonResponse({"error": "Unauthorized access"}, status=401)

    try:
        conversation = CaseConversation.objects.get(case=case)

        return JsonResponse(
            # {"conversation": conversation.conversation, "file_url": tmp_file_url}
            {"conversation": conversation.conversation}
        )
    except CaseConversation.DoesNotExist:
        return JsonResponse({"error": "Conversation does not exist"}, status=404)


def get_latest_user_message(conversation):
    # Reverse iterate through the conversation list
    for message_obj in reversed(conversation.conversation):
        if message_obj["user"] == "me":
            return message_obj["message"]
    return None


@csrf_exempt
@access_token_required
def process_pdf(request, case_uid):
    try:
        conversation = CaseConversation.objects.get(case__uid=case_uid)

        # Check if the requesting user is associated with the Case
        if conversation.case.user != request.user:
            return HttpResponseForbidden(
                "You don't have permission to access this file."
            )

        user_message = get_latest_user_message(conversation)
        # get relevant chunks for highlighting
        processor = DocumentProcessor(conversation.case.uid)
        docs_and_scores = processor.vectorstore.similarity_search_with_score(
            user_message, k=12, filter=processor.filter_query
        )
        # Highlight the text in each of the top three documents
        docs_with_highest_scores = sorted(
            docs_and_scores, key=lambda x: x[1], reverse=True
        )[:6]

        processor.pull_from_s3(conversation)
        processor.clear_highlights(conversation)

        for doc, score in docs_with_highest_scores:
            processor.highlight_text(doc.page_content, conversation.temp_file)

        file_path = os.path.join(settings.TMP_DIR, conversation.temp_file)
        return FileResponse(open(file_path, "rb"), content_type="application/pdf")

    except CaseConversation.DoesNotExist:
        return HttpResponseForbidden("File not found.")


# def sanitize_pdf(input_pdf_path, output_pdf_path):
#     try:
#         ocrmypdf.ocr(
#             input_pdf_path,
#             output_pdf_path,
#             clean_final=True,
#             force_ocr=True,
#             language="eng",
#         )
#     except Exception as e:
#         raise ValueError(f"Error during OCR processing: {str(e)}")


class DocumentProcessor:
    def __init__(self, case_uid):
        self.case_uid = case_uid
        self.openai_api_key = settings.OPENAI_API_KEY
        self.model_name = "text-embedding-ada-002"
        self.pinecone_api_key = settings.PINECONE_API_KEY
        self.pinecone_env = settings.PINECONE_ENV
        self.index_name = "lawcrawl"
        self.namespace = "lawcrawl_cases"
        self.batch_limit = 50

        self.llm = ChatOpenAI(
            openai_api_key=self.openai_api_key,
            model_name="gpt-4-1106-preview",
            temperature=0.7,
        )

        self.embed = OpenAIEmbeddings(
            model=self.model_name, openai_api_key=self.openai_api_key
        )

        pinecone.init(api_key=self.pinecone_api_key, environment=self.pinecone_env)
        self.index = pinecone.Index(self.index_name)
        self.vectorstore = Pinecone(self.index, self.embed, "text", self.namespace)
        self.filter_query = {"case_uid": str(self.case_uid)}

    @csrf_exempt
    def process_chat_message(self, case_uid, message, tmp_file, chat_log):
        try:
            case = Case.objects.get(uid=case_uid)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Invalid case UID"}, status=400)

        retriever = self.vectorstore.as_retriever(
            search_kwargs={"filter": self.filter_query, "k": 6},
            retriever_kwargs={
                "search_kwargs": {"filter": self.filter_query},
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

        question_generator_chain = LLMChain(llm=self.llm, prompt=prompt)
        doc_chain = load_qa_chain(self.llm, chain_type="stuff")

        qa = ConversationalRetrievalChain(
            combine_docs_chain=doc_chain,
            retriever=retriever,
            question_generator=question_generator_chain,
            return_source_documents=True,
        )
        # Truncate chat_log to the last 4 entries (4 Q&A pairs) but always include the first entry (summary)
        truncated_chat_log = chat_log
        if len(chat_log) > 6:
            truncated_chat_log = [chat_log[0]] + chat_log[-6:]

        # Transforming chat history into OpenAI format
        chat_history = []
        for i, entry in enumerate(
            truncated_chat_log[:-1]
        ):  # Exclude the last entry for pairing
            chat_history.append(
                (entry["message"], truncated_chat_log[i + 1]["message"])
            )

        response = qa({"question": message, "chat_history": chat_history})

        if chat_log is None:
            chat_log = []

        chat_log.extend(
            [
                {"user": "me", "message": message},
                {"user": "gpt", "message": response["answer"]},
            ]
        )

        conversation, created = CaseConversation.objects.update_or_create(
            case=case,
            defaults={
                "conversation": chat_log,
                "temp_file": tmp_file,
                "is_active": True,
                "updated_at": timezone.now(),
            },
        )

        return {"conversation": conversation, "answer": response["answer"]}

    @csrf_exempt
    def pull_from_s3(self, conversation):
        temp_file_path = os.path.join(
            settings.TMP_DIR, os.path.basename(conversation.temp_file)
        )
        if os.path.isfile(temp_file_path) == False:
            uploaded_file = UploadedFile.objects.filter(case=conversation.case).first()
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            )
            bucket_name = UploadStorage.bucket_name
            signed_url = s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket_name, "Key": uploaded_file.object_key},
                ExpiresIn=3600,  # expires in 1 hour
            )

            # Fetch the document from S3 using the signed URL
            response = requests.get(signed_url)
            response.raise_for_status()

            # Save the fetched content as a temporary file
            temp_dir = tempfile.mkdtemp()
            temp_file_path = os.path.join(
                temp_dir, os.path.basename(uploaded_file.object_key)
            )
            with open(temp_file_path, "wb") as temp_file:
                temp_file.write(response.content)

            conversation.temp_file = uploaded_file.object_key
            conversation.save()

    def clear_highlights(self, conversation):
        file_path = os.path.join(settings.TMP_DIR, conversation.temp_file)
        doc = fitz.open(file_path)
        # Clear the highlights
        for page in doc:
            # Remove the annotations (highlights are a type of annotation)
            doc.xref_set_key(page.xref, "Annots", "null")

        # Save the changes by overwriting the original file
        try:
            # if doc is repaired, save to new file
            if doc.is_repaired:
                temp_file_name = f"repaired_{conversation.temp_file}"
                file_path = os.path.join(settings.TMP_DIR, temp_file_name)
                doc.save(file_path, encryption=0)
                conversation.temp_file = temp_file_name
                conversation.save()
            else:
                doc.save(file_path, incremental=1, encryption=0)
        except RuntimeError as e:
            # If there's an error during saving, handle it appropriately
            raise RuntimeError(f"Error saving file: {e}")

        doc.close()
        return file_path

    def highlight_text(self, text_to_highlight, temp_file):
        file_path = os.path.join(settings.TMP_DIR, temp_file)

        if not isinstance(text_to_highlight, str):
            raise ValueError("text_to_highlight must be a string")

        # Regular expression to match the "(PAR Form xxxx)" pattern
        par_form_pattern = re.compile(r"\(PAR Form [^\)]+\)")

        # Regular expression to match strings with at least one alphabetical character
        valid_phrase_pattern = re.compile(r"[A-Za-z]")

        # Remove all instances of "(PAR Form xxxx)" from the text
        text_to_highlight = par_form_pattern.sub("", text_to_highlight)

        # Split the text into phrases, filter based on conditions, remove duplicates by converting to a set, then back to a list
        phrases = list(
            set(
                phrase
                for phrase in map(str.strip, text_to_highlight.splitlines())
                if len(phrase) > 20 and valid_phrase_pattern.search(phrase)
            )
        )

        doc = fitz.open(file_path)

        # Keep track of highlighted phrases to avoid duplicates on different pages
        highlighted_phrases = set()

        for page in doc:
            for phrase in phrases:
                if phrase not in highlighted_phrases:
                    areas = page.search_for(phrase)
                    if areas:
                        for area in areas:
                            highlight = page.add_highlight_annot(area)
                            highlight.set_colors({"stroke": (0.698, 0.874, 0.858)})
                            highlight.update()
                        highlighted_phrases.add(
                            phrase
                        )

        # Save the changes to the PDF
        doc.save(file_path, incremental=1, encryption=0)
        return doc

    # create embeddings and track tokens
    # def generate_vectors(self, texts):
    #     tokens = sum(tiktoken_len(text) for text in texts)
    #     vectors = self.embed.embed_documents(texts)
    #     return vectors, tokens

    # Function to upsert embeddings to Pinecone
    def upsert_to_pinecone(self, texts, metadatas):
        if texts:
            ids = [str(uuid4()) for _ in range(len(texts))]
            vectors = self.embed.embed_documents(texts)
            vector_pkg = list(zip(ids, vectors, metadatas))
            self.index.upsert(
                vectors=vector_pkg,
                namespace=self.namespace,
                batch_size=self.batch_limit,
            )

    # upsert the embeddings to Pinecone
    def store_vectors(self, case, user, temp_file_path):
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=150,
            chunk_overlap=0,
            length_function=tiktoken_len,
            separators=["\n\n", "\n", " ", ""],
        )

        metadata = {
            "id": str(uuid4()),
            "created_at": str(timezone.now()),
            "case_id": str(case.id),
            "case_uid": str(case.uid),
            "case_name": case.name,
            "user_id": str(user.id),
            "user_email": user.email,
        }

        text_chunks = []
        loader = PyMuPDFLoader(temp_file_path)
        docs = loader.load()
        for doc in docs:
            # split the text into chunks
            texts = text_splitter.split_text(doc.page_content)
            for text in texts:
                text_chunks.append(text)

        pdf_metadatas = [
            {"chunk": j, "text": text, **metadata} for j, text in enumerate(text_chunks)
        ]

        # Process and upsert embeddings in batches
        for i in range(0, len(text_chunks), self.batch_limit):
            batch_texts = text_chunks[i : i + self.batch_limit]
            batch_metadatas = pdf_metadatas[i : i + self.batch_limit]
            self.upsert_to_pinecone(batch_texts, batch_metadatas)


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
