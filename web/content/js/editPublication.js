var DEFAULT_ID_ITEM_TYPE = 1;
var DEFAULT_ID_ITEM_STATUS = 1;
var agreementText = '';
var agreementLoaded = false;

var unit = {
    id: 0,
    company: null,
    category: null,
    item: null,
    outputPrice: 0.00,
    descriptionShort: null,
    descriptionLong: null,
    startDate: null,
    endDate: null,
    enabled: false,
    specialOffer: false,
    image: null
};

// 1) Page loading
window.onload = async function() {
    getNav();
    //getHeader();
    getFooter();
    initializeForm();
    
    // Cargar agreement antes de que Alpine se inicialice
    try {
        var res = await fetch(config.get_backend_url('/agreement'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
            }
        });
        
        var data = await res.json();
        agreementText = data[0].agreementText;
        agreementLoaded = true;
    } catch (err) {
        console.error('Error cargando agreement:', err);
        agreementLoaded = false;
    }
};

// 2) Form initialization
function initializeForm() {
    config_component.configure_date_format('startDate');
    config_component.configure_currency_format('outputPrice');
    config_component.configure_date_format('endDate');
}

// 3) Form operational mechanics
function editionForm() {
    return {
        // 3.1) Form data
        form: {
            id: 0,
            idCompany: '',
            idCategory: '',
            idItem: '',
            outputPrice: '',
            descriptionShort: '',
            descriptionLong: '',
            startDate: '',
            endDate: '',
            enabled: false,
            specialOffer: false,
            image: ''
        },

        // 3.2) Errors array
        errors: {},
        
        // 3.3) Select options declaration
        companies: [],
        categories: [],
        items: [],
        
        // 3.4) Auxiliary variables
        imagePreview: '',

        // 3.5) Init function
        init: async function() {
            var params = new URLSearchParams(window.location.search);
            var id = params.get('id');
            var self = this;

            // Inicializar fechas solo si no estamos editando
            if (!id) {
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0');
                var yyyy = today.getFullYear();
                self.form.startDate = dd + '/' + mm + '/' + yyyy;
                
                var endDate = new Date();
                endDate.setDate(endDate.getDate() + 7);
                var ddEnd = String(endDate.getDate()).padStart(2, '0');
                var mmEnd = String(endDate.getMonth() + 1).padStart(2, '0');
                var yyyyEnd = endDate.getFullYear();
                self.form.endDate = ddEnd + '/' + mmEnd + '/' + yyyyEnd;
            }

            await this.loadSelects();
            if (id) {
                self.form.id = id;
                await self.loadUnit(id);
            }
            
            // Escuchar evento de creación de ítem
            document.addEventListener('itemCreated', function(e) {
                self.handleNewItemCreated(e.detail);
            });
        },

        // 3.6) Initial selects loading
        loadSelects: async function() {
            var self = this;

            var companiesRes = await fetch(config.get_backend_url('/related_companies'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            });
            var companiesData = await companiesRes.json();
            self.companies = companiesData;
            if (companiesData.length === 1) self.form.idCompany = companiesData[0].id;

            var categoriesRes = await fetch(config.get_backend_url('/public/categories'));
            var categoriesData = await categoriesRes.json();
            self.categories = categoriesData;
            if (categoriesData.length === 1) self.form.idCategory = categoriesData[0].id;
        },

        // 3.7) Dependant selects loading
        loadItems: async function() {
            var self = this;
            this.items = [];
            this.form.idItem = '';

            if (this.form.idCategory) {
                var res = await fetch(config.get_backend_url('/public/items?idCategory=' + this.form.idCategory));
                var data = await res.json();
                self.items = data;
                if (data.length === 1) self.form.idItem = data[0].id;
            }
        },

        // 3.8) Main unit loading
        loadUnit: async function(id) {
            var self = this;
            var res = await fetch(config.get_backend_url('/publication/' + id), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            });
            var data = await res.json();

            Object.assign(self.form, data);
            
            self.form.outputPrice = config.format_currency_view(data.outputPrice);

            self.form.idCompany = data.company.id;
            self.form.idCategory = data.category.id;

            self.form.startDate = config.format_date_DMY(data.startDate);
            self.form.endDate = config.format_date_DMY(data.endDate);

            self.form.enabled = data.enabled == config.BOOLEAN_VALUE_TRUE;
            self.form.specialOffer = data.specialOffer == config.BOOLEAN_VALUE_TRUE;

            if (self.form.image) {
                self.imagePreview = self.form.image;
            }

            // Cargar los ítems y recién luego asignar el ítem
            await self.loadItems();
            self.form.idItem = data.item.id;
        },

        // 3.9) Main unit saving (ahora muestra el modal)
        submitForm: async function() {
            if (!this.validate()) return;

            if (!agreementLoaded) {
                alert('Error al cargar los términos y condiciones. Por favor, recargue la página.');
                return;
            }

            // Mostrar modal de acuerdo pasando el contexto del formulario
            window.dispatchEvent(new CustomEvent('show-agreement', { 
                detail: { formContext: this } 
            }));
        },

        // 3.10) Envío real del formulario (después de aceptar el modal)
        actualSubmit: async function() {
            if(!confirm(config.MESSAGE_CONFIRM))
                return false;

            unit.id = this.form.id;
            unit.company = { id: this.form.idCompany };
            unit.category = { id: this.form.idCategory };
            unit.item = { id: this.form.idItem };
            unit.descriptionShort = this.form.descriptionShort;
            unit.descriptionLong = this.form.descriptionLong;
            unit.startDate = config.format_date_ISO(config_component.clean_date(this.form.startDate));
            unit.endDate = config.format_date_ISO(config_component.clean_date(this.form.endDate));
            unit.outputPrice = config.format_currency_number(this.form.outputPrice);
            unit.enabled = this.form.enabled;
            unit.specialOffer = this.form.specialOffer;
            unit.image = this.imagePreview;
            
            try {
                var res = await fetch(config.get_backend_url('/publication'), {
                    method: (this.form.id > 0 ? 'PUT' : 'POST'),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                    },
                    body: JSON.stringify(unit)
                });
            
                if (!res.ok) throw new Error('Error al guardar');
            
                alert(config.MESSAGE_OPERATION_SUCCESS);
                window.location.href = config.get_frontend_url('/listPublications.html');
            
            } catch (err) {
                console.error(err);
                alert(config.MESSAGE_OPERATION_ERROR);
            }
        },

        // 3.11) Validation
        validate: function() {
            this.errors = {};

            if (!this.form.idCompany) {
                this.errors.company = "La compañía es obligatoria.";
            }
            if (!this.form.idCategory) {
                this.errors.category = "La categoría es obligatoria.";
            }
            if (!this.form.idItem) {
                this.errors.item = "El ítem es obligatorio.";
            }
            if (!this.form.outputPrice || this.form.outputPrice <= 0.00) {
                this.errors.outputPrice = "El precio debe ser mayor a $0.00.";
            }
            if (!this.form.descriptionShort) {
                this.errors.descriptionShort = "La descripción corta es obligatoria.";
            }
            if (!this.form.startDate) {
                this.errors.startDate = "La fecha de inicio es obligatoria.";
            }
            if (!this.form.endDate) {
                this.errors.endDate = "La fecha de fin es obligatoria.";
            }

            return Object.keys(this.errors).length === 0;
        },

        // 3.12) Auxiliary method
        handleImage: function(event) {
            var self = this;
            var file = event.target.files[0];
            if (!file) return;

            var reader = new FileReader();
            reader.onload = function() {
                var base64 = reader.result.split(',')[1];
                self.form.image = base64;
                self.imagePreview = reader.result;
            };
            reader.readAsDataURL(file);
        },

        // 3.13) Método para abrir el modal de creación de ítem
        openItemModal: function() {
            if (!this.form.idCategory) {
                alert('Por favor, seleccione primero una categoría');
                return;
            }
            
            // Disparar evento para abrir el modal
            window.dispatchEvent(new CustomEvent('open-item-modal', { 
                detail: { categoryId: this.form.idCategory } 
            }));
        },
        
        // 3.14) Manejar la creación de un nuevo ítem
        handleNewItemCreated: async function(detail) {
            // Recargar los ítems basados en la categoría seleccionada actualmente
            await this.loadItems();
            
            // Seleccionar el nuevo ítem
            this.form.idItem = detail.item.id;
        }
    };
}

// Función para el modal de creación de ítem
function itemModal() {
    return {
        isOpen: false,
        form: {
            name: '',
            description: '',
            image: ''
        },
        errors: {},
        imagePreviewItemModal: '',
        categoriesSelect: null,
        selectedCategoryId: null,
        
        open: function() {
            this.isOpen = true;
            this.initCategoriesSelect();
        },
        
        close: function() {
            this.isOpen = false;
            this.resetForm();
        },
        
        resetForm: function() {
            this.form = {
                name: '',
                description: '',
                image: ''
            };
            this.errors = {};
            this.imagePreviewItemModal = '';
        },
        
        initCategoriesSelect: async function() {
            // Destruir select anterior si existe
            if (this.categoriesSelect) {
                this.categoriesSelect.destroy();
            }
            
            // Cargar categorías
            var res = await fetch(config.get_backend_url('/categories'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                }
            });
            
            var categories = await res.json();
            
            // Configurar Tom-Select
            this.categoriesSelect = new TomSelect(this.$refs.categoriesSelect, {
                valueField: 'id',
                labelField: 'name',
                searchField: 'name',
                options: categories,
                plugins: ['remove_button'],
                onItemAdd: function(value) {
                    this.close();
                }
            });
            
            // Seleccionar la categoría que estaba seleccionada en el formulario principal
            if (this.selectedCategoryId) {
                this.categoriesSelect.addItem(this.selectedCategoryId);
            }
        },
        
        handleImageItemModal: function(event) {
            var self = this;
            var file = event.target.files[0];
            if (!file) return;

            var reader = new FileReader();
            reader.onload = function() {
                var base64 = reader.result.split(',')[1];
                self.form.image = base64;
                self.imagePreviewItemModal = reader.result;
            };
            reader.readAsDataURL(file);
        },
        
        removeImageItemModal: function() {
            this.form.image = '';
            this.imagePreviewItemModal = '';
        },
        
        validate: function() {
            this.errors = {};
            
            if (!this.form.name) {
                this.errors.name = 'El nombre es obligatorio';
            }
            
            if (!this.form.description) {
                this.errors.description = 'La descripción es obligatoria';
            }
            
            return Object.keys(this.errors).length === 0;
        },
        
        submitForm: async function() {
            if (!this.validate()) return;
            
            try {
                // Preparar datos
                var itemData = {
                    name: this.form.name,
                    description: this.form.description,
                    type: { id: DEFAULT_ID_ITEM_TYPE },
                    status: { id: DEFAULT_ID_ITEM_STATUS },
                    image: this.imagePreviewItemModal,
                    categories: this.categoriesSelect.items.map(function(id) { 
                        return { id: parseInt(id) }; 
                    })
                };
                
                // Enviar solicitud
                var res = await fetch(config.get_backend_url('/item'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                    },
                    body: JSON.stringify(itemData)
                });
                
                if (!res.ok) throw new Error('Error al crear el ítem');
                
                var newItem = await res.json();
                
                // Disparar evento para actualizar el select de ítems
                document.dispatchEvent(new CustomEvent('itemCreated', { 
                    detail: { 
                        item: newItem,
                        categoryId: this.selectedCategoryId
                    } 
                }));
                
                alert(config.MESSAGE_OPERATION_SUCCESS);
                this.close();
                
            } catch (err) {
                console.error(err);
                alert(config.MESSAGE_OPERATION_ERROR);
            }
        }
    };
}

// Función para el modal de acuerdo
function agreementModal() {
    return {
        isOpen: false,
        agreementText: '',
        formContext: null,
        
        open: function() {
            // Obtener el texto actualizado cuando se abre el modal
            this.agreementText = agreementText;
            this.isOpen = true;
        },
        
        accept: function() {
            this.isOpen = false;
            // Llamar directamente al contexto del formulario
            if (this.formContext && this.formContext.actualSubmit) {
                this.formContext.actualSubmit();
            }
        },
        
        cancel: function() {
            this.isOpen = false;
        }
    };
}