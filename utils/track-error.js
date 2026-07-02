import Raven from 'raven';
Raven.config(process.env.SENTRY_URL).install();

export default error => Raven.captureException(error);
