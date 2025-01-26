from django.conf import settings
from django.shortcuts import render, redirect
from userauths.forms import UserRegisterForm
from django.contrib import messages
from userauths.services.emails import send_confirmation_email, send_password_reset_email
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.sites.shortcuts import get_current_site
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth import get_user_model
from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.contrib.auth.views import PasswordResetConfirmView
from django.contrib.messages.views import SuccessMessageMixin


User = get_user_model()


def register_view(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST or None)
        if form.is_valid():
            new_user = form.save(commit=False)
            new_user.is_active = False
            new_user.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Будь ласка, підтвердіть свою електронну пошту, щоб активувати обліковий запис.')
            send_confirmation_email(request, new_user)
            return redirect('core:index')
    else:
        form = UserRegisterForm()

    context = {
        'form': form,
    }
    return render(request, 'userauths/sign-up.html', context)


def login_view(request):
    if request.user.is_authenticated:
        messages.warning(request, f'Ви вже увійшли в систему.')
        return redirect('core:index')

    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        try:
            user = User.objects.get(email=email)
            user = authenticate(request, email=email, password=password)

            if user is not None:
                login(request, user)
                messages.success(request, f'Ласкаво просимо, {user.username}')
                return redirect('core:index')
            else:
                messages.warning(request, 'Користувач не існує, створіть обліковий запис.')
        except:
            messages.warning(request, f'Користувач з {email} не існує.')

    return render(request, 'userauths/sign-in.html')


def logout_view(request):
    logout(request)
    messages.success(request, 'Ви вийшли з системи.')
    return redirect('userauths:sign-in')


# class ResetPasswordView(SuccessMessageMixin, PasswordResetView):
#     template_name = 'reset-password/password_reset.html'
#     email_template_name = 'emails/password_reset_email.html'
#     subject_template_name = 'reset-password/password_reset_subject.html'
#     success_message = "We've emailed you instructions for setting your password, " \
#                       "if an account exists with the email you entered. You should receive them shortly." \
#                       " If you don't receive an email, " \
#                       "please make sure you've entered the address you registered with, and check your spam folder."
#     success_url = reverse_lazy('core:index')


def password_reset_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        try:
            user = User.objects.get(email=email)
            success_url, success_message = send_password_reset_email(request, user)
            messages.success(request, success_message)
            return redirect(success_url)
        except User.DoesNotExist:
            messages.error(request, _("Користувача з такою електронною адресою не знайдено."))
            return redirect('userauths:password_reset')
    return render(request, 'reset-password/password_reset.html')


class CustomPasswordResetConfirmView(SuccessMessageMixin, PasswordResetConfirmView):
    template_name = 'reset-password/password_reset_confirm.html'
    success_url = reverse_lazy('core:index')
    success_message = _("Новий пароль встановлено.")

    def form_valid(self, form):
        response = super().form_valid(form)
        return response


def activate(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        login(request, user)
        messages.success(request, 'Ваш обліковий запис було успішно активовано!')
        return redirect('core:index')
    else:
        messages.error(request, 'Посилання для активації недійсне!')
        return redirect('core:index')
