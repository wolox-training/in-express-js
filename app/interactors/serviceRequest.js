const config = require('../../config'),
  request = require('request');

const serviceUrl = id => {
  return config.common.database.albumsUrl + config.common.database.albumsListEndpoint + (id ? `/${id}` : '');
};

exports.serviceRequest = (req, res, next) => {
  const url = serviceUrl(req.query.id);
  return new Promise((resolve, reject) => {
    request.get(url, { json: true }, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        resolve({ body, status: response.statusCode });
      } else {
        reject(error);
      }
    });
  });
};
