var unit = {
    id: 0,
    name: null,
    description: null,
    type: null,
    status: null,
    province: null,
    department: null,
    locality: null,
    service: null,
    address: null,
    postalCode: null,
    addressAdditionalInfo: null,
    email: null,
    telephoneNumberLandline: null,
    telephoneNumberMobile: null,
    companyAdditionalInfo: null,
    latitude: null,
    longitude: null
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

}

// 3) Form operational mechanics
function editionForm() {

    return {
        // 3.1) Form data
        form: {
            id: 0,
            name: '',
            description: '',
            idCompanyType: '',
            idCompanyStatus: '',
            idProvince: '',
            idDepartment: '',
            idLocality: '',
            idService: '',
            address: '',
            postalCode: '',
            addressAdditionalInfo: '',
            email: '',
            telephoneNumberLandline: '',
            telephoneNumberMobile: '',
            companyAdditionalInfo: '',
            latitude: '',
            longitude: ''
        },

        // 3.2) Errors array
        errors: {},

        // 3.3) Select options declaration
        company_types: [],
        company_status: [],
        provinces: [],
        departments: [],
        localities: [],
        services: [],

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
                fetchAndAssign('/company_types', 'company_types', 'idCompanyType'),
                fetchAndAssign('/company_status', 'company_status', 'idCompanyStatus'),
                fetchAndAssign('/provinces', 'provinces', 'idProvince'),
                fetchAndAssign('/services', 'services', 'idService')
            ]);
        },

        // 3.7) Dependant selects loading
        loadDependantSelects: async function (idDepartment, idLocality) {
        
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
                    console.error("Error al cargar departamentos:", err);
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
                    console.error("Error al cargar localidades:", err);
                }
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
        
            } catch (error) {
                console.error('Error al cargar departamentos:', error);
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
                console.error('Error al cargar localidades:', error);
            }
        },

        // 3.8) Main unit loading
        loadUnit: async function (id) {
        
            var self = this;
        
            var res = await fetch(config.get_backend_url('/company/' + id), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                }
            });
        
            var data = await res.json();
        
            Object.assign(self.form, data);
        
            // self.form.name = data.parent.name;
            // self.form.description = data.parent.description;
        
            self.form.idCompanyType = data.type.id;
            self.form.idCompanyStatus = data.status.id;
            
            self.form.idProvince = data.province.id;
            
            self.form.idService = data.service.id;
            
            // Set dependant id to be selected after loading
            await self.loadDependantSelects(data.department.id, data.locality.id);
        },

        // 3.9) Main unit saving
        submitForm: async function () {

            if(!confirm(config.MESSAGE_CONFIRM))
                return false;

            if (!this.validate())
                return;

            unit.id = this.form.id;
            unit.name = this.form.name;
            unit.description = this.form.description;
            
            unit.type = { id: this.form.idCompanyType };
            unit.status = { id: this.form.idCompanyStatus };
            
            unit.province = { id: this.form.idProvince };
            unit.department = { id: this.form.idDepartment };
            unit.locality = { id: this.form.idLocality };
            
            unit.service = { id: this.form.idService };
            
            unit.address = this.form.address;
            unit.postalCode = this.form.postalCode;
            unit.addressAdditionalInfo = this.form.addressAdditionalInfo;
            unit.email = this.form.email;
            unit.telephoneNumberLandline = this.form.telephoneNumberLandline;
            unit.telephoneNumberMobile = this.form.telephoneNumberMobile;
            unit.companyAdditionalInfo = this.form.companyAdditionalInfo;
            
            unit.latitude = config.format_decimal(this.form.latitude);
            unit.longitude = config.format_decimal(this.form.longitude);

            try {
                var res = await fetch(config.get_backend_url('/company'), {
                    method: (this.form.id > 0 ? 'PUT' : 'POST'),
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
