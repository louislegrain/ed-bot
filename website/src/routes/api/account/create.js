const { Session } = require('api-ecoledirecte');
const { Account, PendingAccount } = require('../../../mongoose/models');
const { encrypt } = require('../../../crypto');
const { notificationCodes } = require('../../../utils');

module.exports = async (req, res) => {
   const { username, password, token, faChoice } = req.body;
   if (
      !username ||
      !password ||
      username.length < 1 ||
      password.length < 1 ||
      !!token !== !!faChoice
   )
      return res.status(400).json({ error: 'Tous les champs doivent être remplis.' });
   if (!req.user.webhook || req.user.error)
      return res
         .status(401)
         .json({ error: "Impossible d'ajouter un compte avant d'avoir invité le bot." });

   let session = new Session();
   let faCreds = {};

   if (token) {
      const pendingAccount = await PendingAccount.findOne({
         id: req.user.id,
         token,
      }).catch(() => null);

      if (!pendingAccount) return res.status(401).json({ error: 'Une erreur est survenue' });

      session = new Session(pendingAccount.token, pendingAccount.userAgent);

      faCreds = await session.fetch2FACreds(faChoice).catch(err => {
         res.status(401).json({ error: typeof err === 'string' ? err : err.message });
         return false;
      });
      if (faCreds === false) return;
   }

   const loginSuccess = await session.login(username, password, faCreds).catch(err => {
      if (err.code !== 250) {
         res.status(401).json({ error: typeof err === 'string' ? err : err.message });
         return false;
      }

      session
         .fetch2FAQuestion(username, password)
         .then(data => {
            PendingAccount.create(
               {
                  id: req.user.id,
                  token: session.token,
                  userAgent: session.userAgent,
               },
               dbErr => {
                  if (dbErr) return res.status(500).json({ success: false });

                  res.status(401).json({
                     question: data.rawQuestion,
                     propositions: data.rawPropositions,
                     token: session.token,
                     error: err.message,
                     success: false,
                  });
               }
            );
         })
         .catch(err => {
            res.status(401).json({ error: typeof err === 'string' ? err : err.message });
         });

      return false;
   });
   if (loginSuccess === false) return;

   const encryptedPassword = encrypt(password);

   const dbSuccess = await Promise.all(
      session.accounts.map(
         account =>
            new Promise((resolve, reject) => {
               Account.findOneAndUpdate(
                  { id: req.user.id, 'user.id': account.id },
                  {
                     id: req.user.id,
                     user: {
                        id: account.id,
                        firstName: account.prenom,
                        lastName: account.nom,
                        class: {
                           id: account.classe.id,
                           name: account.classe.nom,
                        },
                        modules: account.modules
                           .filter(module => module.enable && notificationCodes[module.code])
                           .map(module => notificationCodes[module.code]),
                     },
                     username,
                     password: encryptedPassword,
                     fa: faCreds,
                     webhook: req.user.webhook,
                     $unset: { error: '' },
                  },
                  { upsert: true },
                  err => (err ? reject() : resolve())
               );
            })
      )
   ).catch(() => {
      res.status(500).json({ error: 'Le serveur a rencontré un problème.' });
      return false;
   });
   if (dbSuccess === false) return;

   res.json({ success: true });
};
