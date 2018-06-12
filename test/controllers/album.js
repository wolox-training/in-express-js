const chai = require('chai'),
  chaiHttp = require('chai-http'),
  dictum = require('dictum.js'),
  server = require('../../app'),
  nock = require('nock'),
  User = require('../../app/models').users,
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
