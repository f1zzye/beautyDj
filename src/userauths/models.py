from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
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


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name=_("Користувач"))
    image = models.ImageField(upload_to="image", null=True, blank=True, verbose_name=_("Зображення"))
    fname = models.CharField(max_length=100, null=True, blank=True, verbose_name=_("Ім'я"))
    lname = models.CharField(max_length=100, null=True, blank=True, verbose_name=_("Прізвище"))
    phone = models.CharField(
        _("Телефон"),
        max_length=20,
        null=True, blank=True,
    )

    class Meta:
        verbose_name = _("Профіль")
        verbose_name_plural = _("Профілі")

    def __str__(self):
        return f"{self.user.username} - {self.phone}"
