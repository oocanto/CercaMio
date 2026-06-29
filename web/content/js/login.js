let selectedCompany = '';

window.onload = function () {
    getHeader();
    getFooter();
    fillInstances();
};

function loginForm() {

  return {
    username: '',
    password: '',
    company: 'Quijotito',
    errorMessage: '',

    async login() {

      this.errorMessage = '';  // Limpiar mensaje de error antes de hacer la solicitud

      // const formData = new FormData();
      // formData.append('username', this.username);
      // formData.append('password', this.password);
      // formData.append('company', selectedCompany);
      
      const params = new URLSearchParams();
      params.append('username', this.username);
      params.append('password', this.password);
      params.append('company', selectedCompany);

      try {
        // Hacer el POST al servidor
        const response = await fetch(config.get_backend_url('/login'), {
          method: 'POST',
          // body: formData,
          body: params.toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
        });

        const data = await response.json();
        
        if (data.resultOk) {
          // Si la respuesta es exitosa, puedes redirigir al usuario o hacer algo con el token.
          // alert('Inicio de sesión exitoso: ' + data.flowOnSuccess);
          
          sessionStorage.setItem('auth_data', data.token);
          sessionStorage.setItem('user_data', data.message);
          
          // Ahora llamás a la segunda función
          // const responseAuth = await authenticateInFrontend(JSON.stringify(data));
          const responseAuth = await authenticateInFrontend(data.token);

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

async function authenticateInFrontend(token) {

    const response = await fetch(config.get_frontend_url('/login.html'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: ''
    });

    if (!response.ok) {
        throw new Error('Error.');
    }

    const data_returned = await response;

    return data_returned;
}

function fillInstances() {
    
    var instance = {
        options: [],
        selection: '',
        init: function() {
            var self = this;
            return (async function() {
                try {
                    var response = await fetch(config.get_backend_url('/public/instances'), {
                    });
                    self.options = await response.json();
                    
                    if (self.options.length === 1) {
                        self.selection = self.options[0].key;
                        selectedCompany = self.selection;
                    }
                } catch (e) {
                    console.error('Error: ', e);
                }
            })();
        }
    };

  return instance;
}

