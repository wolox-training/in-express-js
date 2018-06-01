const users = require('./controllers/users'),
  userValidator = require('./middlewares/user'),
  auth = require('./middlewares/auth');

exports.init = app => {
  app.post('/users', [], users.signup);
  app.post('/users/sessions', [], users.signin);
  app.get('/users', auth.isLoggedIn, users.listUsers);
};
