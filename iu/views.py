from django.shortcuts import render
from django.contrib.auth import get_user_model
# Create your views here.
from django.utils import timezone
from .models import Post

def post_list(request):
    user = get_user_model()
    print('*'*20)
    print(user)
    print(Post.objects)
    posts = Post.objects.order_by('published_date')
    print(posts)
    return render(request, 'iu/post_list.html', {'posts': posts})
