from django.contrib.auth import views as auth_views
from django.urls import path

from userauths.views import (CustomPasswordResetConfirmView, activate,
                             login_view, logout_view, password_reset_view,
                             register_view)

app_name = "userauths"

urlpatterns = [
    path("sign-up/", register_view, name="sign-up"),
    path("activate/<uidb64>/<token>/", activate, name="activate"),
    path("sign-in/", login_view, name="sign-in"),
    path("sign-out/", logout_view, name="sign-out"),
    path("password-reset/", password_reset_view, name="password_reset"),
    path(
        "password-reset-confirm/<uidb64>/<token>/",
        CustomPasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
]
