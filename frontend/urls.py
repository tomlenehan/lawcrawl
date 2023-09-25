from django.urls import path
from .views import index

urlpatterns = [
    path('', index),
    path('home', index),
    path('login', index),
    path('chat', index),
    path('upload', index),
]
