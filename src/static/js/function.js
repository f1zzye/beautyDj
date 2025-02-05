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