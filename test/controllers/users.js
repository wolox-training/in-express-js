const chai = require('chai'),
  chaiHttp = require('chai-http'),
  dictum = require('dictum.js'),
  server = require('../../app'),
  User = require('../../app/models').users,
  should = chai.should();

chai.use(chaiHttp);

describe('/users POST', () => {
  it('should fail sign up because of incorrect password', done => {
    chai
      .request(server)
      .post('/users')
      .send({
        firstname: 'Nacho',
        lastname: 'Nieva',
        username: 'myusername',
        password: '1234',
        email: 'ignacio.nieva@wolox.com.ar'
      })
      .catch(err => {
        err.should.have.status(400);
      })
      .then(() => done());
  });

  it('should fail sign up because of missing E-mail', done => {
    chai
      .request(server)
      .post('/users')
      .send({
        firstname: 'Nacho',
        lastname: 'Nieva',
        password: 'password1',
        username: 'myusername'
      })
      .catch(err => {
        err.should.have.status(400);
      })
      .then(() => done());
  });

  it('should fail sign up because of missing username', done => {
    chai
      .request(server)
      .post('/users')
      .send({
        firstname: 'Nacho',
        lastname: 'Nieva',
        password: 'password1',
        email: 'ignacio.nieva@wolox.com.ar'
      })
      .catch(err => {
        err.should.have.status(400);
      })
      .then(() => done());
  });

  it('should fail sign up because of missing password', done => {
    chai
      .request(server)
      .post('/users')
      .send({
        firstname: 'Nacho',
        lastname: 'Nieva',
        username: 'myusername',
        email: 'ignacio.nieva@wolox.com.ar'
      })
      .catch(err => {
        err.should.have.status(400);
      })
      .then(() => done());
  });

  it('should fail sign up because of missing lastname', done => {
    chai
      .request(server)
      .post('/users')
      .send({
        firstname: 'Nacho',
        password: 'password1',
        username: 'myusername',
        email: 'ignacio.nieva@wolox.com.ar'
      })
      .catch(err => {
        err.should.have.status(400);
      })
      .then(() => done());
  });
});

describe('/users POST', () => {
  it('should fail sign up because of missing E-mail', done => {
    chai
      .request(server)
      .post('/users')
      .send({
        firstname: 'Nacho',
        lastname: 'Nieva',
        password: 'password1',
        username: 'myusername'
      })
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
  User.create(data).then(createdUser => {
    it('should fail sign up because of existent email', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          lastname: 'Nieva',
          password: 'password1',
          username: 'myusername',
          email: 'ignacio.nieva@wolox.com.ar'
        })
        .catch(err => {
          err.should.have.status(400);
        })
        .then(() => done());
    });
  });

  it('should fail sign up because of missing firstname', done => {
    chai
      .request(server)
      .post('/users')
      .send({
        lastname: 'Nieva',
        password: 'password1',
        username: 'myusername',
        email: 'ignacio.nieva@wolox.com.ar'
      })
      .catch(err => {
        err.should.have.status(400);
      })
      .then(() => done());
  });
  it('should work and save information in db', done => {
    chai
      .request(server)
      .post('/users')
      .send({
        firstname: 'Nacho',
        lastname: 'Nieva',
        password: 'password1',
        username: 'myusername',
        email: 'ignacio.nieva@wolox.com.ar'
      })
      .then(res => {
        res.should.have.status(200);
        done();
      });
  });
});
