from django.urls import path
from main.views import upload_file, chat_message, get_user_cases, fetch_conversation, process_pdf

urlpatterns = [
    path('upload/file/', upload_file, name='upload_file'),
    # path('chat/ads/', ad_view, name='ad-list'),
    # path('serve_pdf/<str:file_name>/', serve_pdf, name='serve_pdf_file'),
    path('process_pdf/<str:case_uid>/', process_pdf, name='process_pdf_file'),
    path('chat/message/', chat_message, name='chat_message'),
    path('user/cases/', get_user_cases, name='user-cases'),
    path('conversation/<uuid:case_uid>/', fetch_conversation, name='fetch-case-conversation'),
]