# Generated by Django 2.2 on 2019-04-07 14:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tagger', '0006_userprofileinfo'),
    ]

    operations = [
        migrations.CreateModel(
            name='Act',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('act_id', models.CharField(max_length=8)),
                ('act', models.CharField(max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='Intent',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('intent_id', models.CharField(max_length=8)),
                ('intent', models.CharField(max_length=20)),
            ],
        ),
    ]