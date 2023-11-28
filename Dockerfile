# Use Python 3.9 on Alpine as the base image
FROM python:3.11.6-alpine3.18

# Install build dependencies using apk
RUN apk --no-cache add gcc musl-dev openssl-dev libffi-dev zlib-dev make g++

# Copy your application code to the container
COPY . /app
WORKDIR /app

RUN pip3 install --upgrade pip
# Install your application's dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Expose the port your app runs on
EXPOSE 8000

# Command to run your application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
