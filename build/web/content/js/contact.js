window.onload = function () {
    getNav();
    //getHeader();
    getFooter();
};

function toggleMenu() {
  const menu = document.getElementById('menu');
  if (menu.style.display === 'flex') {
    menu.style.display = 'none';
  } else {
    menu.style.display = 'flex';
  }
}

function loadContent(event, url) {
  event.preventDefault();
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById('main-content').innerHTML = html;
    });
}
