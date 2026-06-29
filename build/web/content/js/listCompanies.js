window.onload = function() {
    getNav();
    //getHeader();
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
                        title: "Nombre",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "name",
                        minWidth: 250
                    },
                    {
                        title: "Descripción",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "description",
                        minWidth: 200
                    },
                    {
                        title: "Servicio",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "service.name",
                        hozAlign: "center",
                        minWidth: 100
                    },
                    {
                        title: "Pagos al día",
                        headerHozAlign: "center",
                        field: "isUpToDate",
                        formatter: function(cell) {
                            if(cell.getRow().getData().isUpToDate) {
                                return "<img src='assets/icons/16x16/Apply.png' title='Sí' />";
                            } else {
                                return "<img src='assets/icons/16x16/Delete.png' title='No' />";
                            }
                        },
                        hozAlign: "center",
                        minWidth: 150
                    },
                    {
                        title: "Teléfono fijo",
                        headerHozAlign: "center",
                        field: "telephoneNumberLandline",
                        minWidth: 200
                    },
                    {
                        title: "Teléfono celular",
                        headerHozAlign: "center",
                        field: "telephoneNumberMobile",
                        minWidth: 200
                    },
                    {
                        title: "Email",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "email",
                        minWidth: 200
                    },
                    {
                        title: "Provincia",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "province.name",
                        hozAlign: "center",
                        minWidth: 200
                    },
                    {
                        title: "Departamento",
                        headerHozAlign: "center",
                        field: "department.name",
                        hozAlign: "center"
                    },
                    {
                        title: "Localidad",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "locality.name",
                        hozAlign: "center"
                    },
                    {
                        title: "Tipo",
                        headerHozAlign: "center",
                        field: "type.name",
                        hozAlign: "center"
                    },
                    {
                        title: "Estado",
                        headerHozAlign: "center",
                        field: "status.name",
                        hozAlign: "center"
                    },
                    {
                        title: "Acciones",
                        headerHozAlign: "center",
                        formatter: function(cell) {
                            var id = cell.getRow().getData().id;
                            return (
                                '<span class="icon-btn" onclick="editEntity(' + id + ')"><img src="assets/icons/16x16/book_edit.png" title="Editar" /></span>' +
                                '<span class="icon-btn" onclick="deleteEntity(' + id + ')"><img src="assets/icons/16x16/book_delete.png" title="Eliminar" /></span>' +
                                '<span class="icon-btn" onclick="editPayment(' + id + ')"><img src="assets/icons/16x16/Accounting.png" title="Administrar pagos" /></span>'
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
            var res = await fetch(config.get_backend_url('/companies'), {
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
    // window.open(config.get_frontend_url('/editCompany.html'), '_blank');
    window.location.href = config.get_frontend_url('/editCompany.html');
}

function editEntity(id) {
    // window.open(config.get_frontend_url('/editCompany.html?id=') + id, '_blank');
    window.location.href = config.get_frontend_url('/editCompany.html?id=') + id;
}

async function deleteEntity(id) {
    if (confirm("¿Confirma la operación?")) {
        try {
            // var res = await fetch(config.get_backend_url('/user/') + id, {
            var res = await fetch(config.get_backend_url('/company/') + id, {
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

function editPayment(id) {
    // window.open(config.get_frontend_url('/listPayments.html?id=') + id, '_blank');
    window.location.href = config.get_frontend_url('/listPayments.html?id=') + id;
}
