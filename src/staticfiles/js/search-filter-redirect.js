$(document).ready(function() {
    // Проверяем, находимся ли мы на странице поиска
    const isSearchPage = window.location.pathname.includes('/search');

    if (isSearchPage) {
        // Получаем текущий поисковый запрос из URL
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('query');

        // Обработчик для чекбоксов на странице поиска
        $(".filter-checkbox").on("change", function() {
            let filter_object = {};

            // Собираем выбранные фильтры
            $(".filter-checkbox").each(function () {
                let filter_key = $(this).data("filter");
                filter_object[filter_key + "[]"] = Array.from(
                    document.querySelectorAll('input[data-filter=' + filter_key + ']:checked')
                ).map(element => element.value);
            });

            // Получаем значения цен
            const minPrice = $('#min_range').val();
            const maxPrice = $('#max_range').val();

            // Создаем URL для каталога с параметрами
            let catalogUrl = '/products/?';
            const params = new URLSearchParams();

            // Добавляем категории
            if (filter_object['category[]'] && filter_object['category[]'].length > 0) {
                filter_object['category[]'].forEach(cat => {
                    params.append('category[]', cat);
                });
            }

            // Добавляем бренды
            if (filter_object['brand[]'] && filter_object['brand[]'].length > 0) {
                filter_object['brand[]'].forEach(brand => {
                    params.append('brand[]', brand);
                });
            }

            // Добавляем цены
            if (minPrice) params.append('min_price', minPrice);
            if (maxPrice) params.append('max_price', maxPrice);

            // Добавляем поисковый запрос как дополнительный параметр
            if (searchQuery) {
                params.append('search_query', searchQuery);
            }

            // Перенаправляем на страницу каталога
            window.location.href = catalogUrl + params.toString();
        });

        // Обработчик для кнопки фильтра цены
        $("#price-filter-btn").on("click", function() {
            const minPrice = $('#min_range').val();
            const maxPrice = $('#max_range').val();

            let catalogUrl = '/products/?';
            const params = new URLSearchParams();

            // Добавляем цены
            params.append('min_price', minPrice);
            params.append('max_price', maxPrice);

            // Добавляем поисковый запрос
            if (searchQuery) {
                params.append('search_query', searchQuery);
            }

            // Перенаправляем на страницу каталога
            window.location.href = catalogUrl + params.toString();
        });
    }
});