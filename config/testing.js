exports.config = {
  environment: 'testing',
  isTesting: true,
  common: {
    database: {
      name: process.env.DB_NAME
    },
    session: {
      secret: process.env.NODE_API_SESSION_SECRET
    }
  }
};
