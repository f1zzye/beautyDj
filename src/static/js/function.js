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


// function.js
function handleAddToCart(this_val, isProductPage, currentVariationData = null) {
    const index_val = this_val.attr('data-index');

    // Get product data
    const quantity = $('.product-quantity-' + index_val).val();
    const product_title = $('.product-title-' + index_val).val();
    const product_id = $('.product-id-' + index_val).val();
    const product_pid = $('.product-pid-' + index_val).val();
    const product_image = currentVariationData ? currentVariationData.image : $('.product-image-' + index_val).val();
    const product_price = currentVariationData ? currentVariationData.price : $('.current-product-price-' + index_val).text();

    // Prepare ajax data
    const ajaxData = {
        'id': product_id,
        'pid': product_pid,
        'image': product_image,
        'quantity': quantity,
        'title': product_title,
        'price': product_price
    };

    // Add variation data if exists
    if (currentVariationData) {
        ajaxData.variation_id = currentVariationData.variation_id;
        ajaxData.volume = currentVariationData.volume;
    }

    // Ajax request
    $.ajax({
        url: '/add-to-cart',
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
            this_val.prop('disabled', false);
            alert('Помилка при додаванні товару до кошика. Будь ласка, спробуйте ще раз.');
        },
        complete: function() {
            this_val.prop('disabled', false);
        }
    });
}

// Обработчик для страницы каталога
$(document).on('click', '.add-to-cart-btn:not(.single_add_to_cart_button)', function(e) {
    e.preventDefault();
    handleAddToCart($(this), false);
});