window.config = {

    // BASE_FRONTEND_URL: 'https://localhost:8443/Quijotito/content',
    // BASE_FRONTEND_URL: 'http://localhost:8084/Quijotito/content',
    BASE_FRONTEND_URL: 'http://calendariopd.yjere.com.ar/cercamio/content',
    // BASE_BACKEND_URL: 'https://127.0.0.1:9001',
    // BASE_BACKEND_URL: 'https://localhost:8443/QuijotitoBackend/api',
    // BASE_BACKEND_URL: 'http://localhost:8084/QuijotitoBackend/api',
    BASE_BACKEND_URL: 'http://calendariopd.yjere.com.ar/cercamio-b/api',
    BOOLEAN_VALUE_TRUE: '1',
    BOOLEAN_VALUE_FALSE: '0',
    MESSAGE_CONFIRM: '¿Confirma la operación?',
    MESSAGE_NONVALID_FORMAT: 'Formato no válido.',
    MESSAGE_OPERATION_SUCCESS: 'La operación se ejecutó correctamente.',
    MESSAGE_OPERATION_ERROR: 'Ocurrió un error en la operación.',
    MESSAGE_EXCEPTION: 'Se produjo una excepción.',

    get_frontend_url(endpoint) {
        return `${this.BASE_FRONTEND_URL}${endpoint}`;
    },
    
    get_backend_url(endpoint) {
        return `${this.BASE_BACKEND_URL}${endpoint}`;
    },
    
    format_date_DMY(isoString) {
        var d = new Date(isoString);
        var day = String(d.getDate()).padStart(2, '0');
        var month = String(d.getMonth() + 1).padStart(2, '0');
        var year = d.getFullYear();
        return day + "/" + month + "/" + year;
    },
    
    format_date_ISO(ddMMyyyyString) {
        const [day, month, year] = ddMMyyyyString.split("/").map(Number);
        return new Date(year, month - 1, day);
    },
    
    get_first_day(date) {
        date.setDate(1);
        return date;
    },
    
    get_last_day(date) {
        date.setMonth(date.getMonth() + 1);
        date.setDate(0); // day 0 of next month is last day of current month
        return date;
        
    },
    
    format_currency_view(value) {
        return value
            .toFixed(2)                            // fuerza 2 decimales
            .replace('.', ',')                     // decimal: punto → coma
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // miles: agrega puntos
    },
    
    format_currency_number(value) {
        var normalizedValue = value.replace(/\./g, '').replace(',', '.');
        return parseFloat(normalizedValue);
    },
    
    format_decimal(value) {
        if (typeof value !== 'string') return NaN;
        return parseFloat(value.replace(',', '.'));
    }
};


// ----------------------------------------------------------------------------
// Standard edition form
// ----------------------------------------------------------------------------
// 1) Page loading
// 2) Form initialization
// 3) Form operational mechanics
        // 3.1) Form data
        // 3.2) Errors array
        // 3.3) Select options declaration
        // 3.4) Auxiliary variables
        // 3.5) Init function
        // 3.6) Initial selects loading
        // 3.7) Dependant selects loading
        // 3.8) Main unit loading
        // 3.9) Main unit saving
        // 3.10) Validation
        // 3.11) Auxiliary method
