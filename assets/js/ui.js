function autoHideSidenav() {
    function toggleSideNav() {
        if (window.innerWidth < 1000) {
            document.getElementById('sidenav').setAttribute('class', 'side-nav-hide');
            document.getElementById('mainview').setAttribute('class', 'main-full');
            document.getElementById('sidenav').style.display = 'none';
        } else {
            document.getElementById('sidenav').setAttribute('class', 'side-nav');
            document.getElementById('mainview').setAttribute('class', 'main-side-nav');
            document.getElementById('sidenav').style.display = 'block'
        }
    }

    toggleSideNav();
    window.onresize = ev => {
        toggleSideNav();
    }
}
