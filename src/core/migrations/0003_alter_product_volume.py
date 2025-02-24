# Generated by Django 5.1.4 on 2025-02-05 13:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_product_volume"),
    ]

    operations = [
        migrations.AlterField(
            model_name="product",
            name="volume",
            field=models.PositiveIntegerField(
                blank=True,
                choices=[
                    (None, "Без об'єму"),
                    (50, "50 мл"),
                    (100, "100 мл"),
                    (150, "150 мл"),
                    (200, "200 мл"),
                    (250, "250 мл"),
                    (300, "300 мл"),
                    (400, "400 мл"),
                    (500, "500 мл"),
                    (1000, "1000 мл"),
                ],
                null=True,
                verbose_name="Об'єм (мл)",
            ),
        ),
    ]
