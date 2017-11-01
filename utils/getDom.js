const jsdom = require('jsdom');

module.exports = url => {
    return new Promise((resolve, reject) => {
        jsdom.env(url, (err, w) => {
            if (!err && !!w) {
                resolve(w.document);
            } else {
                reject(err);
            }
        });
    });
};
