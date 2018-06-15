'use strict';

const errors = require('../errors'),
  httpInteractor = require('../interactors/serviceRequest'),
  utils = require('../controllers/utils'),
  Album = require('../models').albums,

  config = require('../../config'),
  logger = require('../logger');

const serviceAlbumUrl = id => {
  return config.common.database.albumsUrl + config.common.database.albumsListEndpoint + (id ? `/${id}` : '');
};
const retrieveAlbums = (req, res, next) => {
  Album.findAll({
    where: {
      userid: req.params.id
    }
  })
    .then(rest => {
      res.send({ albums: rest }).status(200);
    })
    .catch(error => {
      return utils.errorStruct(error, res);
    });
};

exports.listAlbums = (req, res, next) => {
  req.body.serviceEndpoint = serviceAlbumUrl(req.query.id);
  httpInteractor
    .serviceRequest(req, res, next)
    .then(rest => {
      res.send(rest.body).status(rest.status);
    })
    .catch(err => {
      return utils.errorStruct(err, res);
    });
};

exports.purchaseAlbum = (req, res, next) => {
  req.body.serviceEndpoint = serviceAlbumUrl(req.query.id);
  httpInteractor
    .serviceRequest(req, res, next)
    .then(rest => {
      Album.findOne({
        where: {
          id: rest.id,
          userid: req.body.user.id
        }
      }).then(match => {
        if (match) {
          res.send('Users cant buy the same album more than once').status(400);
        } else {
          Album.create({
            id: rest.body.id,
            userid: req.body.user.id,
            title: rest.body.title
          })
            .then(createdAlbum => {
              if (createdAlbum) {
                res.send({ album: createdAlbum }).status(200);
                logger.info(`user id: '${createdAlbum.userid}' purchased album id: '${createdAlbum.id}'`);
                return next();
              }
            })
            .catch(error => {
              return utils.errorStruct(error, res);
            });
        }
      });
    })
    .catch(err => {
      return utils.errorStruct(err, res);
    });
};

exports.listPurchasedAlbums = (req, res, next) => {
  const sessionId = parseInt(req.body.user.id);
  const userId = parseInt(req.params.id);
  if (req.body.user.isadmin === true) {
    retrieveAlbums(req, res, next);
  } else {
    if (sessionId === userId) {
      retrieveAlbums(req, res, next);
    } else {
      res.send(errors.isNotAdmin.message).status(errors.isNotAdmin.statusCode);
      next();
    }
  }
};
exports.listPurchasedPhotos = (req, res, next) => {
  req.body.serviceEndpoint = `${serviceAlbumUrl(req.params.id)}/${config.common.database.photosListEndpoint}`;
  Album.findAll({
    where: {
      userid: req.body.user.id,
      id: req.params.id
    }
  })
    .then(rest => {
      httpInteractor
        .serviceRequest(req, res, next)
        .then(result => {
          res.send(result.body).status(result.status);
        })
        .catch(err => {
          return utils.errorStruct(err, res);
        });
    })
    .catch(error => {
      return utils.errorStruct(error, res);
    });
};

