const { formatDate } = require('../utils');

module.exports = (account, eleve, callback) =>
   new Promise(async (resolve, reject) => {
      let emails = await eleve.fetchMessages().catch(err => {
         reject(err);
         return false;
      });
      if (emails === false) return;

      const today = new Date().setHours(-48, -15, 0, 0);

      emails = emails.messages?.received;
      if (!emails) return resolve({ embeds: [] });
      emails = emails
         .filter(email => new Date(email.date) >= today)
         .sort((a, b) => new Date(a.date) - new Date(b.date));

      const newEmails = emails.filter(({ id }) => !account.data.mail.includes(id));

      callback(account => (account.data.mail = emails.map(email => email.id)));

      const embeds = newEmails.map(({ subject, date, from: { name } = {} }) => ({
         title: `📥 Nouveau message${subject ? ` : ${subject}` : ''}`,
         fields: [
            {
               name: 'De',
               value: name,
               inline: true,
            },
            {
               name: 'Date',
               value: formatDate(date, { time: true }),
               inline: true,
            },
         ].filter(field => !/null|undefined|^$/.test(field.value)),
      }));

      resolve({ embeds });
   });
