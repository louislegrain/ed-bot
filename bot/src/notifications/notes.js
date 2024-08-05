module.exports = (account, eleve, callback) =>
   new Promise(async (resolve, reject) => {
      let notes = await eleve.fetchNotes().catch(err => {
         reject(err);
         return false;
      });
      if (notes === false) return;

      const today = new Date().setHours(-48, -15, 0, 0);

      notes = notes.notes?.filter(note => new Date(note.dateSaisie) >= today);
      if (!notes) return resolve({ embeds: [] });

      const newNotes = notes.filter(({ id }) => !account.data.notes.includes(id));

      callback(account => (account.data.notes = notes.map(note => note.id)));

      const embeds = newNotes.map(
         ({
            libelleMatiere: matiere,
            devoir,
            valeur: note,
            noteSur: on,
            moyenneClasse: average,
            coef,
            minClasse: min,
            maxClasse: max,
         }) => ({
            title: `💯 Nouvelle note de ${matiere} (${devoir})`,
            fields: [
               {
                  name: 'Note',
                  value: `${note}/${on}`,
                  inline: true,
               },
               {
                  name: 'Moyenne de classe',
                  value: `${average}/${on}`,
                  inline: true,
               },
               {
                  name: 'Coefficient',
                  value: `${coef}`,
                  inline: true,
               },
               {
                  name: 'Note la plus basse',
                  value: `${min}/${on}`,
                  inline: true,
               },
               {
                  name: 'Note la plus haute',
                  value: `${max}/${on}`,
                  inline: true,
               },
            ]
               .filter(field => !/null|undefined|^\/|^$/.test(field.value))
               .map(field => ({
                  ...field,
                  value: field.value
                     .replace(',', '.')
                     .replace(/\.0*(?=\/)|(?<=\.\d+)0*(?=\/)/, ''),
               })),
         })
      );

      resolve({ embeds });
   });
