var id = 0;

window.onload = function() {
    getNav();
   // getHeader();
    getFooter();
};

function entitiesTable() {
    return {
        table: null,

        async init() {
            var data = await this.fetchEntities();
            this.table = new Tabulator("#entities-table", {
                data: data,
                responsiveLayout: "collapse",
                /*theme: "bootstrap5",*/
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
                        title: "ID_COMPANY",
                        field: "company.id",
                        visible: false
                    },
                    {
                        title: "Tipo",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "type.name",
                        minWidth: 200
                    },
                    {
                        title: "Monto [$]",
                        headerHozAlign: "center",
                        field: "amountPayment",
                        hozAlign: "right",
                        formatter: function(cell) {
                            var value = cell.getValue();
                            
                            return config.format_currency_view(value);
                        },
                        minWidth: 200
                    },
                    {
                        title: "Servicio",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "service.name",
                        minWidth: 200
                    },
                    {
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
                        title: "Comentarios",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "comment"
                    },
                    {
                        title: "Acciones",
                        headerHozAlign: "center",
                        formatter: function(cell) {
                            var id = cell.getRow().getData().id;
                            return (
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
            
            var params = new URLSearchParams(window.location.search);
            id = params.get('id');
            
            var res = await fetch(config.get_backend_url('/related_payments/' + id), {
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
    // El id de acá es el de company, mientras que los id que se manejan en la grilla son de los pagos en sí
    // window.open(config.get_frontend_url('/editPayment.html?id=' + id), '_blank');
    window.location.href = config.get_frontend_url('/editPayment.html?id=' + id);
}

async function deleteEntity(id) {
    if (confirm("¿Confirma la operación?")) {
        try {
            var res = await fetch(config.get_backend_url('/payment/') + id, {
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
