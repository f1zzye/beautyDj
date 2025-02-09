from django.db.models import F, Max, Min, Q
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.template.loader import render_to_string

from core.models import (Address, CartOrder, CartOrderItems, Category, Coupon,
                         Product, WishList)
from userauths.models import ContactUs
from django.contrib import messages


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
    ).exclude(
        id__in=sale_products.values_list('id', flat=True)
    ).exclude(
        id__in=products.values_list('id', flat=True)
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
    products = Product.objects.filter(category=product.category).exclude(pid=pid).distinct()[:5]
    p_image = product.p_images.all()

    variants = product.variants.filter(status=True)

    all_volumes = []

    if product.volume:
        all_volumes.append(
            {
                "volume": product.volume,
                "price": product.price,
                "image_url": product.image.url,
                "is_base": True,
                "id": None,
                "old_price": None,
            }
        )

    for variant in variants:
        if variant.volume != product.volume:
            all_volumes.append(
                {
                    "volume": variant.volume,
                    "price": variant.price,
                    "image_url": variant.image.url if variant.image else product.image.url,
                    "is_base": False,
                    "id": variant.id,
                    "old_price": getattr(variant, "old_price", None),
                }
            )

    all_volumes.sort(key=lambda x: x["volume"])

    context = {
        "product": product,
        "p_image": p_image,
        "products": products,
        "variants": variants,
        "default_image": product.image.url,
        "default_price": product.price,
        "base_volume": product.volume,
        "all_volumes": all_volumes,
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

    price_range = products.aggregate(min_price=Min("price"), max_price=Max("price"))

    return JsonResponse(
        {
            "min_price": float(price_range["min_price"]) if price_range["min_price"] else 0,
            "max_price": float(price_range["max_price"]) if price_range["max_price"] else 0,
        }
    )


def contacts(request):
    return render(request, "core/contacts.html")


def ajax_contact(request):
    full_name = request.GET["full_name"]
    email = request.GET["email"]
    message = request.GET["message"]

    contact = ContactUs.objects.create(
        full_name=full_name,
        email=email,
        message=message,
    )
    context = {"bool": True, "message": "Your message has been sent successfully."}
    return JsonResponse({"context": context})


def add_to_cart(request):
    cart_product = {}

    product_id = request.GET["id"]
    variation_id = request.GET.get("variation_id", "")
    cart_key = f"{product_id}_{variation_id}" if variation_id else product_id

    cart_product[cart_key] = {
        "title": request.GET["title"],
        "quantity": int(request.GET["quantity"]),
        "price": request.GET["price"],
        "image": request.GET["image"],
        "pid": request.GET["pid"],
        "volume": request.GET.get("volume", ""),
        "variation_id": variation_id,
        "total_price": float(request.GET["price"].replace(',', '.')) * int(request.GET["quantity"])
    }

    if "cart_data_obj" in request.session:
        cart_data = request.session["cart_data_obj"]
        if cart_key in cart_data:
            cart_data[cart_key]["quantity"] = int(cart_product[cart_key]["quantity"])
            price = float(cart_data[cart_key]["price"].replace(',', '.'))
            cart_data[cart_key]["total_price"] = price * cart_data[cart_key]["quantity"]
        else:
            cart_data.update(cart_product)
        request.session["cart_data_obj"] = cart_data
    else:
        request.session["cart_data_obj"] = cart_product

    return JsonResponse({
        "data": request.session["cart_data_obj"],
        "totalcartitems": len(request.session["cart_data_obj"])
    })


def cart(request):
    cart_total = 0
    if 'cart_data_obj' in request.session and request.session['cart_data_obj']:
        cart_data = request.session['cart_data_obj']

        for product_id, item in cart_data.items():
            try:
                price = float(item['price'].replace(',', '.'))
                quantity = int(item['quantity'])
                item['total_price'] = price * quantity
                cart_total += item['total_price']
            except (ValueError, TypeError):
                item['total_price'] = 0

        return render(request, 'core/cart.html', {
            'cart_data': cart_data,
            'totalcartitems': len(cart_data),
            'cart_total': cart_total,
            'is_cart_empty': False
        })
    else:
        return render(request, 'core/cart.html', {
            'is_cart_empty': True
        })


def delete_item_from_cart(request):
    product_id = str(request.GET['id'])
    if 'cart_data_obj' in request.session:
        if product_id in request.session['cart_data_obj']:
            cart_data = request.session['cart_data_obj']
            del request.session['cart_data_obj'][product_id]
            request.session['cart_data_obj'] = cart_data
            request.session.modified = True

    if not request.session.get('cart_data_obj'):
        empty_cart_html = render_to_string('core/async/empty-cart.html')
        return JsonResponse({
            'data': empty_cart_html,
            'totalcartitems': 0,
            'cart_total': 0,
            'is_empty': True
        })

    cart_total = 0
    cart_data = request.session['cart_data_obj']
    for product_id, item in cart_data.items():
        try:
            price = float(str(item['price']).replace(',', '.'))
            quantity = int(item['quantity'])
            item['total_price'] = price * quantity
            cart_total += item['total_price']
        except (ValueError, TypeError):
            item['total_price'] = 0
            continue

    context = {
        'cart_data': cart_data,
        'totalcartitems': len(cart_data),
        'cart_total': cart_total,
        'is_cart_empty': False
    }

    html = render_to_string('core/async/cart-list.html', context)

    return JsonResponse({
        'data': html,
        'totalcartitems': len(cart_data),
        'cart_total': cart_total,
        'is_empty': False
    })


def update_cart(request):
    product_key = str(request.GET['id'])
    product_quantity = int(request.GET['quantity'])

    if 'cart_data_obj' in request.session:
        cart_data = request.session['cart_data_obj']

        if product_key in cart_data:
            cart_data[product_key]['quantity'] = product_quantity

            price = float(str(cart_data[product_key]['price']).replace(',', '.'))
            cart_data[product_key]['total_price'] = price * product_quantity

            request.session['cart_data_obj'] = cart_data
            request.session.modified = True

    cart_total = 0
    products_data = []

    if 'cart_data_obj' in request.session:
        for key, item in request.session['cart_data_obj'].items():
            try:
                price = float(str(item['price']).replace(',', '.'))
                quantity = int(item['quantity'])
                total_price = price * quantity
                cart_total += total_price

                products_data.append({
                    'product_id': key,
                    'quantity': quantity,
                    'total_price': total_price
                })
            except (ValueError, KeyError):
                continue

    return JsonResponse({
        'products': products_data,
        'totalcartitems': len(request.session['cart_data_obj']),
        'cart_total': cart_total
    })