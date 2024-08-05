const fs = require('fs');
const path = require('path');

module.exports = async (req, res, next) => {
   if (req.path === '/') {
      req.reqPath = 'index';
   } else {
      req.reqPath = req.path.match(/^\/(.*?)\/?$/)?.[1];
   }

   if (
      !req.reqPath ||
      ['error'].includes(req.reqPath) ||
      path.relative('/views', `/views/${req.reqPath}`).startsWith('..') ||
      req.reqPath.startsWith('components') ||
      !fs.existsSync(path.resolve(__dirname, `../views/${req.reqPath}.ejs`))
   )
      return res.status(404).render('error', { user: req.user, ...req.data });

   next();
};
