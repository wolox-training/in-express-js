'use strict';

const bcrypt = require('bcryptjs'),
  User = require('../models').users,
  errors = require('../errors'),
  jwt = require('jwt-simple'),
  request = require('request'),
  config = require('../../config'),
  httpInteractor = require('../interactors/serviceRequest'),
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

const requiresNewToken = (token, email) => {
  return (token && jwt.decode(token, config.common.session.secret) !== email) || !token;
};

const transaction = (req, res, next) => {
  User.findOne({
    where: {
      email: req.email
    }
  })
    .then(match => {
      if (match) {
        match.update(req).then(updated => {
          res.send({ user: updated }).status(200);
          next();
        });
      } else {
        User.create(req)
          .then(createdUser => {
            if (createdUser) {
              res.send({ user: createdUser }).status(200);
              logger.info(`created account with email: '${req.email}'`);
              return next();
            }
          })
          .catch(error => {
            return errorStruct(error, res);
          });
      }
    })
    .catch(err => {
      return errorStruct(err, res);
    });
};

exports.signup = (req, res, next) => {
  const userData = emptyToNull(req.body);
  transaction(userData, res, next);
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
      if (requiresNewToken(req.headers.token, signinTry.email)) {
        if (match) {
          if (bcrypt.compareSync(signinTry.password, match.password)) {
            const token = jwt.encode(signinTry.email, config.common.session.secret);
            res.send(token).status(200);
            logger.info(`User logged in with email: '${signinTry.email}'`);
          } else {
            res.send('Incorrect password').status(401);
            logger.error(`Failed attempt to log in with email: '${signinTry.email}', incorrect password`);
          }
        } else {
          res.send('email does not exist').status(404);
          logger.error(`Failed attempt to log in with email: '${signinTry.email}', does not exist`);
        }
      } else {
        res.send('already logged in').status(400);
        logger.error(`Failed attempt to log in with email: '${signinTry.email}', already logged in`);
      }
    })
    .catch(error => {
      return errorStruct(error, res);
    });
};

exports.listUsers = (req, res, next) => {
  User.findAll({
    attributes: {
      exclude: ['id', 'password', 'username']
    },
    offset: req.query.offset ? req.query.offset : 0,
    limit: req.query.limit ? req.query.limit : 10
  })
    .then(stack => {
      return res.status(200).send({ users: stack });
    })
    .catch(error => {
      return errorStruct(error, res);
    });
};

exports.goAdmin = (req, res, next) => {
  const userData = emptyToNull(req.body);
  userData.isadmin = true;
  if (userData.email) {
    transaction(userData, res, next);
  } else {
    res.status(errors.invalidParameter.statusCode).send(errors.invalidParameter.message);
  }
};

exports.listAlbums = (req, res, next) => {
  const url = 'albums';
  httpInteractor
    .serviceRequest({ url }, res, next)
    .then(rest => {
      res.send(rest.body).status(rest.status);
    })
    .catch(err => {
      return errorStruct(err, res);
    });
};
