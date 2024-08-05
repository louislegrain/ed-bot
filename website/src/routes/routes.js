module.exports = app => {
   app.get('/login', require('./login'));
   app.get('/authorize', require('./authorize'));
   app.get('/logout', require('./logout'));
   app.get('/discord', require('./discord'));
   app.get('/oauth2', require('./oauth2'));
   app.use('/api', require('./api'));
   app.use(
      '/',
      require('../middlewares/getUser'),
      require('../middlewares/views'),
      require('../middlewares/requiredAuth')
   );
   app.get('/dashboard', require('../middlewares/getAccounts'));
   app.use('/', require('./views'));
};
