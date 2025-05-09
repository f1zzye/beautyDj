import base64
import hashlib
import json

import requests
from decouple import config
from django.conf import settings
from django.contrib import messages
from bot.bot import send_order_notification
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.db.models import F, Max, Min, Q, Sum
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.views.decorators.csrf import csrf_exempt
from liqpay.liqpay3 import LiqPay

from core.forms import ProfileForm
from core.models import (Address, CartOrder, CartOrderItems, Category, Coupon,
                         Product, WishList)
from userauths.models import ContactUs, Profile


def index(request):
    sale_products = Product.objects.filter(product_status="опубліковано", old_price__gt=F("price")).order_by("-date")

    products = Product.objects.filter(product_status="опубліковано", featured=True).exclude(old_price__gt=F("price"))

    extra_products = (
        Product.objects.filter(product_status="опубліковано", extra_products=True)
        .exclude(id__in=sale_products.values_list("id", flat=True))
        .exclude(id__in=products.values_list("id", flat=True))
    )

    context = {
        "products": products,
        "extra_products": extra_products,
        "sale_products": sale_products,
    }
    return render(request, "index.html", context)


def product_list(request):
    # Получаем параметры фильтрации
    categories = request.GET.getlist("category[]")
    products_list = Product.objects.filter(product_status="опубліковано")

    # Применяем фильтр по категориям, если они выбраны
    if categories:
        products_list = products_list.filter(category__id__in=categories)

    # Определяем количество товаров на странице
    items_per_page = 15  # или другое желаемое количество

    paginator = Paginator(products_list, items_per_page)
    page = request.GET.get("page", 1)

    try:
        products = paginator.page(page)
    except PageNotAnInteger:
        products = paginator.page(1)
    except EmptyPage:
        products = paginator.page(paginator.num_pages)

    context = {
        "products": products,
        "total_products": products_list.count(),
        "show_pagination": products_list.count() > items_per_page,
    }
    return render(request, "core/product_list.html", context)


def products_detail(request, pid):
    product = Product.objects.get(pid=pid)
    products = Product.objects.filter(category=product.category).exclude(pid=pid).distinct()[:5]

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
    sort_by = request.GET.get("orderby", "menu_order")
    min_price = request.GET.get("min_price")
    max_price = request.GET.get("max_price")
    page = request.GET.get("page", 1)

    products = Product.objects.filter(product_status="опубліковано").distinct()

    if categories:
        products = products.filter(category__id__in=categories)
    if brands:
        products = products.filter(brand__id__in=brands)
    if min_price and min_price.strip():
        try:
            products = products.filter(price__gte=float(min_price))
        except ValueError:
            pass
    if max_price and max_price.strip():
        try:
            products = products.filter(price__lte=float(max_price))
        except ValueError:
            pass

    if sort_by == "rating":
        products = products.order_by("title")
    elif sort_by == "price":
        products = products.order_by("-price")
    elif sort_by == "price-desc":
        products = products.order_by("price")
    else:
        products = products.order_by("-date")

    products_count = products.count()

    if products_count == 0:
        return JsonResponse(
            {
                "data": "<div class='no-products'></div>",
                "pagination": "",
                "count_text": "<p class='woocommerce-result-count' id='products-count'>Показано 0-0 із 0 товарів</p>",
                "total_pages": 0,
                "current_page": 1,
                "show_pagination": False,
            }
        )

    items_per_page = 15
    show_pagination = products_count > items_per_page

    paginator = Paginator(products, items_per_page)
    try:
        products_page = paginator.page(page)
    except PageNotAnInteger:
        products_page = paginator.page(1)
    except EmptyPage:
        products_page = paginator.page(paginator.num_pages)

    data = render_to_string("core/async/product-list.html", {"products": products_page, "request": request})

    pagination_html = ""
    if show_pagination:
        pagination_html = render_to_string(
            "core/async/pagination.html",
            {
                "products": products_page,
                "show_pagination": True,
                "current_filters": {
                    "categories": categories,
                    "brands": brands,
                    "min_price": min_price,
                    "max_price": max_price,
                    "sort_by": sort_by,
                },
            },
        )

    word_ending = ""
    if products_count == 1:
        word_ending = ""
    elif products_count in [2, 3, 4]:
        word_ending = "и"
    else:
        word_ending = "ів"

    count_text = f"""<p class="woocommerce-result-count" id="products-count">
        Показано {products_page.start_index()}-{products_page.end_index()} із {products_count} товар{word_ending}</p>"""

    return JsonResponse(
        {
            "data": data,
            "pagination": pagination_html,
            "count_text": count_text,
            "total_pages": paginator.num_pages if show_pagination else 1,
            "current_page": products_page.number if show_pagination else 1,
            "show_pagination": show_pagination,
        }
    )


def get_price_range(request):
    categories = request.GET.getlist("category[]", [])
    brands = request.GET.getlist("brand[]", [])
    ignore_price_filter = request.GET.get("ignore_price_filter", False)
    ignore_price_filter = ignore_price_filter == "true"

    print(ignore_price_filter)

    products = Product.objects.filter(product_status="опубліковано")

    if not ignore_price_filter:
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
    try:
        cart_product = {}

        product_id = request.GET["id"]
        variation_id = request.GET.get("variation_id", "")
        cart_key = f"{product_id}_{variation_id}" if variation_id else product_id

        price_str = request.GET.get("price", "0")
        try:
            # Удаляем пробелы и преобразуем запятые в точки
            price = float(price_str.strip().replace(",", ".") or "0")
        except (ValueError, TypeError):
            price = 0.0

        quantity = int(request.GET.get("quantity", 1))

        cart_product[cart_key] = {
            "title": request.GET["title"],
            "quantity": quantity,
            "price": str(price),
            "image": request.GET["image"],
            "pid": request.GET["pid"],
            "volume": request.GET.get("volume", ""),
            "variation_id": variation_id,
            "total_price": price * quantity,
        }

        if "cart_data_obj" in request.session:
            cart_data = request.session["cart_data_obj"]
            if cart_key in cart_data:
                cart_data[cart_key]["quantity"] = quantity
                cart_data[cart_key]["total_price"] = price * quantity
            else:
                cart_data.update(cart_product)
            request.session["cart_data_obj"] = cart_data
        else:
            request.session["cart_data_obj"] = cart_product

        return JsonResponse(
            {"data": request.session["cart_data_obj"], "totalcartitems": len(request.session["cart_data_obj"])}
        )

    except Exception as e:
        return JsonResponse({"error": str(e), "message": "Помилка при додаванні товару до кошика"}, status=400)


def cart(request):
    cart_total = 0
    if "cart_data_obj" in request.session and request.session["cart_data_obj"]:
        cart_data = request.session["cart_data_obj"]

        for product_id, item in cart_data.items():
            try:
                price = float(item["price"].replace(",", "."))
                quantity = int(item["quantity"])
                item["total_price"] = price * quantity
                cart_total += item["total_price"]
            except (ValueError, TypeError):
                item["total_price"] = 0

        return render(
            request,
            "core/cart.html",
            {
                "cart_data": cart_data,
                "totalcartitems": len(cart_data),
                "cart_total": cart_total,
                "is_cart_empty": False,
            },
        )
    else:
        return render(request, "core/cart.html", {"is_cart_empty": True})


def delete_item_from_cart(request):
    product_id = str(request.GET["id"])
    if "cart_data_obj" in request.session:
        if product_id in request.session["cart_data_obj"]:
            cart_data = request.session["cart_data_obj"]
            del request.session["cart_data_obj"][product_id]
            request.session["cart_data_obj"] = cart_data
            request.session.modified = True

    if not request.session.get("cart_data_obj"):
        empty_cart_html = render_to_string("core/async/empty-cart.html")
        return JsonResponse({"data": empty_cart_html, "totalcartitems": 0, "cart_total": 0, "is_empty": True})

    cart_total = 0
    cart_data = request.session["cart_data_obj"]
    for product_id, item in cart_data.items():
        try:
            price = float(str(item["price"]).replace(",", "."))
            quantity = int(item["quantity"])
            item["total_price"] = price * quantity
            cart_total += item["total_price"]
        except (ValueError, TypeError):
            item["total_price"] = 0
            continue

    context = {
        "cart_data": cart_data,
        "totalcartitems": len(cart_data),
        "cart_total": cart_total,
        "is_cart_empty": False,
    }

    html = render_to_string("core/async/cart-list.html", context)

    return JsonResponse({"data": html, "totalcartitems": len(cart_data), "cart_total": cart_total, "is_empty": False})


def clear_cart(request):
    if "cart_data_obj" in request.session:
        del request.session["cart_data_obj"]
        request.session.modified = True

    empty_cart_html = render_to_string("core/async/empty-cart.html")
    return JsonResponse({"data": empty_cart_html, "totalcartitems": 0, "cart_total": 0, "is_empty": True})


def update_cart(request):
    product_key = str(request.GET["id"])
    product_quantity = int(request.GET["quantity"])

    if "cart_data_obj" in request.session:
        cart_data = request.session["cart_data_obj"]

        if product_key in cart_data:
            cart_data[product_key]["quantity"] = product_quantity

            price = float(str(cart_data[product_key]["price"]).replace(",", "."))
            cart_data[product_key]["total_price"] = price * product_quantity

            request.session["cart_data_obj"] = cart_data
            request.session.modified = True

    cart_total = 0
    products_data = []

    if "cart_data_obj" in request.session:
        for key, item in request.session["cart_data_obj"].items():
            try:
                price = float(str(item["price"]).replace(",", "."))
                quantity = int(item["quantity"])
                total_price = price * quantity
                cart_total += total_price

                products_data.append({"product_id": key, "quantity": quantity, "total_price": total_price})
            except (ValueError, KeyError):
                continue

    return JsonResponse(
        {"products": products_data, "totalcartitems": len(request.session["cart_data_obj"]), "cart_total": cart_total}
    )


@login_required(login_url="userauths:sign-in")
def wishlist(request):
    wishlist = WishList.objects.filter(user=request.user)
    wishlist_count = wishlist.count()

    context = {"wishlist": wishlist, "wishlist_count": wishlist_count, "is_wishlist_empty": wishlist_count == 0}
    return render(request, "core/wishlist.html", context)


def add_to_wishlist(request):
    if not request.user.is_authenticated:
        messages.warning(request, "Увійдіть або зараєструйтесь, щоб додати товар до списку бажань")
        return JsonResponse({"authenticated": False, "redirect_url": "/user/sign-in/"})

    product_id = request.GET.get("id")

    try:
        product = Product.objects.get(id=product_id)
        wishlist_item = WishList.objects.filter(product=product, user=request.user)

        if wishlist_item.exists():
            return JsonResponse(
                {
                    "authenticated": True,
                    "added": False,
                    "message": "Товар вже у списку бажань",
                    "wishlist_count": WishList.objects.filter(user=request.user).count(),
                }
            )
        else:
            WishList.objects.create(
                product=product,
                user=request.user,
            )
            return JsonResponse(
                {
                    "authenticated": True,
                    "added": True,
                    "message": "Товар додано до списку бажань",
                    "wishlist_count": WishList.objects.filter(user=request.user).count(),
                }
            )

    except Product.DoesNotExist:
        return JsonResponse({"authenticated": True, "added": False, "message": "Товар не знайдено"})


def remove_from_wishlist(request):
    if not request.user.is_authenticated:
        messages.warning(request, "Увійдіть або зараєструйтесь, щоб додати товар до списку бажань")
        return JsonResponse({"authenticated": False, "redirect_url": "/user/sign-in/"})

    product_id = request.GET.get("id")

    try:
        wishlist_item = WishList.objects.get(product_id=product_id, user=request.user)
        wishlist_item.delete()

        wishlist_count = WishList.objects.filter(user=request.user).count()
        is_wishlist_empty = wishlist_count == 0

        if is_wishlist_empty:
            empty_wishlist_html = render_to_string("core/async/empty-wishlist.html")
            return JsonResponse(
                {"authenticated": True, "is_empty": True, "html": empty_wishlist_html, "wishlist_count": 0}
            )

        return JsonResponse(
            {
                "authenticated": True,
                "is_empty": False,
                "message": "Товар видалено зі списку бажань",
                "wishlist_count": wishlist_count,
            }
        )

    except WishList.DoesNotExist:
        return JsonResponse({"authenticated": True, "error": "Товар не знайдено у списку бажань"})


def get_nova_poshta_data(api_key, refs):
    address_data = {}

    if refs.get("state"):
        response = requests.post(
            "https://api.novaposhta.ua/v2.0/json/",
            json={"apiKey": api_key, "modelName": "Address", "calledMethod": "getAreas", "methodProperties": {}},
        )
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                for area in data["data"]:
                    if area["Ref"] == refs["state"]:
                        address_data["state"] = area["Description"]
                        break

    if refs.get("city"):
        response = requests.post(
            "https://api.novaposhta.ua/v2.0/json/",
            json={
                "apiKey": api_key,
                "modelName": "Address",
                "calledMethod": "getCities",
                "methodProperties": {"Ref": refs["city"]},
            },
        )
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data["data"]:
                address_data["city"] = data["data"][0]["Description"]

    if refs.get("address"):
        response = requests.post(
            "https://api.novaposhta.ua/v2.0/json/",
            json={
                "apiKey": api_key,
                "modelName": "Address",
                "calledMethod": "getWarehouses",
                "methodProperties": {"Ref": refs["address"]},
            },
        )
        if response.status_code == 200:
            data = response.json()
            if data.get("success") and data["data"]:
                address_data["address"] = data["data"][0]["Description"]

    return address_data


def save_checkout_info(request):
    cart_total = 0
    total_amount = 0
    API_KEY = config("API_KEY")

    if request.method == "POST":
        email = request.POST.get("email")
        phone = request.POST.get("phone")
        fname = request.POST.get("fname")
        lname = request.POST.get("lname")
        state_ref = request.POST.get("state")
        city_ref = request.POST.get("cityRef")
        address_ref = request.POST.get("address")
        extra_info = request.POST.get("extra_info")

        address_data = get_nova_poshta_data(API_KEY, {"state": state_ref, "city": city_ref, "address": address_ref})

        state = address_data.get("state", state_ref)
        city = address_data.get("city", request.POST.get("city", ""))
        address = address_data.get("address", address_ref)

        ordered_items = []
        if "cart_data_obj" in request.session:
            for product_id, item in request.session["cart_data_obj"].items():
                price = float(item["price"].replace(",", "."))
                item_total = price * int(item["quantity"])
                total_amount += item_total

                ordered_items.append({
                    "title": item["title"],
                    "quantity": item["quantity"],
                    "price": price,
                    "volume": item.get("volume", ""),
                    "total": item_total
                })

        order = CartOrder.objects.create(
            user=request.user if request.user.is_authenticated else None,
            price=total_amount,
            email=email,
            phone=phone,
            fname=fname,
            lname=lname,
            address=address,
            city=city,
            state=state,
            extra_info=extra_info,
            product_status="обробка",
        )

        order_details = {
            'oid': order.oid,
            'fname': order.fname,
            'lname': order.lname,
            'email': order.email,
            'phone': order.phone,
            'address': order.address,
            'city': order.city,
            'state': order.state,
            'price': order.price,
            'paid_status': order.paid_status,
            'items': ordered_items
        }

        send_order_notification(order_details)

        if "cart_data_obj" in request.session:
            for product_id, item in request.session["cart_data_obj"].items():
                price = float(item["price"].replace(",", "."))
                item_total = price * int(item["quantity"])

                CartOrderItems.objects.create(
                    order=order,
                    invoice_num="INVOICE_№-" + str(order.id),
                    product_status="розглядається",
                    item=item["title"],
                    image=item["image"],
                    quantity=item["quantity"],
                    price=price,
                    total=item_total,
                    volume=item.get("volume", ""),
                )

            del request.session["cart_data_obj"]
            request.session.modified = True

        return redirect("core:checkout", order.oid)
    return redirect("core:cart")


def checkout(request, oid):
    order = CartOrder.objects.get(oid=oid)
    order_items = CartOrderItems.objects.filter(order=order)

    if request.method == "POST":
        code = request.POST.get("code")
        coupon = Coupon.objects.filter(code=code, active=True).first()

        if coupon and coupon.is_valid():
            if coupon in order.coupons.all():
                messages.warning(request, "Купон вже активовано")
                return redirect("core:checkout", order.oid)
            else:
                if order.saved == 0:
                    order.original_price = order.price

                discount = order.price * coupon.discount / 100

                order.coupons.add(coupon)
                order.price -= discount
                order.saved += discount
                order.save()

                messages.success(request, "Купон активовано")
                return redirect("core:checkout", order.oid)
        else:
            messages.warning(request, "Купон не існує або вже не дійсний")
            return redirect("core:checkout", order.oid)

    liqpay = LiqPay(settings.LIQPAY_PUBLIC_KEY, settings.LIQPAY_PRIVATE_KEY)
    params = {
        "action": "pay",
        "amount": str(order.price),
        "currency": "UAH",
        "description": f"Оплата замовлення №{order.oid}",
        "order_id": order.oid,
        "version": "3",
	    'sandbox': 0,
        "server_url": request.build_absolute_uri("https://mood-cosmetics.com.ua/billing/pay-callback/"),
        "result_url": request.build_absolute_uri(reverse("core:payment-result", args=[order.oid])),
    }
    form_html = liqpay.cnb_form(params)

    context = {
        "order": order,
        "order_items": order_items,
        "form_html": form_html,
    }
    return render(request, "core/checkout.html", context)


@csrf_exempt
def liqpay_callback(request):
    print("Callback function entered")
    data = request.POST.get("data")
    signature = request.POST.get("signature")
    print("Data:", data)
    print("Signature:", signature)

    sign_str = settings.LIQPAY_PRIVATE_KEY + data + settings.LIQPAY_PRIVATE_KEY
    sign = base64.b64encode(hashlib.sha1(sign_str.encode("utf-8")).digest()).decode("utf-8")
    print("Generated Sign:", sign)

    if sign != signature:
        print("Invalid callback signature")
        return HttpResponse(status=400)

    decoded_data = base64.b64decode(data).decode("utf-8")
    response = json.loads(decoded_data)
    print("Callback data:", response)

    try:
        order = CartOrder.objects.get(oid=response["order_id"])
    except CartOrder.DoesNotExist:
        print("Order not found")
        return HttpResponse(status=404)

    if response["status"] == "success":
        order.paid_status = True
        order.save()

        order_items = CartOrderItems.objects.filter(order=order)
        ordered_items = []
        for item in order_items:
            ordered_items.append({
                "title": item.item,
                "quantity": item.quantity,
                "price": float(item.price),
                "volume": item.volume,
                "total": float(item.total)
            })

        order_details = {
            'oid': order.oid,
            'fname': order.fname,
            'lname': order.lname,
            'email': order.email,
            'phone': order.phone,
            'address': order.address,
            'city': order.city,
            'state': order.state,
            'price': float(order.price),
            'paid_status': order.paid_status,
            'items': ordered_items
        }

        send_order_notification(order_details)

    elif response["status"] == "failure":
        print("Payment failed")
    elif response["status"] in ["sandbox", "wait_accept", "processing", "wait_secure"]:
        print("Payment status:", response["status"])
    else:
        print("Unknown payment status:", response["status"])

    return HttpResponse()


def payment_result(request, oid):
    order = get_object_or_404(CartOrder, oid=oid)
    if order.paid_status:
        return redirect("core:payment-completed", oid=oid)
    else:
        return redirect("core:payment-failed", oid=oid)


def payment_completed(request, oid):
    order = CartOrder.objects.get(oid=oid)
    if order.paid_status == False:
        order.paid_status = True
        order.save()

    context = {
        "order": order,
    }

    return render(request, "core/payment-completed.html", context)


def payment_failed(request, oid):
    return render(request, "core/payment-failed.html")


@login_required
def customer_dashboard(request):
    orders = CartOrder.objects.filter(user=request.user).order_by("-order_date")
    profile = Profile.objects.get(user=request.user)

    context = {
        "orders": orders,
        "profile": profile,
    }
    return render(request, "core/dashboard.html", context)


def order_detail(request, id):
    order = CartOrder.objects.get(user=request.user, id=id)
    order_items = CartOrderItems.objects.filter(order=order)

    total_amount = order_items.aggregate(total=Sum("total"))["total"]

    context = {
        "order_items": order_items,
        "total_amount": total_amount,
        "order": order,
    }
    return render(request, "core/order-detail.html", context)


def dashboard_settings(request):
    try:
        profile = Profile.objects.get(user=request.user)
    except Profile.DoesNotExist:
        profile = Profile.objects.create(user=request.user)

    if request.method == "POST":
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        password_changed = False

        password_current = request.POST.get("password_current")
        password_1 = request.POST.get("password_1")
        password_2 = request.POST.get("password_2")

        if any([password_current, password_1, password_2]):
            if not password_current:
                messages.error(request, _("Введіть поточний пароль"))
                context = {"form": form, "profile": profile}
                return render(request, "core/settings.html", context)

            if not request.user.check_password(password_current):
                messages.error(request, _("Невірний поточний пароль"))
                context = {"form": form, "profile": profile}
                return render(request, "core/settings.html", context)

            if not password_1:
                messages.error(request, _("Введіть новий пароль"))
                context = {"form": form, "profile": profile}
                return render(request, "core/settings.html", context)

            if not password_2:
                messages.error(request, _("Підтвердіть новий пароль"))
                context = {"form": form, "profile": profile}
                return render(request, "core/settings.html", context)

            if password_1 != password_2:
                messages.error(request, _("Паролі не співпадають"))
                context = {"form": form, "profile": profile}
                return render(request, "core/settings.html", context)

            if len(password_1) < 8:
                messages.error(request, _("Пароль повинен містити щонайменше 8 символів"))
                context = {"form": form, "profile": profile}
                return render(request, "core/settings.html", context)

            try:
                request.user.set_password(password_1)
                request.user.save()
                update_session_auth_hash(request, request.user)
                password_changed = True
            except Exception as e:
                messages.error(request, _("Помилка при зміні пароля"))
                print(f"Error changing password: {e}")
                context = {"form": form, "profile": profile}
                return render(request, "core/settings.html", context)

        if form.is_valid():
            try:
                profile = form.save(commit=False)
                profile.user = request.user
                profile.save()

                if password_changed:
                    messages.success(request, _("Пароль успішно змінено"))
                else:
                    messages.success(request, _("Профіль успішно оновлено"))

                if not request.headers.get("X-Requested-With") == "XMLHttpRequest":
                    return redirect("core:dashboard")
            except Exception as e:
                messages.error(request, _("Помилка при збереженні профілю"))
                print(f"Error saving profile: {e}")
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{form.fields[field].label}: {error}")
    else:
        form = ProfileForm(instance=profile)

    context = {
        "form": form,
        "profile": profile,
    }

    return render(request, "core/settings.html", context)


def about_us(request):
    return render(request, "core/about-us.html")


def payment_delivery(request):
    return render(request, "core/payment-delivery.html")


def public_offer(request):
    return render(request, "core/public-offer.html")


def page_not_found(request, exception):
    return render(request, "page_404.html", status=404)
