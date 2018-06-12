const users = require('./controllers/users'),
  albums = require('./controllers/album'),
  auth = require('./middlewares/auth');

exports.init = app => {
  app.post('/users', [], users.signup);
  app.post('/users/sessions', [], users.signin);
  app.get('/users/list', auth.isLoggedIn, users.listUsers);
  app.post('/admin/users', [auth.isLoggedIn, auth.isAdminLoggedIn], users.goAdmin);
  app.get('/albums', auth.isLoggedIn, albums.listAlbums);
};
