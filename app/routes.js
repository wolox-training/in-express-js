const users = require('./controllers/users');

exports.init = app => {
  app.post('/users', [], users.signup);
  app.post('/users/sessions', [], users.signin);
};
