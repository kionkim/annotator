# Generated by Django 2.1.7 on 2019-03-16 13:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tagger', '0002_readconv'),
    ]

    operations = [
        migrations.AlterField(
            model_name='readconv',
            name='created_date',
            field=models.DateTimeField(),
        ),
        migrations.AlterField(
            model_name='readconv',
            name='intent',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='readconv',
            name='ner',
            field=models.CharField(max_length=100, null=True),
        ),
    ]
