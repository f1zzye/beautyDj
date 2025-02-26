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
        if (minRange && maxRange) {
            minRange.min = minPrice;
            minRange.max = maxPrice;
            maxRange.min = minPrice;
            maxRange.max = maxPrice;

            minRange.value = minPrice;
            maxRange.value = maxPrice;

            updatePriceLabels();
        }
    }

    function updatePriceLabels() {
        if (minLabel && maxLabel && minRange && maxRange) {
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
    }

    function getFilterParams() {
        const urlParams = new URLSearchParams(window.location.search);
        let filter_object = {
            page: urlParams.get('page') || 1
        };

        if (minRange && maxRange) {
            filter_object.min_price = minRange.value;
            filter_object.max_price = maxRange.value;
        }

        if (orderbySelect) {
            filter_object.orderby = orderbySelect.value;
        }

        // Собираем только отмеченные чекбоксы
        $(".filter-checkbox:checked").each(function () {
            let filter_key = $(this).data("filter");
            if (!filter_object[filter_key + "[]"]) {
                filter_object[filter_key + "[]"] = [];
            }
            filter_object[filter_key + "[]"].push($(this).val());
        });

        return filter_object;
    }

    function updateProducts(page = null) {
    const filter_object = getFilterParams();
    if (page) {
        filter_object.page = page;
    }

    // Сначала обновляем URL
    const url = new URL(window.location.href);
    url.searchParams.forEach((value, key) => {
        url.searchParams.delete(key);
    });

    Object.entries(filter_object).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
            value.forEach(v => url.searchParams.append(key, v));
        } else if (value !== null && value !== '') {
            url.searchParams.set(key, value);
        }
    });

    $.ajax({
        url: '/filter-products',
        data: filter_object,
        dataType: 'json',
        beforeSend: function() {
            $('#filtered-products').addClass('loading');
        },
        success: function(response) {
            if (response && response.data) {
                $('#filtered-products').html(response.data);
                // Обновляем пагинацию только если она есть
                if (response.pagination) {
                    $('.woocommerce-pagination').html(response.pagination);
                    bindPaginationHandlers();
                } else {
                    // Если пагинации нет, удаляем её
                    $('.woocommerce-pagination').empty();
                }
                if (response.count_text) {
                    $('#products-count').html(response.count_text);
                }
                window.history.pushState({}, '', url);
            }
        },
        error: function(error) {
            console.error('Error:', error);
        },
        complete: function() {
            $('#filtered-products').removeClass('loading');
        }
    });
}

    function bindPaginationHandlers() {
        $('.page-numbers a').off('click').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Останавливаем всплытие события
            const page = $(this).data('page');
            if (page) {
                updateProducts(page);
                if ($('#filtered-products').length) {
                    $('html, body').animate({
                        scrollTop: $('#filtered-products').offset().top - 100
                    }, 500);
                }
            }
        });
    }

    // Обработчик изменения сортировки
    if (orderbySelect) {
        orderbySelect.addEventListener('change', function(e) {
            e.preventDefault();
            updateProducts(1); // Сброс на первую страницу при изменении сортировки
        });
    }

    // Обработчики фильтров
    $(".filter-checkbox").on("change", function(event) {
        let filter_object = {};

        $(".filter-checkbox:checked").each(function () {
            let filter_key = $(this).data("filter");
            if (!filter_object[filter_key + "[]"]) {
                filter_object[filter_key + "[]"] = [];
            }
            filter_object[filter_key + "[]"].push($(this).val());
        });

        // Сначала обновляем диапазон цен
        $.ajax({
            url: '/get-price-range/',
            data: {
                ...filter_object,
                ignore_price_filter: !this.checked
            },
            dataType: 'json',
            success: function(response) {
                if (response && typeof response.min_price !== 'undefined' && typeof response.max_price !== 'undefined') {
                    updateSliderRange(response.min_price, response.max_price);
                    // Только после обновления диапазона цен обновляем продукты
                    updateProducts(1);
                }
            },
            error: function(error) {
                console.error('Error updating price range:', error);
            }
        });
    });

    // Обработчики ползунков цены
    if (minRange && maxRange) {
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
    }

    // Обработчик кнопки фильтра цены
    $("#price-filter-btn").on("click", function() {
        updateProducts(1); // Сброс на первую страницу при применении фильтра цены
    });

    // Инициализация при загрузке страницы
    if (minRange && maxRange) {
        updatePriceLabels();
    }

    // Восстановление состояния из URL при загрузке страницы
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('page') || urlParams.has('category[]') || urlParams.has('brand[]') ||
        urlParams.has('min_price') || urlParams.has('max_price') || urlParams.has('orderby')) {

        // Устанавливаем значения фильтров из URL
        if (urlParams.has('min_price') && urlParams.has('max_price') && minRange && maxRange) {
            minRange.value = urlParams.get('min_price');
            maxRange.value = urlParams.get('max_price');
            updatePriceLabels();
        }

        // Восстанавливаем чекбоксы
        urlParams.forEach((value, key) => {
            if (key.endsWith('[]')) {
                $(`.filter-checkbox[data-filter="${key.slice(0, -2)}"][value="${value}"]`).prop('checked', true);
            }
        });

        updateProducts(urlParams.get('page') || 1);
    }

    // Обработчик изменения истории браузера (кнопки назад/вперед)
    window.addEventListener('popstate', function(e) {
        e.preventDefault();
        const urlParams = new URLSearchParams(window.location.search);

        // Восстанавливаем состояние фильтров из URL
        if (urlParams.has('min_price') && urlParams.has('max_price') && minRange && maxRange) {
            minRange.value = urlParams.get('min_price');
            maxRange.value = urlParams.get('max_price');
            updatePriceLabels();
        }

        // Восстанавливаем чекбоксы
        $(".filter-checkbox").prop('checked', false); // Сначала снимаем все галочки
        urlParams.forEach((value, key) => {
            if (key.endsWith('[]')) {
                $(`.filter-checkbox[data-filter="${key.slice(0, -2)}"][value="${value}"]`).prop('checked', true);
            }
        });

        updateProducts(urlParams.get('page') || 1);
    });
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

    $(document).on('click', '#clear-cart-button', function(e){
    e.preventDefault();

    let savedFormData = saveFormData();

    $.ajax({
        url: '/clear-cart/',
        dataType: 'json',
        beforeSend: function(){
            $('#clear-cart-button').prop('disabled', true);
        },
        success: function(response){
            $('#cart-list').html(response.data);
            $('.cart-items-count').text('0');

            setTimeout(() => {
                initPhoneInput();

                if(window.initNovaPoshtaApi) {
                    window.initNovaPoshtaApi();

                    setTimeout(() => {
                        restoreFormData(savedFormData);
                    }, 100);
                }
            }, 100);
        },
        error: function(xhr, status, error) {
            console.error('Error clearing cart:', error);
            $('#clear-cart-button').prop('disabled', false);
            alert('Помилка при очищенні кошика. Будь ласка, спробуйте ще раз.');
        },
        complete: function() {
            $('#clear-cart-button').prop('disabled', false);
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
