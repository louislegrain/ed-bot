const { formatDate } = require('../utils');

module.exports = (account, eleve, callback) =>
   new Promise(async (resolve, reject) => {
      const planning = await eleve
         .fetchEDT(new Date(), new Date(Date.now() + 7 * 24 * 3600 * 1000))
         .catch(err => {
            reject(err);
            return false;
         });
      if (planning === false) return;

      const canceled = planning
         .filter(({ isAnnule, isModifie }) => isAnnule || isModifie)
         .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

      const newCanceled = canceled.filter(({ id }) => !account.data.planning.includes(id));

      callback(account => (account.data.planning = canceled.map(el => el.id)));

      const embeds = newCanceled.map(({ isAnnule, matiere, start_date, end_date, prof }) => ({
         title: `📅 Cours de ${matiere} ${isAnnule ? 'annulé' : 'modifié'} ${formatDate(
            start_date
         )}`,
         fields: [
            {
               name: 'Début du cours',
               value: formatDate(start_date, { date: false, time: true }),
               inline: true,
            },
            {
               name: 'Fin du cours',
               value: formatDate(end_date, { date: false, time: true }),
               inline: true,
            },
            {
               name: 'Professeur',
               value: prof,
            },
         ].filter(field => !/null|undefined|^$/.test(field.value)),
      }));

      resolve({ embeds });
   });
