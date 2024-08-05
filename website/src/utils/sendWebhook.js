const fetch = require('node-fetch');

module.exports = (message, webhook) =>
   new Promise((resolve, reject) => {
      fetch(webhook, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(message),
      })
         .then(res => res.json())
         .then(data => resolve(data))
         .catch(err => reject(err));
   });
