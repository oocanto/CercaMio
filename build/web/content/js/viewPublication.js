var currentLatitude = 0.0;
var currentLongitude = 0.0;
var currentCompany = 0;

window.onload = function() {
    getHeader();
    getFooter();
    loadCategoriesNavbar();

    var link = document.getElementById("btnHowToGetThere");
    link.onclick = function (e) {
        e.preventDefault();
        window.location.href = "https://www.google.com/maps/search/?api=1&query=" + currentLatitude + "," + currentLongitude;
    };
    
    var lnkCompany = document.getElementById("lnkCompany");
    lnkCompany.onclick = function (e) {
        e.preventDefault();
        const urlA = new URL(document.referrer);
        urlA.searchParams.set('itemName', ''); // Fuerzo el valor vacío, a fin de que me traiga todos los ítems del comercio.
        urlA.searchParams.set('company', currentCompany);
        window.location.href = urlA.toString();
    };
    
    var lnkGoBack = document.getElementById("btnGoBack");
    lnkGoBack.onclick = function (e) {
        e.preventDefault();
        history.back();
    };
};

// Modal controlado solo con js
document.addEventListener("DOMContentLoaded", function() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const closeBtn = document.getElementById("closeModal");

  // Delegación: funciona aunque Alpine inserte la imagen después
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".hero-img");
    if (!img) return;

    const src = img.getAttribute("src");
    if (!src) return;

    modalImg.src = src;
    modal.classList.add("active");
  });

  // Cerrar al hacer clic en la X
  closeBtn.addEventListener("click", () => { 
    modal.classList.add("closing"); 
    setTimeout(() => { 
      modal.classList.remove("active", "closing"); 
      modalImg.src = ""; 
    }, 300); // coincide con duración de fadeOutSlide 
  });

  // Cerrar al hacer clic fuera del contenido
  modal.addEventListener("click", (e) => { 
    if (e.target === modal) { 
      modal.classList.add("closing"); 
      setTimeout(() => { 
        modal.classList.remove("active", "closing"); 
        modalImg.src = ""; 
      }, 300); 
    } 
  });
  
  document.addEventListener('keydown', (e) => {
      console.log('Tecla:', e.key); // Verifica que detecta las teclas
      if (e.key === 'Escape') {
          modal.classList.add("closing"); 
          setTimeout(() => { 
            modal.classList.remove("active", "closing"); 
            modalImg.src = ""; 
          }, 300);
      }
  });

});

function publicationDetail() {
  return {
    // Estado inicial
    loading: true,
    error: false,
    mensajeError: '',
    visibleMap: false,
    modalOpen: false,
    modalImage: '',
    form: {
      name: '',
      descriptionShort: '',
      descriptionLong: '',
      outputPrice: 0,
      category: '',
      company: '',
      locationText: '',
      latitude: null,
      longitude: null,
      image: null,
      distanceToCompany: 0,
      specialOffer: null
    },

    // Métodos
    async loadData() {
      try {
        var self = this;
        var params = new URLSearchParams(window.location.search);
        var id = params.get('id');

        var response = await fetch(config.get_backend_url('/public/publication_detail/') + id, {
          method: 'GET'
        });
        if (!response.ok) {
          throw new Error('Error al cargar publicación: ' + response.status);
        }

        var position = await getCurrentLocation();
        console.log('Ubicación obtenida:', position.coords.latitude, position.coords.longitude);

        var data = await response.json();
        Object.assign(self.form, data);

        self.form.name = data.item.name;
        self.form.descriptionShort = data.descriptionShort;
        self.form.descriptionLong = data.descriptionLong;
        self.form.locationText = data.company.address + ' ' + data.company.addressAdditionalInfo;
        self.form.category = data.category.name;
        self.form.company = data.company.name;
        self.form.companyId = data.company.id;
        self.form.outputPrice = config.format_currency_view(data.outputPrice);
        self.form.distanceToCompany = data.distanceToCompany;
        self.form.latitude = data.company.latitude;
        self.form.longitude = data.company.longitude;
        self.form.image = data.finalImage;
        self.form.specialOffer = data.specialOffer;

        currentLatitude = self.form.latitude;
        currentLongitude = self.form.longitude;
        currentCompany = data.company.id;

        if (this.validCoordinates(data.company.latitude, data.company.longitude)) {
          this.visibleMap = true;
          this.initMap(data.company.latitude, data.company.longitude, position.coords.latitude, position.coords.longitude);
        }
      } catch (e) {
        this.error = true;
        this.mensajeError = e.message || 'Ocurrió un error desconocido.';
      } finally {
        this.loading = false;
      }
      
    },

    

    validCoordinates(lat, lng) {
      return typeof lat === 'number' && typeof lng === 'number'
        && !isNaN(lat) && !isNaN(lng)
        && lat >= -90 && lat <= 90 && lat != 0
        && lng >= -180 && lng <= 180 && lng != 0;
    },

    initMap(lat, lng, latUser, lngUser) {
      const map = L.map('map');

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
        minZoom: 1
      }).addTo(map);

      const iconUrl = this.form.specialOffer === '1'
        ? '/Quijotito/content/assets/img/pinOferta.png'
        : '/Quijotito/content/assets/img/pinCommerce.png';

      const iconUserUrl = '/Quijotito/content/assets/img/pinUser.png';

      const customIcon = L.divIcon({
        html: `<div class="pin-bounce"><img src="${iconUrl}" style="width:32px;height:32px;"></div>`,
        className: '',
        iconSize: [48, 48],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const customUserIcon = L.divIcon({
        html: `<div class="pin-bounce"><img src="${iconUserUrl}" style="width:32px;height:32px;"></div>`,
        className: '',
        iconSize: [48, 48],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      L.marker([lat, lng], { icon: customIcon })
        .bindPopup(`<strong>${this.form.name}</strong><br>${this.form.company}`)
        .addTo(map);

      L.marker([latUser, lngUser], { icon: customUserIcon })
        .bindPopup(`<strong>MI UBICACIÓN</strong>`)
        .addTo(map);

      function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      }

      const distanceKm = calculateDistance(lat, lng, latUser, lngUser);
      console.log('Distancia entre puntos:', distanceKm.toFixed(2), 'km');

      function getDynamicZoom(distanceKm) {
        if (distanceKm <= 0.01) return 20;
        else if (distanceKm <= 0.05) return 19;
        else if (distanceKm <= 0.1) return 18;
        else if (distanceKm <= 0.2) return 17;
        else if (distanceKm <= 0.5) return 16;
        else if (distanceKm <= 1) return 15;
        else if (distanceKm <= 2) return 14;
        else if (distanceKm <= 5) return 13;
        else if (distanceKm <= 10) return 12;
        else if (distanceKm <= 20) return 11;
        else if (distanceKm <= 50) return 10;
        else if (distanceKm <= 100) return 9;
        else if (distanceKm <= 200) return 8;
        else if (distanceKm <= 500) return 7;
        else if (distanceKm <= 1000) return 6;
        else if (distanceKm <= 2000) return 5;
        else return 2;
      }

      const dynamicZoom = getDynamicZoom(distanceKm);
      const centerLat = (lat + latUser) / 2;
      const centerLng = (lng + lngUser) / 2;
      const finalZoom = Math.max(2, Math.min(18, dynamicZoom));
      map.setView([centerLat, centerLng], finalZoom);

      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  };
}

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
        timeout: 10000,
        maximumAge: 60000,
        enableHighAccuracy: true
      }
    );
  });
}
