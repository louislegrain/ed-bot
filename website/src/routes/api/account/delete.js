const { Account } = require('../../../mongoose/models');

module.exports = (req, res) => {
   const { id } = req.params;
   if (!id || id.length < 1) return res.status(400).json({ error: 'Invalid ID.' });

   Account.deleteOne({ id: req.user.id, 'user.id': id }, {}, err =>
      res.json({ success: !err })
   );
};
