const { formatDate } = require('../utils');

module.exports = (account, eleve, callback) =>
   new Promise(async (resolve, reject) => {
      const agenda = await eleve.fetchAgenda().catch(err => {
         reject(err);
         return false;
      });
      if (agenda === false) return;

      let homework = [];
      Object.entries(agenda).forEach(([date, day]) => {
         homework = [...homework, ...day.map(homework => ({ ...homework, date }))];
      });

      const newHomework = homework.filter(
         ({ idDevoir: id }) => !account.data.homework.includes(id)
      );

      callback(account => (account.data.homework = homework.map(({ idDevoir: id }) => id)));

      const embeds = newHomework.map(({ matiere, date, interrogation }) => ({
         title: `📕 ${interrogation ? 'Contrôle' : 'Nouveau devoir'} de ${matiere} ${
            interrogation ? '' : 'pour'
         } ${formatDate(date)}`,
      }));

      resolve({ embeds });
   });
