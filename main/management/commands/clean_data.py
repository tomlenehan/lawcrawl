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
            for item in data:
                for paragraph in item['paragraphs']:
                    context = paragraph['context']
                    for qa in paragraph['qas']:
                        answer_text = "No answer" if qa['is_impossible'] else " ".join(answer['text'] for answer in qa['answers'])
                        formatted_data = {
                            "prompt": f"Use the following document context to answer the question:\n\nDocument: {context}\n\nQUESTION: {qa['question']}",
                            "completion": answer_text
                        }
                        json.dump(formatted_data, outfile)
                        outfile.write('\n')

        self.stdout.write(self.style.SUCCESS('Successfully converted data to JSONL format'))
