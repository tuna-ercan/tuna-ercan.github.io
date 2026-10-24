/* =====================================================================
   main.js  -  BEHAVIOUR SHARED BY EVERY PAGE
   =====================================================================

   Loaded at the bottom of every page. It does two things:
     1. Opens / closes the slide-out menu when the menu icon is clicked.
     2. Grows the progress bar on the right edge as you scroll.
   ===================================================================== */


/* ---------------------------------------------------------------------
   1. SLIDE-OUT MENU
   Clicking the icon adds the class "active" to #all, and clicking again
   removes it. All the visual work (the X shape, the slide) is done by
   the ".page.active" rules in common.css.
   --------------------------------------------------------------------- */

const page = document.getElementById('all');
const menuIcon = document.getElementById('toggle');

menuIcon.addEventListener('click', function () {
    page.classList.toggle('active');
});


/* ---------------------------------------------------------------------
   2. SCROLL PROGRESS BAR
   The bar's height = how far down the page you are, in percent.
   e.g. halfway down the page -> the bar fills half the window height.
   --------------------------------------------------------------------- */

const progressBar = document.getElementById('progressBar');

window.addEventListener('scroll', function () {
    // How many pixels the page can scroll in total
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

    // How many pixels we have scrolled so far, as a percentage of that
    const percent = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;

    progressBar.style.height = percent + '%';
});
