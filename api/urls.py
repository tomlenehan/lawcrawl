from django.urls import path
from main.views import upload_file, progress_endpoint

urlpatterns = [
    path('upload/', upload_file, name='upload_file'),
    path('upload/progress/', progress_endpoint, name='upload_progress'),
]