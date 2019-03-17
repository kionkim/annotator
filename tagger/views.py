from django.shortcuts import render
from tagger.forms import UserForm, UserProfileInfoForm
# Create your views here.
from django.utils import timezone
from django.core import serializers
from .models import Conv


from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect, HttpResponse
from django.urls import reverse
from django.contrib.auth.decorators import login_required

from django import forms
from tagger.models import UserProfileInfo
from django.contrib.auth.models import User


def index(request):
    return render(request, 'tagger/index.html')


@login_required
def special(request):
    return HttpResponse("You are logged in !")


@login_required
def user_logout(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))


def register(request):
    registered = False
    if request.method == 'POST':
        user_form = UserForm(data=request.POST)
        profile_form = UserProfileInfoForm(data=request.POST)
        if user_form.is_valid() and profile_form.is_valid():
            user = user_form.save()
            user.set_password(user.password)
            user.save()
            profile = profile_form.save(commit=False)
            profile.user = user
            if 'profile_pic' in request.FILES:
                print('found it')
                profile.profile_pic = request.FILES['profile_pic']
            profile.save()
            registered = True
        else:
            print(user_form.errors,profile_form.errors)
    else:
        user_form = UserForm()
        profile_form = UserProfileInfoForm()
    return render(request,'tagger/registration.html',
                          {'user_form':user_form,
                           'profile_form':profile_form,
                           'registered':registered})


def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                login(request,user)
                return HttpResponseRedirect(reverse('index'))
            else:
                return HttpResponse("Your account was inactive.")
        else:
            print("Someone tried to login and failed.")
            print("They used username: {} and password: {}".format(username,password))
            return HttpResponse("Invalid login details given")
    else:
        return render(request, 'tagger/login.html', {})

@login_required
def show_tagger(request):
    conv = Conv.objects.filter(conv_id=355)
    conv_json = serializers.serialize('json', conv)
    print('conv_json = {}'.format(conv_json[0]) )
    return render(request, 'tagger/tagging_page.html', {'conv': conv, 'conv_json': conv_json})


def load_excel(file = '~/Downloads/190112_chat.xlsx'):
    #'~/Downloads/190112_chat.xlsx'
    import pandas as pd

    #import sqlite3
    #conn = create_connection('/Users/kion.kim/work/annot/db.sqlite3')
    #cur = conn.cursor()
    xl  =pd.ExcelFile(file)
    df = xl.parse('sheet1')
    df1 = df[['번호', '카테고리', '내용', '접수일자']]
    cnt = 0
    # Conv._meta.local_fields 
    for i in range(df1.shape[0]):
        tmp_df =  df1.iloc[i]
        conv_id = tmp_df['번호']
        conv_cat = tmp_df['카테고리']
        tmp_conv = [x.split('|') for x in tmp_df['내용'].split('\n') if x.split('|')[0].strip() in ('고객', '상담사', '시스템')] 
        conv = [[x[0].strip(), x[1].strip(), x[2].strip()] for x in tmp_conv if len(x) == 3]
        for j in range(len(conv)):
            speaker = conv[j][0]
            text = conv[j][1]
            created_date = conv[j][2]
            Conv.objects.create(id = cnt, \
                            conv_id = conv_id, \
                            turn_id = j, \
                            conv_cat = conv_cat, \
                            speaker = speaker, \
                            text = text, \
                            intent = None, \
                            ner = None, \
                            created_date = created_date)
            cnt += 1  
    return None

def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)
 
    return None