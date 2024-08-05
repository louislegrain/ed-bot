const { Account } = require('../../../mongoose/models');
const { notifications } = require('../../../utils');

module.exports = async (req, res) => {
   const { id } = req.params;
   if (!id || id.length < 1) return res.status(400).json({ error: 'Invalid ID.' });

   const account = await Account.findOne({ id: req.user.id, 'user.id': id }).catch(() => null);
   if (!account) return res.status(404).json({ error: "Ce compte n'existe pas." });

   account.notifications = [
      ...new Set([
         ...Object.keys(notifications).filter(notification => req.body[notification] === 'on'),
         ...account.notifications.filter(
            notification => !account.user.modules.includes(notification)
         ),
      ]),
   ];

   const success = await account.save().catch(() => false);
   res.json({ success: !!success });
};
