from django.contrib import admin

from core.models import (Address, CartOrder, CartOrderItems, Category, Coupon,
                         Product, ProductImages, WishList)


class ProductImagesAdmin(admin.TabularInline):
    model = ProductImages


@admin.register(Product)
class ProductsAdmin(admin.ModelAdmin):
    inlines = [ProductImagesAdmin]
    list_display = ["user", "title", "products_image", "price", "category", "featured", "product_status", "pid"]
    readonly_fields = ["pid", "sku"]


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
