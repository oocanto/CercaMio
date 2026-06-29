window.onload = function() {
    getNav();
    //getHeader();
    getFooter();
};

function entitiesTable() {
    return {
        
        form: {
            itemName: null
        },
        
        table: null,

        async init() {
            const data = await this.fetchEntities();
            this.table = new Tabulator("#entities-table", {
                data: data,
                responsiveLayout: "collapse",
                /*theme: "bootstrap5", // Tema Bootstrap 5*/
                layout: "fitColumns",
                pagination: "local",
                paginationSize: 10,
                index: "id",
                columns: [{
                        title: "ID",
                        field: "id",
                        visible: false
                    },
                    {
                        title: "Item",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "item.name",
                        responsive: 0,
                        minWidth: 250
                    },
                    {
                        title: "Descripción",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "descriptionShort",
                        minWidth: 250
                    },
                    {
                        title: "Descripción larga",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "descriptionLong",
                        minWidth: 250
                    },
                    {
                        title: "Comercio",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "company.name",
                        minWidth: 250
                    },
                    {
                        title: "Categoría",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "category.name",
                        minWidth: 250
                    },
                    {
                        title: "Precio [$]",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "outputPrice",
                        hozAlign: "right",
                        formatter: function(cell) {
                            var value = cell.getValue();
                            
                            return config.format_currency_view(value);
                        }
                    },                    {
                        title: "Inicio",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "startDate",
                        hozAlign: "center",
                        formatter: function(cell) {
                            var value = cell.getValue();
                            if (!value) return "";
                            
                            var date = new Date(value);
                            var day = ("0" + date.getDate()).slice(-2);
                            var month = ("0" + (date.getMonth() + 1)).slice(-2);
                            var year = date.getFullYear();
                        
                            return `${day}/${month}/${year}`;
                        }
                    },
                    {
                        title: "Fin",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "endDate",
                        hozAlign: "center",
                        formatter: function(cell) {
                            var value = cell.getValue();
                            if (!value) return "";
                            
                            var date = new Date(value);
                            var day = ("0" + date.getDate()).slice(-2);
                            var month = ("0" + (date.getMonth() + 1)).slice(-2);
                            var year = date.getFullYear();
                        
                            return `${day}/${month}/${year}`;
                        }
                    },
                    {
                        title: "Imagen",
                        headerHozAlign: "center",
                        field: "finalImage",
                        hozAlign: "center",
                        formatter: function(cell) {
                            var val = cell.getValue();
                            if (val) {
                                return '<img src="' + val + '" alt="img" />';
                            }
                            return '';
                        },
                        hozAlign: "center"
                    },
                    {
                        title: "Acciones",
                        headerHozAlign: "center",
                        formatter: function(cell) {
                            var id = cell.getRow().getData().id;
                            return (
                                '<span class="icon-btn" onclick="editEntity(' + id + ')"><img src="assets/icons/16x16/book_edit.png" title="Editar" /></span>' +
                                '<span class="icon-btn" onclick="deleteEntity(' + id + ')"><img src="assets/icons/16x16/book_delete.png" title="Eliminar" /></span>'
                            );
                        },
                        hozAlign: "center",
                        headerSort: false,
                        responsive: 0,
                        minWidth: 120
                    }
                ]
            });

            window.entitiesTableInstance = this;
        },

        async fetchEntities() {
            var res = await fetch(config.get_backend_url('/publications'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                }
            });
            return await res.json();
        }
    };
}

function newEntity() {
    // window.open(config.get_frontend_url('/editPublication.html'), '_blank');
    window.location.href = config.get_frontend_url('/editPublication.html');
}

function editEntity(id) {
    // window.open(config.get_frontend_url('/editPublication.html?id=') + id, '_blank');
    window.location.href = config.get_frontend_url('/editPublication.html?id=') + id;
}

async function deleteEntity(id) {
    if (confirm("¿Confirma la operación?")) {
        try {
            var res = await fetch(config.get_backend_url('/publication/') + id, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                }
            });

            if (!res.ok) {
                throw new Error("Error al eliminar");
            }

            if (window.entitiesTableInstance && window.entitiesTableInstance.table) {
                window.entitiesTableInstance.table.deleteRow(id);
            }

            alert(config.MESSAGE_OPERATION_SUCCESS);
        } catch (err) {
            console.error(err);
            alert(config.MESSAGE_OPERATION_ERROR);
        }
    }
}