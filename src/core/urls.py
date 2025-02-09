from django.urls import include, path

from core.views import (add_to_cart, ajax_contact, category_product_list,
                        contacts, filter_products, get_price_range, index,
                        product_list, products_detail, search, cart, delete_item_from_cart, update_cart)

app_name = "core"

urlpatterns = [
    path("", index, name="index"),
    path("products/", product_list, name="product-list"),
    path("product/<pid>/", products_detail, name="product-detail"),
    path("category/<cid>/", category_product_list, name="category-product-list"),
    path("search/", search, name="search"),
    path("filter-products/", filter_products, name="filter-products"),
    path("contacts/", contacts, name="contacts"),
    path("ajax-contact-form/", ajax_contact, name="ajax-contact-form"),
    path("get-price-range/", get_price_range, name="get-price-range"),
    path("add-to-cart/", add_to_cart, name="add-to-cart"),
    path('cart/', cart, name='cart'),
    path('delete-from-cart/', delete_item_from_cart, name='delete-from-cart'),
    path('update-cart/', update_cart, name='update-cart'),
]
