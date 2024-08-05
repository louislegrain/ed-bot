const { Account } = require('../mongoose/models');
const { relativeTime, notifications } = require('../utils');

module.exports = async (res, command) => {
   const id = command.member?.user?.id || command.user?.id;
   if (!id) {
      return res.json({
         type: 4,
         data: { content: "Impossible de récupérer l'utilisateur." },
      });
   }

   const accounts = await Account.find({ id }).catch(() => {
      res.json({
         type: 4,
         data: { content: 'Une erreur est survenue.' },
      });
      return false;
   });
   if (accounts === false) return;

   if (accounts.length > 10) {
      return res.json({
         type: 4,
         data: {
            content: `Tu as trop de comptes EcoleDirecte, rends-toi sur [ton dashboard](<${process.env.BASE_URL}/dashboard>) pour les gérer.`,
         },
      });
   } else if (accounts.length < 1) {
      return res.json({
         type: 4,
         data: {
            content: `Tu n'as pas ajouté de comptes EcoleDirecte, rends-toi sur [ton dashboard](<${process.env.BASE_URL}/dashboard>) pour le faire.`,
         },
      });
   }

   res.json({
      type: 4,
      data: {
         content: `Rends-toi sur [ton dashboard](<${process.env.BASE_URL}/dashboard>) pour gérer tes comptes.`,
         embeds: accounts.map(account => {
            const accountNotifications = account.user.modules.filter(module =>
               account.notifications.includes(module)
            );
            const seconds = Math.ceil((Date.now() - account.lastUpdate) / 1000);

            return {
               title: `${account.user.firstName} ${account.user.lastName}${
                  account.user.class.name ? ` - ${account.user.class.name}` : ''
               }`,
               color: 937363,
               fields: [
                  {
                     name: 'Notifications',
                     value:
                        accountNotifications.length > 0
                           ? accountNotifications
                                .map(notification => notifications[notification])
                                .join(', ')
                                .toLowerCase()
                           : 'Aucune notification activée.',
                  },
                  {
                     name: 'Dernière mise à jour',
                     value: isNaN(seconds) ? 'Jamais' : relativeTime(seconds),
                  },
                  {
                     name: 'Status',
                     value: account.error
                        ? `❌ Une erreur est survenue, rends-toi sur [ton dashboard](<${process.env.BASE_URL}/dashboard>) pour réactiver ce compte.`
                        : '✅',
                  },
               ],
            };
         }),
      },
   });
};
