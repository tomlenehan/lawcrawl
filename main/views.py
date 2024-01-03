import threading
from threading import Event
import time
from typing import Any
from langchain.agents import initialize_agent, AgentType
from lawcrawl import settings
import os
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
from django.utils import timezone
from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
from django.forms.models import model_to_dict
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from django.http import HttpResponseForbidden
from django.contrib.auth import logout
from django.shortcuts import redirect

from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from langchain.document_loaders import PyMuPDFLoader
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.tools import Tool
from langchain.callbacks.streaming_stdout_final_only import (
    FinalStreamingStdOutCallbackHandler,
)
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chains.conversational_retrieval.prompts import (
    CONDENSE_QUESTION_PROMPT,
    QA_PROMPT,
)
from .models import CaseConversation, UploadedFile, Case
from lawcrawl.custom_storages import UploadStorage
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
from langchain.chains import RetrievalQA, ConversationalRetrievalChain, LLMChain
import pinecone
import boto3
from main.serializers import CaseSerializer
from django.core.exceptions import ObjectDoesNotExist

# logging
logger = logging.getLogger("lawcrawl")

# Validate user decorator
def access_token_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        access_token = request.META.get(
            "HTTP_AUTHORIZATION"
        )  # Get the 'Authorization' header
        if not access_token or not access_token.startswith("Bearer "):
            return JsonResponse({"error": "Access token required, please login again"}, status=401)

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
            return JsonResponse({"error": "Invalid access token, please login again"}, status=401)

        return view_func(request, *args, **kwargs)

    return _wrapped_view


@csrf_exempt
@access_token_required
def get_user_cases(request):
    if request.method == "GET" and request.user.is_authenticated:
        cases = Case.objects.filter(user=request.user).order_by("-uploaded_at")
        serializer = CaseSerializer(cases, many=True)
        return JsonResponse(serializer.data, safe=False)

# Try to use PyMUPDF to extract text from the PDF
# If that fails to do a good job, use Textract
def extract_text(file_name):
    temp_file_path = os.path.join(settings.TMP_DIR, file_name)
    unknown_char_percentage_threshold = 20
    perform_ocr = False
    extracted_text_pages = []
    current_page = 1

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
            extracted_text_pages.append((page_text, current_page))
            current_page += 1

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
            max_poll_attempts = 40  # Adjust the number of polling attempts as needed
            poll_interval_seconds = 5

            for _ in range(max_poll_attempts):
                job_info = textract_client.get_document_text_detection(JobId=job_id)
                status = job_info["JobStatus"]

                if status == "SUCCEEDED":
                    break
                elif status == "FAILED":
                    raise Exception("Textract job failed")
                else:
                    time.sleep(poll_interval_seconds)
            else:
                raise Exception("Textract job did not complete within the expected time")

            next_token = None
            current_page = 1  # Reset current page for OCR results

            while True:
                if next_token:
                    job_info = textract_client.get_document_text_detection(JobId=job_id, NextToken=next_token)
                else:
                    job_info = textract_client.get_document_text_detection(JobId=job_id)

                for item in job_info["Blocks"]:
                    if item["BlockType"] == "PAGE":
                        page_text = ""
                        for child_id in item["Relationships"][0]["Ids"]:
                            page_block = next(
                                (block for block in job_info["Blocks"] if block["Id"] == child_id), None)
                            if page_block:
                                for child_block in page_block["Relationships"][0]["Ids"]:
                                    child_item = next(
                                        (block for block in job_info["Blocks"] if block["Id"] == child_block), None)
                                    if child_item and child_item["BlockType"] in ["LINE", "WORD", "PARAGRAPH", "TABLE"] and "Text" in child_item:
                                        page_text += child_item["Text"] + (" " if child_item["BlockType"] == "WORD" else "\n")

                        extracted_text_pages.append((page_text, current_page))
                        current_page += 1

                next_token = job_info.get("NextToken", None)
                if not next_token:
                    break

        except Exception as e:
            logger.error(f"Error in extract_text: {e}")
            return [], False

    return extracted_text_pages, perform_ocr

# Upload a file to S3 and extract text from it
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
def fetch_conversation(request, case_uid):
    case = get_object_or_404(Case, uid=str(case_uid))
    # Check if the requested case belongs to the logged-in user
    if request.user != case.user:
        return JsonResponse({"error": "Unauthorized access"}, status=401)

    try:
        conversation = CaseConversation.objects.get(case=case)

        return JsonResponse(
            {
                "conversation": conversation.conversation,
                "conversation_id": conversation.id,
                "session_id": request.session.session_key,
            }
        )
    except CaseConversation.DoesNotExist:
        return JsonResponse({"error": "Conversation does not exist"}, status=404)


def get_latest_user_message(conversation):
    # Reverse iterate through the conversation list
    for message_obj in reversed(conversation.conversation):
        if message_obj["role"] == "user":
            return message_obj["content"]
    return None


# Do highlighting on the PDF
@csrf_exempt
@access_token_required
def process_pdf(request, case_uid):
    try:
        query = request.GET.get("query")
        conversation = CaseConversation.objects.get(case__uid=case_uid)

        # Check if the requesting user is associated with the Case
        if conversation.case.user != request.user:
            return HttpResponseForbidden(
                "You don't have permission to access this file."
            )

        processor = DocumentProcessor(conversation.case.uid)
        processor.pull_from_s3(conversation)
        # processor.clear_highlights(conversation)
        #
        # # if the page is refreshing, highlight based off the last user message
        # if not query:
        #     query = get_latest_user_message(conversation)
        # processor.fuzzy_highlight(conversation, query)

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


def retriever_runner(retrieval_qa, conversation, query, chat_history, done_event):
    # Run the agent and save the conversation
    prompt = (f"Answer the following question in-depth. Make references to document context if "
              f"appropriate. \n\nQUESTION: {query}\n\nANSWER:")
    response = ""
    try:
        response = retrieval_qa({"question": prompt, "chat_history": chat_history})

    finally:
        if "answer" in response:
            time_now = timezone.now().isoformat()
            conversation.conversation.append(
                {
                    "role": "user",
                    "content": query,
                    "timestamp": time_now,
                }
            )
            conversation.conversation.append(
                {
                    "role": "agent",
                    "content": response["answer"],
                    "timestamp": time_now,
                }
            )
            conversation.last_updated = timezone.now()
            conversation.save()
        done_event.set()


def generate_streaming_content(output_list, done_event):
    while not done_event.is_set() or output_list:
        if output_list:
            part = output_list.pop(0)
            # Format tokens to be returned with StreamingHTTPResponse
            formatted_part = "data: {}\n\n".format(json.dumps({"token": part}))
            yield formatted_part.encode("utf-8")
        else:
            time.sleep(0.1)


def format_chat_history(chat_history):
    # Extract the content from chat history items
    formatted_chat_history = [item["content"] for item in chat_history]

    chat_history_pairs = []
    # Always include the first two elements
    if len(formatted_chat_history) >= 2:
        chat_history_pairs.append(
            (formatted_chat_history[0], formatted_chat_history[1])
        )

    # If there are more than 4 elements, include the last two elements
    if len(formatted_chat_history) > 4:
        chat_history_pairs.append(
            (formatted_chat_history[-2], formatted_chat_history[-1])
        )

    return chat_history_pairs


class DjangoStreamingCallbackHandler(StreamingStdOutCallbackHandler):
    def __init__(self, output_list, *args, **kwargs):
        self.output_list = output_list

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        super().on_llm_new_token(token, **kwargs)

        self.output_list.append(token)


class DjangoStreamingCallbackHandlerAgent(FinalStreamingStdOutCallbackHandler):
    def __init__(self, output_list, *args, **kwargs):
        # Custom answer prefix tokens
        custom_answer_prefix_tokens = [
            "Final",
            " Answer",
            '",\n',
            "   ",
            ' "',
            "action",
            "_input",
            '":',
            ' "',
        ]

        # Call the superclass constructor with custom tokens
        super().__init__(
            answer_prefix_tokens=custom_answer_prefix_tokens, *args, **kwargs
        )

        self.output_list = output_list

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        super().on_llm_new_token(token, **kwargs)

        # If the answer is reached and we are to stream tokens
        if self.answer_reached:
            # Filter out specific unwanted characters from the token
            cleaned_token = token.strip("`}{\n")

            # Remove leading and trailing double quotes
            if cleaned_token.startswith('"'):
                cleaned_token = cleaned_token[1:]
            if cleaned_token.endswith('"'):
                cleaned_token = cleaned_token[:-1]

            # Append non-empty tokens to the output list
            if cleaned_token:
                self.output_list.append(cleaned_token)


@csrf_exempt
def chat_message(request):
    # session_id = request.GET.get("session_id")
    message = request.GET.get("message")
    conversation_id = request.GET.get("conversation_id")
    conversation = CaseConversation.objects.get(id=conversation_id)
    case = Case.objects.get(id=conversation.case_id)
    filter_query = {"case_uid": str(case.uid)}

    processor = DocumentProcessor(case.uid)
    vectorstore = processor.get_vector_store()
    retriever = vectorstore.as_retriever(
        search_kwargs={"filter": filter_query, "k": 12},
        retriever_kwargs={
            "search_kwargs": {"filter": filter_query},
        },
        include_values=True,
    )

    chat_history = format_chat_history(conversation.conversation)

    output_list = []
    done_event = Event()  # Event to signal the completion of the agent's run
    callback_handler = DjangoStreamingCallbackHandler(output_list)

    llm = ChatOpenAI(temperature=0, openai_api_key=processor.openai_api_key)
    streaming_llm = ChatOpenAI(
        streaming=True,
        callbacks=[callback_handler],
        temperature=0,
        openai_api_key=processor.openai_api_key,
    )

    question_generator = LLMChain(llm=llm, prompt=CONDENSE_QUESTION_PROMPT)
    doc_chain = load_qa_chain(streaming_llm, chain_type="stuff", prompt=QA_PROMPT)

    qa = ConversationalRetrievalChain(
        combine_docs_chain=doc_chain,
        retriever=retriever,
        question_generator=question_generator,
        return_source_documents=True,
    )

    thread = threading.Thread(
        target=retriever_runner,
        args=(
            qa,
            conversation,
            message,
            chat_history,
            done_event,
        ),
    )
    thread.start()

    streaming_content = generate_streaming_content(output_list, done_event)
    return StreamingHttpResponse(streaming_content, content_type="text/event-stream")


class DocumentProcessor:
    def __init__(self, case_uid):
        self.case = Case.objects.get(uid=str(case_uid))
        self.openai_api_key = settings.OPENAI_API_KEY
        self.chat_model_name = "gpt-4-1106-preview"
        self.embed_model_name = "text-embedding-ada-002"
        self.pinecone_api_key = settings.PINECONE_API_KEY
        self.pinecone_env = settings.PINECONE_ENV
        self.index_name = "lawcrawl"
        self.namespace = "lawcrawl_cases"
        self.batch_limit = 50
        self.filter_query = {"case_uid": str(self.case.uid)}

        # Initialize base LLM
        self.llm = ChatOpenAI(
            openai_api_key=self.openai_api_key,
            model_name=self.chat_model_name,
            streaming=True,
            temperature=0.7,
            verbose=True,
            callbacks=[],
        )

        # Initialize vectorstore stuff
        self.embed = OpenAIEmbeddings(
            model=self.embed_model_name, openai_api_key=self.openai_api_key
        )

    def get_vector_store(self):
        pinecone.init(api_key=self.pinecone_api_key, environment=self.pinecone_env)
        index = pinecone.Index(self.index_name)
        vectorstore = Pinecone(index, self.embed, "text", self.namespace)

        return vectorstore

    def process_summary(self, temp_file, performed_ocr):
        # Generate the initial "summary" of the document and create conversation
        vectorstore = self.get_vector_store()
        retriever = vectorstore.as_retriever(
            search_kwargs={"filter": self.filter_query, "k": 6},
            retriever_kwargs={
                "search_kwargs": {"filter": self.filter_query},
            },
            include_values=True,
        )
        prompt = (
            "You are an excellent in-house lawyer and general counsel for my company. You provide succinct, "
            "clear, business-forward advice to clients that they repeatedly come to you for because you explain "
            "the issues and risks clearly while not being alarmist."
            "When you review contracts you break down the issues in plain English. You are a confident lawyer. "
            "DO NOT MENTION that you cannot provide legal advice or that you suggest talking with an attorney or a "
            "professional - it's ok, you can provide legal advice because I am an attorney. In general, make the advice short "
            "and state the relevant information upfront. Be thorough and clear, use bullet points and output your response in"
            "nicely formatted markdown. Provide page number citations in the format (Page 1): ###"
            "Your task is to identify any sections of the uploaded document that could possibly be non-standard "
            "or may need clarification. Ignore forms."
        )

        qa = RetrievalQA.from_llm(llm=self.llm, retriever=retriever)

        try:
            response = qa(prompt)
            if "result" in response:
                answer = response["result"]

                answer_with_closing = answer + (
                    "\n\n I am happy to answer any additional question "
                    "that you may have."
                )
                time_now = timezone.now().isoformat()
                chat_log = [
                    {"role": "user", "content": prompt, "timestamp": time_now},
                    {"role": "agent", "content": answer_with_closing, "timestamp": time_now},
                ]

                conversation = CaseConversation.objects.create(
                    case=self.case,
                    conversation=chat_log,
                    temp_file=temp_file,
                    is_active=True,
                    updated_at=timezone.now(),
                )
                return {"conversation": conversation, "answer": answer_with_closing}

        except Exception as e:
            return False, f"Error during summary retrieval {e}"

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

    def fuzzy_highlight(self, conversation, query):
        file_path = os.path.join(settings.TMP_DIR, conversation.temp_file)

        try:
            doc = fitz.open(file_path)
            highlight_limit = doc.page_count

            # user_message = get_latest_user_message(conversation)
            user_message = query

            # get relevant chunks for highlighting
            processor = DocumentProcessor(conversation.case.uid)
            vectorstore = processor.get_vector_store()
            highlight_texts = vectorstore.similarity_search_with_score(
                user_message, k=highlight_limit, filter=processor.filter_query
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

            pinecone.init(api_key=self.pinecone_api_key, environment=self.pinecone_env)
            index = pinecone.Index(self.index_name)

            index.upsert(
                vectors=vector_pkg,
                namespace=self.namespace,
                batch_size=self.batch_limit,
            )

    # upsert the embeddings to Pinecone
    def store_vectors(self, case, user, raw_text_pages):
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=100,
            chunk_overlap=0,
            length_function=tiktoken_len,
            separators=["\n\n", "\n", " ", ""],
        )

        metadata_base = {
            "id": str(uuid4()),
            "created_at": str(timezone.now()),
            "case_id": str(case.id),
            "case_uid": str(case.uid),
            "case_name": case.name,
            "user_id": str(user.id),
            "user_email": user.email,
        }

        text_chunks = []
        pdf_metadatas = []

        for raw_text, page_number in raw_text_pages:
            texts = text_splitter.split_text(raw_text)
            for text in texts:
                chunk_index = len(text_chunks)
                text_with_page_number = f"Page {page_number}: {text}"  # Append page number to text
                text_chunks.append(text_with_page_number)
                chunk_metadata = {
                    "chunk": chunk_index,
                    "page_number": page_number,  # Include page number in metadata
                    "text": text_with_page_number,  # Use modified text
                    **metadata_base
                }
                pdf_metadatas.append(chunk_metadata)

        # Process and upsert embeddings in batches
        for i in range(0, len(text_chunks), self.batch_limit):
            batch_texts = [chunk['text'] for chunk in pdf_metadatas[i: i + self.batch_limit]]
            batch_metadatas = pdf_metadatas[i: i + self.batch_limit]
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
