var selectCategories = null;

var unit = {
    id: 0,
    name: null,
    description: null,
    type: null,
    status: null,
    image: null,
    categories: []
};

// 1) Page loading
window.onload = function() {

    // getNav();
    // getHeader();
    // getFooter();
    initializeForm();
};

// 2) Form initialization
function initializeForm() {

    // config_component.configure_date_format('birthDate');
    selectCategories = config_component.configure_select('categories');

}

// 3) Form operational mechanics
function editionForm() {

    return {
        // 3.1) Form data
        form: {
            id: 0,
            name: '',
            description: '',
            idItemType: 1,
            idItemStatus: 1,
            image: ''
        },

        // 3.2) Errors array
        errors: {},

        // 3.3) Select options declaration
        // item_types: [],
        // item_status: [],
        categories: [],

        // 3.4) Auxiliary variables
        imagePreview: '',

        // 3.5) Init function
        init: async function () {

            var params = new URLSearchParams(window.location.search);
            var id = params.get('id');

            await this.loadSelects();

            if (id) {
                this.form.id = id;
                await this.loadUnit(id);
            }
        },

        // 3.6) Initial selects loading
        loadSelects: async function () {

            var self = this;

            async function fetchAndAssign(url, targetArray, targetFormKey) {
                var res = await fetch(config.get_backend_url(url), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                    }
                });

                var data = await res.json();
                self[targetArray] = data;
                if (data.length === 1)
                    self.form[targetFormKey] = data[0].id;
            }

            // await Promise.all([
            //     fetchAndAssign('/item_types', 'item_types', 'idItemType'),
            //     fetchAndAssign('/item_status', 'item_status', 'idItemStatus')
            // ]);
            
            await self.loadDependantSelects([]);
        },

        // 3.7) Dependant selects loading
        loadDependantSelects: async function (categories) {
            
            var self = this;
        
            // Tom-Select...
            // All entities loading
            var resCategories = await fetch(config.get_backend_url('/categories'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                }
            });
        
            var dataCategories = await resCategories.json();
            
            for(var i = 0; i < dataCategories.length; i++) {
                selectCategories.addOption({id: dataCategories[i].id, name: dataCategories[i].name});
            }
            
            selectCategories.refreshOptions(false); // actualiza el dropdown sin abrirlo

            // User related categories selected
            for(var i = 0; i < categories.length; i++) {
                selectCategories.addItem(categories[i].id);
            }
        },

        // 3.8) Main unit loading
        loadUnit: async function (id) {
        
            var self = this;
        
            var res = await fetch(config.get_backend_url('/item/' + id), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                }
            });
        
            var data = await res.json();
            
            Object.assign(self.form, data);
            
            self.form.name = data.name;
            self.form.description = data.description;
        
            // self.form.idItemType = data.type.id;
            // self.form.idItemStatus = data.status.id;
            
            if (self.form.image) {
                self.imagePreview = self.form.image;
            }
            
            // Set dependant id to be selected after loading
            await self.loadDependantSelects(data.categories);
        },

        // 3.9) Main unit saving
        submitForm: async function () {

            if(!confirm(config.MESSAGE_CONFIRM))
                return false;

            var self = this;

            if (!this.validate())
                return;
           
            unit.id = this.form.id;
            
            unit.name = this.form.name;
            unit.description = this.form.description;
            
            unit.type = { id: 1 };
            unit.status = { id: 1 };
            
            unit.image = this.imagePreview;

            var selectedCategories = selectCategories.items;
            
            // Delete all categories related to the entity
            unit.categories.length = 0;
            
            for(var i = 0; i < selectedCategories.length; i++) {
                unit.categories.push({ id: selectedCategories[i] });
            }
            
            try {
                var res = await fetch(config.get_backend_url('/item'), {
                    method: (this.form.id > 0 ? 'PUT' : 'POST'),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                    },
                    body: JSON.stringify(unit)
                });

                if (!res.ok)
                    throw new Error(config.MESSAGE_OPERATION_ERROR);

                alert(config.MESSAGE_OPERATION_SUCCESS);
                window.location.href = config.get_frontend_url('/listItems.html');

            } catch (err) {
                console.error(config.MESSAGE_EXCEPTION, err);
                alert(config.MESSAGE_OPERATION_ERROR);
            }
        },

        // 3.10) Validation
        validate: function () {

            /*

            this.errors = {};

            if (!this.form.idPersonType) {
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

            */

            return true;
        },

        // 3.11) Auxiliary method
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

        // 3.12) Custom format functions
        // ...

    };
}
