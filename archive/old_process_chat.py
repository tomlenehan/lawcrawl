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
