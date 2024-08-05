const fetch = require('node-fetch');

module.exports = (message, channel) =>
   new Promise((resolve, reject) => {
      fetch(`https://discord.com/api/v10/channels/${channel}/messages`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot ${process.env.SERVER_BOT_TOKEN}`,
         },
         body: JSON.stringify(message),
      })
         .then(res => res.json())
         .then(data => resolve(data))
         .catch(err => reject(err));
   });
