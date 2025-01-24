from django.urls import path
from userauths import views
from userauths.views import activate

app_name = "userauths"

urlpatterns = [
    path("sign-up/", views.register_view, name="register"),
    path('activate/<uidb64>/<token>/', activate, name='activate'),
]