const fetch = require('node-fetch');
const { User } = require('../mongoose/models');

module.exports = async (req, res, next) => {
   req.user = req.session.discordId
      ? await User.findOne({ id: req.session.discordId }).catch(() => null)
      : null;

   if (!req.user || Date.now() - req.user.lastUpdate < 300000) return next();

   const userRes = await fetch('https://discord.com/api/v9/users/@me', {
      headers: {
         Authorization: `Bearer ${req.user.token}`,
      },
   }).catch(() => false);
   const data = await userRes?.json?.()?.catch(() => false);

   if (!userRes.ok || !data || !data.username) {
      const refreshRes = await fetch('https://discord.com/api/v9/oauth2/token', {
         method: 'POST',
         body: new URLSearchParams({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: req.user.refreshToken,
         }),
      }).catch(() => false);
      const refreshData = await refreshRes?.json?.()?.catch(() => false);

      if (
         !refreshRes.ok ||
         !refreshData ||
         !refreshData.access_token ||
         !refreshData.refresh_token
      ) {
         req.session.destroy();
         return res.redirect('/');
      }

      req.user.token = refreshData.access_token;
      req.user.refreshToken = refreshData.refresh_token;
      req.user.save().catch(() => false);

      return next();
   }

   req.user.username = data.username;
   req.user.avatar = data.avatar;
   req.user.lastUpdate = Date.now();
   req.user.save().catch(() => false);

   next();
};
