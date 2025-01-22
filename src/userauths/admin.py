from django.contrib import admin
from userauths.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["username", "email", "is_active", "date_joined"]
    readonly_fields = ['email', 'username']
    ordering = ['email',]
