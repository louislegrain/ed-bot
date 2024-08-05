const production = process.env.NODE_ENV === 'production';
require('dotenv').config({ path: production ? './.env' : './.env.development' });

if (process.argv[2] !== 'shard')
   console.log(`Environnement : ${production ? 'production' : 'dev'}`);

module.exports = require(production ? './config.json' : './config.dev.json');
