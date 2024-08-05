const { Schema, model } = require('mongoose');
const notifications = { ...require('../../utils/notifications.json') };

Object.keys(notifications).forEach(
   key => (notifications[key] = { type: Array, required: false })
);

const Account = new Schema({
   id: { type: String, required: true },
   user: {
      id: { type: Number, required: true },
      firstName: { type: String, required: false },
      lastName: { type: String, required: false },
      class: {
         id: { type: Number, required: false },
         name: { type: String, required: false },
      },
      modules: { type: Array, required: true, default: Object.keys(notifications) },
   },
   username: { type: String, required: true },
   password: {
      iv: { type: String, required: true },
      content: { type: String, required: true },
   },
   fa: {
      cn: { type: String, required: false },
      cv: { type: String, required: false },
   },
   webhook: { type: String, required: true },
   notifications: { type: Array, required: true, default: Object.keys(notifications) },
   data: notifications,
   lastUpdate: { type: Number, required: false },
   error: { type: String, required: false },
   closedSchool: { type: Boolean, required: false },
});

module.exports = model('Account', Account);
