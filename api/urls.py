from django.urls import path
from main.views import (upload_file, get_user_cases, get_user_details, check_user_accounts, delete_case, fetch_conversation,
                        process_pdf, chat_message, update_newsletter_opt_in)

urlpatterns = [
    path('upload/file/', upload_file, name='upload_file'),
    # path('chat/ads/', ad_view, name='ad-list')w,
    path('process_pdf/<str:case_uid>/', process_pdf, name='process_pdf_file'),
    path('chat/message/', chat_message, name='chat_message'),
    path('user/cases/', get_user_cases, name='user-cases'),
    path('user/update_newsletter_opt_in/', update_newsletter_opt_in, name='update_newsletter_opt_in'),
    path('user/details/', get_user_details, name='get_user_details'),
    path('user/check', check_user_accounts, name='check_user'),
    path('user/cases/delete/<uuid:case_uid>/', delete_case, name='delete_case'),
    path('conversation/<uuid:case_uid>/', fetch_conversation, name='fetch-case-conversation'),
]