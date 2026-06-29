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
                        title: "Apellido(s), Nombre(s)",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "fullName",
                        formatter: function(cell, formatterParams, onRendered) {
                            var data = cell.getData();
                            return data.parent.surname + ", " + data.parent.name;
                        },
                        responsive: 0,
                        minWidth: 250
                    },
                    {
                        title: "Teléfono celular",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "parent.telephoneNumberMobile",
                        minWidth: 200
                    },
                    {
                        title: "Email",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "parent.email",
                        minWidth: 200
                    },
                    {
                        title: "Nombre de usuario",
                        headerFilter: "input",
                        headerHozAlign: "center",
                        field: "username",
                        hozAlign: "center"
                    },
                    {
                        title: "¿Es administrador?",
                        headerHozAlign: "center",
                        field: "admin",
                        formatter: function(cell) {
                            return cell.getValue() === '1' ? "<img src='assets/icons/16x16/Boss.png' title='Sí' />" : "<img src='assets/icons/16x16/Delete.png' title='No' />";
                        },
                        hozAlign: "center"
                    },
                    {
                        title: "¿Está activo?",
                        headerHozAlign: "center",
                        field: "active",
                        formatter: function(cell) {
                            return cell.getValue() === '1' ? "<img src='assets/icons/16x16/Apply.png' title='Sí' />" : "<img src='assets/icons/16x16/Delete.png' title='No' />";
                        },
                        hozAlign: "center"
                    },
                    {
                        title: "Acciones",
                        headerHozAlign: "center",
                        formatter: function(cell) {
                            var id = cell.getRow().getData().id;
                            var admin = cell.getRow().getData().admin;
                            var username = cell.getRow().getData().username;
                            return (
                                '<span class="icon-btn" onclick="editEntity(' + id + ')"><img src="assets/icons/16x16/book_edit.png" title="Editar" /></span>' +
                                (admin != "1" ? '<span class="icon-btn" onclick="deleteEntity(' + id + ')"><img src="assets/icons/16x16/book_delete.png" title="Eliminar" /></span>' : '') +
                                (admin != "1" ? '<span class="icon-btn" onclick="resetPassword(' + id + ', \'' + username + '\')"><img src="assets/icons/16x16/book_key.png" title="Resetear contraseña" /></span>' : '')
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
            var res = await fetch(config.get_backend_url('/users'), {
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
    window.location.href = config.get_frontend_url('/editUser.html');
}

function editEntity(id) {
    // window.open(config.get_frontend_url('/editUser.html?id=') + id, '_blank');
    window.location.href = config.get_frontend_url('/editUser.html?id=') + id;
}

async function deleteEntity(id) {
    if (confirm(config.MESSAGE_CONFIRM)) {
        try {
            var res = await fetch(config.get_backend_url('/user/') + id, {
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

async function resetPassword(id, username) {
    
    var newPassword = null;

    newPassword = prompt('Ingrese la nueva contraseña para ' + username + ':');
    
    const params = new URLSearchParams();
    params.append('id', id);
    params.append('password', newPassword);
    
    //if (confirm(config.MESSAGE_CONFIRM)) {
    if (newPassword != null && newPassword != '') {
        try {
            var res = await fetch(config.get_backend_url('/user_password'), {
                method: "POST",
                body: params.toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('auth_data')
                },
            });

            if (!res.ok) {
                throw new Error(config.MESSAGE_OPERATION_ERROR);
            }

            alert(config.MESSAGE_OPERATION_SUCCESS);
        } catch (err) {
            console.error(err);
            alert(config.MESSAGE_OPERATION_ERROR);
        }
    }
}