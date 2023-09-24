from django.urls import path
from main.views import upload_file, progress_endpoint, chat_message, get_user_cases

urlpatterns = [
    path('upload/', upload_file, name='upload_file'),
    path('upload/progress/', progress_endpoint, name='upload_progress'),
    path('chat/message/', chat_message, name='chat_message'),
    path('user/cases/', get_user_cases, name='user-cases'),
]