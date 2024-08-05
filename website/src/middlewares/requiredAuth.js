const fs = require('fs');
const path = require('path');

module.exports = (req, res, next) => {
   if (req.user) return next();
   if (!req.reqPath) return res.status(401).json({ error: 'You are not logged in.' });

   if (
      /^\s*<%#\s*loginRequired\s*%>/.test(
         fs.readFileSync(path.resolve(__dirname, `../views/${req.reqPath}.ejs`), {
            encoding: 'utf-8',
         })
      )
   )
      return res.redirect('/');

   next();
};
