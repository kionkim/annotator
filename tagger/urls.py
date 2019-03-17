from django.urls import path
from . import views

urlpatterns = [
    path('', views.show_tagger, name = 'tagging_page'),
]
