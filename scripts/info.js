/* =====================================================================
   info.js  -  ONLY FOR THE INFO PAGE
   =====================================================================

   Turns the smiley face's eyes toward the mouse.

   How it works: each eye is a white circle with the dark pupil on its
   left side (see .eyes .eye::before in info_style.css). Rotating the
   whole eye swings the pupil around the circle, so this script rotates
   each eye until its left side faces the mouse.
   ===================================================================== */

const eyes = document.querySelectorAll('.eye');

document.addEventListener('mousemove', function (event) {
    eyes.forEach(function (eye) {
        // Centre of this eye on the screen
        const box = eye.getBoundingClientRect();
        const eyeX = box.left + box.width / 2;
        const eyeY = box.top + box.height / 2;

        // Angle from the eye's centre to the mouse, in degrees.
        // The "* -1 + 270" turns the maths angle into a CSS rotation
        // that points the eye's left side at the mouse.
        const radians = Math.atan2(event.clientX - eyeX, event.clientY - eyeY);
        const degrees = radians * (180 / Math.PI) * -1 + 270;

        eye.style.transform = 'rotate(' + degrees + 'deg)';
    });
});
