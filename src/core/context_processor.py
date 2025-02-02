from django.contrib import messages
from django.db.models import Max, Min

from core.models import (Address, Brand, CartOrder, CartOrderItems, Category,
                         Product, ProductImages, WishList)


def default(request):
    categories = Category.objects.all()
    brands = Brand.objects.all()

    min_max_price = Product.objects.aggregate(Min("price"), Max("price"))

    # try:
    #     wishlist = WishList.objects.filter(user=request.user)
    # except:
    #     messages.warning(request, 'You need to login before accessing your wishlist.')
    #     wishlist = 0

    try:
        address = Address.objects.get(user=request.user)
    except:
        address = None

    return {
        "categories": categories,
        "address": address,
        "brands": brands,
        "min_max_price": min_max_price,
    }
