const chai = require('chai'),
  chaiHttp = require('chai-http'),
  dictum = require('dictum.js'),
  server = require('../../app'),
  nock = require('nock'),
  User = require('../../app/models').users,
  should = chai.should();

chai.use(chaiHttp);

describe('/POST users', () => {
  const badPassword = {
    firstname: 'Nacho',
    lastname: 'Nieva',
    username: 'myusername',
    password: '1234',
    email: 'ignacio.nieva@wolox.com.ar'
  };

  it('should fail sign up because of incorrect password', done => {
    chai
      .request(server)
      .post('/users')
      .send(badPassword)
      .catch(err => {
        err.should.have.status(400);
      })
      .then(() => done());
  });

  const noEmail = {
    firstname: 'Nacho',
    lastname: 'Nieva',
    password: 'password1',
    username: 'myusername'
  };

  it('should fail sign up because of missing E-mail', done => {
    chai
      .request(server)
      .post('/users')
      .send()
      .catch(err => {
        err.should.have.status(400);
      })
      .then(() => done());
  });

  const noUsername = {
    firstname: 'Nacho',
    lastname: 'Nieva',
    password: 'password1',
    email: 'ignacio.nieva@wolox.com.ar'
  };

  it('should fail sign up because of missing username', done => {
    chai
      .request(server)
      .post('/users')
      .send(noUsername)
      .catch(err => {
        err.should.have.status(400);
      })
      .then(() => done());
  });
  const noPassword = {
    firstname: 'Nacho',
    lastname: 'Nieva',
    username: 'myusername',
    email: 'ignacio.nieva@wolox.com.ar'
  };
  it('should fail sign up because of missing password', done => {
    chai
      .request(server)
      .post('/users')
      .send(noPassword)
      .catch(err => {
        err.should.have.status(400);
      })
      .then(() => done());
  });

  const noLastname = {
    firstname: 'Nacho',
    password: 'password1',
    username: 'myusername',
    email: 'ignacio.nieva@wolox.com.ar'
  };

  it('should fail sign up because of missing lastname', done => {
    chai
      .request(server)
      .post('/users')
      .send(noLastname)
      .catch(err => {
        err.should.have.status(400);
      })
      .then(() => done());
  });
  const data = {
    firstname: 'nacho',
    lastname: 'Nieva',
    password: 'password1',
    username: 'myusername',
    email: 'ignacio.nieva@wolox.com.ar'
  };

  it('should fail sign up because of existent email', done => {
    User.create(data).then(createdUser => {
      chai
        .request(server)
        .post('/users')
        .send(data)
        .catch(err => {
          err.should.have.status(400);
        })
        .then(() => done());
    });
  });

  const noFirstname = {
    lastname: 'Nieva',
    password: 'password1',
    username: 'myusername',
    email: 'ignacio.nieva@wolox.com.ar'
  };

  it('should fail sign up because of missing firstname', done => {
    chai
      .request(server)
      .post('/users')
      .send(noFirstname)
      .catch(err => {
        err.should.have.status(400);
      })
      .then(() => done());
  });

  const userData = {
    firstname: 'Nacho',
    lastname: 'Nieva',
    password: 'password1',
    username: 'myusername',
    email: 'ignacio.nieva@wolox.com.ar'
  };

  it('should work and save information in db', done => {
    chai
      .request(server)
      .post('/users')
      .send(userData)
      .then(res => {
        res.should.have.status(200);
        dictum.chai(res, 'User sign up');
        done();
      });
  });
});

describe('/POST users/sessions', () => {
  const data = {
    firstname: 'nacho',
    lastname: 'Nieva',
    password: 'password1',
    username: 'myusername',
    email: 'asd.2@wolox.com.ar'
  };
  const unToken =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.ImlnbmFjaW8ubmlldmFAd29sb3guY29tLmFyIg.vj6mVvG0s75OvdoxTKmJTb7EXLEs2a8JkESx0Nv7Xcg';
  const badPassword = {
    email: 'ignacio.nieva@wolox.com.ar',
    password: '1234'
  };
  const badEmail = {
    email: 'kevin.temes@wolox.com.ar',
    password: 'password1'
  };
  const correctUser = {
    email: 'ignacio.nieva@wolox.com.ar',
    password: 'password1'
  };
  it('should fail sign up because of incorrect password', done => {
    User.create(data).then(createdUser => {
      chai
        .request(server)
        .post('/users/sessions')
        .send(badPassword)
        .catch(err => {
          err.should.have.status(401);
        })
        .then(() => done());
    });
  });
  it('should fail sign up because of unexistent Email', done => {
    chai
      .request(server)
      .post('/users/sessions')
      .send(badEmail)
      .catch(err => {
        err.should.have.status(404);
      })
      .then(() => done());
  });
  it('should fail sign up because user is already logged in', done => {
    User.create(data).then(createdUser => {
      chai
        .request(server)
        .post('/users/sessions')
        .send(correctUser)
        .set('token', unToken)
        .catch(err => {
          err.should.have.status(400);
        })
        .then(() => done());
    });
  });
  it('should work and log in', done => {
    User.create(data).then(createdUser => {
      chai
        .request(server)
        .post('/users/sessions')
        .send(correctUser)
        .then(res => {
          res.should.have.status(200);
          dictum.chai(res, 'User sign in');
          done();
        });
    });
  });
});

describe('/GET users/list', () => {
  const newUser = {
    firstname: 'nacho',
    lastname: 'Nieva',
    password: 'password1',
    username: 'myusername',
    email: 'ignacio.nieva@wolox.com.ar'
  };
  const userOne = {
    firstname: 'kevin',
    lastname: 'temes',
    password: 'password2',
    username: 'kevinusername',
    email: 'kevin.temes@wolox.com.ar'
  };
  beforeEach(done => {
    User.create(newUser).then(res => {
      User.create(userOne).then(res2 => {
        done();
      });
    });
  });
  const correctUser = {
    email: 'ignacio.nieva@wolox.com.ar',
    password: 'password1'
  };
  it('should work listing users with offset', done => {
    chai
      .request(server)
      .post('/users/sessions')
      .send(correctUser)
      .then(res => {
        chai
          .request(server)
          .get('/users/list?offset=0')
          .send()
          .set('token', res.text)
          .then(res => {
            res.should.have.status(200);
            res.body.users.should.exist;
            res.body.users.length.should.equal(2);
            dictum.chai(res, 'User sign up');
            done();
          });
      });
  });
  it('should work listing users with limit', done => {
    chai
      .request(server)
      .post('/users/sessions')
      .send(correctUser)
      .then(res => {
        chai
          .request(server)
          .get('/users/list?limit=1')
          .send()
          .set('token', res.text)
          .then(res => {
            res.should.have.status(200);
            res.body.should.exist;
            res.body.users.length.should.equal(1);
            dictum.chai(res, 'User sign up');
            done();
          });
      });
  });
  it('should fail listing users because user is not logged in', done => {
    chai
      .request(server)
      .get('/users/list')
      .send()
      .catch(err => {
        err.should.have.status(401);
      })
      .then(() => done());
  });
});

describe('/POST admin/users', () => {
  const newUser = {
    firstname: 'nacho',
    lastname: 'Nieva',
    password: 'password1',
    username: 'myusername',
    email: 'ignacio.nieva@wolox.com.ar',
    isadmin: true
  };
  const userOne = {
    firstname: 'kevin',
    lastname: 'temes',
    password: 'password2',
    username: 'kevinusername',
    email: 'kevin.temes@wolox.com.ar',
    isadmin: false
  };
  const userTwo = {
    firstname: 'try',
    lastname: 'try',
    password: 'password3',
    username: 'try3user',
    email: 'try.3@wolox.com.ar'
  };
  beforeEach(done => {
    User.create(newUser).then(res => {
      User.create(userOne).then(res2 => {
        done();
      });
    });
  });
  const correctUser = {
    email: 'ignacio.nieva@wolox.com.ar',
    password: 'password1'
  };
  const notAdmin = {
    email: 'kevin.temes@wolox.com.ar',
    password: 'password2'
  };
  it('should fail goAdmin because user is not logged in', done => {
    chai
      .request(server)
      .post('/admin/users')
      .send(userOne)
      .catch(err => {
        err.should.have.status(401);
      })
      .then(() => done());
  });
  it('should work goAdmin, updating existing row to isadmin=true', done => {
    chai
      .request(server)
      .post('/users/sessions')
      .send(correctUser)
      .then(res => {
        chai
          .request(server)
          .post('/admin/users')
          .send(userOne)
          .set('token', res.text)
          .then(res => {
            res.should.have.status(200);
            res.body.should.exist;
            res.body.user.should.include({
              firstname: 'kevin',
              lastname: 'temes',
              username: 'kevinusername',
              email: 'kevin.temes@wolox.com.ar',
              isadmin: true
            });
            dictum.chai(res, 'existing user is now admin');
            done();
          });
      });
  });
  it('should work goAdmin, creating new user with isadmin=true', done => {
    chai
      .request(server)
      .post('/users/sessions')
      .send(correctUser)
      .then(res => {
        chai
          .request(server)
          .post('/admin/users')
          .send(userTwo)
          .set('token', res.text)
          .then(res => {
            res.should.have.status(200);
            res.body.should.exist;
            res.body.user.should.include({
              firstname: 'try',
              lastname: 'try',
              username: 'try3user',
              email: 'try.3@wolox.com.ar'
            });
            dictum.chai(res, 'new user is now admin');
            done();
          });
      });
  });
  it('should fail goAdmin, null parameter', done => {
    chai
      .request(server)
      .post('/users/sessions')
      .send(correctUser)
      .then(res => {
        chai
          .request(server)
          .post('/admin/users')
          .send()
          .set('token', res.text)
          .catch(err => {
            err.should.have.status(400);
            err.should.have.property('message');
          })
          .then(() => done());
      });
  });
  it('should work goAdmin, updating existing row to isadmin=true and changing username', done => {
    userOne.username = 'kevinNEWusername';
    chai
      .request(server)
      .post('/users/sessions')
      .send(correctUser)
      .then(res => {
        chai
          .request(server)
          .post('/admin/users')
          .send(userOne)
          .set('token', res.text)
          .then(res => {
            res.should.have.status(200);
            res.body.should.exist;
            res.body.user.should.include({
              firstname: 'kevin',
              lastname: 'temes',
              username: 'kevinNEWusername',
              email: 'kevin.temes@wolox.com.ar',
              isadmin: true
            });
            dictum.chai(res, 'existing user is now admin and changed username');
            done();
          });
      });
  });
});
