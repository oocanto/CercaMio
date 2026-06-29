// Eliminar window.onload y usar DOMContentLoaded en su lugar
document.addEventListener('DOMContentLoaded', function() {
    getHeader();
    getFooter();
});

// Asegurar que la función esté en el scope global
window.currentLocation = function() {
    return {
        loading: true,
        error: false,
        mensajeError: '',
        visibleMap: false,
        form: {
            company: 'Mi ubicación actual' // Agregado para el popup del mapa
        },
        
        async loadData() {
            try {
                console.log('Iniciando carga de ubicación...');
                
                // Pequeño delay para asegurar que Alpine.js esté completamente inicializado
                await new Promise(resolve => setTimeout(resolve, 50));
                
                var position = await getCurrentLocation();
                console.log('Ubicación obtenida:', position.coords.latitude, position.coords.longitude);
                
                this.loading = false;
                this.error = false;

                if (this.validCoordinates(position.coords.latitude, position.coords.longitude)) {
                    this.visibleMap = true;
                    
                    // Usar $nextTick para asegurar que el DOM esté actualizado
                    this.$nextTick(() => {
                        console.log('Inicializando mapa...');
                        this.initMap(position.coords.latitude, position.coords.longitude);
                    });
                } else {
                    console.warn('Coordenadas no válidas');
                    this.error = true;
                    this.mensajeError = 'Las coordenadas obtenidas no son válidas.';
                }
                
            } catch (err) {
                console.error('Error en loadData:', err);
                this.loading = false;
                this.error = true;
                this.mensajeError = err.message || 'Error al obtener la ubicación.';
                
                if (err.code == 1) {
                    this.mensajeError = 'Permiso de ubicación denegado. Por favor, habilita la geolocalización en tu navegador.';
                } else if (err.code == 2) {
                    this.mensajeError = 'La ubicación no está disponible. Verifica tu conexión.';
                } else if (err.code == 3) {
                    this.mensajeError = 'Tiempo de espera agotado. Intenta nuevamente.';
                } else if (err.code == 0) {
                    this.mensajeError = 'Geolocalización no soportada por tu navegador.';
                }
            }
        },
        
        validCoordinates: function(lat, lng) {
            return typeof lat === 'number' && typeof lng === 'number'
              && !isNaN(lat) && !isNaN(lng)
              && lat >= -90 && lat <= 90 && lat != 0
              && lng >= -180 && lng <= 180 && lng != 0;
        },
        
        initMap: function(lat, lng) {
            try {
                console.log('Creando mapa en:', lat, lng);
                
                // Asegurarse de que el elemento 'map' existe
                if (!document.getElementById('map')) {
                    console.error('Elemento #map no encontrado');
                    return;
                }
                
                var map = L.map('map').setView([lat, lng], 15);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(map);
            
                var marker = L.marker([lat, lng]).addTo(map).bindPopup(this.form.company);
            
                // Corregir tamaño del mapa (importante cuando se muestra después de estar oculto)
                setTimeout(() => {
                    map.invalidateSize();
                    console.log('Mapa redimensionado');
                    
                    // Esperar otro frame antes de abrir el popup
                    setTimeout(() => {
                        marker.openPopup();
                        console.log('Popup abierto');
                    }, 100);
                }, 100);
                
            } catch (mapError) {
                console.error('Error al inicializar el mapa:', mapError);
                this.error = true;
                this.mensajeError = 'Error al cargar el mapa.';
            }
        }
    };
}

// Función getCurrentLocation sin cambios (pero la incluyo para completitud)
async function getCurrentLocation() {
    return new Promise(function (resolve, reject) {
        if (!navigator.geolocation) {
            reject({ code: 0, message: "Geolocalización no soportada." });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function (position) {
                resolve(position);
            },
            function (error) {
                if (error.code === 1) {
                    reject({ code: 1, message: "El usuario no permite el uso de la ubicación del dispositivo." });
                } else if (error.code === 2) {
                    reject({ code: 2, message: "La ubicación del dispositivo no está disponible." });
                } else if (error.code === 3) {
                    reject({ code: 3, message: "Tiempo de espera de ubicación del dispositivo agotado." });
                } else {
                    reject({ code: error.code, message: error.message });
                }
            },
            {
                // Opciones adicionales para mejor performance
                timeout: 10000,
                maximumAge: 60000, // Cache de 1 minuto
                enableHighAccuracy: true
            }
        );
    });
}