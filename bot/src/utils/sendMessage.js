const fetch = require('node-fetch');
const { truncate } = require('./');
const { color } = require('../config');

module.exports = (message, account) => {
   return new Promise(async (resolve, reject) => {
      if (!message.content && message.embeds?.length < 1) return resolve();

      let messages = [];

      if (message.embeds) {
         message.embeds = message.embeds.map(embed => {
            if (embed.title) embed.title = truncate(embed.title, 256);
            embed.fields?.forEach(field => {
               if (field.value) field.value = truncate(field.value, 1024);
            });

            return {
               color,
               author: {
                  name: 'ED Bot',
                  url: process.env.BASE_URL,
                  icon_url: process.env.BASE_URL + '/assets/logos/ed_bot_logo_50px.png',
               },
               footer: {
                  text: `${account.user.firstName} ${account.user.lastName}${
                     account.user.class?.name ? ` - ${account.user.class.name}` : ''
                  }`,
               },
               ...embed,
            };
         });
         for (let i = 0; i < Math.ceil(message.embeds.length / 10); i++) {
            const embeds = message.embeds.slice(i * 10, (i + 1) * 10);
            messages.push(i === 0 ? { ...message, embeds } : { embeds });
         }
      } else {
         messages = [message];
      }

      for (const message of messages) {
         const res = await fetch(account.webhook + '?wait=true', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
         }).catch(() => false);
         const data = await res?.json?.()?.catch(() => false);

         if (!res.ok || !data || !data.id) {
            if ([10015, 10016, 50027].includes(data?.code)) {
               reject({
                  error: 'unable to send webhook',
                  major: true,
                  details: { data, message },
               });
            } else {
               reject({
                  error: 'Failed to send webhook.',
                  details: { data, message },
               });
            }
            return;
         }
      }

      resolve();
   });
};
