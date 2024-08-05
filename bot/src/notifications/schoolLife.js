module.exports = (account, eleve, callback) =>
   new Promise(async (resolve, reject) => {
      let schoolLife = await eleve.fetchVieScolaire().catch(err => {
         reject(err);
         return false;
      });
      if (schoolLife === false) return;

      const today = new Date().setHours(-48, -15, 0, 0);

      schoolLife = schoolLife.absencesRetards?.filter(el => new Date(el.date) >= today);
      if (!schoolLife) return resolve({ embeds: [] });

      const newEls = schoolLife.filter(({ id }) => !account.data.schoolLife.includes(id));

      callback(account => (account.data.schoolLife = schoolLife.map(el => el.id)));

      const embeds = newEls.map(
         ({
            libelle: duration,
            displayDate: date,
            justifie: justified,
            motif: reason,
            typeElement: type,
         }) => ({
            title: type === 'Retard' ? '⏰ Nouveau retard' : '⏰ Nouvelle absence',
            fields: [
               {
                  name: 'Date',
                  value: date,
               },
               {
                  name: 'Durée',
                  value: duration,
               },
               {
                  name: 'Justifié',
                  value: justified ? 'Oui' : 'Non',
                  inline: true,
               },
               {
                  name: 'Motif',
                  value: reason ? reason : 'Aucun',
                  inline: true,
               },
            ].filter(field => !/null|undefined|^$/.test(field.value)),
         })
      );

      resolve({ embeds });
   });
