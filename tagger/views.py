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

@login_required
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

@login_required
def show_dashboard(request):
    with open('tagger/static/data/conv.json', 'r') as f:
        conv =  f.read()
    #print(conv)
    act = ['inform', 'ack', 'introduce', 'notify_success', \
           'request', 'confirm', 'affirm', 'thank', 'bye', 'offer' ]
    intent = ['선물', '리필']
    slot = ['service_type', 'coupon', 'data', 'calling', 'date', 'subscription']
    # Need to turn conv in json format
    return render(request, 'tagger/dashboard.html', \
                  {'act': act, 'slot': slot, 'intent': intent})

def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        print('login success = {}'.format(user))
        if user:
            if user.is_active:
                login(request,user)
                return HttpResponseRedirect(reverse('dashboard'))
            else:
                return HttpResponse("Your account was inactive.")
        else:
            print("Someone tried to login and failed.")
            print("They used username: {} and password: {}".format(username,password))
            return HttpResponse("Invalid login details given")
    else:
        return render(request, 'tagger/login.html')

@login_required
def show_tagger(request):
    print('***************** ')
    if request.method == 'POST':
        post_id = request.POST['post_id']
        print('post id = {}'.format(post_id))
    with open('tagger/static/data/conv.json', 'r') as f:
        conv =  f.read()
    #print(conv)
    act = ['inform', 'ack', 'introduce', 'notify_success', \
           'request', 'confirm', 'affirm', 'thank', 'bye', 'offer' ]
    intent = ['선물', '리필']
    slot = [{'service_type': '(178, 212, 245)'}, {'coupon': '(252, 195, 167)'}, \
            {'data': '(143, 208, 187)'}, {'calling': '(211, 189, 235)'}, \
            {'date': '(154, 159, 249)'}, {'subscription': '(252, 202, 202)'}]
    print(slot)
    print('render page')
    # Need to turn conv in json format
    return render(request, 'tagger/tagging_page.html', \
                  {'conv': conv, 'act': act, 'slot': slot, 'intent': intent})


def load_excel_to_sqlite(file = '~/Downloads/190112_chat.xlsx'):
    #'~/Downloads/twd_chat.xlsx'
    import pandas as pd

    #import sqlite3
    #conn = create_connection('/Users/kion.kim/work/annot/db.sqlite3')
    #cur = conn.cursor()
    xl  = pd.ExcelFile(file)
    df = xl.parse('sheet1')
    
    df.columns = list(df.iloc[0]) # First row is blank. so set the second row as column name
    df = df[1:]
    df1 = df[['번호', '카테고리', '내용', '접수일자']]
    cnt = 0
    # Conv._meta.local_fields 
    for i in range(100):
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

def load_excel_json(file = '~/Downloads/190112_chat.xlsx'):
    #'~/Downloads/twd_chat.xlsx'
    import pandas as pd
    import os, json
    #import sqlite3
    #conn = create_connection('/Users/kion.kim/work/annot/db.sqlite3')
    #cur = conn.cursor()
    xl  = pd.ExcelFile(file)
    df = xl.parse('sheet1')
    # Working on my mac, First row is blank. so set the second row as column name
    #df.columns = list(df.iloc[0]) 
    #df = df[1:]
    df1 = df[['번호', '카테고리', '내용', '접수일자']]
    results = []
    num_conv = df1.shape[0]
    # Conv._meta.local_fields 
    for i in range(10):
        tmp_df =  df1.iloc[i]
        conv_id = tmp_df['번호']
        conv_cat = tmp_df['카테고리']
        tmp_conv = [x.split('|') for x in tmp_df['내용'].split('\n') if x.split('|')[0].strip() in ('고객', '상담사', '시스템')] 
        conv = [[x[0].strip(), x[1].strip(), x[2].strip()] for x in tmp_conv if len(x) == 3]
        sen_json = []
        for j in range(len(conv)):
            speaker = conv[j][0]
            text = conv[j][1].replace('\'', '*').replace('"', '*').replace('\\', '=')
            #created_date = conv[j][2]
            txt = """{{"text": "{}", "speaker": "{}", "domain": null, "intent": null, "dialogActs": []}}""".format(text, speaker)
            #print(txt)
            sen_json.append(json.loads(txt))
            print(sen_json)
        _res = """{{"name": "{}", "cat": "{}", "sentences": {} }}""".format("TTXX_" + str(conv_id), conv_cat, sen_json)
        #print(_res)
        results.append(_res)
    with open(os.path.join(os.curdir, "tagger/static/data/conv.json"), 'w') as f:
        txt = """{{ "count": "{}", "next": null, "previous": null, "results": {} }}""".format(num_conv, results)
        txt = txt.replace('["{', '[{]').replace('}", "{', '}, {').replace("'", '"')
        print(txt)
        f.write(txt)
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