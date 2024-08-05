const production = process.env.NODE_ENV === 'production';
require('dotenv').config({ path: production ? './.env' : './.env.development' });

console.log(`Environnement : ${production ? 'production' : 'dev'}`);

module.exports = production;
