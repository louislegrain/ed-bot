const { User, Account } = require('../mongoose/models');
const { color } = require('../config');

module.exports = async (client, channel) => {
   const users = await User.find({
      'channel.guild': channel.guildId,
      'channel.id': channel.id,
      error: { $exists: false },
   }).catch(() => []);

   users.forEach(async user => {
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
         details: `Channel deleted : user ${user.id}`,
      });
      (await client.users.fetch(user.id))
         .send({
            embeds: [
               {
                  title: '❌ Compte désactivé',
                  description: `Il semblerait que le salon avec lequel tu as configuré ED Bot ne soit plus disponible.\nRends-toi sur [ton dashboard](<${process.env.BASE_URL}/dashboard>) pour réactiver ce compte.`,
                  color,
               },
            ],
         })
         .catch(() => false);
   });
};
