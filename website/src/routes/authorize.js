module.exports = (req, res) =>
   res.redirect(
      `https://discord.com/api/oauth2/authorize?client_id=${
         process.env.CLIENT_ID
      }&permissions=0&redirect_uri=${encodeURIComponent(
         process.env.REDIRECT_URI
      )}&response_type=code&scope=${
         req.session.discordId ? '' : 'identify%20'
      }bot%20webhook.incoming%20applications.commands`
   );
