from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from openai import OpenAI


class Command(BaseCommand):
    help = "Uploads a prepared chat JSONL file to OpenAI for fine-tuning."

    def add_arguments(self, parser):
        parser.add_argument(
            "--input",
            default="data/cleaned/cuad.jsonl",
            help="Path to the JSONL file produced by clean_data.",
        )
        parser.add_argument(
            "--purpose",
            default="fine-tune",
            help="OpenAI file purpose.",
        )

    def handle(self, *args, **options):
        input_file = Path(options["input"])
        purpose = options["purpose"]

        if not settings.OPENAI_API_KEY:
            raise CommandError("OPENAI_API_KEY is required to upload tuning data.")

        if not input_file.exists():
            raise CommandError(f"Input file does not exist: {input_file}")

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        with input_file.open("rb") as file_handle:
            response = client.files.create(file=file_handle, purpose=purpose)

        file_id = getattr(response, "id", None)
        if file_id:
            self.stdout.write(self.style.SUCCESS(f"Uploaded {input_file} as {file_id}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Uploaded {input_file}"))
            self.stdout.write(response.model_dump_json(indent=2))
