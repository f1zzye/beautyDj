from django.contrib import admin

from core.models import (Address, Brand, CartOrder, CartOrderItems, Category,
                         Coupon, Product, ProductVariant, WishList)


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0
    fields = ["volume", "price", "old_price", "status", "image"]
    readonly_fields = ["sku"]


@admin.register(Product)
class ProductsAdmin(admin.ModelAdmin):
    inlines = [ProductVariantInline]
    list_display = [
        "user",
        "title",
        "products_image",
        "price",
        "category",
        "featured",
        "extra_products",
        "product_status",
    ]
    list_filter = ["category", "brand", "status", "featured", "product_status"]
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


class CartOrderItemsInline(admin.TabularInline):
    model = CartOrderItems
    extra = 0
    readonly_fields = ["order_image"]
    fields = ["item", "order_image", "quantity", "total", "volume"]


@admin.register(CartOrder)
class CartOrderAdmin(admin.ModelAdmin):
    inlines = [CartOrderItemsInline]
    list_editable = ["paid_status", "product_status"]
    list_display = ["user", "price", "paid_status", "order_date", "product_status", "sku"]
    readonly_fields = ["sku", "oid", "user"]


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
