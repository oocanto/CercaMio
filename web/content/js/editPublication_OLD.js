let selectedCompany = '';
let selectedCategory = '';
let selectedItem = '';

window.onload = function () {
    
    getNav();
    //getHeader();
    getFooter();
    
    fillCompanies();
    fillCategories();
    
    flatpickr("#startDate", {
        // enableTime: true,
        // noCalendar: true,       // oculta el calendario
        // dateFormat: "d/m/Y H:i:S",
        dateFormat: "d/m/Y",
        // time_24hr: true,
        allowInput: true,       // permite escribir manualmente
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
        allowInput: true,       // permite escribir manualmente
        onClose: function(selectedDates, dateStr, instance) {
            if (!selectedDates.length) {
                alert("Fecha no válida");
                instance.clear();
            }
        }
    });
};

function getElementIdFromUrl(url, element) {

    if (url != null && url != '') {

        if (url.indexOf('?') != -1) {

            var parts = url.split('?');
            for (var i = 1; i < parts.length; i++) {
                var innerParts = parts[i].toString().split('&');
                for (var j = 0; j < innerParts.length; j++) {
                    if (innerParts[j].toString().indexOf('=') != -1) {
                        var pairs = innerParts[j].toString().split('=');
                        if (pairs[0] == element) {
                            return pairs[1];
                        }
                    }
                }
            }
        }
    }
    return null;
}

function editForm() {
  return {
    id: 0,
    company: '',
    category: '',
    item: '',
    items: [],
    startDate: '',
    endDate: '',
    outputPrice: 0.00,
    enabled: false,
    specialOffer: false,
    imageBase64: '',

    init: function () {
      /*
      var params = new URLSearchParams(window.location.search);
      if (params.has('id')) {
        this.id = params.get('id');
        this.loadPublication(this.id);
      }
      */
      this.id = getQueryParam("id");
    },

    loadItems: function () {
      if (this.category === 'noticias') {
        this.items = ['Política', 'Deportes', 'Cultura'];
      } else if (this.category === 'eventos') {
        this.items = ['Concierto', 'Conferencia', 'Exposición'];
      } else {
        this.items = [];
      }
      this.item = '';
    },

    convertToBase64: function (event) {
      var self = this;
      var file = event.target.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function (e) {
        self.imageBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removeImage: function () {
      this.imageBase64 = '';
      var input = document.querySelector('input[type="file"]');
      if (input) {
        input.value = '';
      }
    },

    loadPublication: function (id) {
      var self = this;
      fetch('/api/publications/' + id)
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          self.category = data.category;
          self.loadItems();
          self.item = data.item;
          self.start = data.start;
          self.end = data.end;
          self.title = data.title;
          self.content = data.content;
          self.enabled = data.enabled;
          self.imageBase64 = data.image || '';
        });
    },

    submitForm: function () {
      var formData = new FormData();
      formData.append('category', this.category);
      formData.append('item', this.item);
      formData.append('start', this.start);
      formData.append('end', this.end);
      formData.append('title', this.title);
      formData.append('content', this.content);
      formData.append('enabled', this.enabled ? '1' : '0');
      formData.append('image', this.imageBase64);

      var url = this.id ? '/api/publications/' + this.id : '/api/publications';
      var method = this.id ? 'PUT' : 'POST';

      fetch(url, {
        method: method,
        body: formData
      })
      .then(function (res) {
        if (res.ok) {
          alert('Guardado correctamente');
          window.location.href = '/publications.html';
        } else {
          alert('Error al guardar');
        }
      });
    }
  };
}


function editForm3() {
    return {
      id: 0,
      company: '',
      category: '',
      item: '',
      descriptionShort: '',
      descriptionLong: '',
      outputPrice = 0.00,
      startDate: '',
      endDate: '',
      enabled: false,
      specialOffer: false,
      image: '',

      init: function () {
        this.id = getQueryParam("id");

        var self = this;

        if (this.id) {
          // Edición: cargar datos desde API
          fetch('/publication/' + this.id)
            .then(function (r) { return r.json(); })
            .then(function (data) {
              self.id = data.id;
              self.company = data.company;
              self.category = data.category;
              self.item = data.item;
              self.descriptionShort = data.descriptionShort;
              self.descriptionLong = data.descriptionLong;
              self.outputPrice = data.outputPrice;
              self.dateTimeStart = data.startDate;
              self.dateTimeEnd = data.endDate;
              self.enabled = data.enabled;
              self.specialOffer = data.specialOffer;
              self.image = data.image || '';
            });
        }
      },

      submit: function () {
        var payload = {
          id = this.id,
          company: this.company,
          category: this.category,
          item: this.item,
          descriptionShort: this.descriptionShort,
          descriptionLong: this.descriptionLong,
          outputPrice = this.outputPrice;
          startDate: this.startDate,
          endDate: this.endDate,
          enabled: this.enabled,
          specialOffer: this.specialOffer,
          image: this.image
        };

        var method = 'POST';
        var url = '/publications';

        fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          alert("Publicación guardada.");
          // podés redirigir si querés
        });
      }
    };
  }

function editForm2() {

  return {
    id = null,
    idCompany: '',
    idCategory: '',
    idItem: '',
    descriptionShort: '',
    descriptionLong: '',
    startDate: '',
    endDate: '',
    outputPrice: '',
    enabled: false,
    specialOffer: false,
    image: '',
    errorMessage: '',
    convertImage: function (event) {
      var file = event.target.files[0];
      if (file) {
        var reader = new FileReader();
        var self = this;
        reader.onload = function (e) {
          self.image = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    },

    async send() {

      this.errorMessage = '';  // Limpiar mensaje de error antes de hacer la solicitud

      const formData = new FormData();
      formData.append('idCompany', selectedCompany);
      formData.append('idCategory', selectedCategory);
      formData.append('idItem', selectedItem);
      formData.append('outputPrice', this.outputPrice);
      formData.append('descriptionShort', this.descriptionShort);
      formData.append('descriptionLong', this.descriptionLong);
      formData.append('startDate', this.startDate + ' ' + '00:00:00');
      formData.append('endDate', this.endDate + ' ' + '00:00:00');
      formData.append('outputPrice', this.outputPrice);
      formData.append('enabled', this.enabled);
      formData.append('specialOffer', this.specialOffer);
      formData.append('image', this.image);
      
      try {
        // Hacer el POST al servidor
        const response = await fetch('https://127.0.0.1:9001/publication', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
          },
          body: formData
        });

        const data = await response.json();
        
        if (data.resultOk) {
            
            alert('Todo bien');
          // Si la respuesta es exitosa, puedes redirigir al usuario o hacer algo con el token.
          // alert('Inicio de sesión exitoso: ' + data.flowOnSuccess);
          
          // sessionStorage.setItem('auth_data', data.token);
          
          // Ahora llamás a la segunda función
          // const responseAuth = await authenticateInFrontend(JSON.stringify(data));
          // const responseAuth = await authenticateInFrontend(data.token);

          window.location.href = data.flowOnSuccess;

        } else {

          // Mostrar el error si algo sale mal
          this.errorMessage = data.message || 'Error.';
        }
      } catch (e) {
        // En caso de que haya un error en la solicitud
        this.errorMessage = 'Error: ' + e;
      }
    }
  }
}

function fillCompanies() {
    
    var instance = {
        companies: [],
        companySelection: '',
        async init() {
            try {
                const response = await fetch('https://127.0.0.1:9001/companies', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                        },
                });
                const data = await response.json();
                this.companies = data;

                if (this.companies.length === 1) {
                    this.companySelection = this.companies[0].id;
                    this.selectedCompany = this.selection;
                }
            } catch (e) {
                console.error('Error cargando compañías: ', e);
            }
        }
    };

  return instance;
}

function fillCategories() {
    return {
        categories: [],
        categorySelection: '',
        items: [],
        itemSelection: '',
        async init() {
            try {
                const response = await fetch('https://127.0.0.1:9001/public/categories');
                const data = await response.json();
                this.categories = data;

                if (this.categories.length === 1) {
                    this.categorySelection = this.categories[0].id;
                    this.fillItems();
                }
            } catch (e) {
                console.error('Error: ', e);
            }
        },
        async fillItems() {
            if (!this.categorySelection) {
                this.items = [];
                return;
            }

            try {
                const response = await fetch(`https://127.0.0.1:9001/public/items?idCategory=${this.categorySelection}`);
                const data = await response.json();
                this.items = data;
            } catch (e) {
                console.error('Error: ', e);
            }
        }
    };
}

function getQueryParam(name) {
    var url = new URL(window.location.href);
    return url.searchParams.get(name);
}