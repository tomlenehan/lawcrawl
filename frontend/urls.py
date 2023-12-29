from django.urls import path, re_path, include
from .views import index

urlpatterns = [
    path('', index),
    path('home', index),
    path('login', index),
    path('signup', index),
    path('chat', index),
    path('upload', index),
    path('terms', index),
    path('blog_list', index),
    path('blog_post/<str:post_id>/', index),

    # auth
    re_path(r'^activation/.*$', index, name='activation'),
    path('reset_password', index, name='reset_password'),
    re_path(r'^password/reset/confirm/.*$', index, name='password_reset_confirm'),
]
