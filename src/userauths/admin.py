from django.contrib import admin

from userauths.models import ContactUs, Profile, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["username", "email", "is_active", "date_joined"]
    readonly_fields = ["email", "username"]
    ordering = [
        "email",
    ]


@admin.register(ContactUs)
class ContactUsAdmin(admin.ModelAdmin):
    list_display = ["full_name", "email"]


admin.site.register(Profile)
