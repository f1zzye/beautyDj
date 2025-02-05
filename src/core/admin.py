from django.contrib import admin
from core.models import (Address, Brand, CartOrder, CartOrderItems, Category,
                         Coupon, Product, ProductImages, WishList, ProductVariant)


class ProductImagesAdmin(admin.TabularInline):
    model = ProductImages
    extra = 1


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ['volume', 'price', 'old_price', 'status', 'image']
    readonly_fields = ['sku']


@admin.register(Product)
class ProductsAdmin(admin.ModelAdmin):
    inlines = [ProductVariantInline, ProductImagesAdmin]
    list_display = ["user", "title", "products_image", "price", "category", "featured", "product_status", "pid"]
    list_filter = [
        "category",
        "brand",
        "status",
        "featured",
        "product_status"
    ]
    search_fields = ["title", "description", "mini_description"]
    readonly_fields = ["pid", "sku"]


@admin.register(Brand)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["title"]
    readonly_fields = ["bid"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["title", "category_image"]
    readonly_fields = ["cid"]


@admin.register(CartOrder)
class CartOrderAdmin(admin.ModelAdmin):
    list_editable = ["paid_status", "product_status"]
    list_display = ["user", "price", "paid_status", "order_date", "product_status", "sku"]
    readonly_fields = ["sku", "oid"]


@admin.register(CartOrderItems)
class CartOrderItemsAdmin(admin.ModelAdmin):
    list_display = ["order", "invoice_num", "item", "image", "quantity", "price", "total"]


@admin.register(WishList)
class WishListAdmin(admin.ModelAdmin):
    list_display = ["user", "product", "date"]


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_editable = ["address", "status"]
    list_display = ["user", "address", "status"]


admin.site.register(Coupon)