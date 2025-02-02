console.log("working fine");

$(document).ready(function () {
    $(".filter-checkbox").on("click", function () {
        console.log("A checkbox was clicked");

        let filter_object = {};

        $(".filter-checkbox").each(function () {
            let filter_value = $(this).val();
            let filter_key = $(this).data("filter");

            filter_object[filter_key] = Array.from(document.querySelectorAll('input[data-filter=' + filter_key + ']:checked')).map(function (element) {
                return element.value;
            })
        });

        $.ajax({
            url: '/filter-products',
            data: filter_object,
            dataType: 'json',
            beforeSend: function(){
                console.log('Trying to filter products...');
                // Можно добавить индикатор загрузки
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