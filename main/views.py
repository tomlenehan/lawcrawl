from lawcrawl import settings
import os
import re
import time
import uuid
from uuid import uuid4
import requests
import tempfile
import shutil
import logging
import json
import fitz
import ocrmypdf
from fuzzywuzzy import fuzz
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

logger = logging.getLogger("lawcrawl")


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


def extract_text(file_name):
    temp_file_path = os.path.join(settings.TMP_DIR, file_name)
    unknown_char_percentage_threshold = 20
    perform_ocr = False
    extracted_text = ""

    # First, attempt to extract text with MuPDF
    loader = PyMuPDFLoader(temp_file_path)
    docs = loader.load()

    for doc in docs:
        page_text = doc.page_content
        unknown_char_count = page_text.count("�")
        total_char_count = len(page_text)

        # Calculate the percentage of unknown characters
        unknown_char_percentage = (
            (unknown_char_count / total_char_count) * 100 if total_char_count > 0 else 0
        )

        if unknown_char_percentage > unknown_char_percentage_threshold:
            perform_ocr = True
            break
        else:
            extracted_text += page_text

    if perform_ocr:
        try:
            textract_client = boto3.client(
                "textract",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name="us-east-1",
            )
            bucket_name = UploadStorage.bucket_name

            # Start the Textract job to extract text from the PDF
            response = textract_client.start_document_text_detection(
                DocumentLocation={
                    "S3Object": {
                        "Bucket": bucket_name,
                        "Name": file_name,
                    }
                }
            )

            job_id = response["JobId"]
            # Poll the Textract job status until it's completed
            max_poll_attempts = 40  # Adjust the number of polling attempts as needed
            poll_interval_seconds = 5

            for _ in range(max_poll_attempts):
                job_info = textract_client.get_document_text_detection(JobId=job_id)
                status = job_info["JobStatus"]

                if status == "SUCCEEDED":
                    # Textract job has completed successfully
                    break
                elif status == "FAILED":
                    # Textract job has failed
                    raise Exception("Textract job failed")
                else:
                    # Textract job is still in progress, wait and poll again
                    time.sleep(poll_interval_seconds)
            else:
                # Max polling attempts reached without success
                raise Exception(
                    "Textract job did not complete within the expected time"
                )

            # Extract and concatenate the detected text from various block types
            extracted_text = ""
            next_token = None

            # Loop for pagination
            while True:
                # Get results and handle pagination
                if next_token:
                    job_info = textract_client.get_document_text_detection(
                        JobId=job_id, NextToken=next_token
                    )
                else:
                    job_info = textract_client.get_document_text_detection(JobId=job_id)

                for item in job_info["Blocks"]:
                    if (
                        item["BlockType"] in ["LINE", "WORD", "PARAGRAPH", "TABLE"]
                        and "Text" in item
                    ):
                        extracted_text += item["Text"] + (
                            " " if item["BlockType"] == "WORD" else "\n"
                        )
                    elif item["BlockType"] == "PAGE":
                        # Handle text extraction within pages
                        for child_id in item["Relationships"][0]["Ids"]:
                            page_block = next(
                                (
                                    block
                                    for block in job_info["Blocks"]
                                    if block["Id"] == child_id
                                ),
                                None,
                            )
                            if page_block:
                                for child_block in page_block["Relationships"][0][
                                    "Ids"
                                ]:
                                    child_item = next(
                                        (
                                            block
                                            for block in job_info["Blocks"]
                                            if block["Id"] == child_block
                                        ),
                                        None,
                                    )
                                    if (
                                        child_item
                                        and child_item["BlockType"]
                                        in ["LINE", "WORD", "PARAGRAPH", "TABLE"]
                                        and "Text" in child_item
                                    ):
                                        extracted_text += child_item["Text"] + (
                                            " "
                                            if child_item["BlockType"] == "WORD"
                                            else "\n"
                                        )
                # Check if there's a next page
                next_token = job_info.get("NextToken", None)
                if not next_token:
                    break

        except Exception as e:
            logger.error(f"Error in extract_text: {e}")  # Log the error
            return "", False

    return extracted_text.strip(), perform_ocr


@csrf_exempt
@access_token_required
def upload_file(request):
    if request.method == "POST" and request.user.is_authenticated:
        uploaded_file_obj = request.FILES["file"]
        case_name = request.POST.get("case_name", None)
        document_type = request.POST.get("document_type", None)

        case = Case.objects.create(name=case_name, user=request.user)

        temp_file = sanitize_pdf(uploaded_file_obj)
        temp_file_path = os.path.join(settings.TMP_DIR, temp_file)

        # Save the file from the temp location to S3
        case_document_storage = UploadStorage()
        with open(temp_file_path, "rb") as f:
            file_name = case_document_storage.save(temp_file, f)

        # Extract text from the PDF using AWS Textract
        raw_text, performed_ocr = extract_text(file_name)
        if raw_text is None:
            return JsonResponse({"error": "Text extraction failed"}, status=500)

        # if the doc has been OCRed, pull the updated doc from s3
        if performed_ocr:
            try:
                with case_document_storage.open(file_name, "rb") as f:
                    with open(temp_file_path, "wb") as local_file:
                        local_file.write(f.read())
            except Exception as e:
                return JsonResponse(
                    {"error": f"Failed to download file: {str(e)}"}, status=500
                )

        UploadedFile.objects.create(
            case=case,
            object_key=file_name,
            document_type=document_type,
            raw_text=raw_text,
        )

        try:
            # Store vectors in Pinecone
            processor = DocumentProcessor(case.uid)
            processor.store_vectors(case, request.user, raw_text)
        except ValueError as e:
            # Clean up: Remove the temporary file
            shutil.rmtree(temp_file_path)
            return JsonResponse({"error": str(e)}, status=400)

        # Generate a summary of the doc
        processor.process_summary(temp_file, performed_ocr)

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
            result = processor.process_chat_message(message, chat_log, tmp_file)
            return JsonResponse({"message": result["answer"]})
        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@access_token_required
def fetch_conversation(request, case_uid):
    case = get_object_or_404(Case, uid=str(case_uid))
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

        processor = DocumentProcessor(conversation.case.uid)
        processor.pull_from_s3(conversation)
        processor.clear_highlights(conversation)
        processor.fuzzy_highlight(conversation)

        file_path = os.path.join(settings.TMP_DIR, conversation.temp_file)
        return FileResponse(open(file_path, "rb"), content_type="application/pdf")

    except CaseConversation.DoesNotExist:
        return HttpResponseForbidden("File not found.")


def sanitize_pdf(uploaded_file_obj):
    temp_dir = settings.TMP_DIR
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)

    file_extension = os.path.splitext(uploaded_file_obj.name)[1]
    temp_filename = f"{uuid.uuid4()}{file_extension}"
    temp_file_path = os.path.join(temp_dir, temp_filename)

    try:
        with open(temp_file_path, "wb+") as temp_file:
            for chunk in uploaded_file_obj.chunks():
                temp_file.write(chunk)
        if os.path.getsize(temp_file_path) == 0:
            raise IOError("Written file is empty")
    except IOError as e:
        return False, f"Error saving file: {str(e)}"

    try:
        doc = fitz.open(temp_file_path)

        if doc.is_repaired:
            temp_filename = f"repaired_{temp_filename}"
            temp_file_path = os.path.join(temp_dir, temp_filename)
            doc.save(temp_file_path, encryption=0)

        return temp_filename
    except Exception as e:
        return False, f"Error opening file: {str(e)}"


# def ocr_pdf(uploaded_file_obj):
#     temp_dir = settings.TMP_DIR
#     if not os.path.exists(temp_dir):
#         os.makedirs(temp_dir)
#
#     file_extension = os.path.splitext(uploaded_file_obj.name)[1]
#     temp_filename = f"{uuid.uuid4()}{file_extension}"
#     temp_file_path = os.path.join(temp_dir, temp_filename)
#
#     try:
#         with open(temp_file_path, "wb+") as temp_file:
#             for chunk in uploaded_file_obj.chunks():
#                 temp_file.write(chunk)
#         if os.path.getsize(temp_file_path) == 0:
#             raise IOError("Written file is empty")
#     except IOError as e:
#         return False, f"Error saving file: {str(e)}"
#
#     unknown_char_threshold = 50
#     perform_ocr = False
#
#     try:
#         doc = fitz.open(temp_file_path)
#
#         if doc.is_repaired:
#             temp_filename = f"repaired_{temp_filename}"
#             temp_file_path = os.path.join(temp_dir, temp_filename)
#             doc.save(temp_file_path, encryption=0)
#
#         loader = PyMuPDFLoader(temp_file_path)
#         docs = loader.load()
#
#         for page_num in range(min(10, len(docs))):
#             page_text = docs[page_num].page_content
#             if page_text.count("�") > unknown_char_threshold:
#                 perform_ocr = True
#                 break
#
#         doc.close()  # Close the document
#
#         if perform_ocr:
#             temp_filename = f"ocr_{temp_filename}"
#             ocred_pdf_path = os.path.join(temp_dir, temp_filename)
#             try:
#                 # If the document is less than 4 pages, force OCR
#                 if len(docs) < 4:
#                     ocrmypdf.ocr(
#                         temp_file_path,
#                         ocred_pdf_path,
#                         force_ocr=True,
#                         language="eng",
#                     )
#                 else:
#                     ocrmypdf.ocr(
#                         temp_file_path,
#                         ocred_pdf_path,
#                         skip_text=True,w\
#                         language="eng",
#                     )
#                 return True, temp_filename
#             except Exception as ocr_error:
#                 return False, f"Error during OCR processing {ocr_error}"
#
#     except RuntimeError as e:
#         return False, f"Error opening file: {str(e)}"
#
#     # If no OCR needed, return True and the original filename
#     return True, temp_filename


class DocumentProcessor:
    def __init__(self, case_uid):
        self.case = Case.objects.get(uid=str(case_uid))
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
        self.filter_query = {"case_uid": str(self.case.uid)}

    def process_summary(self, temp_file, performed_ocr):
        retriever = self.vectorstore.as_retriever(
            search_kwargs={"filter": self.filter_query, "k": 6},
            retriever_kwargs={
                "search_kwargs": {"filter": self.filter_query},
            },
            include_values=True,
        )
        question = (
            "You are friendly AI legal assistant tasked with analyzing the provided document "
            "and identify any sections that could possibly be non-standard "
            "or may need clarification. Ignore incomplete forms. Do not say if you can't"
            " conclusively evaluate and keep your response brief."
        )

        qa = RetrievalQA.from_llm(llm=self.llm, retriever=retriever)

        try:
            response = qa(question)
            if "result" in response:
                answer = response["result"]

                chat_log = [
                    {"user": "me", "message": question},
                    {"user": "gpt", "message": answer},
                ]
                if performed_ocr:
                    chat_log.append(
                        {
                            "user": "gpt",
                            "message": "Your document seems to be scanned or contains many images, which "
                            "effects how well I can read it, but I'm happy to your questions "
                            "as best I can.",
                        }
                    )
                else:
                    chat_log.append(
                        {
                            "user": "gpt",
                            "message": "I highlighted some items of interest in your doc. "
                            "I'm happy to answer any further questions that you may have.",
                        }
                    )

                conversation = CaseConversation.objects.create(
                    case=self.case,
                    conversation=chat_log,
                    temp_file=temp_file,
                    is_active=True,
                    updated_at=timezone.now(),
                )
                return {"conversation": conversation, "answer": answer}

        except Exception as e:
            return False, f"Error during summary retrieval {e}"

    def process_chat_message(self, message, chat_log, tmp_file):
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
            "a standalone question. Be sure to respond with only the requested information "
            "and If you do not know the answer, simply say so."
            "Chat History: {chat_history} "
            "Follow up question: {question} "
        )

        truncated_chat_log = (
            [chat_log[0]] + chat_log[-6:] if len(chat_log) > 6 else chat_log
        )
        chat_history = [
            (entry["message"], truncated_chat_log[i + 1]["message"])
            for i, entry in enumerate(truncated_chat_log[:-1])
        ]

        prompt = PromptTemplate.from_template(template)

        question_generator_chain = LLMChain(llm=self.llm, prompt=prompt)
        doc_chain = load_qa_chain(self.llm, chain_type="stuff")

        qa = ConversationalRetrievalChain(
            combine_docs_chain=doc_chain,
            retriever=retriever,
            question_generator=question_generator_chain,
            return_source_documents=True,
        )

        try:
            response = qa({"question": message, "chat_history": chat_history})

            if "answer" in response:
                answer = response["answer"]

                # add response to the chat log
                chat_log.extend(
                    [
                        {"user": "me", "message": message},
                        {"user": "gpt", "message": answer},
                    ]
                )

                conversation = CaseConversation.objects.get(case=self.case)
                conversation.conversation = chat_log
                conversation.temp_file = tmp_file
                conversation.is_active = True
                conversation.updated_at = timezone.now()
                conversation.save()

                return {"conversation": conversation, "answer": answer}

        except Exception as e:
            return False, f"Error processing chat response: {e}"

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
                region_name="us-east-1",
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

        doc.save(file_path, incremental=1, encryption=0)
        doc.close()
        return file_path

    def fuzzy_highlight(self, conversation):
        file_path = os.path.join(settings.TMP_DIR, conversation.temp_file)

        try:
            doc = fitz.open(file_path)
            highlight_limit = doc.page_count * 2

            user_message = get_latest_user_message(conversation)
            # get relevant chunks for highlighting
            processor = DocumentProcessor(conversation.case.uid)
            highlight_texts = processor.vectorstore.similarity_search_with_score(
                user_message, k=6, filter=processor.filter_query
            )

            # sort by score
            highlight_texts = sorted(
                [
                    doc_and_score
                    for doc_and_score in highlight_texts
                    if doc_and_score[1] >= 0.75
                ],
                key=lambda x: x[1],
                reverse=True,
            )[:highlight_limit]

            for highlight_text in highlight_texts:
                cleaned_text = highlight_text[0].page_content

                for page in doc:
                    # for page in docs:
                    page_text = page.get_text("text")

                    # Calculate similarity score
                    similarity = fuzz.partial_ratio(page_text, cleaned_text)

                    if similarity > 80:
                        areas = page.search_for(cleaned_text)

                        # If it fails to match exactly, split cleaned
                        # text into segments and search for each segment
                        if not areas:
                            bounding_rects = []
                            # Split the cleaned text into segments based on newline characters
                            segments = cleaned_text.split("\n")
                            # Iterate through each segment and search for areas
                            for segment in segments:
                                areas = page.search_for(segment)
                                if areas:
                                    # Create a bounding rect around all areas for this segment
                                    bounding_rect = fitz.Rect(areas[0])
                                    for area in areas[1:]:
                                        bounding_rect.include_rect(area)

                                    bounding_rects.append(bounding_rect)

                            # Create a single highlight annotation for the bounding rects of all segments
                            if bounding_rects:
                                bounding_rect = bounding_rects[0]
                                for rect in bounding_rects[1:]:
                                    bounding_rect.include_rect(rect)

                                highlight = page.add_highlight_annot(bounding_rect)
                                highlight.set_colors({"stroke": (1.0, 1.0, 0.553)})
                                highlight.update()
                        else:
                            # Create a highlight annotation for the entire cleaned_text
                            bounding_rect = fitz.Rect(areas[0])
                            for area in areas[1:]:
                                bounding_rect.include_rect(area)

                            highlight = page.add_highlight_annot(bounding_rect)
                            highlight.set_colors({"stroke": (1.0, 1.0, 0.553)})
                            highlight.update()

            doc.save(file_path, incremental=1, encryption=0)
            return doc

        except Exception as e:
            return False, f"Error highlighting text: {e}"

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
    def store_vectors(self, case, user, raw_text):
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=100,
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

        # Then split the cleaned text into chunks
        texts = text_splitter.split_text(raw_text)
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

    # upsert the embeddings to Pinecone
    # def store_vectors_deprecated(self, case, user, temp_file):
    #     temp_file_path = os.path.join(settings.TMP_DIR, temp_file)
    #
    #     text_splitter = RecursiveCharacterTextSplitter(
    #         chunk_size=100,
    #         chunk_overlap=0,
    #         length_function=tiktoken_len,
    #         separators=["\n\n", "\n", " ", ""],
    #     )
    #
    #     metadata = {
    #         "id": str(uuid4()),
    #         "created_at": str(timezone.now()),
    #         "case_id": str(case.id),
    #         "case_uid": str(case.uid),
    #         "case_name": case.name,
    #         "user_id": str(user.id),
    #         "user_email": user.email,
    #     }
    #
    #     text_chunks = []
    #     loader = PyMuPDFLoader(temp_file_path)
    #     docs = loader.load()
    #     for doc in docs:
    #         # Clean the entire page content first
    #         cleaned_text = doc.page_content.replace("�", "").replace("\n", " ").strip()
    #         # Then split the cleaned text into chunks
    #         texts = text_splitter.split_text(cleaned_text)
    #         for text in texts:
    #             text_chunks.append(text)
    #
    #     pdf_metadatas = [
    #         {"chunk": j, "text": text, **metadata} for j, text in enumerate(text_chunks)
    #     ]
    #
    #     # Process and upsert embeddings in batches
    #     for i in range(0, len(text_chunks), self.batch_limit):
    #         batch_texts = text_chunks[i : i + self.batch_limit]
    #         batch_metadatas = pdf_metadatas[i : i + self.batch_limit]
    #         self.upsert_to_pinecone(batch_texts, batch_metadatas)


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
