// Variable global para almacenar el orden actual
var currentOrder = 1;
var currentDistance = 1;
var currentLatitude = 0.0;
var currentLongitude = 0.0;
var currentCategories = '';
var currentCompany = 0;
var currentCompanyName = '';

function setupEnterKeyListener() {

    var txtItemName = document.getElementById('txtItemName');
    var btnSearch = document.getElementById('btnSearch');

    txtItemName.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevenir el comportamiento por defecto
            btnSearch.click(); // Disparar el clic del botón
        }
    });
    
    txtItemName.focus();
}

window.onload = function() {

    getHeader();
    getFooter();
    loadCategoriesNavbar();

    var publicationsTitle = document.getElementById('publicationsTitle');
    var clearCompany = document.getElementById('btnClearCompany');
    
    document.getElementById('btnClearCompany').addEventListener('click', (e) => {
        e.preventDefault();
        deleteTitle();
    });


    const params = new URLSearchParams(window.location.search);

    // si hay parámetros en la URL, cargamos esa búsqueda
    const urlParams = new URLSearchParams(window.location.search);
    const itemName = urlParams.get("itemName");
    const order = urlParams.get("order");
    const distance = urlParams.get("distance");
    const categories = urlParams.get("categories");
    const company = urlParams.get("company");

    if (itemName) {
        document.getElementById('txtItemName').value = itemName;
    }

    if (order) {
        currentOrder = parseInt(order);
        document.getElementById('selOrder').value = currentOrder;
    }
    
    if (distance) {
        currentDistance = parseInt(distance);
        document.getElementById('selDistance').value = currentDistance;
    }

    if(categories) {
        currentCategories = categories;
        loadCategoriesFromURL();
    }
    
    if(company) {
        currentCompany = parseInt(company);
    }
    
    var btnSearch = document.getElementById('btnSearch');
    btnSearch.click();

    setupEnterKeyListener();
};

// Función para actualizar el orden
function updateOrder() {
    currentOrder = parseInt(document.getElementById('selOrder').value);
    const itemName = document.getElementById('txtItemName').value.trim();
    if (itemName) {
        getEntities(itemName);
    } else {
        console.log("No hay itemName, no se actualiza la búsqueda.");
    }
}

// Función para actualizar la distancia
function updateDistance() {
    currentDistance = parseInt(document.getElementById('selDistance').value);
    const itemName = document.getElementById('txtItemName').value.trim();
    if (itemName) {
        getEntities(itemName);
    } else {
        console.log("No hay itemName, no se actualiza la búsqueda.");
    }
}

async function getEntities(itemNameFromParam) {
    try {
        const itemName = itemNameFromParam || document.getElementById('txtItemName').value.trim();

        // Si no hay texto y además, no hay un comercio seleccionado, no hacemos nada...
        if (!itemName && currentCompany == 0) {
            console.log("No se ingresó ningún nombre de ítem; no se buscará nada.");
            return;
        }
        
        var position = await getCurrentLocation();
        console.log('Ubicación obtenida:', position.coords.latitude, position.coords.longitude);
        
        currentLatitude = position.coords.latitude;
        currentLongitude = position.coords.longitude;

        const params = new URLSearchParams();
        params.append('itemName', itemName);
        params.append('order', currentOrder);
        params.append('latitude', currentLatitude);
        params.append('longitude', currentLongitude);
        params.append('distance', currentDistance);
        params.append('categories', currentCategories);
        params.append('company', currentCompany);

        const newUrl = window.location.pathname + '?' + params.toString();
        window.history.replaceState({}, "", newUrl);

        const url = config.get_backend_url(
            '/public/publications?itemName=' + encodeURIComponent(itemName) + '&order=' + currentOrder +
            '&latitude=' + currentLatitude + '&longitude=' + currentLongitude + '&distance=' + currentDistance +
            '&categories=' + currentCategories + '&company=' + currentCompany);

        const response = await fetch(url);
        if (!response.ok) throw new Error('Error en la solicitud: ' + response.status);

        const data = await response.json();
        await fillCards(data);
        return data;
    } catch (error) {
        console.error('Error in /public/publications: ', error);
    }
}

async function fillCards(data, content) {
    const container = document.getElementById('publications');
    container.innerHTML = '';
    var idx_for = 0;

    for (let pub of data) {
        const esquiner = pub.specialOffer === '1' ? `
            <div class="esquiner-img">
                <img src="/Quijotito/content/assets/img/QuijotitoOferta.png" alt="Oferta especial" class="esquiner-icon">
            </div>` : '';

        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center';

        currentCompanyName = pub.company.name;
        var clearCompany = document.getElementById('btnClearCompany');
        
        if(idx_for == 0) {
            if(currentCompany > 0) {
                const title = document.getElementById("publicationsTitle");
                if (title) {
                    title.textContent = "Publicaciones de " + currentCompanyName;
                }
            } else {
                clearCompany.style.display = 'none';
            }
        }

        col.innerHTML = `
            <div class="cards hand position-relative p-2" style="max-width: 260px; width: 100%;" 
                 onclick="window.location.href = config.get_frontend_url('/viewPublication.html?id=') + ${pub.id};">
                ${esquiner}
                <div class="card-head text-center bg-white p-2">
                    <img class="card-img-top mx-auto d-block" src="${pub.finalImage}" alt="Producto" 
                         style="max-width: 160px; max-height: 120px; object-fit: contain;">
                </div>
                <div class="card-body p-2 text-center">
                    <h6 class="product-title mb-1">${pub.item.name}</h6>
                    <p class="text-muted small mb-1">${pub.descriptionShort}</p>
                    <h5 class="product-price text-success fw-bold mb-0">$ ${config.format_currency_view(pub.outputPrice)}</h5>
                </div>
                <div class="card-footer bg-transparent border-0 text-center pt-2">
                    <small class="text-secondary d-block fw-semibold">${pub.category.name}</small>
                    <small class="text-secondary fw-normal">${pub.company.name}</small>
                </div>
            </div>
        `;
        container.appendChild(col);
        idx_for++;
    }
}

async function getCurrentLocation() {
    return new Promise(function (resolve, reject) {
        if (!navigator.geolocation) {
            reject({ code: 0, message: "Geolocalización no soportada." });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function (position) {
                resolve(position);
            },
            function (error) {
                if (error.code === 1) {
                    reject({ code: 1, message: "El usuario no permite el uso de la ubicación del dispositivo." });
                } else if (error.code === 2) {
                    reject({ code: 2, message: "La ubicación del dispositivo no está disponible." });
                } else if (error.code === 3) {
                    reject({ code: 3, message: "Tiempo de espera de ubicación del dispositivo agotado." });
                } else {
                    reject({ code: error.code, message: error.message });
                }
            },
            {
                // Opciones adicionales para mejor performance
                timeout: 10000,
                maximumAge: 60000, // Cache de 1 minuto
                enableHighAccuracy: true
            }
        );
    });
}

function loadCategoriesFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const categories = urlParams.get("categories");
    
    if (categories) {
        const categoryIds = categories.split(',');
        
        // Para cada ID, necesitamos obtener el nombre de la categoría
        categoryIds.forEach(async (id) => {
            try {
                const url = config.get_backend_url("/public/categories");
                const response = await fetch(url);
                const allCategories = await response.json();
                
                const category = allCategories.find(c => c.id.toString() === id);
                if (category) {
                    addCategoryTag(id, category.name);
                }
            } catch (error) {
                console.error('Error cargando categoría:', error);
            }
        });
    }
}

function deleteTitle() {

    var clearCompany = document.getElementById('btnClearCompany');

    publicationsTitle.textContent = '';
    clearCompany.style.display = 'none';
    currentCompany = 0;
    currentCompanyName = '';

    document.getElementById('txtItemName').focus();
}

function executeCategoriesAction(ids) {

    currentCategories = ids;

    const itemName = document.getElementById('txtItemName').value.trim();

    getEntities(itemName);
}




