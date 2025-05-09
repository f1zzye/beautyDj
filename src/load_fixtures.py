# src/load_fixtures.py
import os
import django
from django.db.models.signals import post_save
from django.contrib.auth import get_user_model
from django.core.management import call_command

# Устанавливаем правильный путь к настройкам
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Добавляем путь к директории с настройками в PYTHONPATH
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), ''))

# Инициализация Django
django.setup()

User = get_user_model()

def main():
    # Сохраняем существующие receivers
    saved_receivers = post_save.receivers
    post_save.receivers = []

    try:
        # Очищаем существующие данные
        User.objects.all().delete()

        # Загружаем данные
        print("Loading userauths data...")
        call_command('loaddata', 'src/fixtures/userauths_data.json', verbosity=1)
        print("Loading core data...")
        call_command('loaddata', 'src/fixtures/core_data.json', verbosity=1)

    finally:
        # Восстанавливаем receivers
        post_save.receivers = saved_receivers

if __name__ == '__main__':
    main()