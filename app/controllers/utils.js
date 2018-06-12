'use strict';

const logger = require('../logger');

exports.errorStruct = (error, res) => {
  let errorBag = [];
  if (error.errors) {
    errorBag = error.errors.map(err => err.message);
    logger.error(`A database error occured when attempting a user signup. Details: ${errorBag}.`);
    return res.status(400).send(errorBag);
  }
};
