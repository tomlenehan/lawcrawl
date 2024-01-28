from django.core.management.base import BaseCommand
import json

class Command(BaseCommand):
    help = 'Converts raw JSON data to JSONL format for GPT-3.5 fine-tuning'

    def handle(self, *args, **options):
        input_file = 'data/raw/CUAD_v1.json'
        output_file = 'data/cleaned/cuda.jsonl'

        with open(input_file, 'r') as infile:
            data = json.load(infile)['data']

        with open(output_file, 'w') as outfile:
            record_count = 0  # Initialize a counter for the number of records processed

            for item in data:
                if record_count >= 20:  # Break the loop if 20 records have been processed
                    break

                for paragraph in item['paragraphs']:
                    if record_count >= 20:  # Check again in the inner loop
                        break

                    context_escaped = paragraph['context'].replace('\n', '\\n')

                    for qa in paragraph['qas']:
                        question_escaped = qa['question'].replace('\n', '\\n')
                        answers_escaped = " ".join(answer['text'].replace('\n', '\\n') for answer in qa['answers']) if not qa['is_impossible'] else "No answer"

                        input_text = "You are an excellent in-house lawyer and general counsel for my company. " + context_escaped + " \\n\\nYour task is to " + question_escaped
                        ideal_response = answers_escaped

                        formatted_data = {
                            "messages": [
                                {"role": "user", "content": input_text},
                                {"role": "assistant", "content": ideal_response}
                            ]
                        }

                        json.dump(formatted_data, outfile)
                        outfile.write('\n')

                        record_count += 1  # Increment the counter after each record

        self.stdout.write(self.style.SUCCESS('Successfully converted data to JSONL format'))
