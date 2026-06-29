// 1) Page loading
window.onload = function() {

    getNav();
    //getHeader();
    getFooter();
    initializeForm();
};

// 2) Form initialization
function initializeForm() {

    flatpickr("#startDate", {
        // enableTime: true,
        // noCalendar: true,       // oculta el calendario
        // dateFormat: "d/m/Y H:i:S",
        dateFormat: "d/m/Y",
        // time_24hr: true,
        allowInput: true, // permite escribir manualmente
        onClose: function(selectedDates, dateStr, instance) {
            if (!selectedDates.length) {
                alert("Fecha no válida");
                instance.clear();
            }
        }
    });

    flatpickr("#endDate", {
        // enableTime: true,
        // noCalendar: true,       // oculta el calendario
        // dateFormat: "d/m/Y H:i:S",
        dateFormat: "d/m/Y",
        // time_24hr: true,
        allowInput: true, // permite escribir manualmente
        onClose: function(selectedDates, dateStr, instance) {
            if (!selectedDates.length) {
                alert("Fecha no válida");
                instance.clear();
            }
        }
    });
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
        init: function() {

            var params = new URLSearchParams(window.location.search);
            var id = params.get('id');
            var self = this;

            this.loadSelects().then(function() {
                if (id) {
                    self.form.id = id;
                    self.loadUnit(id);
                }
            });
        },

        // 3.6) Initial selects loading
        loadSelects: function() {

            var self = this;
            return Promise.all([
                fetch(config.get_backend_url('/companies'), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                    },
                })
                .then(function(res) {
                    return res.json();
                })
                .then(function(data) {
                    self.companies = data;
                    if (data.length === 1) self.form.idCompany = data[0].id;
                }),

                fetch(config.get_backend_url('/public/categories'))
                .then(function(res) {
                    return res.json();
                })
                .then(function(data) {
                    self.categories = data;
                    if (data.length === 1) self.form.idCategory = data[0].id;
                })
            ]);
        },

        // 3.7) Dependant selects loading
        loadItems: function() {

            var self = this;
            this.items = [];
            this.form.idItem = '';
            if (this.form.idCategory) {
                return fetch(config.get_backend_url('/public/items?idCategory=' + this.form.idCategory))
                    .then(function(res) {
                        return res.json();
                    })
                    .then(function(data) {
                        self.items = data;
                        if (data.length === 1) self.form.idItem = data[0].id;
                    });
            } else {
                return Promise.resolve(); // Para que no rompa si no hay categoría
            }
        },

        // 3.8) Main unit loading
        loadUnit: function(id) {

            var self = this;
            fetch(config.get_backend_url('/publication/' + id), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                    },
                })
                .then(function(res) {
                    return res.json();
                })
                .then(function(data) {

                    Object.assign(self.form, data);

                    self.form.idCompany = data.company.id;
                    self.form.idCategory = data.category.id;

                    self.form.startDate = self.formatDateDMY(data.startDate);
                    self.form.endDate = self.formatDateDMY(data.endDate);

                    self.form.enabled = data.enabled == config.BOOLEAN_VALUE_TRUE;
                    self.form.specialOffer = data.specialOffer == config.BOOLEAN_VALUE_TRUE;

                    if (self.form.image) {
                        self.imagePreview = self.form.image;
                    }

                    // Cargar los ítems y recién luego asignar el ítem
                    self.loadItems().then(function() {
                        self.form.idItem = data.item.id;
                    });
                });
        },

        // 3.9) Main unit saving
        submitForm: function() {

            if (!this.validate()) return;

            var formData = new FormData();

            formData.append('id', this.form.id);
            formData.append('idCompany', this.form.idCompany);
            formData.append('idCategory', this.form.idCategory);
            formData.append('idItem', this.form.idItem);
            formData.append('descriptionShort', this.form.descriptionShort);
            formData.append('descriptionLong', this.form.descriptionLong);
            formData.append('startDate', this.form.startDate + ' ' + '00:00:00');
            formData.append('endDate', this.form.endDate + ' ' + '00:00:00');
            formData.append('outputPrice', this.form.outputPrice);
            formData.append('enabled', this.form.enabled);
            formData.append('specialOffer', this.form.specialOffer);
            formData.append('publicationImage', this.imagePreview);

            var self = this;

            fetch(config.get_backend_url('/publication'), {
                    method: (this.form.id > 0 ? 'PUT' : 'POST'),
                    headers: {
                        'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                    },
                    body: formData
                })
                .then(function(res) {
                    if (!res.ok) throw new Error('Error al guardar');
                    alert('Publicación guardada exitosamente');
                    window.location.href = config.get_frontend_url('/listPublications.html');
                })
                .catch(function(err) {
                    console.error(err);
                    alert('Error al guardar la publicación');
                });
        },

        // 3.10) Validation
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

        // 3.12) Custom format function
        formatDateDMY: function(isoString) {

            const d = new Date(isoString);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }

    };
}
