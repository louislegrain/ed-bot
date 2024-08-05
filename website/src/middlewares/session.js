const session = require('express-session');
const MongoStore = require('connect-mongo');
const production = require('../config');

module.exports = session({
   secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized: false,
   store: MongoStore.create({ mongoUrl: process.env.DB_CONNECTION }),
   cookie: production
      ? {
           secure: true,
           maxAge: 63115200000,
           domain: '.edbot.fr',
        }
      : {
           maxAge: 63115200000,
        },
});
