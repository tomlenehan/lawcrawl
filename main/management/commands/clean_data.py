import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from main.ai_prompts import FINE_TUNING_SYSTEM_PROMPT

class Command(BaseCommand):
    help = "Converts CUAD-style raw JSON data to chat JSONL for fine-tuning."

    def add_arguments(self, parser):
        parser.add_argument(
            "--input",
            default="data/raw/CUAD_v1.json",
            help="Path to the raw CUAD JSON file.",
        )
        parser.add_argument(
            "--output",
            default="data/cleaned/cuad.jsonl",
            help="Path where the chat JSONL file should be written.",
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=20,
            help="Maximum records to write. Use 0 for no limit.",
        )

    def handle(self, *args, **options):
        input_file = Path(options["input"])
        output_file = Path(options["output"])
        record_limit = options["limit"]

        if not input_file.exists():
            raise CommandError(f"Input file does not exist: {input_file}")

        output_file.parent.mkdir(parents=True, exist_ok=True)

        with input_file.open("r", encoding="utf-8") as infile:
            data = json.load(infile)["data"]

        with output_file.open("w", encoding="utf-8") as outfile:
            record_count = 0

            for item in data:
                if record_limit and record_count >= record_limit:
                    break

                for paragraph in item["paragraphs"]:
                    if record_limit and record_count >= record_limit:
                        break

                    context = paragraph["context"].strip()

                    for qa in paragraph["qas"]:
                        if record_limit and record_count >= record_limit:
                            break

                        question = qa["question"].strip()
                        ideal_response = (
                            " ".join(answer["text"].strip() for answer in qa["answers"])
                            if not qa["is_impossible"]
                            else "The answer is not stated in the provided excerpt."
                        )

                        formatted_data = {
                            "messages": [
                                {"role": "system", "content": FINE_TUNING_SYSTEM_PROMPT},
                                {
                                    "role": "user",
                                    "content": (
                                        "Document excerpt:\n"
                                        f"{context}\n\n"
                                        "Question:\n"
                                        f"{question}\n\n"
                                        "Answer using only the excerpt."
                                    ),
                                },
                                {"role": "assistant", "content": ideal_response},
                            ]
                        }

                        json.dump(formatted_data, outfile)
                        outfile.write("\n")

                        record_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully wrote {record_count} fine-tuning records to {output_file}"
            )
        )
