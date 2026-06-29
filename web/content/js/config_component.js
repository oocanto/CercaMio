window.config_component = {

    configure_date_format(elementName) {

        IMask(document.getElementById(elementName), {

            mask: Date,
        
            pattern: 'd/`m/`Y',
        
            blocks: {
                d: {
                    mask: IMask.MaskedRange,
                    from: 1,
                    to: 31,
                    maxLength: 2
                },
                m: {
                    mask: IMask.MaskedRange,
                    from: 1,
                    to: 12,
                    maxLength: 2
                },
                Y: {
                    mask: IMask.MaskedRange,
                    from: 1900,
                    to: 3000
                }
            },
        
            format: function(date) {
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
        
                if (day < 10) day = "0" + day;
                if (month < 10) month = "0" + month;
       
                return day + '/' + month + '/' + year;
            },
        
            parse: function(str) {
                var partes = str.split('/');
                var day = partes[0];
                var month = partes[1];
                var year = partes[2];
                return new Date(year, month - 1, day);
            },
        
            min: new Date(1900, 0, 1),
            max: new Date(2099, 0, 1),
        
            autofix: true,
            lazy: false,
            overwrite: true
        });
    },
    
    clean_date(value) {
        return value.replace(/_/g, '');
    },
    
    configure_currency_format(elementName) {

        IMask(document.getElementById(elementName), {

            mask: Number,
            scale: 2,               // dos decimales
            signed: false,          // no permitir negativos
            thousandsSeparator: '.',// separador de miles
            radix: ',',             // separador decimal
            padFractionalZeros: true,  // agregar ceros si faltan decimales
            normalizeZeros: true,      // eliminar ceros innecesarios
            min: 0,
            max: 999999999.99,      // límite superior opcional
            lazy: false             // mostrar los decimales siempre (e.g. 0,00)
        });
    },
    
    configure_select(elementName) {

        return new TomSelect('#' + elementName, {
            options: [],
            items: [],
            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            plugins: ['remove_button'],
            persist: false,
            create: false,
            onItemAdd: function(value) {
                this.close();
            }
        });
    }
}