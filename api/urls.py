from django.urls import path
from main.views import upload_file, chat_message, get_user_cases, fetch_case_conversation

urlpatterns = [
    path('upload/file/', upload_file, name='upload_file'),
    # path('upload/progress/', progress_endpoint, name='upload_progress'),
    path('chat/message/', chat_message, name='chat_message'),
    path('user/cases/', get_user_cases, name='user-cases'),
    path('conversation/<uuid:case_uid>/', fetch_case_conversation, name='fetch-case-conversation'),
]