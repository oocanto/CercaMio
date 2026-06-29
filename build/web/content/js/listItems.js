window.onload = function() {
    getNav();
    //getHeader();
    getFooter();
};

function entitiesTable() {
    return {
        table: null,

        async init() {
            const data = await this.fetchEntities();
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
                        responsive: 0,
                        minWidth: 250
                    },
                    {
                        title: "Tipo",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "type.name",
                        minWidth: 250
                    },
                    {
                        title: "Estado",
                        headerHozAlign: "center",
                        field: "status.name",
                        minWidth: 250
                    },
                    {
                        title: "Descripción",
                        headerHozAlign: "center",
                        field: "description",
                        minWidth: 250
                    },
                    {
                        title: "Imagen",
                        headerHozAlign: "center",
                        field: "image",
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
            var res = await fetch(config.get_backend_url('/items'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            });
            return await res.json();
        }
    };
}

function newEntity() {
    // window.open(config.get_frontend_url('/editUser.html'), '_blank');
    window.location.href = config.get_frontend_url('/editItem.html');
}

function editEntity(id) {
    // window.open(config.get_frontend_url('/editUser.html?id=') + id, '_blank');
    window.location.href = config.get_frontend_url('/editItem.html?id=') + id;
}

async function deleteEntity(id) {
    if (confirm(config.MESSAGE_CONFIRM)) {
        try {
            var res = await fetch(config.get_backend_url('/item/') + id, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            });

            if (!res.ok) {
                throw new Error(config.MESSAGE_OPERATION_ERROR);
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