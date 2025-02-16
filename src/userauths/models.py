from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=60)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.username


class ContactUs(models.Model):
    full_name = models.CharField(_("Повне Ім'я"), max_length=100)
    email = models.EmailField()
    message = models.TextField(_("Повідомлення"))

    class Meta:
        verbose_name_plural = _("Зв'язатися з нами")

    def __str__(self):
        return self.full_name

