const { relativeTime, notifications } = require('../utils');

module.exports = (req, res, next) => {
   req.data = { path: req.path, query: req.query, notifications, relativeTime };
   next();
};
