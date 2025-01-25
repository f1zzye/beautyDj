from django.shortcuts import render, redirect
from userauths.forms import UserRegisterForm
from django.contrib import messages
from userauths.services.emails import send_confirmation_email
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth.models import User
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth import get_user_model


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
