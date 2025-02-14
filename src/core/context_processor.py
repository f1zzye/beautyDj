from django.contrib import messages
from django.db.models import Max, Min

from core.models import (Address, Brand, CartOrder, CartOrderItems, Category,
                         Product, ProductImages, WishList)


def default(request):
    categories = Category.objects.all()
    brands = Brand.objects.all()
    min_max_price = Product.objects.aggregate(Min("price"), Max("price"))

    wishlist = WishList.objects.filter(user=request.user) if request.user.is_authenticated else []

    return {
        "wishlist": wishlist,
        "categories": categories,
        "brands": brands,
        "min_max_price": min_max_price,
    }
