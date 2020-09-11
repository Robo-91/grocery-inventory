const icon = document.querySelector('.icon');

function displayNav() {
    const navBar = document.getElementById('myNav');

    if (navBar.className === 'navbar-home') {
        navBar.className += ' responsive';
    } else {
        navBar.className = 'navbar-home';
    }
}

icon.addEventListener('click', displayNav);