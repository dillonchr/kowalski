const Raven = require('raven');
Raven.config(process.env.SENTRY_URL).install();

module.exports = error => Raven.captureException(error);
