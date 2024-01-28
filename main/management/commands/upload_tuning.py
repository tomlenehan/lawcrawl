import openai

openai.api_key = 'your-api-key'

response = openai.File.create(
  file=open("data/cleaned/cuda.jsonl"),
  purpose='fine-tune'
)

print(response)
