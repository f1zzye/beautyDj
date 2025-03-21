from django.urls import include, path

from core.views import (about_us, add_to_cart, add_to_wishlist, ajax_contact,
                        cart, checkout, clear_cart, contacts,
                        customer_dashboard, dashboard_settings,
                        delete_item_from_cart, filter_products,
                        get_price_range, index, liqpay_callback, order_detail,
                        payment_completed, payment_delivery, payment_failed,
                        payment_result, product_list, products_detail,
                        remove_from_wishlist, save_checkout_info, search,
                        update_cart, wishlist, public_offer)

app_name = "core"

urlpatterns = [
    path("", index, name="index"),
    path("products/", product_list, name="product-list"),
    path("product/<pid>/", products_detail, name="product-detail"),
    path("search/", search, name="search"),
    path("filter-products/", filter_products, name="filter-products"),
    path("contacts/", contacts, name="contacts"),
    path("ajax-contact-form/", ajax_contact, name="ajax-contact-form"),
    path("get-price-range/", get_price_range, name="get-price-range"),
    path("add-to-cart/", add_to_cart, name="add-to-cart"),
    path("cart/", cart, name="cart"),
    path("delete-from-cart/", delete_item_from_cart, name="delete-from-cart"),
    path("clear-cart/", clear_cart, name="clear_cart"),
    path("update-cart/", update_cart, name="update-cart"),
    path("wishlist/", wishlist, name="wishlist"),
    path("add-to-wishlist/", add_to_wishlist, name="add-to-wishlist"),
    path("remove-from-wishlist/", remove_from_wishlist, name="remove-from-wishlist"),
    path("checkout/<oid>/", checkout, name="checkout"),
    path("save_checkout_info/", save_checkout_info, name="save_checkout_info"),
    path("payment-result/<str:oid>/", payment_result, name="payment-result"),
    path("payment-failed/<str:oid>/", payment_failed, name="payment-failed"),
    path("payment-completed/<oid>/", payment_completed, name="payment-completed"),
    path("billing/pay-callback/", liqpay_callback, name="liqpay_callback"),
    path("dashboard/", customer_dashboard, name="dashboard"),
    path("dashboard/order/<int:id>", order_detail, name="order-detail"),
    path("dashboard/settings/", dashboard_settings, name="settings"),
    path("about-us/", about_us, name="about-us"),
    path("privacy-policy/", public_offer, name="privacy-policy"),
    path("payment-and-delivery", payment_delivery, name="payment-and-delivery"),
]
