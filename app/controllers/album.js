'use strict';

const errors = require('../errors'),
  httpInteractor = require('../interactors/serviceRequest'),
  utils = require('../controllers/utils'),
  logger = require('../logger');

exports.listAlbums = (req, res, next) => {
  httpInteractor
    .serviceRequest(req, res, next)
    .then(rest => {
      res.send(rest.body).status(rest.status);
    })
    .catch(err => {
      return utils.errorStruct(err, res);
    });
};
