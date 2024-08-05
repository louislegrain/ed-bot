const form = document.querySelector('form');
const infoEl = document.querySelector('.info-msg');
const submitBtn = form.querySelector('button[type="submit"]');

let loading = false;
let payload = {};

function info(info) {
   infoEl.innerHTML = info;
   infoEl.className = 'info-msg';
}
function error(err = 'Une erreur est survenue.') {
   infoEl.innerHTML = err;
   infoEl.className = 'info-msg danger';
}
function hideInfo() {
   infoEl.classList.add('hidden');
}

function decodeBase64(str) {
   return decodeURIComponent(
      atob(str)
         .split('')
         .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
         .join('')
   );
}

form.addEventListener('submit', async e => {
   e.preventDefault();
   if (loading) return;
   loading = true;
   submitBtn.disabled = true;

   info('Chargement...');

   const formdata = new FormData(form);
   payload = {
      ...payload,
      ...Object.fromEntries(formdata),
   };

   const res = await fetch('/api/account', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload).toString(),
   }).catch(() => false);
   const data = await res?.json?.()?.catch(() => false);

   loading = false;
   submitBtn.disabled = false;

   if (data?.success) {
      window.location.href = '/dashboard';
      return;
   }

   if (!data?.question) return error(data?.error);

   payload.token = data.token;

   hideInfo();
   form.querySelectorAll('input').forEach(input => input.remove());

   const questionEl = document.createElement('h2');
   questionEl.textContent = decodeBase64(data.question);
   submitBtn.before(questionEl);

   data.propositions.forEach(proposition => {
      const propositionInputEl = document.createElement('input');
      propositionInputEl.type = 'radio';
      propositionInputEl.name = 'faChoice';
      propositionInputEl.id = proposition;
      propositionInputEl.required = true;
      propositionInputEl.value = proposition;
      const propositionLabelEl = document.createElement('label');
      propositionLabelEl.textContent = decodeBase64(proposition);
      propositionLabelEl.htmlFor = proposition;
      submitBtn.before(propositionInputEl, propositionLabelEl);
   });
});
