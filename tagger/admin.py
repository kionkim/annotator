from django.contrib import admin
from .models import UserProfileInfo, User
# Register your models here.

from .models import Conv

admin.site.register(UserProfileInfo)
admin.site.register(Conv)

