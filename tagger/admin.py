from django.contrib import admin
from .models import UserProfileInfo, User, Conv, Intent, Act
# Register your models here.

admin.site.register(UserProfileInfo)
admin.site.register(Conv)
admin.site.register(Intent)
admin.site.register(Act)

