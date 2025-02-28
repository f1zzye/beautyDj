#!/bin/bash

mkdir -p /beautyDj/src/static
mkdir -p /beautyDj/src/media

python src/manage.py makemigrations
python src/manage.py migrate

python src/manage.py collectstatic --noinput

python src/manage.py runserver 0.0.0.0:8000