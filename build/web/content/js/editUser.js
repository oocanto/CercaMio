var selectCompanies = null;

var unit = {
    id: 0,
    username: null,
    password: null,
    active: false,
    admin: false,
    parent: {
        id: 0,
        name: null,
        surname: null,
        type: null,
        // status: null,
        gender: null,
        province: null,
        department: null,
        locality: null,
        identificationType: null,
        identificationNumber: null,
        birthDate: null,
        address: null,
        postalCode: null,
        addressAdditionalInfo: null,
        email: null,
        telephoneNumberLandline: null,
        telephoneNumberMobile: null,
        personAdditionalInfo: null
    },
    companies: []
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

    config_component.configure_date_format('birthDate');
    selectCompanies = config_component.configure_select('companies');

}

// 3) Form operational mechanics
function editionForm() {

    return {
        // 3.1) Form data
        form: {
            id: 0,
            name: '',
            surname: '',
            idPersonType: '',
            // idPersonStatus: '',
            idGender: '',
            idProvince: '',
            idDepartment: '',
            idLocality: '',
            idIdentificationType: '',
            identificationNumber: '',
            birthDate: '',
            address: '',
            postalCode: '',
            addressAdditionalInfo: '',
            email: '',
            telephoneNumberLandline: '',
            telephoneNumberMobile: '',
            personAdditionalInfo: '',
            username: '',
            password: '',
            active: false,
            admin: false
        },

        // 3.2) Errors array
        errors: {},

        // 3.3) Select options declaration
        person_types: [],
        person_status: [],
        identification_types: [],
        genders: [],
        provinces: [],
        departments: [],
        localities: [],

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
                fetchAndAssign('/person_types', 'person_types', 'idPersonType'),
                // fetchAndAssign('/person_status', 'person_status', 'idPersonStatus'),
                fetchAndAssign('/identification_types', 'identification_types', 'idIdentificationType'),
                fetchAndAssign('/genders', 'genders', 'idGender'),
                fetchAndAssign('/provinces', 'provinces', 'idProvince')
            ]);
            
            await self.loadDependantSelectMultiple([]);
        },

        // 3.7) Dependant selects loading
        loadDependantSelects: async function (idDepartment, idLocality, companies) {
            
            var self = this;
        
            self.departments = [];
            self.form.idDepartment = '';
            self.localities = [];
            self.form.idLocality = '';
        
            if (self.form.idProvince) {
                try {
                    var resDept = await fetch(config.get_backend_url('/departments?idProvince=' + self.form.idProvince), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                        }
                    });
        
                    var dataDept = await resDept.json();
                    self.departments = dataDept;
        
                    if (idDepartment) {
                        self.form.idDepartment = idDepartment;
                    } else if (dataDept.length === 1) {
                        self.form.idDepartment = dataDept[0].id;
                    }
        
                } catch (err) {
                    console.error(config.MESSAGE_EXCEPTION, err);
                }
            }
        
            if (self.form.idDepartment) {
                try {
                    var resLoc = await fetch(config.get_backend_url('/localities?idDepartment=' + self.form.idDepartment), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                        }
                    });
        
                    var dataLoc = await resLoc.json();
                    self.localities = dataLoc;
        
                    if (idLocality) {
                        self.form.idLocality = idLocality;
                    } else if (dataLoc.length === 1) {
                        self.form.idLocality = dataLoc[0].id;
                    }
        
                } catch (err) {
                    console.error(config.MESSAGE_EXCEPTION, err);
                }
            }
            
            // Tom-Select...
            // All entities loading
            var resCompanies = await fetch(config.get_backend_url('/companies'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                }
            });
        
            var dataCompanies = await resCompanies.json();
            
            for(var i = 0; i < dataCompanies.length; i++) {
                selectCompanies.addOption({id: dataCompanies[i].id, name: dataCompanies[i].name});
            }
            
            selectCompanies.refreshOptions(false); // actualiza el dropdown sin abrirlo

            // User related companies selected
            for(var i = 0; i < companies.length; i++) {
                selectCompanies.addItem(companies[i].id);
            }
        },
        
        loadDependantSelectMultiple: async function (companies) {
            
            var self = this;
        
            // Tom-Select...
            // All entities loading
            var resCompanies = await fetch(config.get_backend_url('/companies'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                }
            });
        
            var dataCompanies = await resCompanies.json();
            
            for(var i = 0; i < dataCompanies.length; i++) {
                selectCompanies.addOption({id: dataCompanies[i].id, name: dataCompanies[i].name});
            }
            
            selectCompanies.refreshOptions(false); // actualiza el dropdown sin abrirlo

            // User related companies selected
            for(var i = 0; i < companies.length; i++) {
                selectCompanies.addItem(companies[i].id);
            }
        },

        // 3.7.1) Province change
        onProvinceChange: async function () {
            this.form.idDepartment = '';
            this.departments = [];
            this.form.idLocality = '';
            this.localities = [];
        
            if (!this.form.idProvince)
                return;
        
            try {
                var res = await fetch(config.get_backend_url('/departments?idProvince=' + this.form.idProvince), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                    }
                });
        
                var data = await res.json();
                this.departments = data;
                if (data.length === 1)
                    this.form.idDepartment = data[0].id;
        
            } catch (err) {
                console.error(config.MESSAGE_EXCEPTION, err);
            }
        },
        
        // 3.7.2) Department change
        onDepartmentChange: async function () {

            this.form.idLocality = '';
            this.localities = [];
        
            if (!this.form.idDepartment)
                return;
        
            try {
                var res = await fetch(config.get_backend_url('/localities?idDepartment=' + this.form.idDepartment), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                    }
                });
        
                var data = await res.json();
                this.localities = data;
                if (data.length === 1)
                    this.form.idLocality = data[0].id;
        
            } catch (error) {
                console.error(config.MESSAGE_EXCEPTION, error);
            }
        },

        // 3.8) Main unit loading
        loadUnit: async function (id) {
        
            var self = this;
        
            var res = await fetch(config.get_backend_url('/user/' + id), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                }
            });
        
            var data = await res.json();
            
            document.getElementById('password').disabled = true;
        
            Object.assign(self.form, data);
            
            self.form.name = data.parent.name;
            self.form.surname = data.parent.surname;
            self.form.birthDate = config.format_date_DMY(data.parent.birthDate);
        
            self.form.idPersonType = data.parent.type.id;
            // self.form.idPersonStatus = data.parent.status.id;
            self.form.idGender = data.parent.gender.id;
            
            self.form.idProvince = data.parent.province.id;
            self.form.idIdentificationType = data.parent.identificationType.id;
            self.form.identificationNumber = data.parent.identificationNumber;
            
            self.form.address = data.parent.address;
            self.form.postalCode = data.parent.postalCode;
            self.form.addressAdditionalInfo = data.parent.addressAdditionalInfo;
            self.form.email = data.parent.email;
            self.form.telephoneNumberLandline = data.parent.telephoneNumberLandline;
            self.form.telephoneNumberMobile = data.parent.telephoneNumberMobile;
            self.form.personAdditionalInfo = data.parent.personAdditionalInfo;
            
            self.form.active = data.active == config.BOOLEAN_VALUE_TRUE;
            self.form.admin = data.admin == config.BOOLEAN_VALUE_TRUE;
            
            // Set dependant id to be selected after loading
            await self.loadDependantSelects(data.parent.department.id, data.parent.locality.id, data.companies);
        },

        // 3.9) Main unit saving
        submitForm: async function () {

            if(!confirm(config.MESSAGE_CONFIRM))
                return false;

            var self = this;

            if (!this.validate())
                return;
           
            unit.id = this.form.id;
            unit.username = this.form.username;
            unit.password = this.form.password;
            unit.active = this.form.active;
            unit.admin = this.form.admin
            
            unit.parent.name = this.form.name;
            unit.parent.surname = this.form.surname;
            unit.parent.birthDate = config.format_date_ISO(config_component.clean_date(this.form.birthDate));
            
            unit.parent.type = { id: this.form.idPersonType };
            // unit.parent.status = { id: this.form.idPersonStatus };
            unit.parent.gender = { id: this.form.idGender };
            
            unit.parent.province = { id: this.form.idProvince };
            unit.parent.department = { id: this.form.idDepartment };
            unit.parent.locality = { id: this.form.idLocality };
            
            unit.parent.identificationType = { id: this.form.idIdentificationType };
            unit.parent.identificationNumber = this.form.identificationNumber;

            unit.parent.address = this.form.address;
            unit.parent.postalCode = this.form.postalCode;
            unit.parent.addressAdditionalInfo = this.form.addressAdditionalInfo;
            unit.parent.email = this.form.email;
            unit.parent.telephoneNumberLandline = this.form.telephoneNumberLandline;
            unit.parent.telephoneNumberMobile = this.form.telephoneNumberMobile;
            unit.parent.personAdditionalInfo = this.form.personAdditionalInfo;

            var selectedCompanies = selectCompanies.items;
            
            // Delete all companies related to the entity
            unit.companies.length = 0;
            
            for(var i = 0; i < selectedCompanies.length; i++) {
                unit.companies.push({ id: selectedCompanies[i] });
            }
            
            try {
                var res = await fetch(config.get_backend_url('/user'), {
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
                window.location.href = config.get_frontend_url('/listUsers.html');

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

        // 3.11) Auxiliary methods
        // ...

        // 3.12) Custom format functions
        // ...

    };
}
