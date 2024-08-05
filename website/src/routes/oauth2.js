const fetch = require('node-fetch');
const { User, Account } = require('../mongoose/models');
const { sendMessage, sendWebhook, escapeMarkdown } = require('../utils');

module.exports = async (req, res) => {
   const { code } = req.query;
   if (!code || code.length < 1) return res.redirect('/');

   const fetchRes = await fetch('https://discord.com/api/v9/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
         client_id: process.env.CLIENT_ID,
         client_secret: process.env.CLIENT_SECRET,
         grant_type: 'authorization_code',
         code,
         redirect_uri: process.env.REDIRECT_URI,
      }),
   }).catch(() => false);
   const data = await fetchRes?.json?.()?.catch(() => false);
   const scopes = data?.scope?.split(' ') || [];

   const token = data?.access_token;
   const refreshToken = data?.refresh_token;

   if (!fetchRes.ok || !token || !refreshToken || !scopes.includes('identify')) {
      req.session.destroy();
      return res.redirect('/');
   }

   const userRes = await fetch('https://discord.com/api/v9/users/@me', {
      headers: {
         Authorization: `Bearer ${token}`,
      },
   }).catch(() => false);
   const userData = await userRes?.json?.()?.catch(() => false);

   if (!userRes.ok || !userData || !userData.id || !userData.username)
      return res.redirect('/');

   req.session.discordId = userData.id;

   if (
      !data.webhook ||
      !data.webhook.url ||
      !data.webhook.guild_id ||
      !data.webhook.channel_id ||
      !data.guild
   ) {
      await User.findOneAndUpdate(
         { id: userData.id },
         {
            id: userData.id,
            token,
            refreshToken,
            username: userData.username,
            avatar: userData.avatar,
            lastUpdate: Date.now(),
         },
         { upsert: true }
      );

      return res.redirect('/dashboard');
   }

   const doc = await User.findOneAndUpdate(
      { id: userData.id },
      {
         id: userData.id,
         token,
         refreshToken,
         username: userData.username,
         avatar: userData.avatar,
         webhook: data.webhook.url,
         channel: {
            id: data.webhook.channel_id,
            guild: data.webhook.guild_id,
         },
         lastUpdate: Date.now(),
         $unset: { error: '' },
      },
      { upsert: true }
   );
   await Account.updateMany({ id: userData.id }, { webhook: data.webhook.url });
   await Account.updateMany(
      {
         id: userData.id,
         error: { $in: ['bot no longer on the server', 'unable to send webhook'] },
      },
      { $unset: { error: '' } }
   );
   User.updateMany(
      { 'channel.guild': data.webhook.guild_id, error: 'bot no longer on the server' },
      { error: 'unable to send webhook' },
      {},
      () => null
   );

   sendWebhook(
      {
         embeds: [
            {
               title: '✅ ED Bot est prêt à être utilisé',
               description: doc?.webhook
                  ? 'Tu recevras désormais tes notifications dans ce salon.'
                  : `N'oublie pas d'ajouter ton compte EcoleDirecte sur [ton dashboard](<${process.env.BASE_URL}/dashboard>).\nTu recevras tes notifications dans ce salon.`,
               color: 937363,
            },
         ],
      },
      data.webhook.url
   ).catch(() => false);

   sendMessage(
      {
         content: `<@${userData.id}> a ajouté ED Bot au serveur **${escapeMarkdown(
            data.guild.name
         )}**`,
      },
      process.env.LOGS_CHANNEL
   ).catch(() => false);

   res.redirect('/dashboard');
};
