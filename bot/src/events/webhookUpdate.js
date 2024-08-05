const { User } = require('../mongoose/models');
const { checkWebhookValidity, wait } = require('../utils');

module.exports = async (client, channel) => {
   await wait(5000);
   const users = await User.find({
      'channel.guild': channel.guildId,
      error: { $exists: false },
   }).catch(() => []);
   users.forEach(user => checkWebhookValidity(client, user));
};
