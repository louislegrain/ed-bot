const fetch = require('node-fetch');
const { Account } = require('../mongoose/models');
const { color } = require('../config');

module.exports = async (client, user) => {
   const res = await fetch(user.webhook).catch(() => false);
   const data = await res?.json?.()?.catch(() => false);

   if (!data) {
      console.displayError({
         error: 'Webhook fetch error',
         details: `User ${user.id}`,
      });
      return;
   }

   if (![10015, 10016, 50027].includes(data?.code)) {
      if (data.channel_id && user.channel.id !== data.channel_id) {
         user.channel.id = data.channel_id;
         user.save().catch(() => false);
      }
      return;
   }

   user.error = 'unable to send webhook';
   user.save().catch(() => false);
   Account.updateMany(
      { id: user.id, error: { $exists: false } },
      { error: 'unable to send webhook' },
      {},
      () => null
   );
   console.displayError({
      error: 'unable to send webhook',
      major: true,
      details: `Check webhook validity : user ${user.id}`,
   });
   (await client.users.fetch(user.id))
      .send({
         embeds: [
            {
               title: '❌ Compte désactivé',
               description: `Il semblerait que le webhook ne soit plus disponible.\nRends-toi sur [ton dashboard](<${process.env.BASE_URL}/dashboard>) pour réactiver ce compte.`,
               color,
            },
         ],
      })
      .catch(() => false);
};
