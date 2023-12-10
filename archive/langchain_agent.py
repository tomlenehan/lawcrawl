Initialize agent
self.agent = initialize_agent(
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    tools=[],
    llm=self.llm,
    verbose=False,
    max_iterations=3,
    early_stopping_method="generate",
    # memory=memory,
    return_intermediate_steps=False,
)


def agent_runner(agent, conversation, query, chat_history, done_event):
    # Run the agent and save the conversation
    response = ""
    try:
        prompt = (
            "Use the 'Lawcrawl Retrieval Tool' to answer the following question:"
            + query
        )
        response = agent.run({"input": prompt, "chat_history": chat_history})

    finally:
        if response:
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
            # Format tokens to be returned with StreamingHTTPResponse
            formatted_part = "data: {}\n\n".format(json.dumps({"token": part}))
            yield formatted_part.encode("utf-8")
        else:
            time.sleep(0.1)


def format_chat_history_old(chat_history):
    # Format the chat history so it can be used by the agent

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
def chat_message_agent(request):
    # session_id = request.GET.get("session_id")
    message = request.GET.get("message")
    conversation_id = request.GET.get("conversation_id")
    conversation = CaseConversation.objects.get(id=conversation_id)
    case = Case.objects.get(id=conversation.case_id)
    filter_query = {"case_uid": str(case.uid)}

    processor = DocumentProcessor(case.uid)

    retriever = processor.vectorstore.as_retriever(
        search_kwargs={"filter": filter_query, "k": 4},
        retriever_kwargs={
            "search_kwargs": {"filter": filter_query},
        },
        include_values=True,
    )

    retrieval_qa = RetrievalQA.from_chain_type(
        llm=processor.llm, chain_type="stuff", retriever=retriever
    )

    agent = processor.agent

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
    agent.agent.llm_chain.llm.callbacks = [callback_handler]

    thread = threading.Thread(
        target=agent_runner,
        args=(
            agent,
            conversation,
            message,
            chat_history,
            done_event,
        ),
    )
    thread.start()

    streaming_content = generate_streaming_content(output_list, done_event)
    return StreamingHttpResponse(streaming_content, content_type="text/event-stream")
