from django.shortcuts import render
from django.contrib.auth import get_user_model
# Create your views here.
from django.utils import timezone
from django.core import serializers
from .models import Conv

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