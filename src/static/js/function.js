console.log("working fine");

$(document).on('submit', '#contact-form-ajax', function (e){
    e.preventDefault();
    console.log('Form submitted');

    let full_name = $('#full_name').val()
    let email = $('#email').val()
    let message = $('#message').val()

    console.log('Full Name:', full_name);
    console.log('Email:', email);
    console.log('Message:', message);

    $.ajax({
        url: '/ajax-contact-form',
        data: {
            'full_name': full_name,
            'email': email,
            'message': message
        },
        dataType: 'json',
        beforeSend: function(){
            console.log('Sending data to server...');
        },
        success: function(res){
            console.log('Data sent successfully');
            $('#contact-form-ajax').hide()
            $('#message-response').html('Message sent successfully')

        }
    })
});

$(document).ready(function () {
    const minRange = document.getElementById('min_range');
    const maxRange = document.getElementById('max_range');
    const minLabel = document.getElementById('min_price_label');
    const maxLabel = document.getElementById('max_price_label');
    const orderbySelect = document.querySelector('.orderby');

    function updateSliderRange(minPrice, maxPrice) {
        minRange.min = minPrice;
        minRange.max = maxPrice;
        maxRange.min = minPrice;
        maxRange.max = maxPrice;

        minRange.value = minPrice;
        maxRange.value = maxPrice;

        updatePriceLabels();
    }

    function updatePriceLabels() {
        minLabel.textContent = parseFloat(minRange.value).toFixed(2);
        maxLabel.textContent = parseFloat(maxRange.value).toFixed(2);

        const percent1 = ((minRange.value - minRange.min) / (minRange.max - minRange.min)) * 100;
        const percent2 = ((maxRange.value - minRange.min) / (minRange.max - minRange.min)) * 100;

        $('.range-track').css('background',
            `linear-gradient(to right, 
            #ddd ${percent1}%, 
            #000 ${percent1}%, 
            #000 ${percent2}%, 
            #ddd ${percent2}%)`
        );
    }

    function getFilterParams() {
        let filter_object = {
            min_price: minRange.value,
            max_price: maxRange.value
        };

        if (orderbySelect) {
            filter_object.orderby = orderbySelect.value;
        }

        $(".filter-checkbox").each(function () {
            let filter_value = $(this).val();
            let filter_key = $(this).data("filter");

            filter_object[filter_key] = Array.from(
                document.querySelectorAll('input[data-filter=' + filter_key + ']:checked')
            ).map(element => element.value);
        });

        return filter_object;
    }

    function updateProducts() {
        const filter_object = getFilterParams();

        $.ajax({
            url: '/filter-products',
            data: filter_object,
            dataType: 'json',
            beforeSend: function() {
                $('#filtered-products').addClass('loading');
            },
            success: function(response) {
                $('#filtered-products').html(response.data);
                $('#products-count').html(response.count_text);
                $('#filtered-products').removeClass('loading');
            },
            error: function(error) {
                console.log('Error:', error);
                $('#filtered-products').removeClass('loading');
            }
        });
    }

    // Обработчик изменения сортировки
    if (orderbySelect) {
        orderbySelect.addEventListener('change', function(e) {
            e.preventDefault();
            updateProducts();
        });
    }

    // Обработчики фильтров
    $(".filter-checkbox").on("change", function(event) {
        let filter_object = {};

        $(".filter-checkbox").each(function () {
            let filter_key = $(this).data("filter");
            filter_object[filter_key + "[]"] = Array.from(
                document.querySelectorAll('input[data-filter=' + filter_key + ']:checked')
            ).map(element => element.value);
        });

        $.ajax({
            url: '/get-price-range/',
            data: {
            ...filter_object,
            ignore_price_filter: !this.checked
            },
            dataType: 'json',
            success: function(response) {
                updateSliderRange(response.min_price, response.max_price);
                updateProducts();
            }
        });

    });

    minRange.addEventListener('input', function() {
        if (parseFloat(minRange.value) > parseFloat(maxRange.value)) {
            minRange.value = maxRange.value;
        }
        updatePriceLabels();
    });

    maxRange.addEventListener('input', function() {
        if (parseFloat(maxRange.value) < parseFloat(minRange.value)) {
            maxRange.value = minRange.value;
        }
        updatePriceLabels();
    });

    $("#price-filter-btn").on("click", updateProducts);

    if (minRange && maxRange) {
        updatePriceLabels();
    }
});


function handleAddToCart(this_val, isProductPage, currentVariationData = null) {
    const index_val = this_val.attr('data-index');

    // Get product data
    const quantity = $('.product-quantity-' + index_val).val() || '1';
    const product_title = $('.product-title-' + index_val).val();
    const product_id = $('.product-id-' + index_val).val();
    const product_pid = $('.product-pid-' + index_val).val();
    const product_image = currentVariationData ? currentVariationData.image : $('.product-image-' + index_val).val();

    // Получаем цену из hidden input
    let product_price = currentVariationData ? currentVariationData.price : $('.current-product-price-' + index_val).val();

    // Проверяем наличие цены
    if (!product_price || product_price === '') {
        console.error('Price is missing for product:', product_id);
        alert('Помилка: відсутня ціна товару');
        return;
    }

    // Получаем объем
    const base_volume = $('.product-volume-' + index_val).val() || '';

    // Prepare ajax data
    const ajaxData = {
        'id': product_id,
        'pid': product_pid,
        'image': product_image,
        'quantity': quantity,
        'title': product_title,
        'price': product_price,
        'volume': currentVariationData ? currentVariationData.volume : base_volume
    };

    // Add variation data if exists
    if (currentVariationData) {
        ajaxData.variation_id = currentVariationData.variation_id;
    }

    // Ajax request
    $.ajax({
        url: '/add-to-cart/',
        data: ajaxData,
        dataType: 'json',
        beforeSend: function() {
            this_val.prop('disabled', true);
        },
        success: function(response) {
            if (isProductPage) {
                this_val.html('Товар у кошику');
            } else {
                this_val.html('<span class="success-check">✔</span>');
            }
            this_val.addClass('added-to-cart');
            $('.cart-items-count').text(response.totalcartitems);
        },
        error: function(xhr, status, error) {
            console.error('Error adding to cart:', error);
            console.error('Ajax data:', ajaxData); // Добавим для отладки
            this_val.prop('disabled', false);
            alert('Помилка при додаванні товару до кошика. Будь ласка, спробуйте ще раз.');
        },
        complete: function() {
            this_val.prop('disabled', false);
        }
    });
}

$(document).on('click', '.add-to-cart-btn:not(.single_add_to_cart_button)', function(e) {
    e.preventDefault();
    handleAddToCart($(this), false);
});

    $(document).on('click', '.delete-product', function(){
        let product_id = $(this).attr('data-product');
        let this_val = $(this);

        // Сохраняем данные формы перед удалением
        let savedFormData = saveFormData();

        $.ajax({
            url: '/delete-from-cart',
            data: {
                'id': product_id
            },
            dataType: 'json',
            beforeSend: function(){
                this_val.hide();
            },
            success: function(response){
                if(response.is_empty) {
                    $('#cart-list').html(response.data);
                    $('.cart-items-count').text('0');
                } else {
                    $('#cart-list').html(response.data);
                    $('.cart-items-count').text(response.totalcartitems);

                    // Ждем полного обновления DOM
                    setTimeout(() => {
                        // Инициализируем телефонный инпут
                        initPhoneInput();

                        // Инициализируем Nova Poshta API
                        if(window.initNovaPoshtaApi) {
                            window.initNovaPoshtaApi();

                            // После инициализации API восстанавливаем данные формы
                            setTimeout(() => {
                                restoreFormData(savedFormData);
                            }, 100);
                        }
                    }, 100);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error removing from cart:', error);
                this_val.show();
                alert('Помилка при видаленні товару з кошика. Будь ласка, спробуйте ще раз.');
            }
        });
    });


$(document).on('click', '.qty-plus', function() {
    let input = $(this).siblings('input.qty');
    let product_key = input.attr('data-key');
    let currentVal = parseInt(input.val());

    input.val(currentVal + 1);
    updateCart(product_key, currentVal + 1, $(this));
});

$(document).on('click', '.qty-minus', function() {
    let input = $(this).siblings('input.qty');
    let product_key = input.attr('data-key');
    let currentVal = parseInt(input.val());

    if (currentVal > 1) {
        input.val(currentVal - 1);
        updateCart(product_key, currentVal - 1, $(this));
    }
});

function updateCart(product_key, quantity, button) {
    button.prop('disabled', true);

    $.ajax({
        url: '/update-cart',
        data: {
            'id': product_key,
            'quantity': quantity
        },
        dataType: 'json',
        success: function(response) {
            response.products.forEach(function(product) {

                $('.product-quantity-' + product.product_id.replace('_', '-'))
                    .val(product.quantity);

                let subtotalCell = $('[data-key="' + product.product_id + '"]')
                    .closest('tr')
                    .find('.c-cart__shop-td--product-subtotal .woocommerce-Price-amount bdi');

                subtotalCell.html(
                    '<span class="woocommerce-Price-currencySymbol">₴</span>' +
                    product.total_price.toFixed(2)
                );
            });

            $('.cart-items-count').text(response.totalcartitems);
            $('.cart-subtotal .woocommerce-Price-amount bdi').html(
                '<span class="woocommerce-Price-currencySymbol">₴</span>' +
                response.cart_total.toFixed(2)
            );
            $('.order-total .woocommerce-Price-amount bdi').html(
                '<span class="woocommerce-Price-currencySymbol">₴</span>' +
                response.cart_total.toFixed(2)
            );
        },
        error: function() {
            alert('Помилка при оновленні кошика');
        },
        complete: function() {
            button.prop('disabled', false);
        }
    });
}


$(document).ready(function() {
    // Обработка клика по кнопке вишлиста
    $(document).on('click', '.add-to-wishlist', function(e) {
        e.preventDefault();
        let $this = $(this);
        let productId = $this.data('product-item');
        let url = $this.hasClass('active') ? '/remove-from-wishlist/' : '/add-to-wishlist/';

        $.ajax({
            url: url,
            data: {
                'id': productId
            },
            dataType: 'json',
            beforeSend: function() {
                $this.prop('disabled', true);
            },
            success: function(response) {
                if (!response.authenticated) {
                    window.location.href = response.redirect_url;
                    return;
                }

                // Обновляем счетчик в шапке
                $('.js-wishlist-info .c-header__cart-count').text(response.wishlist_count);

                if (url === '/add-to-wishlist/') {
                    if (response.added) {
                        $this.addClass('active');
                    }
                } else {
                    if (!response.error) {
                        $this.removeClass('active');

                        // Если мы на странице вишлиста
                        if (window.location.pathname.includes('wishlist')) {
                            if (response.is_empty) {
                                $('.l-section__content').html(response.html);
                            } else {
                                $this.closest('.c-wishlist__shop-tr').fadeOut(300, function() {
                                    $(this).remove();
                                });
                            }
                        }
                    }
                }
            },
            error: function() {
                alert('Виникла помилка. Спробуйте пізніше.');
            },
            complete: function() {
                $this.prop('disabled', false);
            }
        });
    });

    // Удаление из вишлиста на странице вишлиста
    $(document).on('click', '.js-wishlist-remove', function(e) {
        e.preventDefault();
        let $this = $(this);
        let productId = $this.data('product-id');

        $.ajax({
            url: '/remove-from-wishlist/',
            data: {
                'id': productId
            },
            dataType: 'json',
            beforeSend: function() {
                $this.prop('disabled', true);
            },
            success: function(response) {
                if (!response.authenticated) {
                    window.location.href = response.redirect_url;
                    return;
                }

                if (response.is_empty) {
                    $('.l-section__content').html(response.html);
                } else {
                    $this.closest('.c-wishlist__shop-tr').fadeOut(300, function() {
                        $(this).remove();
                    });
                }

                // Обновляем счетчик в шапке
                $('.js-wishlist-info .c-header__cart-count').text(response.wishlist_count);

                // Обновляем состояние кнопки на карточке товара, если она есть на странице
                $('.add-to-wishlist[data-product-item="' + productId + '"]').removeClass('active');
            },
            error: function() {
                alert('Виникла помилка при видаленні товару.');
            },
            complete: function() {
                $this.prop('disabled', false);
            }
        });
    });
});
