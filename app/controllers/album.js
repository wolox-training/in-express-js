'use strict';

const errors = require('../errors'),
  httpInteractor = require('../interactors/serviceRequest'),
  utils = require('../controllers/utils'),
  Album = require('../models').albums,
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

exports.purchaseAlbum = (req, res, next) => {
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
