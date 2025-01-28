from django.urls import include, path

from core.views import index, product_list

app_name = "core"

urlpatterns = [
    path("", index, name="index"),
    path("products/", product_list, name="product-list"),
]
