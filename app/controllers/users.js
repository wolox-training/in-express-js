'use strict';

const bcrypt = require('bcryptjs'),
  User = require('../models').users,
  errors = require('../errors'),
  jwt = require('jwt-simple'),
  config = require('../../config'),
  logger = require('../logger');

const emptyToNull = input => {
  const newInput = {};
  Object.keys(input).forEach(key => {
    newInput[key] = input[key] === '' ? null : input[key];
  });

  return newInput;
};

const errorStruct = (error, res) => {
  let errorBag = [];
  if (error.errors) {
    errorBag = error.errors.map(err => err.message);
    logger.error(`A database error occured when attempting a user signup. Details: ${errorBag}.`);
    return res.status(400).send(errorBag);
  }
};

exports.signup = (req, res, next) => {
  const userData = emptyToNull(req.body);
  User.create({
    firstname: userData.firstname,
    lastname: userData.lastname,
    username: userData.username,
    password: userData.password,
    email: userData.email
  })
    .then(createdUser => {
      if (createdUser) {
        res.send(createdUser).status(200);
        logger.info(`created account with email: '${userData.email}'`);
      } else {
        res.status(400);
      }
    })
    .catch(error => {
      return errorStruct(error, res);
    });
};

exports.signin = (req, res, next) => {
  const signinTry = {
    email: req.body.email,
    password: req.body.password
  };
  User.findOne({
    where: {
      email: signinTry.email
    }
  })
    .then(match => {
      const secret = 'n4ch0n13v4';
      if (
        (req.headers.token && jwt.decode(req.headers.token, secret) !== signinTry.email) ||
        !req.headers.token
      ) {
        if (match) {
          if (bcrypt.compareSync(signinTry.password, match.password)) {
            const token = jwt.encode(signinTry.email, secret);
            res.send(token).status(200);
            logger.info(`User logged in with email: '${signinTry.email}'`);
          } else {
            res.send('Incorrect password').status(400);
            logger.error(`Failed attempt to log in with email: '${signinTry.email}', incorrect password`);
          }
        } else {
          res.send('email does not exist').status(404);
          logger.error(`Failed attempt to log in with email: '${signinTry.email}', does not exist`);
        }
      } else {
        res.send('already logged in').status(401);
        logger.error(`Failed attempt to log in with email: '${signinTry.email}', already logged in`);
      }
    })
    .catch(error => {
      return errorStruct(error, res);
    });
};
