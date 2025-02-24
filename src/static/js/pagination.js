$(document).ready(function() {
    function updateQueryString(key, value) {
        let uri = window.location.href;
        let re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        let separator = uri.indexOf('?') !== -1 ? "&" : "?";

        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            return uri + separator + key + "=" + value;
        }
    }

    // Обработчик клика по ссылкам пагинации
    $(document).on('click', '.page-numbers a', function(e) {
        e.preventDefault();
        let page = this.href.split('page=')[1] || 1;
        let newUrl = updateQueryString('page', page);
        window.location.href = newUrl;
    });
});