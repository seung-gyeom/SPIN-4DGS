document.addEventListener("DOMContentLoaded", function () {
  var navbarBurger = document.querySelector(".navbar-burger");
  var navbarMenu = document.querySelector(".navbar-menu");

  if (navbarBurger && navbarMenu) {
    navbarBurger.addEventListener("click", function () {
      navbarBurger.classList.toggle("is-active");
      navbarMenu.classList.toggle("is-active");
    });
  }

  initializeComparisons();
});
