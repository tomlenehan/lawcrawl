from django.urls import path
from main.views import upload_file, chat_message, get_user_cases, fetch_case_conversation, ad_view

urlpatterns = [
    path('upload/file/', upload_file, name='upload_file'),
    path('chat/ads/', ad_view, name='ad-list'),
    path('chat/message/', chat_message, name='chat_message'),
    path('user/cases/', get_user_cases, name='user-cases'),
    path('conversation/<uuid:case_uid>/', fetch_case_conversation, name='fetch-case-conversation'),
]