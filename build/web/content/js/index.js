// ============================================================================
// VARIABLES GLOBALES
// ============================================================================

var currentOrder = 1;           // Orden actual de publicaciones (1-4)
var currentDistance = 1;        // Distancia de búsqueda (0-8)
var currentLatitude = 0.0;      // Latitud del usuario
var currentLongitude = 0.0;     // Longitud del usuario
var currentCategories = '';     // IDs de categorías seleccionadas (separadas por coma)
var currentCompany = 0;         // ID de empresa seleccionada
var currentCompanyName = '';    // Nombre de empresa seleccionada

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Función principal que se ejecuta al cargar la página
 */
window.onload = function() {
    // Cargar componentes del layout
    getHeader();
    getFooter();
    loadCategoriesNavbar();

    // Configurar eventos de botones
    setupEventListeners();
    
    // Cargar parámetros de URL
    loadURLParameters();
    
    // Ejecutar búsqueda inicial
    var btnSearch = document.getElementById('btnSearch');
    btnSearch.click();
    
    // Configurar listener de Enter en input
    setupEnterKeyListener();
};

/**
 * Configura los event listeners de los elementos de la página
 */
function setupEventListeners() {
    var btnClearCompany = document.getElementById('btnClearCompany');
    
    btnClearCompany.addEventListener('click', function(e) {
        e.preventDefault();
        deleteTitle();
    });
    
    // Listener para cerrar con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var clearCompany = document.getElementById('btnClearCompany');
            if (clearCompany.style.display !== 'none') {
                deleteTitle();
            }
        }
    });
}

/**
 * Configura el listener para el Enter en el input de búsqueda
 */
function setupEnterKeyListener() {
    var txtItemName = document.getElementById('txtItemName');
    var btnSearch = document.getElementById('btnSearch');

    txtItemName.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            btnSearch.click();
        }
    });
    
    txtItemName.focus();
}

/**
 * Carga los parámetros de la URL y configura los valores iniciales
 */
function loadURLParameters() {
    var urlParams = new URLSearchParams(window.location.search);
    
    var itemName = urlParams.get('itemName');
    var order = urlParams.get('order');
    var distance = urlParams.get('distance');
    var categories = urlParams.get('categories');
    var company = urlParams.get('company');

    // Cargar itemName
    if (itemName) {
        document.getElementById('txtItemName').value = itemName;
    }

    // Cargar orden
    if (order) {
        currentOrder = parseInt(order);
        document.getElementById('selOrder').value = currentOrder;
    }
    
    // Cargar distancia
    if (distance) {
        currentDistance = parseInt(distance);
        document.getElementById('selDistance').value = currentDistance;
    }

    // Cargar categorías
    if (categories) {
        currentCategories = categories;
        loadCategoriesFromURL();
    }
    
    // Cargar empresa
    if (company) {
        currentCompany = parseInt(company);
    }
}

/**
 * Carga las categorías desde la URL y muestra los tags correspondientes
 */
function loadCategoriesFromURL() {
    var urlParams = new URLSearchParams(window.location.search);
    var categories = urlParams.get('categories');
    
    if (!categories) {
        return;
    }
    
    var categoryIds = categories.split(',');
    
    // Obtener todas las categorías del backend
    var url = config.get_backend_url('/public/categories');
    
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(allCategories) {
            // Para cada ID, buscar la categoría y agregar el tag
            categoryIds.forEach(function(id) {
                var category = allCategories.find(function(c) {
                    return c.id.toString() === id.trim();
                });
                
                if (category) {
                    addCategoryTag(id, category.name);
                }
            });
        })
        .catch(function(error) {
            console.error('Error cargando categorías:', error);
        });
}

// ============================================================================
// ACTUALIZACIÓN DE FILTROS
// ============================================================================

/**
 * Actualiza el orden de las publicaciones
 */
function updateOrder() {
    currentOrder = parseInt(document.getElementById('selOrder').value);
    var itemName = document.getElementById('txtItemName').value.trim();
    
    if (itemName || currentCompany > 0) {
        getEntities(itemName);
    } else {
        console.log("No hay itemName ni empresa, no se actualiza la búsqueda.");
    }
}

/**
 * Actualiza la distancia de búsqueda
 */
function updateDistance() {
    currentDistance = parseInt(document.getElementById('selDistance').value);
    var itemName = document.getElementById('txtItemName').value.trim();
    
    if (itemName || currentCompany > 0) {
        getEntities(itemName);
    } else {
        console.log('No hay itemName ni empresa, no se actualiza la búsqueda.');
    }
}

/**
 * Ejecuta la búsqueda cuando se filtran categorías
 * @param {string} ids - IDs de categorías separados por coma
 */
function executeCategoriesAction(ids) {
    currentCategories = ids;
    var itemName = document.getElementById('txtItemName').value.trim();
    getEntities(itemName);
}

// ============================================================================
// BÚSQUEDA Y OBTENCIÓN DE DATOS
// ============================================================================

/**
 * Obtiene las publicaciones desde el backend
 * @param {string} itemNameFromParam - Nombre del artículo a buscar
 */
async function getEntities(itemNameFromParam) {
    try {
        var itemName = itemNameFromParam || document.getElementById('txtItemName').value.trim();

        // Si no hay texto y no hay empresa seleccionada, no buscar
        if (!itemName && currentCompany == 0) {
            console.log('No se ingresó ningún nombre de ítem; no se buscará nada.');
            return;
        }
        
        // Obtener ubicación del usuario
        var position = await getCurrentLocation();
        console.log('Ubicación obtenida:', position.coords.latitude, position.coords.longitude);
        
        currentLatitude = position.coords.latitude;
        currentLongitude = position.coords.longitude;

        // Actualizar URL con parámetros
        updateURLParameters(itemName);

        // Construir URL de búsqueda
        var url = config.get_backend_url(
            '/public/publications?itemName=' + encodeURIComponent(itemName) + 
            '&order=' + currentOrder +
            '&latitude=' + currentLatitude + 
            '&longitude=' + currentLongitude + 
            '&distance=' + currentDistance +
            '&categories=' + currentCategories + 
            '&company=' + currentCompany
        );

        var response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.status);
        }

        var data = await response.json();
        await fillCards(data);
        
        return data;
    } catch (error) {
        console.error('Error in /public/publications: ', error);
    }
}

/**
 * Actualiza los parámetros en la URL
 * @param {string} itemName - Nombre del artículo
 */
function updateURLParameters(itemName) {
    var params = new URLSearchParams();
    params.append('itemName', itemName);
    params.append('order', currentOrder);
    params.append('latitude', currentLatitude);
    params.append('longitude', currentLongitude);
    params.append('distance', currentDistance);
    params.append('categories', currentCategories);
    params.append('company', currentCompany);

    var newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, "", newUrl);
}

/**
 * Obtiene la ubicación actual del usuario
 * @returns {Promise} Promesa con la posición del usuario
 */
async function getCurrentLocation() {
    return new Promise(function(resolve, reject) {
        if (!navigator.geolocation) {
            reject({ 
                code: 0, 
                message: 'Geolocalización no soportada.' 
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function(position) {
                resolve(position);
            },
            function(error) {
                var errorMessage = '';
                
                if (error.code === 1) {
                    errorMessage = 'El usuario no permite el uso de la ubicación del dispositivo.';
                } else if (error.code === 2) {
                    errorMessage = 'La ubicación del dispositivo no está disponible.';
                } else if (error.code === 3) {
                    errorMessage = 'Tiempo de espera de ubicación del dispositivo agotado.';
                } else {
                    errorMessage = error.message;
                }
                
                reject({ 
                    code: error.code, 
                    message: errorMessage 
                });
            },
            {
                timeout: 10000,
                maximumAge: 60000,
                enableHighAccuracy: true
            }
        );
    });
}

// ============================================================================
// RENDERIZADO DE TARJETAS
// ============================================================================

/**
 * Llena el contenedor con las tarjetas de publicaciones
 * @param {Array} data - Array de publicaciones
 */
async function fillCards(data) {
    var container = document.getElementById('publications');
    container.innerHTML = '';
    
    // Si no hay resultados
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No se encontraron publicaciones</p>';
        return;
    }
    
    var idx_for = 0;

    for (var i = 0; i < data.length; i++) {
        var pub = data[i];
        
        // Crear esquina de oferta si aplica
        var esquiner = pub.specialOffer === '1' ? 
            '<div class="esquiner-img">' +
                '<img src="/Quijotito/content/assets/img/QuijotitoOferta.png" ' +
                'alt="Oferta especial" class="esquiner-icon">' +
            '</div>' : '';

        var col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex justify-content-center';

        currentCompanyName = pub.company.name;
        var clearCompany = document.getElementById('btnClearCompany');
        
        // En la primera iteración, actualizar título si hay empresa seleccionada
        if (idx_for === 0) {
            if (currentCompany > 0) {
                var title = document.getElementById('publicationsTitle');
                if (title) {
                    title.textContent = 'Publicaciones de ' + currentCompanyName;
                    clearCompany.style.display = 'inline-block';
                }
            } else {
                clearCompany.style.display = 'none';
            }
        }

        // Construir HTML de la tarjeta
        col.innerHTML = 
            '<div class="cards hand position-relative p-2" style="max-width: 260px; width: 100%;" ' +
                'onclick="window.location.href = config.get_frontend_url(\'/viewPublication.html?id=\') + ' + pub.id + ';">' +
                esquiner +
                '<div class="card-head text-center bg-white p-2">' +
                    '<img class="card-img-top mx-auto d-block" src="' + pub.finalImage + '" alt="Producto" ' +
                         'style="max-width: 160px; max-height: 120px; object-fit: contain;">' +
                '</div>' +
                '<div class="card-body p-2 text-center">' +
                    '<h6 class="product-title mb-1">' + pub.item.name + '</h6>' +
                    '<p class="text-muted small mb-1">' + pub.descriptionShort + '</p>' +
                    '<h5 class="product-price text-success fw-bold mb-0">$ ' + 
                        config.format_currency_view(pub.outputPrice) + '</h5>' +
                '</div>' +
                '<div class="card-footer bg-transparent border-0 text-center pt-2">' +
                    '<small class="text-secondary d-block fw-semibold">' + pub.category.name + '</small>' +
                    '<small class="text-secondary fw-normal">' + pub.company.name + '</small>' +
                '</div>' +
            '</div>';
            
        container.appendChild(col);
        idx_for++;
    }
}

// ============================================================================
// LIMPIEZA DE FILTROS
// ============================================================================

/**
 * Elimina el filtro de empresa y limpia el título
 */
function deleteTitle() {
    var clearCompany = document.getElementById('btnClearCompany');
    var publicationsTitle = document.getElementById('publicationsTitle');

    publicationsTitle.textContent = '';
    clearCompany.style.display = 'none';
    currentCompany = 0;
    currentCompanyName = '';

    // Actualizar URL sin empresa
    var urlParams = new URLSearchParams(window.location.search);
    urlParams.set('company', '');
    window.history.replaceState({}, '', window.location.pathname + '?' + urlParams.toString());

    document.getElementById('txtItemName').focus();
}
