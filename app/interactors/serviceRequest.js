const config = require('../../config'),
  request = require('request');

exports.serviceRequest = (req, res, next) => {
  const url = config.common.database.albumsUrl + config.common.database.albumsListEndpoint;
  return new Promise((resolve, reject) => {
    request.get(url, { json: true }, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        resolve({ body, status: response.statusCode });
        next();
      } else {
        reject(error);
      }
    });
  });
};
