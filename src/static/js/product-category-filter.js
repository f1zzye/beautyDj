$(document).ready(function() {
    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryIds = urlParams.getAll('category[]');

    // Если есть параметры категорий, устанавливаем соответствующие чекбоксы
    if (categoryIds.length > 0) {
        categoryIds.forEach(categoryId => {
            $(`.filter-checkbox[data-filter="category"][value="${categoryId}"]`).prop('checked', true);
        });

        // Вызываем обновление цен и продуктов
        const filter_object = {};
        $(".filter-checkbox").each(function () {
            let filter_key = $(this).data("filter");
            filter_object[filter_key + "[]"] = Array.from(
                document.querySelectorAll('input[data-filter=' + filter_key + ']:checked')
            ).map(element => element.value);
        });

        // Обновляем диапазон цен
        $.ajax({
            url: '/get-price-range/',
            data: filter_object,
            dataType: 'json',
            success: function(response) {
                const minRange = document.getElementById('min_range');
                const maxRange = document.getElementById('max_range');
                if (minRange && maxRange) {
                    minRange.value = response.min_price;
                    maxRange.value = response.max_price;
                    $('#min_price_label').text(response.min_price.toFixed(2));
                    $('#max_price_label').text(response.max_price.toFixed(2));
                }
            }
        });

        // Обновляем список продуктов
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
            }
        });
    }
});