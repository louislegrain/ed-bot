const { Schema, model } = require('mongoose');

const PendingAccount = new Schema({
   id: { type: String, required: true },
   token: { type: String, required: true },
   userAgent: { type: String, required: true },
});

module.exports = model('PendingAccount', PendingAccount);
