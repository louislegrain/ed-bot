const { Session } = require('api-ecoledirecte');
const cron = require('node-cron');
const { decrypt } = require('../crypto');

let cachedSessions = [];

cron.schedule('0 */6 * 8 *', () => (cachedSessions = []));
cron.schedule('0 */6 1-10 9 *', () => (cachedSessions = []));

module.exports.clearSession = account => {
   const index = cachedSessions.findIndex(
      cachedSession =>
         cachedSession.username === account.username &&
         cachedSession.password.iv === account.password.iv &&
         cachedSession.password.content === account.password.content
   );
   if (index !== -1) cachedSessions.splice(index, 1);
};

module.exports.getSession = account => {
   return new Promise(async (resolve, reject) => {
      let session = cachedSessions.find(
         cachedSession =>
            cachedSession.username === account.username &&
            cachedSession.password.iv === account.password.iv &&
            cachedSession.password.content === account.password.content
      );

      if (!session) {
         session = new Session();
         session.username = account.username;
         session.password = account.password;
         session.logged = false;
         session.loginPromise = session.login(
            account.username,
            decrypt(account.password),
            account.fa
         );
         session.loginPromise
            .then(() => (session.logged = true))
            .catch(() => module.exports.clearSession(account));
         cachedSessions.push(session);
      }
      if (!session.logged) {
         const success = await session.loginPromise.catch(err => {
            reject({ error: err.code, details: err });
            return false;
         });
         if (success === false) return;
      }

      resolve(session);
   });
};
