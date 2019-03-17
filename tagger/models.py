from django.db import models
from django.conf import settings
# Create your models here.

from django.utils import timezone

class Conv(models.Model):
    conv_id = models.CharField(max_length = 10)
    turn_id = models.CharField(max_length = 3)
    conv_cat = models.CharField(max_length = 200)
    speaker = models.CharField(max_length = 5)
    text = models.CharField(max_length = 300)
    intent = models.CharField(max_length = 100, null = True)
    ner = models.CharField(max_length = 100, null = True)
    created_date = models.DateTimeField()