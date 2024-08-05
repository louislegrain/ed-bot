module.exports = (req, res) =>
   res.redirect(
      `https://discord.com/api/oauth2/authorize?client_id=${
         process.env.CLIENT_ID
      }&redirect_uri=${encodeURIComponent(
         process.env.REDIRECT_URI
      )}&response_type=code&scope=identify&prompt=none`
   );
