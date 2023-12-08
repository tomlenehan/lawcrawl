import threading
from threading import Event
import time
from typing import Any
from langchain.chains import RetrievalQA
from lawcrawl import settings
import json
from django.utils import timezone
from django.http import JsonResponse, StreamingHttpResponse
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.tools import Tool
from langchain.callbacks.streaming_stdout_final_only import (
    FinalStreamingStdOutCallbackHandler,
)
from langchain.vectorstores import Pinecone
from ninja import NinjaAPI
import pinecone
from langchain.memory import ConversationBufferWindowMemory
from langchain.agents import load_tools, AgentType, initialize_agent
from django.views.decorators.csrf import csrf_exempt
from main.views import access_token_required
from main.models import Case, CaseConversation

# Create the Ninja API instance
chat_api = NinjaAPI()

openai_api_key = settings.OPENAI_API_KEY
chat_model_name = "gpt-4-1106-preview"
embed_model_name = "text-embedding-ada-002"
pinecone_api_key = settings.PINECONE_API_KEY
pinecone_env = settings.PINECONE_ENV
index_name = "lawcrawl"
namespace = "lawcrawl_cases"
batch_limit = 50

llm = ChatOpenAI(
    openai_api_key=openai_api_key,
    model_name=chat_model_name,
    streaming=True,
    temperature=0.7,
    verbose=True,
    callbacks=[],
)

memory = ConversationBufferWindowMemory(
    memory_key="chat_history", k=5, return_messages=True, output_key="output"
)

agent = initialize_agent(
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    tools=[],
    llm=llm,
    verbose=False,
    max_iterations=3,
    early_stopping_method="generate",
    # memory=memory,
    return_intermediate_steps=False,
)

embed = OpenAIEmbeddings(model=embed_model_name, openai_api_key=openai_api_key)
pinecone.init(api_key=pinecone_api_key, environment=pinecone_env)
index = pinecone.Index(index_name)
vectorstore = Pinecone(index, embed, "text", namespace)


class DjangoStreamingCallbackHandler(FinalStreamingStdOutCallbackHandler):
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
            # Filter out unwanted characters from the token
            cleaned_token = token.strip("}`{")
            if cleaned_token:
                self.output_list.append(cleaned_token)


def gen_message(msg):
    # return 'data: {}'.format(msg)
    return "data: {}\n\n".format(json.dumps({"token": msg}))


def agent_runner(conversation, query, chat_history, callback_handler, done_event):
    # Run the agent and save the conversation
    response = ""
    try:
        prompt = (
            "Use the 'Lawcrawl Retrieval Tool' to answer the following question:"
            + query
        )
        agent.agent.llm_chain.llm.callbacks = [callback_handler]
        response = agent.run({"input": prompt, "chat_history": chat_history})
    finally:
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
                "content": response,
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
            formatted_part = gen_message(part)
            yield formatted_part.encode("utf-8")
        else:
            time.sleep(0.1)


def format_chat_history(chat_history):
    formatted_chat_history = []
    for item in chat_history:
        if item["role"] == "user":
            formatted_chat_history.append(
                HumanMessage(
                    content=item["content"],
                    timestamp=item["timestamp"],
                    metadata={"role": item["role"]},
                )
            )
        elif item["role"] == "agent":
            formatted_chat_history.append(
                AIMessage(
                    content=item["content"],
                    timestamp=item["timestamp"],
                    metadata={"role": item["role"]},
                )
            )
    return formatted_chat_history


@csrf_exempt
@access_token_required
@chat_api.get("/chat_message")
def chat_message(request):
    # session_id = request.GET.get("session_id")
    message = request.GET.get("message")
    conversation_id = request.GET.get("conversation_id")
    conversation = CaseConversation.objects.get(id=conversation_id)
    case = Case.objects.get(id=conversation.case_id)
    filter_query = {"case_uid": str(case.uid)}

    retriever = vectorstore.as_retriever(
        search_kwargs={"filter": filter_query, "k": 4},
        retriever_kwargs={
            "search_kwargs": {"filter": filter_query},
        },
        include_values=True,
    )

    retrieval_qa = RetrievalQA.from_chain_type(
        llm=llm, chain_type="stuff", retriever=retriever
    )

    tools = [
        Tool(
            name="Lawcrawl Retrieval Tool",
            func=retrieval_qa.run,
            description="You are friendly AI legal assistant tasked with giving "
            "helpful answers to questions about the user's legal document.",
        )
    ]
    agent.tools = tools

    # Format the chat history so it can be used by the agent,
    # limit it to the last 4 messages
    chat_history = format_chat_history(conversation.conversation[-4:])

    output_list = []
    done_event = Event()  # Event to signal the completion of the agent's run
    callback_handler = DjangoStreamingCallbackHandler(output_list)
    thread = threading.Thread(
        target=agent_runner,
        args=(conversation, message, chat_history, callback_handler, done_event),
    )
    thread.start()

    streaming_content = generate_streaming_content(output_list, done_event)
    return StreamingHttpResponse(streaming_content, content_type="text/event-stream")
