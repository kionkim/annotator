from django.urls import path
from django.conf.urls import url
from tagger import views

urlpatterns = [
    url(r'^conv_tagger/$', views.show_conv_tagger, name = 'conv_tagger'),
    url(r'^conv_tagger_wp/$', views.show_conv_tagger_wp, name = 'conv_tagger_wp'),
    url(r'^conv_generator/$', views.show_conv_generator, name = 'conv_generator'),
    url(r'^dashboard/', views.show_dashboard, name = 'dashboard'),
    url(r'^register/$', views.register, name = 'register'),
    url(r'^user_login/$', views.user_login, name = 'user_login'),

]
