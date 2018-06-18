const chai = require('chai'),
  chaiHttp = require('chai-http'),
  dictum = require('dictum.js'),
  server = require('../../app'),
  nock = require('nock'),
  User = require('../../app/models').users,
  Album = require('../../app/models').albums,
  config = require('../../config'),
  should = chai.should();

describe('/GET albums', () => {
  const newUser = {
    firstname: 'nacho',
    lastname: 'Nieva',
    password: 'password1',
    username: 'myusername',
    email: 'ignacio.nieva@wolox.com.ar',
    isadmin: true
  };
  beforeEach(done => {
    User.create(newUser).then(res => {
      done();
    });
  });
  const correctUser = {
    email: 'ignacio.nieva@wolox.com.ar',
    password: 'password1'
  };
  it('should fail listing albums because user is not logged in', done => {
    chai
      .request(server)
      .get('/albums')
      .catch(err => {
        err.should.have.status(401);
      })
      .then(() => done());
  });
  it('should work by listing albums', done => {
    const correctResponse = nock(config.common.database.albumsUrl)
      .get('/albums')
      .reply(200, [
        {
          userId: 1,
          id: 1,
          title: 'quidem molestiae enim'
        }
      ]);
    chai
      .request(server)
      .post('/users/sessions')
      .send(correctUser)
      .then(res => {
        chai
          .request(server)
          .get('/albums')
          .set('token', res.text)
          .then(res => {
            res.should.have.status(200);
            res.body.should.exist;
            dictum.chai(res, 'list of albums');
            done();
          });
      });
  });
  it('should list be empty', done => {
    const badResponse = nock(config.common.database.albumsUrl)
      .get('/albums')
      .reply(200, []);
    chai
      .request(server)
      .post('/users/sessions')
      .send(correctUser)
      .then(res => {
        chai
          .request(server)
          .get('/albums')
          .set('token', res.text)
          .then(res => {
            res.should.have.status(200);
            res.body.should.exist;
            dictum.chai(res, 'empty list of albums');
            done();
          });
      });
  });
});

describe('/POST albums/purchase', () => {
  const newUser = {
    firstname: 'nacho',
    lastname: 'Nieva',
    password: 'password1',
    username: 'myusername',
    email: 'ignacio.nieva@wolox.com.ar',
    isadmin: true
  };
  const newPurchase = {
    title: 'quidem molestiae enim'
  };
  beforeEach(done => {
    User.create(newUser).then(res => {
      newPurchase.userid = res.id;
      newPurchase.id = 1;
      Album.create(newPurchase).then(() => {
        done();
      });
    });
  });
  const correctUser = {
    email: 'ignacio.nieva@wolox.com.ar',
    password: 'password1'
  };
  it('should fail purchasing album because user is not logged in', done => {
    chai
      .request(server)
      .post('/albums/purchase?id=1')
      .catch(err => {
        err.should.have.status(401);
      })
      .then(() => done());
  });
  it('should work by purchasing album id:2', done => {
    const correctResponse = nock(config.common.database.albumsUrl)
      .get('/albums/2')
      .reply(200, {
        userId: 2,
        id: 2,
        title: 'quidem molestiae enim'
      });
    chai
      .request(server)
      .post('/users/sessions')
      .send(correctUser)
      .then(res => {
        chai
          .request(server)
          .post('/albums/purchase?id=2')
          .set('token', res.text)
          .then(res => {
            res.should.have.status(200);
            res.body.should.exist;
            dictum.chai(res, 'list of albums');
            done();
          });
      });
  });
  it('should fail purchasing album because user already owns it', done => {
    const correctResponse2 = nock(config.common.database.albumsUrl)
      .get('/albums/1')
      .reply(200, {
        userId: 1,
        id: 1,
        title: 'quidem molestiae enim'
      });
    chai
      .request(server)
      .post('/users/sessions')
      .send(correctUser)
      .then(res => {
        chai
          .request(server)
          .post('/albums/purchase?id=1')
          .set('token', res.text)
          .catch(err => {
            err.should.have.status(400);
          })
          .then(() => done());
      });
  });
});

describe('/GET users/:id/albums', () => {
  const adminUser = {
    firstname: 'nacho',
    lastname: 'Nieva',
    password: 'password1',
    username: 'myusername',
    email: 'ignacio.nieva@wolox.com.ar',
    isadmin: true
  };
  const newUser = {
    firstname: 'try',
    lastname: 'try',
    password: 'passwordtry',
    username: 'tryusername',
    email: 'try@wolox.com.ar',
    isadmin: false
  };
  const tryUser = {
    firstname: 'try2',
    lastname: 'try2',
    password: 'passwordtry2',
    username: 'tryusername2',
    email: 'try2@wolox.com.ar',
    isadmin: false
  };
  const tryAdminUser = {
    firstname: 'try3',
    lastname: 'try3',
    password: 'passwordtry3',
    username: 'tryusername3',
    email: 'try3@wolox.com.ar',
    isadmin: true
  };
  beforeEach(done => {
    User.create(newUser).then(res => {
      User.create(adminUser).then(res2 => {
        done();
      });
    });
  });
  const correctUser = {
    email: 'ignacio.nieva@wolox.com.ar',
    password: 'password1'
  };
  const notAdminUser = {
    email: 'try@wolox.com.ar',
    password: 'passwordtry'
  };
  it('should fail listing purchased albums because user is not logged in', done => {
    chai
      .request(server)
      .get('/users/1/albums')
      .catch(err => {
        err.should.have.status(401);
      })
      .then(() => done());
  });
  it('should work by listing albums', done => {
    const correctResponse = nock(config.common.database.albumsUrl)
      .get('/albums/1')
      .reply(200, {
        userId: 1,
        id: 1,
        title: 'quidem molestiae enim'
      });
    chai
      .request(server)
      .post('/users/sessions')
      .send(notAdminUser)
      .then(res => {
        chai
          .request(server)
          .post('/albums/purchase?id=1')
          .set('token', res.text)
          .then(res2 => {
            chai
              .request(server)
              .get(`/users/${res2.body.album.userid}/albums`)
              .set('token', res.text)
              .then(res => {
                res.should.have.status(200);
                res.body.should.exist;
                dictum.chai(res, 'list of purchased albums');
                done();
              });
          });
      });
  });
  it('should work by listing albums', done => {
    const correctResponse = nock(config.common.database.albumsUrl)
      .get('/albums/1')
      .reply(200, {
        userId: 1,
        id: 1,
        title: 'quidem molestiae enim'
      });
    chai
      .request(server)
      .post('/users/sessions')
      .send(correctUser)
      .then(res => {
        chai
          .request(server)
          .post('/albums/purchase?id=1')
          .set('token', res.text)
          .then(res2 => {
            chai
              .request(server)
              .get(`/users/${res2.body.album.userid}/albums`)
              .set('token', res.text)
              .then(res => {
                res.should.have.status(200);
                res.body.should.exist;
                dictum.chai(res, 'list of purchased albums');
                done();
              });
          });
      });
  });
  it('should work by listing albums', done => {
    const correctResponse = nock(config.common.database.albumsUrl)
      .get('/albums/1')
      .reply(200, {
        userId: 1,
        id: 1,
        title: 'quidem molestiae enim'
      });
    User.create(tryUser).then(inserted => {
      chai
        .request(server)
        .post('/users/sessions')
        .send(notAdminUser)
        .then(res => {
          chai
            .request(server)
            .post('/albums/purchase?id=1')
            .set('token', res.text)
            .then(res2 => {
              chai
                .request(server)
                .get(`/users/${inserted.userid}/albums`)
                .set('token', res.text)
                .then(res => {
                  res.should.have.status(200);
                  res.body.should.exist;
                  dictum.chai(res, 'list of purchased albums');
                  done();
                });
            });
        });
    });
  });
  it('should fail by listing albums from admin user', done => {
    const correctResponse = nock(config.common.database.albumsUrl)
      .get('/albums/1')
      .reply(200, {
        userId: 1,
        id: 1,
        title: 'quidem molestiae enim'
      });
    User.create(tryAdminUser).then(inserted => {
      chai
        .request(server)
        .post('/users/sessions')
        .send(notAdminUser)
        .then(res => {
          chai
            .request(server)
            .post('/albums/purchase?id=1')
            .set('token', res.text)
            .then(res2 => {
              chai
                .request(server)
                .get(`/users/${inserted.userid}/albums`)
                .set('token', res.text)
                .then(res => {
                  res.should.have.status(200);
                  res.body.should.exist;
                  dictum.chai(res, 'list of purchased albums');
                  done();
                });
            });
        });
    });
  });
});

describe('/GET users/albums/:id/photos', () => {
  const adminUser = {
    firstname: 'nacho',
    lastname: 'Nieva',
    password: 'password1',
    username: 'myusername',
    email: 'ignacio.nieva@wolox.com.ar',
    isadmin: true
  };
  const newUser = {
    firstname: 'try',
    lastname: 'try',
    password: 'passwordtry',
    username: 'tryusername',
    email: 'try@wolox.com.ar',
    isadmin: false
  };
  const tryUser = {
    firstname: 'try2',
    lastname: 'try2',
    password: 'passwordtry2',
    username: 'tryusername2',
    email: 'try2@wolox.com.ar',
    isadmin: false
  };
  const tryAdminUser = {
    firstname: 'try3',
    lastname: 'try3',
    password: 'passwordtry3',
    username: 'tryusername3',
    email: 'try3@wolox.com.ar',
    isadmin: true
  };
  beforeEach(done => {
    User.create(newUser).then(res => {
      User.create(adminUser).then(res2 => {
        done();
      });
    });
  });
  const correctUser = {
    email: 'ignacio.nieva@wolox.com.ar',
    password: 'password1'
  };
  const notAdminUser = {
    email: 'try@wolox.com.ar',
    password: 'passwordtry'
  };
  it('should fail listing purchased photos because user is not logged in', done => {
    chai
      .request(server)
      .get('/users/albums/1/photos')
      .catch(err => {
        err.should.have.status(401);
      })
      .then(() => done());
  });

  it('should work by listing album photos', done => {
    const correctResponse = nock(config.common.database.albumsUrl)
      .get('/albums/1')
      .reply(200, {
        userId: 1,
        id: 1,
        title: 'quidem molestiae enim'
      });
    const correctPhotoResponse = nock(config.common.database.albumsUrl)
      .get('/albums/1/photos')
      .reply(200, [
        {
          albumId: 1,
          id: 1,
          title: 'accusamus beatae ad facilis cum similique qui sunt',
          url: 'http://placehold.it/600/92c952',
          thumbnailUrl: 'http://placehold.it/150/92c952'
        }
      ]);
    chai
      .request(server)
      .post('/users/sessions')
      .send(notAdminUser)
      .then(res => {
        chai
          .request(server)
          .post('/albums/purchase?id=1')
          .set('token', res.text)
          .then(res2 => {
            chai
              .request(server)
              .get(`/users/albums/${res2.body.album.id}/photos`)
              .set('token', res.text)
              .then(res => {
                res.should.have.status(200);
                res.body.should.exist;
                dictum.chai(res, 'list of purchased albums');
                done();
              });
          });
      });
  });
});
