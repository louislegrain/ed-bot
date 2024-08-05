module.exports = (account, eleve, callback) =>
   new Promise(async (resolve, reject) => {
      let documents = await eleve.fetchDocuments().catch(err => {
         reject(err);
         return false;
      });
      if (documents === false) return;

      const today = new Date().setHours(-48, -15, 0, 0);

      documents = Object.values(documents)
         .filter(el => Array.isArray(el))
         .flat()
         .filter(document => new Date(document.date) >= today);

      const newDocuments = documents.filter(({ id }) => !account.data.documents.includes(id));

      callback(account => (account.data.documents = documents.map(document => document.id)));

      const embeds = newDocuments.map(({ libelle: name }) => ({
         title: `📄 Nouveau document : ${name}`,
      }));

      resolve({ embeds });
   });
