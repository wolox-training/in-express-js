'use strict';

const bcrypt = require('bcryptjs'),
  sessionManager = require('../services/sessionManager'),
  User = require('../models').users,
  errors = require('../errors'),
  logger = require('../logger');

const emptyToNull = input => {
  const newInput = {};
  Object.keys(input).forEach(key => {
    newInput[key] = input[key] === '' ? null : input[key];
  });

  return newInput;
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
      let errorBag = [];
      if (error.errors) {
        errorBag = error.errors.map(err => err.message);
        logger.error(`A database error occured when attempting a user signup. Details: ${errorBag}.`);
        return res.status(400).send(errorBag);
      }
    });
};
