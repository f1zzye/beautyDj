from django.urls import include, path

from core.views import (category_product_list, filter_products, index,
                        product_list, products_detail, search)

app_name = "core"

urlpatterns = [
    path("", index, name="index"),
    path("products/", product_list, name="product-list"),
    path("product/<pid>/", products_detail, name="product-detail"),
    path("category/<cid>/", category_product_list, name="category-product-list"),
    path("search/", search, name="search"),
    path("filter-products/", filter_products, name="filter-products"),
]
