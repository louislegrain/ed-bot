const { User, Account } = require('../mongoose/models');
const { color } = require('../config');

module.exports = async (client, guild) => {
   const users = await User.find({
      'channel.guild': guild.id,
      error: { $exists: false },
   }).catch(() => []);

   users.forEach(async user => {
      user.error = 'bot no longer on the server';
      user.save().catch(() => false);
      Account.updateMany(
         { id: user.id, error: { $exists: false } },
         { error: 'bot no longer on the server' },
         {},
         () => null
      );
      console.displayError({
         error: 'bot no longer on the server',
         major: true,
         details: `User ${user.id}`,
      });
      (await client.users.fetch(user.id))
         .send({
            embeds: [
               {
                  title: '❌ Compte désactivé',
                  description: `Il semblerait que ED Bot ne soit plus sur ton serveur.\nRends-toi sur [ton dashboard](<${process.env.BASE_URL}/dashboard>) pour réactiver ce compte.`,
                  color,
               },
            ],
         })
         .catch(() => false);
   });
};
