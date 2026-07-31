import langsmith
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from langchain import smith
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from main.ai_prompts import FINE_TUNING_SYSTEM_PROMPT


class Command(BaseCommand):
    help = "Runs LangSmith criteria evaluation against the Lawcrawl answer prompt."

    def add_arguments(self, parser):
        parser.add_argument("--dataset-name", required=True)
        parser.add_argument("--project-name", default="lawcrawl-ai-eval")
        parser.add_argument("--input-key", default="question")
        parser.add_argument("--model", default=settings.OPENAI_CHAT_MODEL)
        parser.add_argument("--eval-model", default=settings.OPENAI_CHAT_MODEL)
        parser.add_argument("--concurrency", type=int, default=5)

    def handle(self, *args, **options):
        if not settings.OPENAI_API_KEY:
            raise CommandError("OPENAI_API_KEY is required to run AI evaluations.")
        if not settings.LANGCHAIN_API_KEY:
            raise CommandError("LANGCHAIN_API_KEY is required to run LangSmith evaluations.")

        input_key = options["input_key"]
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", FINE_TUNING_SYSTEM_PROMPT),
                ("human", "{" + input_key + "}"),
            ]
        )
        llm = ChatOpenAI(model_name=options["model"], temperature=0)
        chain = prompt | llm | StrOutputParser()

        eval_config = smith.RunEvalConfig(
            evaluators=[
                smith.RunEvalConfig.Criteria("coherence"),
                smith.RunEvalConfig.Criteria("relevance"),
                smith.RunEvalConfig.Criteria("helpfulness"),
                smith.RunEvalConfig.Criteria("conciseness"),
            ],
            eval_llm=ChatOpenAI(model_name=options["eval_model"], temperature=0),
        )

        client = langsmith.Client()
        results = client.run_on_dataset(
            dataset_name=options["dataset_name"],
            llm_or_chain_factory=chain,
            evaluation=eval_config,
            project_name=options["project_name"],
            concurrency_level=options["concurrency"],
            verbose=True,
        )

        self.stdout.write(self.style.SUCCESS("Evaluation run submitted."))
        self.stdout.write(str(results))
