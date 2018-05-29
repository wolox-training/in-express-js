'use strict';

const bcrypt = require('bcryptjs'),
  sessionManager = require('./../services/sessionManager'),
  User = require('../models').users,
  errors = require('../errors'),
  logger = require('../logger');

exports.signup = (req, res, next) => {
  const userData = req.body;
  if (req.body) {
    User.findOne({
      where: {
        email: userData.email
      }
    })
      .then(dbUser => {
        if (!dbUser) {
          User.create({
            firstname: userData.firstname,
            lastname: userData.lastname,
            username: userData.username,
            password: userData.password,
            email: userData.email
          }).then(createdUser => {
            if (createdUser) {
              res.send(createdUser).status(200);
              logger.info(`created account with email: "${userData.email}"`);
            } else {
              res.status(400);
            }
          });
        } else {
          logger.info(`Failed create attempt to account with already created email: "${userData.email}"`);
          res.send('E-mail has an account already').status(400);
        }
      })
      .catch(error => {
        logger.error(`Failed create attempt to account with invalid email: "${userData.email}". Error message:"${error}"`);
      });
  }
};
