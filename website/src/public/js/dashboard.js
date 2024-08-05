const forms = document.querySelectorAll('form');
let formsCount = forms.length;

forms.forEach(form => {
   const infoEl = form.querySelector('.info-msg');
   const deleteBtn = form.querySelector('.buttons .danger-btn');

   let controller = null;
   let loading = false;

   function info(info) {
      infoEl.innerHTML = info;
      infoEl.className = 'info-msg';
   }
   function error(err = 'Une erreur est survenue.') {
      infoEl.innerHTML = err;
      infoEl.className = 'info-msg danger';
   }

   form.addEventListener('input', async () => {
      if (controller) controller.abort();
      controller = new AbortController();

      const formdata = new FormData(form);

      const res = await fetch(`/api/account/${form.dataset.id}`, {
         method: 'PATCH',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
         },
         body: new URLSearchParams(formdata).toString(),
         signal: controller.signal,
      }).catch(err => err);
      if (res.name === 'AbortError') return;
      const data = await res?.json?.()?.catch(() => false);

      if (!res.ok || !data || !data.success) error(data?.error);
   });

   deleteBtn.addEventListener('click', async () => {
      if (loading) return;
      loading = true;
      deleteBtn.disabled = true;

      info('Chargement...');

      const res = await fetch(`/api/account/${form.dataset.id}`, {
         method: 'DELETE',
      }).catch(() => false);
      const data = await res?.json?.()?.catch(() => false);

      loading = false;
      deleteBtn.disabled = false;

      if (!res.ok || !data || !data.success) return error(data?.error);

      form.remove();
      formsCount -= 1;
      if (formsCount < 1)
         document.getElementById('accounts-helper').classList.remove('hidden');
   });
});
