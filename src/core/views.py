import base64
import hashlib
import json

import requests
from decouple import config
from django.conf import settings
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db.models import F, Max, Min, Q
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from liqpay.liqpay import LiqPay

from core.models import (Address, CartOrder, CartOrderItems, Category, Coupon,
                         Product, WishList)
from userauths.models import ContactUs


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
    sort_by = request.GET.get("orderby", "menu_order")
    min_price = request.GET.get("min_price")
    max_price = request.GET.get("max_price")

    products = Product.objects.filter(product_status="опубліковано").distinct()

    if min_price:
        products = products.filter(price__gte=min_price)
    if max_price:
        products = products.filter(price__lte=max_price)

    if categories:
        products = products.filter(category__id__in=categories)
    if brands:
        products = products.filter(brand__id__in=brands)

    if sort_by == "rating":
        products = products.order_by("title")
    elif sort_by == "price":
        products = products.order_by("-price")
    elif sort_by == "price-desc":
        products = products.order_by("price")
    else:
        products = products.order_by("date")

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

        if "cart_data_obj" in request.session:
            for product_id, item in request.session["cart_data_obj"].items():
                price = float(item["price"].replace(",", "."))
                item_total = price * int(item["quantity"])
                total_amount += item_total

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
        )

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
        "sandbox": 0,  # Удалить для продакшн
        # 'server_url': request.build_absolute_uri(reverse("core:liqpay_callback")),
        "server_url": request.build_absolute_uri("https://e21b-62-16-0-117.ngrok-free.app/billing/pay-callback/"),
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


def customer_dashboard(request):
    return render(request, "core/dashboard.html")
