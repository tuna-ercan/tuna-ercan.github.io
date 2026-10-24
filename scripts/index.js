/* =====================================================================
   index.js  -  ONLY FOR THE HOMEPAGE
   =====================================================================

   The menu icon stays in the corner while you scroll. It is white,
   which is easy to see on the banner photo but not on the white card
   below it. So when the icon is below the photo, this adds the class
   "overCard" to the header, and index_style.css turns the lines dark.
   While the menu is open the icon sits on the menu panel, so it stays
   white then.
   ===================================================================== */

const menuHeader = document.querySelector('header');
const banner = document.querySelector('section.homePhotoSection');

function updateMenuIconColour() {
    const icon = document.getElementById('toggle').getBoundingClientRect();
    const iconMiddle = icon.top + icon.height / 2;
    const bannerBottom = banner.getBoundingClientRect().bottom;
    const menuOpen = document.body.classList.contains('menu-open');

    menuHeader.classList.toggle('overCard', iconMiddle > bannerBottom && !menuOpen);
}

window.addEventListener('scroll', updateMenuIconColour);
window.addEventListener('resize', updateMenuIconColour);
document.getElementById('toggle').addEventListener('click', updateMenuIconColour);
updateMenuIconColour();
