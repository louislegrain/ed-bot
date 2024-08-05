const { Schema, model } = require('mongoose');

const User = new Schema({
   id: { type: String, required: true },
   token: { type: String, required: true },
   refreshToken: { type: String, required: true },
   username: { type: String, required: true },
   avatar: { type: String, required: false },
   webhook: { type: String, required: false },
   channel: {
      id: { type: String, required: false },
      guild: { type: String, required: false },
   },
   lastUpdate: { type: Number, required: true },
   error: { type: String, required: false },
});

module.exports = model('User', User);
