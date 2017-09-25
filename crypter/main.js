const Cryptonics = require('./cryptonics');
const is = {
    encrypt: s => /^encrypt \d+;/i.test(s),
    decrypt: s => /^decrypt \d+;/i.test(s)
};

module.exports = c => {
    c.on('direct_message,direct_mention', (b, m) => {
        if (is.encrypt(m.text) || is.decrypt(m.text)) {
            const firstSemi = m.text.indexOf(';');
            const offset = +m.text.substr(0, firstSemi).match(/\d+/)[0];
            const method = (is.encrypt(m.text) ? 'en' : 'de') + 'crypt';
            const message = m.text.substr(firstSemi + 1);
            const response = Cryptonics[method](offset, message);
            b.reply(m, response);
        }
    });
};
