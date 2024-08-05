const { Client, Intents } = require('discord.js');
const mongoose = require('mongoose');
require('./config');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_WEBHOOKS] });

require('./handlers/events')(client);

(async () => {
   mongoose.set('strictQuery', true);
   const success = await mongoose.connect(process.env.DB_CONNECTION).catch(err => {
      console.error(`An error occurred while connecting to MongoDB : ${err}`);
      return false;
   });
   if (success === false) return;

   client.login(process.env.TOKEN);
})();
