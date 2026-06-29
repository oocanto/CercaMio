// Lista de categorías principales
const principalCategories = [
  { name: "VERDULERÍA", icon: "bi bi-bag", id: "11" },
  { name: "ALMACÉN", icon: "bi bi-basket", id: "1" },
  { name: "PANADERÍA", icon: "fa fa-bread-slice", id: "7" },
  { name: "CARNICERÍA", icon: "fa fa-drumstick-bite", id: "12" },
  { name: "INDUMENTARIA", icon: "bi bi-bag-check", id: "3" },
  { name: "FERRETERÍA", icon: "bi bi-tools", id: "4" },
  { name: "LIBRERÍA", icon: "bi bi-book", id: "5" }
];

// Renderiza categorías en el header
async function loadCategoriesNavbar() {
  try {
    const url = config.get_backend_url("/public/categories");
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al obtener categorías");

    const categories = await response.json();

    const container = document.getElementById("categorias-navbar");
    const extraContainer = document.getElementById("categorias-extra-container");
    const extraList = document.getElementById("categorias-extra");

    container.innerHTML = "";
    extraList.innerHTML = "";

    // Render principales
    principalCategories.forEach(cat => {
      const div = document.createElement("div");
      div.className = "categoria-item text-center text-white hand";
      div.setAttribute('data-bs-toggle', 'collapse');
      div.setAttribute('data-bs-target', '#navbarContent');
      div.innerHTML = `
        <i class="${cat.icon} fs-5 categoria-icon"></i><br>
        <span class="fw-semibold small">${cat.name}</span>
      `;
      div.addEventListener("click", () => {
        handleCategoryClick(cat.id, cat.name);
      });
      container.appendChild(div);
    });

    // Lista de IDs principales para evitar duplicados
    const principalIds = principalCategories.map(c => c.id.toString());

    // Filtrar extras: solo categorías cuyo ID no esté en los principales
    const extras = categories.filter(c => !principalIds.includes(c.id.toString()));

    if (extras.length > 0) {
      extraContainer.style.display = "block";
      extras.forEach(cat => {
        const li = document.createElement("li");
        li.innerHTML = `<a class="dropdown-item" href="#">${cat.name}</a>`;
        li.setAttribute('data-bs-toggle', 'collapse');
        li.setAttribute('data-bs-target', '#navbarContent');
        li.addEventListener("click", () => {
          handleCategoryClick(cat.id, cat.name);
        });
        extraList.appendChild(li);
      });
    } else {
      extraContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

// Manejo de click en categoría
function handleCategoryClick(categoryId, categoryName) {
  addCategoryTag(categoryId, categoryName);
}

// Renderiza un tag de filtro
function addCategoryTag(categoryId, categoryName) {
  const activeFilters = document.getElementById("active-filters");
  
  // Evitar duplicados
  if ([...activeFilters.children].some(tag => tag.dataset.id == categoryId)) return;

  const tag = document.createElement("div");
  tag.className = "filter-tag";
  tag.dataset.id = categoryId;
  tag.innerHTML = `
    ${categoryName}
    <span class="remove">&times;</span>
  `;
  tag.querySelector(".remove").addEventListener("click", () => {
    tag.remove();
    removeCategoryFilter(categoryId);
  });
  activeFilters.appendChild(tag);
  
  getActiveFiltersAndExecuteCategoriesAction();
}

// Quitar filtro y actualizar resultados
function removeCategoryFilter(categoryId) {
  const activeFilters = document.getElementById("active-filters");
  const activeIds = [...activeFilters.children].map(tag => tag.dataset.id);

  if (activeIds.length === 0) {
    getEntities(""); // sin filtros → todas las publicaciones
  }
  
  getActiveFiltersAndExecuteCategoriesAction();
}

function getActiveFiltersAndExecuteCategoriesAction() {
  const activeFilters = document.getElementById("active-filters");
  const filterTags = activeFilters.querySelectorAll(".filter-tag");
  
  // Crear array de IDs y convertirlo a string separado por comas
  const ids = Array.from(filterTags).map(tag => tag.dataset.id);
  
  executeCategoriesAction(ids.join(","));
}

