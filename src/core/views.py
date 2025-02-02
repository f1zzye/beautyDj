from django.db.models import Avg, Count
from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string

from core.models import (Address, CartOrder, CartOrderItems, Category, Coupon,
                         Product, ProductImages, WishList)


def index(request):
    products = Product.objects.filter(product_status="опубліковано", featured=True)
    extra_products = Product.objects.filter(product_status="опубліковано", extra_products=True)

    context = {
        "products": products,
        "extra_products": extra_products,
    }
    return render(request, "index.html", context)


def product_list(request):
    products = Product.objects.filter(product_status="опубліковано")

    context = {
        "products": products,
    }
    return render(request, "core/product_list.html", context)


def category_product_list(request, cid):
    category = Category.objects.get(cid=cid)
    products = Product.objects.filter(product_status="опубліковано", category=category)

    # Добавляем выбранную категорию в контекст
    context = {
        "category": category,
        "products": products,
        "selected_category": category.id,  # Добавляем ID выбранной категории
    }
    return render(request, "core/category-product-list.html", context)


def products_detail(request, pid):
    product = Product.objects.get(pid=pid)
    products = Product.objects.filter(category=product.category).exclude(pid=pid)[:5]
    p_image = product.p_images.all()

    context = {
        "product": product,
        "p_image": p_image,
        "products": products,
    }
    return render(request, "core/product-detail.html", context)


def search(request):
    query = request.GET.get("query")
    products = Product.objects.filter(title__icontains=query).order_by("-date")

    context = {
        "products": products,
        "query": query,
    }
    return render(request, "core/search.html", context)


def filter_products(request):
    categories = request.GET.getlist('category[]')
    brands = request.GET.getlist('brand[]')

    products = Product.objects.filter(product_status="опубліковано").order_by('-date').distinct()

    if len(categories) > 0:
        products = products.filter(category__id__in=categories).distinct()

    if len(brands) > 0:
        products = products.filter(brand__id__in=brands).distinct()

    products_count = products.count()

    word_ending = 'ів'
    if products_count == 1:
        word_ending = ''
    elif products_count in [2, 3, 4]:
        word_ending = 'и'

    data = render_to_string('core/async/product-list.html', {'products': products})
    count_text = f'Ми знайшли для вас <strong>{products_count}</strong> товар{word_ending}!'

    return JsonResponse({
        'data': data,
        'count_text': count_text
    })