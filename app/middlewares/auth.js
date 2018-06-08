const User = require('../models').users,
  jwt = require('jwt-simple'),
  errors = require('../errors'),
  config = require('../../config');

exports.isLoggedIn = (req, res, next) => {
  const token = req.headers.token;
  if (token) {
    const userEmail = jwt.decode(token, config.common.session.secret);
    User.findOne({ where: { email: userEmail } }).then(match => {
      if (match) {
        req.body.user = match;
        next();
      } else {
        res.status(errors.notFound.statusCode).send(errors.notFound.message);
        next();
      }
    });
  } else {
    return res.status(errors.invalidCredentialError.statusCode).send(errors.invalidCredentialError.message);
  }
};

exports.isAdminLoggedIn = (req, res, next) => {
  const isAdmin = req.body.user.dataValues.isadmin;
  if (isAdmin) {
    next();
  } else {
    res.status(errors.isNotAdminError.statusCode).send(errors.isNotAdminError.message);
  }
};
