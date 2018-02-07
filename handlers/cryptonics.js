const { cryptonics } = require('funhouse-client');
const { trackError, whisper } = require('../utils');
const is = {
    encrypt: s => /^encrypt \d+;/i.test(s),
    decrypt: s => /^decrypt \d+;/i.test(s)
};

module.exports = c => {
    c.hears(['encrypt', 'decrypt'], 'direct_message,direct_mention', (b, m) => {
        if (is.encrypt(m.text) || is.decrypt(m.text)) {
            const firstSemi = m.text.indexOf(';');
            const offset = +m.text.substr(0, firstSemi).match(/\d+/)[0];
            const message = m.text.substr(firstSemi + 1);
            const isEncrypt = is.encrypt(m.text);
            const call = isEncrypt ? cryptonics.encrypt : cryptonics.decrypt;

            call(offset, message, (err, response) => {
                if (err) {
                    trackError(err);
                    return whisper(b, m, `Error translating: ${err.message}`);
                }

                const emoji = isEncrypt ? ':lock:' : ':unlock:';
                whisper(b, m, `${emoji} - \`${response.body}\``);
            });
        }
    });
};
