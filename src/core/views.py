from django.shortcuts import render

from core.models import (Address, CartOrder, CartOrderItems, Category, Coupon,
                         Product, ProductImages, WishList)


def index(request):
    products = Product.objects.filter(product_status="опубліковано", featured=True)

    context = {
        "products": products,
    }
    return render(request, "index.html", context)


def product_list(request):
    products = Product.objects.filter(product_status="опубліковано")

    context = {
        "products": products,
    }
    return render(request, "core/product_list.html", context)
