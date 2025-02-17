from django import forms
from django.utils.translation import gettext_lazy as _

from userauths.models import Profile


class ProfileForm(forms.ModelForm):
    fname = forms.CharField(
        label=_("Ім'я"),
        widget=forms.TextInput(attrs={
            'class': 'woocommerce-Input woocommerce-Input--text input-text',
            'placeholder': _("Ім'я")
        })
    )
    lname = forms.CharField(
        label=_("Прізвище"),
        widget=forms.TextInput(attrs={
            'class': 'woocommerce-Input woocommerce-Input--text input-text',
            'placeholder': _("Прізвище")
        })
    )
    phone = forms.CharField(
        label=_("Номер телефону"),
        widget=forms.TextInput(attrs={
            'class': 'woocommerce-Input woocommerce-Input--text input-text',
            'placeholder': _("Номер телефону"),
            'maxlength': '19',
            'minlength': '17',
            'id': 'phone-input',
        })
    )

    class Meta:
        model = Profile
        fields = ['fname', 'lname', 'phone']