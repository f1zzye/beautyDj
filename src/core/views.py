from django.shortcuts import render
from django.db.models import Count, Avg
from core.models import (Address, CartOrder, CartOrderItems, Category, Coupon,
                         Product, ProductImages, WishList)


def index(request):
    products = Product.objects.filter(product_status="опубліковано", featured=True)
    categories = Category.objects.all().annotate(product_count=Count('category'))

    context = {
        "products": products,
        'categories': categories,
    }
    return render(request, "index.html", context)


def product_list(request):
    products = Product.objects.filter(product_status="опубліковано")
    categories = Category.objects.all().annotate(product_count=Count('category'))

    context = {
        "products": products,
        "categories": categories,
    }
    return render(request, "core/product_list.html", context)


def category_product_list(request, cid):
    category = Category.objects.get(cid=cid)
    categories = Category.objects.all().annotate(product_count=Count('category'))
    products = Product.objects.filter(product_status='опубліковано', category=category)

    context = {
        'category': category,
        'products': products,
        'categories': categories,
    }
    return render(request, 'core/category-product-list.html', context)