from lawcrawl import settings
from storages.backends.s3boto3 import S3Boto3Storage


class StaticStorage(S3Boto3Storage):
    bucket_name = settings.AWS_STATIC_BUCKET_NAME


class UploadStorage(S3Boto3Storage):
    bucket_name = settings.AWS_UPLOAD_BUCKET_NAME
