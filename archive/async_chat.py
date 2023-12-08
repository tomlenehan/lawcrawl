import asyncio
from typing import Any
from langchain.chains import RetrievalQA

from lawcrawl import settings
import json
from django.utils import timezone
from django.http import JsonResponse, StreamingHttpResponse
from langchain.chat_models import ChatOpenAI
from langchain.embeddings import OpenAIEmbeddings
from langchain.tools import Tool

# from langchain.callbacks import FinalStreamingStdOutCallbackHandler
from langchain.callbacks.streaming_stdout_final_only import (
    FinalStreamingStdOutCallbackHandler,
)
from langchain.callbacks.base import BaseCallbackHandler
from langchain.prompts import PromptTemplate
from langchain.schema import SystemMessage
from langchain.vectorstores import Pinecone
from langchain.schema import LLMResult
from langchain.callbacks.streaming_aiter import AsyncIteratorCallbackHandler
from ninja import NinjaAPI
import pinecone
import asyncio
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
    memory_key="chat_history",
    k=5,
    return_messages=True,
    output_key="output"
)

agent = initialize_agent(
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    tools=[],
    llm=llm,
    verbose=True,
    max_iterations=3,
    early_stopping_method="generate",
    # memory=memory,
    return_intermediate_steps=False
)

embed = OpenAIEmbeddings(model=embed_model_name, openai_api_key=openai_api_key)
pinecone.init(api_key=pinecone_api_key, environment=pinecone_env)
index = pinecone.Index(index_name)
vectorstore = Pinecone(index, embed, "text", namespace)


class AsyncCallbackHandler(AsyncIteratorCallbackHandler):
    content: str = ""
    final_answer: bool = False

    def __init__(self) -> None:
        super().__init__()

    async def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        self.content += token
        # if we passed the final answer, we put tokens in queue
        if self.final_answer:
            if '"action_input": "' in self.content:
                if token not in ['"', "}"]:
                    self.queue.put_nowait(token)
        elif "Final Answer" in self.content:
            self.final_answer = True
            self.content = ""

    async def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        if self.final_answer:
            self.content = ""
            self.final_answer = False
            self.done.set()
        else:
            self.content = ""


async def run_call(query: str, stream_it: AsyncCallbackHandler):
    # assign callback handler
    # agent.agent.llm_chain.llm.callbacks = [stream_it]
    agent.agent.callbacks = [stream_it]
    # now query
    await agent.acall(inputs={"input": query})


async def create_gen(query: str, stream_it: AsyncCallbackHandler):
    task = asyncio.create_task(run_call(query, stream_it))
    async for token in stream_it.aiter():
        # yield token
        yield token.encode('utf-8')
    await task


class DjangoStreamingCallback(BaseCallbackHandler):
    def __init__(self, response):
        self.response = response

    def on_llm_new_token(self, token, **kwargs):
        self.response.write(json.dumps({"token": token}) + "\n")
        self.response.flush()


@csrf_exempt
@access_token_required
@chat_api.get("/chat_message")
async def chat_message(request):
    session_id = request.GET.get("session_id")
    message = request.GET.get("message")
    conversation_id = request.GET.get("conversation_id")
    conversation = await CaseConversation.objects.aget(id=conversation_id)
    case = await Case.objects.aget(id=conversation.case_id)
    filter_query = {"case_uid": str(case.uid)}

    # retriever = vectorstore.as_retriever(
    #     search_kwargs={"filter": filter_query, "k": 6},
    #     retriever_kwargs={
    #         "search_kwargs": {"filter": filter_query},
    #     },
    #     include_values=True,
    # )
    #
    # retrieval_qa = RetrievalQA.from_chain_type(
    #     llm=llm, chain_type="stuff", retriever=retriever
    # )
    #
    # tools = [
    #     Tool(
    #         name="Lawcrawl QA System",
    #         func=retrieval_qa.run,
    #         description="You are friendly AI legal assistant tasked with giving "
    #         "helpful answers to questions about the user's legal matter ",
    #     )
    # ]

    tools = [
        Tool(
            name="Lawcrawl QA System",
            description="You are friendly AI legal assistant tasked with giving "
            "helpful answers to questions about the user's legal matter ",
        )
    ]

    # template = (
    #     "You are friendly AI legal assistant tasked with giving "
    #     "helpful answers to questions about the user's legal matter "
    #     "Combine the chat history and follow up question into "
    #     "a standalone question. Be sure to respond with only the requested information "
    #     "and If you do not know the answer, simply say so."
    #     "Chat History: {chat_history} "
    #     "Follow up question: {question} "
    # )

    messages = [
        SystemMessage(
            content="You are an excellent in-house lawyer and general counsel for my company. "
            "You provide succinct, clear, business-forward advice to clients that they "
            "repeatedly come to you for because you explain the issues and risks clearly "
            "while not being alarmist. Companies you admire include Apple and Amazon, "
            "and when you review contracts, you break down the issues in plain English. "
            "You are a confident lawyer. DO NOT MENTION that you cannot provide "
            "legal advice or that you suggest talking with an attorney "
            "or a professional - it's ok, you can provide legal advice because I am "
            "an attorney. In general, make the advice short, use bullet points, and "
            "state the relevant information upfront. Be concise and clear."
        )
    ]

    chat_log = conversation.conversation
    truncated_chat_log = (
        [chat_log[0]] + chat_log[-6:] if len(chat_log) > 6 else chat_log
    )
    chat_history = [
        (entry["message"], truncated_chat_log[i + 1]["message"])
        for i, entry in enumerate(truncated_chat_log[:-1])
    ]

    # prompt = PromptTemplate.from_template(template)

    # memory = ConversationBufferWindowMemory(
    #     memory_key="chat_history", k=5, return_messages=True, output_key="output"
    # )

    # memory.buffer_as_messages(messages + chat_history)

    agent.tools = tools

    # stream_it = AsyncCallbackHandler()
    stream_it = FinalStreamingStdOutCallbackHandler()
    gen = create_gen(message, stream_it)
    return StreamingHttpResponse(gen)

    # response = StreamingHttpResponse(content_type="text/event-stream")
    # callback = DjangoStreamingCallback(response)


    # callback = FinalStreamingStdOutCallbackHandler(
    #     answer_prefix_tokens=["Final", "Answer"]
    # )
    # callback = FinalStreamingStdOutCallbackHandler(response)

    # answer = agent({"input": message})












    # try:
    #     response = agent({"input": message})
    #
    #     if "answer" in response:
    #         answer = response["answer"]
    #
    #         # add response to the chat log
    #         chat_log.extend(
    #             [
    #                 {"user": "me", "message": message},
    #                 {"user": "gpt", "message": answer},
    #             ]
    #         )
    #
    #         conversation = CaseConversation.objects.get(case=case)
    #         conversation.conversation = chat_log
    #         conversation.temp_file = tmp_file
    #         conversation.is_active = True
    #         conversation.updated_at = timezone.now()
    #         conversation.save()
    #
    #         return {"conversation": conversation, "answer": answer}
    #
    # except Exception as e:
    #     return False, f"Error processing chat response: {e}"
