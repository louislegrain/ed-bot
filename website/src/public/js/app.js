const menuEls = document.querySelectorAll('.menu > li > span');

menuEls.forEach(el => {
   const parent = el.parentNode;
   let open = false;

   el.addEventListener('mousedown', e => {
      if (!open) return;
      e.preventDefault();
      document.activeElement.blur();
      open = false;
   });
   parent.addEventListener('focusin', () => {
      open = true;
   });
   parent.addEventListener('focusout', () => {
      open = false;
   });
});
