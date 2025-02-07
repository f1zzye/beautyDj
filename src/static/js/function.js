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

    $(".filter-checkbox").on("change", function() {
        let filter_object = {};

        $(".filter-checkbox").each(function () {
            let filter_key = $(this).data("filter");
            filter_object[filter_key + "[]"] = Array.from(
                document.querySelectorAll('input[data-filter=' + filter_key + ']:checked')
            ).map(element => element.value);
        });

        $.ajax({
            url: '/get-price-range/',
            data: filter_object,
            dataType: 'json',
            success: function(response) {
                updateSliderRange(response.min_price, response.max_price);
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

    $(".filter-checkbox, #price-filter-btn").on("click", function () {
        let filter_object = {
            min_price: minRange.value,
            max_price: maxRange.value
        };

        $(".filter-checkbox").each(function () {
            let filter_value = $(this).val();
            let filter_key = $(this).data("filter");

            filter_object[filter_key] = Array.from(
                document.querySelectorAll('input[data-filter=' + filter_key + ']:checked')
            ).map(element => element.value);
        });

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
    });
});


$('.add-to-cart-btn').on('click', function(e){
    e.preventDefault();

    let this_val = $(this)
    let index_val = this_val.attr('data-index')
    let isProductPage = this_val.hasClass('single_add_to_cart_button'); // Проверяем, находимся ли мы на странице продукта

    let quantity = $('.product-quantity-'+ index_val).val()
    let product_title = $('.product-title-'+ index_val).val()
    let product_id = $('.product-id-'+ index_val).val()
    let product_price = $('.current-product-price-'+ index_val).text()
    let product_pid = $('.product-pid-' + index_val).val()
    let product_image = $('.product-image-' + index_val).val()

    console.log('Quantity:', quantity);
    console.log('Title:', product_title);
    console.log('ID:', product_id);
    console.log('PID:', product_pid);
    console.log('Image:', product_image);
    console.log('Index:', index_val);
    console.log('Price:', product_price);

    $.ajax({
        url: '/add-to-cart',
        data: {
            'id': product_id,
            'pid': product_pid,
            'image': product_image,
            'quantity': quantity,
            'title': product_title,
            'price': product_price
        },
        dataType: 'json',
        beforeSend: function(){
            console.log('Adding to cart...');
            // Можно добавить индикатор загрузки
            this_val.prop('disabled', true);
        },
        success: function(response) {
            if (isProductPage) {
                // Если это страница product-details
                this_val.html('Товар у кошику');
                this_val.addClass('added-to-cart');
            } else {
                // Если это страница index
                this_val.html('<span class="success-check">✔</span>');
                this_val.addClass('added-to-cart');
            }

            console.log('Added to cart');
            $('.cart-items-count').text(response.totalcartitems);
        },
        error: function() {
            // Обработка ошибки
            this_val.prop('disabled', false);
        },
        complete: function() {
            // Действия после завершения запроса
            this_val.prop('disabled', false);
        }
    });
});