async function getHeader() {
    try {
        var response = await fetch("header.ht");
        var data = await response.text();
        document.getElementById("divHeader").innerHTML = data;
    } catch (error) {
      console.error("Error: ", error);
    }
}

async function getNav() {
    try {
        var response = await fetch("nav.ht");
        var data = await response.text();
        document.getElementById("divNav").innerHTML = data;
        
        getUserInfo();
        
    } catch (error) {
      console.error("Error: ", error);
    }
}

async function getFooter() {
    try {
        var response = await fetch("footer.ht");
        var data = await response.text();
        document.getElementById("divFooter").innerHTML = data;
    } catch (error) {
      console.error("Error: ", error);
    }
}

async function getUserInfo() {
    try {
        var data = sessionStorage.getItem('user_data');
        document.getElementById("spaUser").innerHTML = data;
    } catch (error) {
      console.error("Error: ", error);
    }
}

function closeSession() {

    if(confirm(config.MESSAGE_CONFIRM)) {

        sessionStorage.removeItem("auth_data");
        sessionStorage.removeItem("user_data");
        
        window.location.href = config.get_frontend_url('/login.html');
    }

}