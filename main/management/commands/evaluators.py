# TODO: NOT FUNCTIONAL CODE, JUST USE FOR REFERENCE
import langsmith

from langchain import chat_models, smith


# Define your runnable or chain below.
prompt = prompts.ChatPromptTemplate.from_messages(
  [
    ("system", "You are a helpful AI assistant."),
    ("human", "{your_input_key}")
  ]
)
llm = chat_models.ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = prompt | llm | output_parser.StrOutputParser()

# Define the evaluators to apply
eval_config = smith.RunEvalConfig(
    evaluators=[
        smith.RunEvalConfig.Criteria("coherence"),
        smith.RunEvalConfig.Criteria("relevance"),
        smith.RunEvalConfig.Criteria("helpfulness"),
        smith.RunEvalConfig.Criteria("controversiality")
    ],
    custom_evaluators=[],
    eval_llm=chat_models.ChatOpenAI(model="gpt-4", temperature=0)
)

client = langsmith.Client()
chain_results = client.run_on_dataset(
    dataset_name="<dataset-name>",
    llm_or_chain_factory=chain,
    evaluation=eval_config,
    project_name="test-loyal-push-9",
    concurrency_level=5,
    verbose=True,
)