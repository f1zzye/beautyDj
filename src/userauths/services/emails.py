from django.core.mail import send_mail, EmailMessage
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.tokens import default_token_generator


def send_confirmation_email(request, user):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    current_site = get_current_site(request)
    mail_subject = _('Activate your account')
    message = render_to_string('emails/registration_email.html', {
        'user': user,
        'domain': current_site.domain,
        'uid': uid,
        'token': token,
    })

    email = EmailMessage(
        subject=mail_subject,
        body=message,
        from_email='kosenko2401@gmail.com',
        to=[user.email]
    )
    email.content_subtype = 'html'
    email.send()


