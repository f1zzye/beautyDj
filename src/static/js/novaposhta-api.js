function initNovaPoshtaApi() {
    // Кэшируем DOM элементы
    const elements = {
        region: document.getElementById("region"),
        city: {
            input: document.getElementById("cityInput"),
            results: document.getElementById("citySearchResults"),
            toggle: document.getElementById("toggleCitySelect"),
            ref: document.getElementById("cityRef")
        },
        office: document.getElementById("office")
    };

    // Проверяем наличие необходимых элементов
    if (!elements.region || !elements.city.input || !elements.office) {
        return;
    }

    // Константы
    const API_KEY = "3506f7c429e7bd9d4bd22481c0458455";
    const DEFAULT_OPTIONS = {
        loading: '<option value="">Завантаження...</option>',
        select: '<option value="">Оберіть відділення</option>'
    };

    // Функции для работы с формой делаем глобальными
    window.saveFormData = function() {
        return {
            fname: $('input[name="fname"]').val(),
            lname: $('input[name="lname"]').val(),
            email: $('input[name="email"]').val(),
            phone: $('input[name="phone"]').val(),
            state: $('#region').val(),
            city: $('#cityInput').val(),
            cityRef: $('#cityRef').val(),
            address: $('#office').val(),
            extra_info: $('textarea[name="extra_info"]').val()
        };
    };

    window.restoreFormData = function(formData) {
        $('input[name="fname"]').val(formData.fname);
        $('input[name="lname"]').val(formData.lname);
        $('input[name="email"]').val(formData.email);
        $('input[name="phone"]').val(formData.phone);

        // Восстанавливаем данные Новой Почты
        if(formData.state) {
            $('#region').val(formData.state);
            // Загружаем города для выбранной области
            if(formData.state && elements.region) {
                loadCities(formData.state);
            }
        }
        if(formData.city) {
            $('#cityInput').val(formData.city);
        }
        if(formData.cityRef) {
            $('#cityRef').val(formData.cityRef);
            // Загружаем отделения для выбранного города
            if(formData.cityRef) {
                loadOffices(formData.cityRef);
            }
        }
        if(formData.address) {
            setTimeout(() => {
                $('#office').val(formData.address);
            }, 500);
        }

        $('textarea[name="extra_info"]').val(formData.extra_info);
    };

    // Класс для работы с API
    class NovaPoshtaApi {
        constructor(apiKey) {
            this.apiKey = apiKey;
            this.baseUrl = "https://api.novaposhta.ua/v2.0/json/";
        }

        async request(modelName, calledMethod, methodProperties = {}) {
            try {
                const response = await fetch(this.baseUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        apiKey: this.apiKey,
                        modelName,
                        calledMethod,
                        methodProperties
                    })
                });
                const data = await response.json();
                if (!data.success) throw new Error(data.errors?.join(' ') || "API request failed");
                return data;
            } catch (error) {
                console.error(`${modelName}/${calledMethod} failed:`, error);
                throw error;
            }
        }
    }

    const api = new NovaPoshtaApi(API_KEY);
    let citiesData = [];

    // Утилиты
    const utils = {
        setLoading: (isLoading) => {
            elements.city.input.disabled = isLoading;
            elements.city.input.placeholder = isLoading ?
                'Завантаження...' :
                'Введіть назву міста або оберіть зі списку';
        },

        sortByLocale: (a, b, field = 'Description') =>
            a[field].localeCompare(b[field], 'uk'),

        getCityName: (city) => city.Description.split(',')[0].trim().toLowerCase()
    };

    // Функция выбора города
    function selectCity(city) {
        elements.city.input.value = city.Description;
        elements.city.ref.value = city.Ref;
        elements.city.results.style.display = 'none';
        loadOffices(city.Ref);
    }

    // Основные функции
    async function loadRegions() {
        try {
            elements.region.innerHTML = DEFAULT_OPTIONS.loading;
            utils.setLoading(true);
            elements.office.innerHTML = DEFAULT_OPTIONS.select;

            const response = await api.request("Address", "getAreas");
            const filteredAreas = response.data
                .filter(area => area.Description !== 'АРК')
                .sort(utils.sortByLocale);

            elements.region.innerHTML = '<option value="">Оберіть область</option>' +
                filteredAreas.map(area =>
                    `<option value="${area.Ref}">${area.Description}</option>`
                ).join('');

        } catch (error) {
            elements.region.innerHTML = '<option value="">Помилка завантаження</option>';
        }
    }

    async function loadCities(regionRef) {
        try {
            utils.setLoading(true);
            elements.office.innerHTML = DEFAULT_OPTIONS.select;

            const response = await api.request("Address", "getCities", { AreaRef: regionRef });
            citiesData = response.data.sort(utils.sortByLocale);
            utils.setLoading(false);

        } catch (error) {
            utils.setLoading(true);
            elements.city.input.placeholder = 'Помилка завантаження';
        }
    }

    function filterCities(searchText) {
        if (!searchText) {
            displaySearchResults(citiesData);
            return;
        }

        const search = searchText.toLowerCase().trim();
        const filtered = citiesData
            .filter(city => utils.getCityName(city).includes(search))
            .sort((a, b) => {
                const nameA = utils.getCityName(a);
                const nameB = utils.getCityName(b);
                const aStarts = nameA.startsWith(search);
                const bStarts = nameB.startsWith(search);

                return aStarts === bStarts ?
                    nameA.localeCompare(nameB, 'uk') :
                    bStarts ? 1 : -1;
            });

        displaySearchResults(filtered);
    }

    function displaySearchResults(cities) {
        elements.city.results.innerHTML = '';

        if (cities.length) {
            cities.forEach(city => {
                const div = document.createElement('div');
                div.className = 'dropdown-item';
                div.textContent = city.Description;
                div.onclick = () => selectCity(city);
                elements.city.results.appendChild(div);
            });
            elements.city.results.style.display = 'block';
        } else {
            elements.city.results.style.display = 'none';
        }
    }

    async function loadOffices(cityRef) {
        try {
            elements.office.innerHTML = DEFAULT_OPTIONS.loading;

            const response = await api.request("Address", "getWarehouses", { CityRef: cityRef });
            const sortedOffices = response.data.sort((a, b) =>
                parseInt(a.Number) - parseInt(b.Number)
            );

            elements.office.innerHTML = DEFAULT_OPTIONS.select +
                sortedOffices.map(office =>
                    `<option value="${office.Ref}">${office.Description}</option>`
                ).join('');

        } catch (error) {
            elements.office.innerHTML = '<option value="">Помилка завантаження</option>';
        }
    }

    // Event Listeners
    elements.region.addEventListener("change", (e) => {
        const regionRef = e.target.value;
        elements.city.input.value = '';
        elements.city.results.style.display = 'none';

        if (regionRef) {
            loadCities(regionRef);
        } else {
            utils.setLoading(true);
            elements.office.innerHTML = DEFAULT_OPTIONS.select;
        }
    });

    elements.city.input.addEventListener('input', (e) => filterCities(e.target.value));

    elements.city.input.addEventListener('focus', () => {
        if (elements.region.value) {
            displaySearchResults(citiesData);
        }
    });

    document.addEventListener('click', (e) => {
        if (!elements.city.input.contains(e.target) &&
            !elements.city.results.contains(e.target)) {
            elements.city.results.style.display = 'none';
        }
    });

    // Initialize
    loadRegions();
}

document.addEventListener('DOMContentLoaded', initNovaPoshtaApi);

window.initNovaPoshtaApi = initNovaPoshtaApi;

// phone validation
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    const prefix = '+38 0';
    phoneInput.value = prefix;

    phoneInput.addEventListener('input', function(e) {
        let value = phoneInput.value;

        if (!value.startsWith(prefix)) {
            phoneInput.value = prefix;
            return;
        }

        value = value.replace(/\D/g, '').substring(3); // Удаляем +38 0

        let formattedValue = prefix;

        if (value.length > 0) {
            formattedValue += value.substring(0, 2) + ' ';
        }
        if (value.length > 2) {
            formattedValue += value.substring(2, 5) + ' ';
        }
        if (value.length > 5) {
            formattedValue += value.substring(5, 7) + ' ';
        }
        if (value.length > 7) {
            formattedValue += value.substring(7, 9);
        }

        phoneInput.value = formattedValue.trim();
    });

    phoneInput.addEventListener('keydown', function(e) {
        if (phoneInput.selectionStart < prefix.length && (e.key === 'Backspace' || e.key === 'Delete')) {
            e.preventDefault();
        }
    });
});
