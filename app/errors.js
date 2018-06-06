exports.notFound = {
  statusCode: 404,
  message: 'Not found'
};

exports.internalServerError = {
  statusCode: 500,
  message: 'Internal Server Error. Please try again later.'
};

exports.invalidCredentialError = {
  statusCode: 401,
  message: 'Invalid Email/Password combination'
};

exports.invalidOffset = {
  statusCode: 400,
  message: 'Invalid Offset requested'
};
