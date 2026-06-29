// ============================================================================
// CATEGORÍAS PRINCIPALES
// ============================================================================

/**
 * Lista de categorías principales que se muestran en el header
 */
var principalCategories = [
    { name: "VERDULERÍA", icon: "bi bi-bag", id: "11" },
    { name: "ALMACÉN", icon: "bi bi-basket", id: "1" },
    { name: "PANADERÍA", icon: "fa fa-bread-slice", id: "7" },
    { name: "CARNICERÍA", icon: "fa fa-drumstick-bite", id: "12" },
    { name: "INDUMENTARIA", icon: "bi bi-bag-check", id: "3" },
    { name: "FERRETERÍA", icon: "bi bi-tools", id: "4" },
    { name: "LIBRERÍA", icon: "bi bi-book", id: "5" }
];

// ============================================================================
// CARGA DE CATEGORÍAS EN NAVBAR
// ============================================================================

/**
 * Carga y renderiza las categorías en el navbar
 * Obtiene todas las categorías del backend y las divide en:
 * - Principales: Las definidas en principalCategories
 * - Extra: Todas las demás categorías
 */
async function loadCategoriesNavbar() {
    try {
        // Obtener categorías del backend
        var url = config.get_backend_url('/public/categories');
        var response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Error al obtener categorías');
        }

        var categories = await response.json();

        var container = document.getElementById('categorias-navbar');
        var extraContainer = document.getElementById('categorias-extra-container');
        var extraList = document.getElementById('categorias-extra');

        // Limpiar contenedores
        container.innerHTML = '';
        extraList.innerHTML = '';

        // Renderizar categorías principales
        renderPrincipalCategories(container);

        // Renderizar categorías extra
        renderExtraCategories(categories, extraContainer, extraList);

    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

/**
 * Renderiza las categorías principales en el contenedor
 * @param {HTMLElement} container - Contenedor donde se renderizarán las categorías
 */
function renderPrincipalCategories(container) {
    principalCategories.forEach(function(cat) {
        var div = document.createElement('div');
        div.className = 'categoria-item text-center text-white hand';
        div.setAttribute('data-bs-toggle', 'collapse');
        div.setAttribute('data-bs-target', '#navbarContent');
        
        div.innerHTML = 
            '<i class="' + cat.icon + ' fs-5 categoria-icon"></i><br>' +
            '<span class="fw-semibold small">' + cat.name + '</span>';
        
        div.addEventListener("click", function() {
            handleCategoryClick(cat.id, cat.name);
        });
        
        container.appendChild(div);
    });
}

/**
 * Renderiza las categorías extra (no principales)
 * @param {Array} categories - Array de todas las categorías
 * @param {HTMLElement} extraContainer - Contenedor del dropdown extra
 * @param {HTMLElement} extraList - Lista donde se agregarán las categorías extra
 */
function renderExtraCategories(categories, extraContainer, extraList) {
    // Obtener IDs de categorías principales
    var principalIds = principalCategories.map(function(c) {
        return c.id.toString();
    });

    // Filtrar categorías que no son principales
    var extras = categories.filter(function(c) {
        return !principalIds.includes(c.id.toString());
    });

    if (extras.length > 0) {
        extraContainer.style.display = 'block';
        
        extras.forEach(function(cat) {
            var li = document.createElement("li");
            li.innerHTML = '<a class="dropdown-item" href="#">' + cat.name + '</a>';
            li.setAttribute('data-bs-toggle', 'collapse');
            li.setAttribute('data-bs-target', '#navbarContent');
            
            li.addEventListener('click', function() {
                handleCategoryClick(cat.id, cat.name);
            });
            
            extraList.appendChild(li);
        });
    } else {
        extraContainer.style.display = 'none';
    }
}

// ============================================================================
// MANEJO DE CLICKS EN CATEGORÍAS
// ============================================================================

/**
 * Maneja el click en una categoría
 * @param {string|number} categoryId - ID de la categoría
 * @param {string} categoryName - Nombre de la categoría
 */
function handleCategoryClick(categoryId, categoryName) {
    addCategoryTag(categoryId, categoryName);
}

// ============================================================================
// GESTIÓN DE TAGS DE FILTRO
// ============================================================================

/**
 * Agrega un tag de filtro de categoría
 * @param {string|number} categoryId - ID de la categoría
 * @param {string} categoryName - Nombre de la categoría
 */
function addCategoryTag(categoryId, categoryName) {
    var activeFilters = document.getElementById('active-filters');
    
    // Evitar duplicados
    var existingTags = Array.from(activeFilters.children);
    var isDuplicate = existingTags.some(function(tag) {
        return tag.dataset.id == categoryId;
    });
    
    if (isDuplicate) {
        return;
    }

    // Crear el tag
    var tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.dataset.id = categoryId;
    tag.innerHTML = 
        categoryName +
        '<span class="remove">&times;</span>';
    
    // Agregar evento de click al botón de remover
    var removeBtn = tag.querySelector('.remove');
    removeBtn.addEventListener('click', function() {
        tag.remove();
        removeCategoryFilter(categoryId);
    });
    
    activeFilters.appendChild(tag);
    
    // Actualizar búsqueda con los filtros activos
    getActiveFiltersAndExecuteCategoriesAction();
}

/**
 * Remueve un filtro de categoría
 * @param {string|number} categoryId - ID de la categoría a remover
 */
function removeCategoryFilter(categoryId) {
    var activeFilters = document.getElementById('active-filters');
    var activeIds = Array.from(activeFilters.children).map(function(tag) {
        return tag.dataset.id;
    });

    // Si no quedan filtros, buscar todas las publicaciones
    if (activeIds.length === 0) {
        getEntities("");
    }
    
    // Actualizar búsqueda
    getActiveFiltersAndExecuteCategoriesAction();
}

/**
 * Obtiene los filtros activos y ejecuta la acción de categorías
 */
function getActiveFiltersAndExecuteCategoriesAction() {
    var activeFilters = document.getElementById('active-filters');
    var filterTags = activeFilters.querySelectorAll('.filter-tag');
    
    // Crear array de IDs
    var ids = Array.from(filterTags).map(function(tag) {
        return tag.dataset.id;
    });
    
    // Ejecutar búsqueda con los IDs
    executeCategoriesAction(ids.join(','));
}
