# Generated by Django 5.1.4 on 2025-02-05 21:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0007_product_skin_type"),
    ]

    operations = [
        migrations.AlterField(
            model_name="product",
            name="skin_type",
            field=models.CharField(
                blank=True,
                default="Тип шкіри",
                max_length=100,
                null=True,
                verbose_name="Тип шкіри/волосся:",
            ),
        ),
    ]
