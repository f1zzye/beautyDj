from django.db.models import Avg, Count
from django.shortcuts import render

from core.models import (Address, CartOrder, CartOrderItems, Category, Coupon,
                         Product, ProductImages, WishList)


def index(request):
    products = Product.objects.filter(product_status="опубліковано", featured=True)
    categories = Category.objects.all().annotate(product_count=Count("category"))

    context = {
        "products": products,
        "categories": categories,
    }
    return render(request, "index.html", context)


def product_list(request):
    products = Product.objects.filter(product_status="опубліковано")
    categories = Category.objects.all().annotate(product_count=Count("category"))

    context = {
        "products": products,
        "categories": categories,
    }
    return render(request, "core/product_list.html", context)


def category_product_list(request, cid):
    category = Category.objects.get(cid=cid)
    categories = Category.objects.all().annotate(product_count=Count("category"))
    products = Product.objects.filter(product_status="опубліковано", category=category)

    context = {
        "category": category,
        "products": products,
        "categories": categories,
    }
    return render(request, "core/category-product-list.html", context)


def products_detail(request, pid):
    product = Product.objects.get(pid=pid)
    products = Product.objects.filter(category=product.category).exclude(pid=pid)[:4]
    p_image = product.p_images.all()

    context = {
        "product": product,
        "p_image": p_image,
        "products": products,
    }
    return render(request, "core/product-detail.html", context)


def search(request):
    query = request.GET.get("query")
    categories = Category.objects.all().annotate(product_count=Count("category"))
    products = Product.objects.filter(title__icontains=query).order_by("-date")

    context = {
        "products": products,
        "query": query,
        "categories": categories,
    }
    return render(request, "core/search.html", context)
