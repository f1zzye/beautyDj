from django.core.validators import (MaxValueValidator, MinValueValidator,
                                    RegexValidator)
from django.db import models
from django.utils.html import mark_safe
from django.utils.timezone import now
from django.utils.translation import gettext_lazy as _
from shortuuid.django_fields import ShortUUIDField

from userauths.models import User

STATUS_CHOICE = (
    ("обробка", "Обробка"),
    ("відправлено", "Відправлено"),
    ("доставлено", "Доставлено"),
)

STATUS = (
    ("чернетка", "Чернетка"),
    ("відключено", "Відключено"),
    ("відхилено", "Відхилено"),
    ("розглядається", "Розглядається"),
    ("опубліковано", "Опубліковано"),
)


def user_directory_path(instance, filename):
    return "user_{0}/{1}".format(instance.user.id, filename)


class Category(models.Model):
    cid = ShortUUIDField(unique=True, length=10, max_length=20, prefix="cid", alphabet="abcdefgh12345")
    title = models.CharField(_("Назва"), max_length=100, default="Food")
    image = models.ImageField(_("Зображення"), upload_to="category", default="category.jpg")

    class Meta:
        verbose_name = _("Категорія")
        verbose_name_plural = _("Категорії")

    def category_image(self):
        return mark_safe('<img src="%s" width="50" height="50" />' % (self.image.url))

    def __str__(self):
        return self.title


class Brand(models.Model):
    bid = ShortUUIDField(unique=True, length=10, max_length=20, prefix="bid", alphabet="abcdefgh12345")
    title = models.CharField(_("Назва"), max_length=100, default="Brand")

    class Meta:
        verbose_name = _("Бренд")
        verbose_name_plural = _("Бренди")

    def __str__(self):
        return self.title


class Product(models.Model):
    VOLUME_CHOICES = [
        (None, _("Без об'єму")),
        (50, "50 мл"),
        (100, "100 мл"),
        (150, "150 мл"),
        (200, "200 мл"),
        (250, "250 мл"),
        (300, "300 мл"),
        (400, "400 мл"),
        (500, "500 мл"),
        (1000, "1000 мл"),
    ]

    pid = ShortUUIDField(unique=True, length=10, max_length=20, prefix="pid", alphabet="abcdefgh12345")

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name=_("Користувач"))

    title = models.CharField(_("Назва"), max_length=100, default="Product")
    image = models.ImageField(_("Зображення"), upload_to=user_directory_path, default="product.jpg")
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name="category", verbose_name=_("Категорія")
    )
    volume = models.PositiveIntegerField(
        _("Об'єм (мл)"),
        choices=VOLUME_CHOICES,
        null=True,
        blank=True,
    )
    mini_description = models.TextField(_("Короткий опис"), null=True, blank=True, default="Короткий опис товару")
    description = models.TextField(_("Опис"), null=True, blank=True, default="Повний опис товару")
    skin_type = models.CharField(_("Тип шкіри/волосся:"), max_length=100, null=True, blank=True, default="Тип шкіри")

    country_of_manufacture = models.CharField(_("Країна виробник"), max_length=100, default="Ukraine")
    usage = models.TextField(_("Використання"), max_length=300, default="Як використовувати продукт")
    brand = models.ForeignKey(
        Brand, on_delete=models.SET_NULL, null=True, related_name="brand", verbose_name=_("Бренд")
    )

    price = models.DecimalField(_("Ціна"), max_digits=99, decimal_places=2, default="1.99")
    old_price = models.DecimalField(_("Стара ціна"), max_digits=99, decimal_places=2, default="2.99")
    product_status = models.CharField(_("Статус продукту"), choices=STATUS, max_length=20, default="розглядається")

    status = models.BooleanField(_("Активний"), default=True)
    in_stock = models.BooleanField(_("В наявності"), default=True)
    featured = models.BooleanField(_("Рекомендований"), default=False)
    extra_products = models.BooleanField(_("Додаткові товари для Головоної сторінки"), default=False)

    sku = ShortUUIDField(unique=True, length=4, max_length=10, prefix="sku", alphabet="1234567890")

    date = models.DateTimeField(_("Дата створення"), auto_now_add=True)
    updated = models.DateTimeField(_("Оновлено"), auto_now=True)

    class Meta:
        verbose_name = _("Товар")
        verbose_name_plural = _("Товари")

    def products_image(self):
        return mark_safe('<img src="%s" width="50" height="50" />' % (self.image.url))

    def __str__(self):
        return self.title

    def get_percentage(self):
        # new_price = (self.price / self.old_price) * 100
        new_price = ((self.old_price - self.price) / self.old_price) * 100
        return new_price


class ProductVariant(models.Model):
    """Модель для дополнительных вариантов товара с разными объемами"""

    product = models.ForeignKey(
        Product, related_name="variants", on_delete=models.CASCADE, verbose_name=_("Основний товар")
    )
    volume = models.PositiveIntegerField(_("Об'єм (мл)"), choices=Product.VOLUME_CHOICES, null=True, blank=True)
    price = models.DecimalField(_("Ціна"), max_digits=99, decimal_places=2)
    old_price = models.DecimalField(_("Стара ціна"), max_digits=99, decimal_places=2, null=True, blank=True)
    image = models.ImageField(
        _("Зображення варіанту"),
        upload_to="product-variants",
        help_text=_("Зображення для конкретного об'єму товару"),
        null=True,
        blank=True,
    )
    sku = ShortUUIDField(unique=True, length=4, max_length=10, prefix="sku", alphabet="1234567890")
    status = models.BooleanField(_("Активний"), default=True)

    class Meta:
        verbose_name = _("Варіант товару")
        verbose_name_plural = _("Варіанти товару")
        unique_together = ["product", "volume"]

    def __str__(self):
        return f"{self.product.title} - {self.volume}мл" if self.volume else self.product.title

    def get_percentage(self):
        if self.old_price:
            return ((self.old_price - self.price) / self.old_price) * 100
        return 0


class ProductImages(models.Model):
    images = models.ImageField(_("Зображення"), upload_to="product-images", default="product.jpg")
    product = models.ForeignKey(
        Product, verbose_name=_("Продукт"), related_name="p_images", on_delete=models.SET_NULL, null=True
    )
    data = models.DateTimeField(_("Дата"), auto_now_add=True)

    class Meta:
        verbose_name = _("Зображення продукту")
        verbose_name_plural = _("Зображення продуктів")

    ################################## Cart, Order, OrderItems and Address ############################


class CartOrder(models.Model):
    user = models.ForeignKey(User, verbose_name=_("Користувач"), on_delete=models.SET_NULL, null=True)
    full_name = models.CharField(_("Повне ім'я"), max_length=100, null=True, blank=True)
    email = models.CharField(_("Електронна пошта"), max_length=100, null=True, blank=True)
    phone = models.CharField(
        _("Телефон"),
        max_length=15,
        validators=[RegexValidator(r"^\+?1?\d{9,15}$", _("Введіть дійсний номер телефону."))],
    )

    address = models.CharField(_("Адреса"), max_length=100, null=True, blank=True)
    city = models.CharField(_("Місто"), max_length=100, null=True, blank=True)
    state = models.CharField(_("Область"), max_length=100, null=True, blank=True)
    country = models.CharField(_("Країна"), max_length=100, null=True, blank=True)

    price = models.DecimalField(_("Ціна"), max_digits=99, decimal_places=2, default="1.99")
    saved = models.DecimalField(_("Заощаджено"), max_digits=12, decimal_places=2, default="0.00")
    coupons = models.ManyToManyField("core.Coupon", verbose_name=_("Купони"), blank=True)

    paid_status = models.BooleanField(_("Статус оплати"), default=False)
    order_date = models.DateTimeField(_("Дата замовлення"), auto_now_add=True)
    product_status = models.CharField(
        _("Статус продукту"), choices=STATUS_CHOICE, max_length=30, default="розглядається", null=True, blank=True
    )

    sku = ShortUUIDField(_("SKU"), null=True, blank=True, length=5, prefix="SKU", max_length=20, alphabet="1234567890")
    oid = ShortUUIDField(_("OID"), null=True, blank=True, length=5, max_length=20, alphabet="1234567890")

    class Meta:
        verbose_name = _("Замовлення")
        verbose_name_plural = _("Замовлення")


class CartOrderItems(models.Model):
    order = models.ForeignKey(CartOrder, verbose_name=_("Замовлення"), on_delete=models.CASCADE)
    invoice_num = models.CharField(_("Номер Замовлення"), max_length=200)
    product_status = models.CharField(_("Статус продукту"), max_length=200)
    item = models.CharField(_("Елемент"), max_length=200)
    image = models.CharField(_("Зображення"), max_length=200)
    quantity = models.IntegerField(_("Кількість"), default=0)
    price = models.DecimalField(_("Ціна"), max_digits=99, decimal_places=2, default="1.99")
    total = models.DecimalField(_("Загалом"), max_digits=99, decimal_places=2, default="1.99")

    class Meta:
        verbose_name = _("Замовленний товар")
        verbose_name_plural = _("Замовленні товари")

    def order_image(self):
        return mark_safe('<img src="/media/%s" width="50" height="50" />' % (self.image))

    ################################## Wishlishs, Address, Coupon ##########################################


class WishList(models.Model):
    user = models.ForeignKey(User, verbose_name=_("Користувач"), on_delete=models.SET_NULL, null=True)
    product = models.ForeignKey(Product, verbose_name=_("Продукт"), on_delete=models.SET_NULL, null=True)
    date = models.DateTimeField(_("Дата"), auto_now_add=True)

    class Meta:
        verbose_name = _("Список бажань")
        verbose_name_plural = _("Списки бажань")

    def __str__(self):
        return self.product.title


class Address(models.Model):
    user = models.ForeignKey(User, verbose_name=_("Користувач"), on_delete=models.SET_NULL, null=True)
    address = models.CharField(_("Адреса"), max_length=100, null=True)
    mobile = models.CharField(
        _("Телефон"),
        max_length=15,
        null=True,
        validators=[RegexValidator(r"^\+?1?\d{9,15}$", _("Введіть дійсний номер телефону."))],
    )
    status = models.BooleanField(_("Статус"), default=False)

    class Meta:
        verbose_name = _("Адреса")
        verbose_name_plural = _("Адреси")


class Coupon(models.Model):
    code = models.CharField(_("Код"), max_length=50)
    discount = models.PositiveIntegerField(
        _("Знижка"), default=1, validators=[MinValueValidator(1), MaxValueValidator(100)]
    )
    active = models.BooleanField(_("Активний"), default=True)
    start_date = models.DateTimeField(_("Дата початку"), default=now)
    end_date = models.DateTimeField(_("Дата завершення"), null=True, blank=True)

    def is_valid(self):
        if self.end_date:
            return self.active and now() < self.end_date
        return self.active

    def __str__(self):
        return self.code

    class Meta:
        verbose_name = _("Купон")
        verbose_name_plural = _("Купони")
