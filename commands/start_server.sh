#!/bin/bash

mkdir -p /beautyDj/src/static
mkdir -p /beautyDj/src/media
mkdir -p /beautyDj/src/staticfiles

python src/manage.py makemigrations
python src/manage.py migrate

python src/manage.py collectstatic --noinput --clear

python src/manage.py runserver 0.0.0.0:8000