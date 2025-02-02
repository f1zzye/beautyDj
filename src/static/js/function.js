console.log("working fine");

$(document).ready(function () {
    const minRange = document.getElementById('min_range');
    const maxRange = document.getElementById('max_range');
    const minLabel = document.getElementById('min_price_label');
    const maxLabel = document.getElementById('max_price_label');

    minRange.value = minRange.min;
    maxRange.value = maxRange.max;
    updatePriceLabels();

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
        console.log("Filter triggered");

        let filter_object = {
            min_price: minRange.value,
            max_price: maxRange.value
        };

        $(".filter-checkbox").each(function () {
            let filter_value = $(this).val();
            let filter_key = $(this).data("filter");

            filter_object[filter_key] = Array.from(document.querySelectorAll('input[data-filter=' + filter_key + ']:checked')).map(function (element) {
                return element.value;
            });
        });

        $.ajax({
            url: '/filter-products',
            data: filter_object,
            dataType: 'json',
            beforeSend: function(){
                console.log('Trying to filter products...');
                $('#filtered-products').addClass('loading');
            },
            success: function(response){
                console.log('Data filtered successfully');
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