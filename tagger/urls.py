from django.urls import path
from django.conf.urls import url
from tagger import views

urlpatterns = [
    url(r'^conv_tag/', views.show_tagger, name = 'conv_tag'),
    url(r'^dashboard/', views.show_tagger, name = 'dashboard'),
    url(r'^register/$', views.register, name = 'register'),
    url(r'^user_login/$', views.user_login, name = 'user_login'),
]
