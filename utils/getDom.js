const jsdom = require('jsdom');
const Raven = require('raven');

module.exports = url => {
    return new Promise((resolve, reject) => {
        jsdom.env(url, (err, w) => {
            if (!err && !!w) {
                resolve(w.document);
            } else {
                Raven.captureException(err);
                reject(err);
            }
        });
    });
};
