const { ShardingManager } = require('discord.js');
const { AutoPoster } = require('topgg-autoposter');
const mongoose = require('mongoose');
const path = require('path');
require('./config');
require('./utils/displayError');
const sendNotifications = require('./sendNotifications');

(async () => {
   mongoose.set('strictQuery', true);
   const success = await mongoose.connect(process.env.DB_CONNECTION).catch(err => {
      console.error(`An error occurred while connecting to MongoDB : ${err}`);
      return false;
   });
   if (success === false) return;
   console.log('Program started successfully');

   sendNotifications();
})();

if (process.env.SHARD_ID === '0') {
   const manager = new ShardingManager(path.resolve(__dirname, './bot.js'), {
      token: process.env.TOKEN,
      shardArgs: ['shard'],
   });

   manager.on('shardCreate', shard => {
      console.log(`Shard ${shard.id + 1}/${manager.totalShards} created`);
   });

   manager.spawn();
   if (process.env.TOPGG_TOKEN) AutoPoster(process.env.TOPGG_TOKEN, manager);
}
