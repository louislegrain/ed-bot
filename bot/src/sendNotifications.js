const { Account, User } = require('./mongoose/models');
const {
   sendMessage,
   session: { getSession, clearSession },
   notificationCodes,
   majorErrors,
} = require('./utils');
const notifications = { ...require('./utils/notifications.json') };

Object.keys(notifications).forEach(notification => {
   notifications[notification] = require(`./notifications/${notification}`);
});

function main(account) {
   return new Promise(async (resolve, reject) => {
      const session = await getSession(account).catch(err => {
         reject(err);
         return false;
      });
      if (session === false) return;

      const eleve = session.accounts.find(student => student.id === account.user.id);
      if (!eleve)
         return reject({
            error: 'student is no longer linked to this account',
            major: true,
         });

      if (!eleve.classCheck) {
         eleve.classCheck = true;

         const oldClass = account.user.class.id;
         account.user = {
            id: eleve.id,
            firstName: eleve.prenom,
            lastName: eleve.nom,
            class: {
               id: eleve.classe.id,
               name: eleve.classe.nom,
            },
            modules: eleve.modules
               .filter(module => module.enable && notificationCodes[module.code])
               .map(module => notificationCodes[module.code]),
         };

         if (eleve.classe.id && oldClass !== eleve.classe.id) {
            const success = await sendMessage(
               {
                  embeds: [
                     {
                        title: '🎒 Nouvelle classe',
                        fields: [
                           {
                              name: 'ID',
                              value: eleve.classe.id,
                              inline: true,
                           },
                           {
                              name: 'Nom de la classe',
                              value: eleve.classe.nom || 'Vide',
                              inline: true,
                           },
                        ],
                     },
                  ],
               },
               account
            ).catch(err => {
               reject(err);
               return false;
            });
            if (success === false) return;
         }
      }

      const promises = await Promise.allSettled(
         account.notifications
            .filter(notification => account.user.modules.includes(notification))
            .map(
               notification =>
                  new Promise(async (resolve, reject) => {
                     if (!notifications[notification])
                        return reject({
                           error: "This notification doesn't exists.",
                           details: notification,
                        });

                     let callback = null;
                     const message = await notifications[notification](
                        account,
                        eleve,
                        func => (callback = func)
                     ).catch(err => {
                        if (err.code === 210) {
                           resolve();
                           return false;
                        }
                        err = {
                           error: err.code,
                           details: `[${notification}] ${JSON.stringify(err)}`,
                        };

                        if ([520, 525].includes(err.error)) {
                           reject(err);
                           if (session.expired) return false;
                           session.expired = true;
                           clearSession(account);
                           return false;
                        } else if (err.error === 403) {
                           account.user.modules = account.user.modules.filter(
                              module => module !== notification
                           );
                        }

                        err.details = 'Minor error ' + err.details;
                        console.displayError(err, account);
                        resolve();
                        return false;
                     });

                     if (message === false) return;
                     sendMessage(message, account)
                        .then(() => {
                           callback?.(account);
                           resolve();
                        })
                        .catch(reject);
                  })
            )
      );
      const err = promises.find(promise => promise.status === 'rejected');
      if (err) return reject(err.reason);

      resolve();
   });
}

let lastClosedSchoolUpdate = null;

module.exports = async () => {
   const closedSchool =
      !lastClosedSchoolUpdate || Date.now() - lastClosedSchoolUpdate > 21600000;
   if (closedSchool) lastClosedSchoolUpdate = Date.now();

   const accounts = await Account.find(
      {
         error: { $exists: false },
         closedSchool: closedSchool ? true : { $ne: true },
         'user.id': { $mod: [process.env.SHARD_NB, process.env.SHARD_ID] },
      },
      '_id',
      {
         sort: { _id: -1 },
      }
   ).catch(() => false);
   if (accounts === false) {
      console.error('Unable to fetch accounts.');
      return setTimeout(() => module.exports(), 300000);
   }

   const length = accounts.length || 1;
   const interval = Math.max(300000 / length, 1000);

   setTimeout(() => module.exports(), interval * length);
   console.log(
      `Starting a new cycle : ${interval * length}ms | ${
         accounts.length
      } accounts | closed accounts : ${closedSchool}`
   );

   accounts.forEach((account, i) => {
      setTimeout(async () => {
         account = await Account.findOne({
            _id: account._id,
            error: { $exists: false },
         }).catch(() => false);
         if (!account) return;

         const closedSchoolOldState = account.closedSchool;
         account.closedSchool = undefined;
         await main(account)
            .then(() => (account.lastUpdate = Date.now()))
            .catch(err => {
               if ([516, 535].includes(err.error)) {
                  account.lastUpdate = Date.now();
                  account.closedSchool = true;
                  if (closedSchoolOldState) return;
               } else if (err.major || majorErrors[err.error]) {
                  account.error = majorErrors[err.error] || err.error;
                  if (account.error === 'unable to send webhook') {
                     User.findOneAndUpdate(
                        { id: account.id, error: { $exists: false } },
                        { error: 'unable to send webhook' },
                        {},
                        () => null
                     );
                  }
                  sendMessage(
                     {
                        embeds: [
                           {
                              title: '❌ Une erreur est survenue',
                              description: `Rends-toi sur [ton dashboard](<${process.env.BASE_URL}/dashboard>) pour réactiver ce compte.`,
                           },
                        ],
                     },
                     account
                  ).catch(() => false);
               }
               console.displayError(err, account);
            });

         account.save().catch(() => false);
      }, interval * i);
   });
};
