function editUser() {
  return {
    userId: null,
    form: {
      name: '',
      surname: '',
      type: '',
      status: '',
      birthDate: '',
      identificationType: '',
      identificationNumber: '',
      gender: '',
      address: '',
      postalCode: '',
      addressAdditionalInfo: '',
      province: '',
      department: '',
      locality: '',
      email: '',
      telephoneNumberLandline: '',
      telephoneNumberMobile: '',
      personAdditionalInfo: '',
      username: '',
      password: '',
      active: '',
      admin: ''
    },
    options: {
      person_type: [],
      person_status: [],
      identification_type: [],
      gender: [],
      province: [],
      department: [],
      locality: [],
      user_active: [],
      user_admin: []
    },
    init() {
      const params = new URLSearchParams(window.location.search);
      this.userId = params.get('id');

      this.fetchAllOptions();

      if (this.userId) {
        fetch(`https://127.0.0.1:9001/user/${this.userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            })
          .then(res => res.json())
          .then(data => this.form = data);
      }
    },
    fetchAllOptions() {
      this.fetchOptions('person_type');
      this.fetchOptions('person_status');
      this.fetchOptions('identification_type');
      this.fetchOptions('gender');
      this.fetchOptions('province');
      this.fetchOptions('user_active');
      this.fetchOptions('user_admin');
    },
    fetchOptions(field) {
      fetch(`https://127.0.0.1:9001/${field}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            })
        .then(res => res.json())
        .then(data => this.options[field] = data)
        .catch(err => {
            console.error('Error al obtener opciones de ', field, ': ', err);
            alert(err.message || 'Error desconocido');
        });
    },
    fetchDepartments() {
      if (this.form.province) {
        fetch(`https://127.0.0.1:9001/department?idProvince=${this.form.province}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            })
          .then(res => res.json())
          .then(data => {
            this.options.department = data;
            this.options.locality = [];
            this.form.department = '';
            this.form.locality = '';
          });
      }
    },
    fetchLocalities() {
      if (this.form.department) {
        fetch(`https://127.0.0.1:9001/locality?idDepartment=${this.form.department}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            })
          .then(res => res.json())
          .then(data => {
            this.options.locality = data;
            this.form.locality = '';
          });
      }
    },
    saveUser() {
      const method = this.userId ? 'PUT' : 'POST';
      const url = this.userId ? `https://127.0.0.1:9001/user/${this.userId}` : `https://127.0.0.1:9001/user`;
      fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json',
                   'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
        },
        body: JSON.stringify(this.form)
      })
        .then(res => {
          if (!res.ok) throw new Error('Error al guardar el usuario');
          alert('Usuario guardado correctamente');
          if (!this.userId) window.location.href = 'editUser.html';
        })
        .catch(err => alert(err.message));
    }
  }
}
