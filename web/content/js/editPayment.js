var ID_PAYMENT_TYPE = 2;

var unit = {
    type: null,
	amountPayment: null,
	creationDate: new Date(),
	creationTimestamp: new Date(),
	company: null,
	service: null,
	startDate: config.get_first_day(new Date()),
	endDate: config.get_last_day(new Date())
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

    config_component.configure_date_format('startDate');
    config_component.configure_currency_format('amountPayment');
    config_component.configure_date_format('endDate');
}

// 3) Form operational mechanics
function editionForm() {

    return {
        // 3.1) Form data
        form: {
            id: 0,
            idCompany: null,
            idService: null,
            idPaymentType: ID_PAYMENT_TYPE,
	        amountPayment: null,
	        creationDate: new Date(),
	        creationTimestamp: new Date(),
	        company: '',
	        service: '',
	        startDate: config.format_date_DMY(config.get_first_day(new Date())),
	        endDate: config.format_date_DMY(config.get_last_day(new Date())),
            comment: ''

        },

        // 3.2) Errors array
        errors: {},

        // 3.3) Select options declaration
        payment_types: [],

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

            // await Promise.all([
            //     fetchAndAssign('/payment_types', 'payment_types', 'idPaymentType')
            // ]);
        },

        // 3.7) Dependant selects loading

        // 3.8) Main unit loading
        loadUnit: async function (id) {
        
            var self = this;
        
            var res = await fetch(config.get_backend_url('/prepared_payment/' + id), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                }
            });
        
            var data = await res.json();
        
            Object.assign(self.form, data);
        
            // self.form.idPaymentType = data.type.id;
            
            self.form.idCompany = data.company.id;
            self.form.idService = data.service.id;
            
            self.form.company = data.company.name;
            self.form.service = data.service.name;
            self.form.amountPayment = config.format_currency_view(data.amountPayment);
            
            // Set dependant id to be selected after loading
        },

        // 3.9) Main unit saving
        submitForm: async function () {

            if(!confirm(config.MESSAGE_CONFIRM))
                return false;

            if (!this.validate())
                return;

            unit.company = { id: this.form.idCompany };
            unit.service = { id: this.form.idService };
            unit.type = { id: this.form.idPaymentType };

            unit.amountPayment = config.format_currency_number(this.form.amountPayment);

            unit.startDate = config.format_date_ISO(config_component.clean_date(this.form.startDate));
            unit.endDate = config.format_date_ISO(config_component.clean_date(this.form.endDate));
            
            unit.comment = this.form.comment;
            
            try {
                var res = await fetch(config.get_backend_url('/payment'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                    },
                    body: JSON.stringify(unit)
                });

                if (!res.ok)
                    throw new Error('Error al guardar');

                alert(config.MESSAGE_OPERATION_SUCCESS);
                window.location.href = config.get_frontend_url('/listCompanies.html');

            } catch (err) {
                console.error(err);
                alert(config.MESSAGE_OPERATION_ERROR);
            }
        },

        // 3.10) Validation
        validate: function () {

            /*

            this.errors = {};

            if (!this.form.idCompanyType) {
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

        // 3.11) Auxiliary methods
        // ...

        // 3.12) Custom format function
        // ...

    };
}
