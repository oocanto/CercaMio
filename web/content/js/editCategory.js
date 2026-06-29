var selectItems = null;

var unit = {
    id: 0,
    name: null,
    description: null,
    type: null,
    status: null,
    items: []
};

// 1) Page loading
window.onload = function() {

    getNav();
    //getHeader();
    getFooter();
    initializeForm();
};

// 2) Form initialization
function initializeForm() {

    // config_component.configure_date_format('birthDate');
    selectItems = config_component.configure_select('items');

}

// 3) Form operational mechanics
function editionForm() {

    return {
        // 3.1) Form data
        form: {
            id: 0,
            name: '',
            description: '',
            idCategoryType: '',
            idCategoryStatus: ''
        },

        // 3.2) Errors array
        errors: {},

        // 3.3) Select options declaration
        category_types: [],
        category_status: [],
        items: [],

        // 3.4) Auxiliary variables
        // ...

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

            await Promise.all([
                fetchAndAssign('/category_types', 'category_types', 'idCategoryType'),
                fetchAndAssign('/category_status', 'category_status', 'idCategoryStatus')
            ]);
            
            await self.loadDependantSelects([]);
        },

        // 3.7) Dependant selects loading
        loadDependantSelects: async function (items) {
            
            var self = this;
        
            // Tom-Select...
            // All entities loading
            var resItems = await fetch(config.get_backend_url('/items'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                }
            });
        
            var dataItems = await resItems.json();
            
            for(var i = 0; i < dataItems.length; i++) {
                selectItems.addOption({id: dataItems[i].id, name: dataItems[i].name});
            }
            
            selectItems.refreshOptions(false); // actualiza el dropdown sin abrirlo

            // User related items selected
            for(var i = 0; i < items.length; i++) {
                selectItems.addItem(items[i].id);
            }
        },

        // 3.8) Main unit loading
        loadUnit: async function (id) {
        
            var self = this;
        
            var res = await fetch(config.get_backend_url('/category/' + id), {
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
        
            self.form.idCategoryType = data.type.id;
            self.form.idCategoryStatus = data.status.id;
            
            // Set dependant id to be selected after loading
            await self.loadDependantSelects(data.items);
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
            
            unit.type = { id: this.form.idCategoryType };
            unit.status = { id: this.form.idCategoryStatus };

            var selectedItems = selectItems.items;
            
            // Delete all items related to the entity
            unit.items.length = 0;
            
            for(var i = 0; i < selectedItems.length; i++) {
                unit.items.push({ id: selectedItems[i] });
            }
            
            try {
                var res = await fetch(config.get_backend_url('/category'), {
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
                window.location.href = config.get_frontend_url('/listCategories.html');

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
        // ...

        // 3.12) Custom format functions
        // ...

    };
}
