/* =====================================================================
   projects.js  -  ONLY FOR THE PROJECTS PAGE
   =====================================================================

   Hidden entrance to the project editor: clicking the "Hi!" title
   opens pages/project/editor.html.

   It is a click handler instead of a normal link on purpose: nothing
   changes when the mouse is over the title (no colour change, no hand
   cursor) and the browser doesn't show the address in the corner, so
   visitors can't tell it is clickable.
   ===================================================================== */

document.getElementById('pageTitle').addEventListener('click', function () {
    window.location.href = 'project/editor.html';
});
