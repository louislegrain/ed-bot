const { Account } = require('../mongoose/models');

module.exports = async (req, res, next) => {
   const accounts = await Account.find({ id: req.user.id }).catch(() => {
      req.data.accounts = {
         error: 'Impossible de récupérer les comptes dans la base de données.',
         data: [],
      };
      return false;
   });
   if (accounts === false) return next();

   req.data.accounts = { data: accounts };
   next();
};
