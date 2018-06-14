const chai = require('chai'),
  chaiHttp = require('chai-http'),
  dictum = require('dictum.js'),
  server = require('../../app'),
  nock = require('nock'),
  User = require('../../app/models').users,
  Album = require('../../app/models').albums,
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
    const correctResponse = nock('https://jsonplaceholder.typicode.com')
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
    const badResponse = nock('https://jsonplaceholder.typicode.com')
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
    const correctResponse = nock('https://jsonplaceholder.typicode.com')
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
    const correctResponse2 = nock('https://jsonplaceholder.typicode.com/albums')
      .get('/1')
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
