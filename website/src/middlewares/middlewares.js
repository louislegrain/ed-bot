module.exports = app => {
   app.use(require('./static'));
   app.use(require('./session'));
   app.use(require('./body'));
   app.use(require('./additionnalData'));
};
