from django.db.models import F, Q, Min, Max
from django.http import JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string

from core.models import (Address, CartOrder, CartOrderItems, Category, Coupon,
                         Product, WishList)
from userauths.models import ContactUs


def index(request):
    sale_products = Product.objects.filter(
        product_status="опубліковано",
        old_price__gt=F("price")
    ).order_by("-date")

    products = Product.objects.filter(
        product_status="опубліковано",
        featured=True
    ).exclude(
        old_price__gt=F("price")
    )

    extra_products = Product.objects.filter(
        product_status="опубліковано",
        extra_products=True
    )

    context = {
        "products": products,
        "extra_products": extra_products,
        "sale_products": sale_products,
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

    context = {
        "category": category,
        "products": products,
        "selected_category": category.id,
    }
    return render(request, "core/category-product-list.html", context)


def products_detail(request, pid):
    product = Product.objects.get(pid=pid)
    products = Product.objects.filter(
        category=product.category
    ).exclude(
        pid=pid
    ).distinct()[:5]
    p_image = product.p_images.all()

    context = {
        "product": product,
        "p_image": p_image,
        "products": products,
    }
    return render(request, "core/product-detail.html", context)


def search(request):
    query = request.GET.get("query", "")

    if query:
        products = (
            Product.objects.filter(
                Q(title__icontains=query)
                | Q(title__icontains=query.lower())
                | Q(title__icontains=query.upper())
                | Q(title__iregex=query)
            )
            .distinct()
            .order_by("-date")
        )

    else:
        products = Product.objects.none()

    context = {
        "products": products,
        "query": query,
    }
    return render(request, "core/search.html", context)


def filter_products(request):
    categories = request.GET.getlist("category[]")
    brands = request.GET.getlist("brand[]")

    min_price = request.GET["min_price"]
    max_price = request.GET["max_price"]

    products = Product.objects.filter(product_status="опубліковано").order_by("-date").distinct()

    products = products.filter(price__gte=min_price)
    products = products.filter(price__lte=max_price)

    if len(categories) > 0:
        products = products.filter(category__id__in=categories).distinct()

    if len(brands) > 0:
        products = products.filter(brand__id__in=brands).distinct()

    products_count = products.count()

    word_ending = "ів"
    if products_count == 1:
        word_ending = ""
    elif products_count in [2, 3, 4]:
        word_ending = "и"

    data = render_to_string("core/async/product-list.html", {"products": products})
    count_text = f"Ми знайшли для вас <strong>{products_count}</strong> товар{word_ending}!"

    return JsonResponse({"data": data, "count_text": count_text})


def get_price_range(request):
    categories = request.GET.getlist("category[]", [])
    brands = request.GET.getlist("brand[]", [])

    products = Product.objects.filter(product_status="опубліковано")

    if categories:
        products = products.filter(category__id__in=categories)
    if brands:
        products = products.filter(brand__id__in=brands)

    price_range = products.aggregate(
        min_price=Min('price'),
        max_price=Max('price')
    )

    return JsonResponse({
        'min_price': float(price_range['min_price']) if price_range['min_price'] else 0,
        'max_price': float(price_range['max_price']) if price_range['max_price'] else 0
    })


def contacts(request):
    return render(request, "core/contacts.html")


def ajax_contact(request):
    full_name = request.GET['full_name']
    email = request.GET['email']
    message = request.GET['message']

    contact = ContactUs.objects.create(
        full_name=full_name,
        email=email,
        message=message,
    )
    context = {
        'bool': True,
        'message': 'Your message has been sent successfully.'
    }
    return JsonResponse({'context': context})
