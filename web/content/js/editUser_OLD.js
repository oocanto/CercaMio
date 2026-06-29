function userForm() {
  return {
    isEdit: false,
    userId: null,
    user: {
      id: 0,
      parent: { id: 0,
                name: '',
                surname: '',
                type: { id: '', name: '' },
                status: { id: '', name: '' },
                birthDate: '',
                identificationType: { id: '', name: '' },
                identificationNumber: '',
                gender: { id: '', name: '' },
                address: '',
                postalCode: '',
                addressAdditionalInfo: '',
                province: { id: '', name: '' },
                department: { id: '', name: '' },
                locality: { id: '', name: '' },
                email: '',
                telephoneNumberLandline: '',
                telephoneNumberMobile: '',
      personAdditionalInfo: '' },
      username: '',
      password: '',
      active: [],
      admin: []
    },
    options: {
      type: [],
      status: [],
      identificationType: [],
      gender: [],
      province: [],
      department: [],
      locality: [],
      active: [],
      admin: []
    },

    init: function() {
      this.userId = this.getUserIdFromURL();
      this.isEdit = !!this.userId;
      this.loadAllOptions();

      if (this.isEdit) {
        this.loadUser();
      }
    },

    getUserIdFromURL: function() {
      var params = new URLSearchParams(window.location.search);
      return params.get("id");
    },

    loadAllOptions: function() {
      var self = this;
      var endpoints = [
        "person_type", "person_status", "identification_type", "gender",
        "province", "user_active", "user_admin"
      ];

      endpoints.forEach(function(key) {
        fetch('https://127.0.0.1:9001/' + key, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            })
          .then(function(res) { return res.json(); })
          .then(function(data) { self.options[key] = data; });
      });
    },

    loadDepartments: function() {
      var self = this;
      var provId = this.user.province[0];
      if (provId) {
        fetch('https://127.0.0.1:9001/department?idProvince=' + provId, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            })
          .then(function(res) { return res.json(); })
          .then(function(data) { self.options.department = data; });
      }
    },

    loadLocalities: function() {
      var self = this;
      var deptId = this.user.department[0];
      if (deptId) {
        fetch('https://127.0.0.1:9001/locality?idDepartment=' + deptId, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            })
          .then(function(res) { return res.json(); })
          .then(function(data) { self.options.locality = data; });
      }
    },

    loadUser: function() {
      var self = this;
      fetch('https://127.0.0.1:9001/users/' + this.userId, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          self.user = data;
        });
    },

    submitForm: function() {
      var method = this.isEdit ? 'PUT' : 'POST';
      var url = this.isEdit ? 'https://127.0.0.1:9001/users/' + this.userId : '/users';
      fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
        },
        body: JSON.stringify(this.user)
      })
      .then(function(res) { return res.json(); })
      .then(function(response) {
        alert('Usuario guardado con éxito');
        window.location.href = '/users';
      });
    }
  };
}
