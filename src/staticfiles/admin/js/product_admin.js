document.addEventListener('DOMContentLoaded', function() {
    function toggleVariants(checkbox) {
        const variantsInline = document.querySelector('.inline-related[data-inline-type="tabular"]');
        if(variantsInline) {
            variantsInline.style.display = checkbox.checked ? 'block' : 'none';
        }
    }

    const checkbox = document.querySelector('#id_has_variants');
    if(checkbox) {
        toggleVariants(checkbox);
        checkbox.addEventListener('change', function() { toggleVariants(this) });
    }
});