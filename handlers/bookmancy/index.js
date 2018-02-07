const { bookmancy } = require('funhouse-client');
const { trackError, whisper } = require('../../utils');
const slackResponder = require('./slack-responder');
const confirmMessage = require('./confirmation-messages');
const is = {
    abe: s => /^abe /i.test(s),
    ebay: s => /^ebay /i.test(s),
    sold: s => /^sold /i.test(s),
    live: s => /^live /i.test(s)
};

module.exports = c => {
    c.hears(['ebay', 'abe'], 'direct_message,direct_mention', (b, m) => {
        if (is.abe(m.text)) {
            confirmMessage(b, m);
            const messagePieces = m.text.substr(4).split(',').map(s => s.trim());
            const [author, title, publisher, year, format] = messagePieces;
            const query = {
                author,
                title,
                publisher,
                year: format && !isNaN(format) ? format : !isNaN(year) && year,
                format: isNaN(year) ? year : format,
                source: 'abe',
                withUrl: true
            };
            bookmancy(query, (err, results) => {
                 if (err) {
                     trackError(err);
                     return whisper(b, m, `Search error: ${err.message}`);
                 }

                const searchTitle = messagePieces.join(' - ');
                b.reply(m, slackResponder(searchTitle, results.url, results.results));
            });
        } else if(is.ebay(m.text)) {
            confirmMessage(b, m);
            const isLive = /^live /i.test(m.text.substr(5));
            const query = m.text.substr(5).replace(/live|sold/i, '').trim();
            bookmancy({source: 'ebay', query, live: isLive, sold: !isLive}, (err, results) => {
                if (err) {
                    trackError(err);
                    return whisper(b, m, `Search error: ${err.message}`);
                }

                b.reply(m, slackResponder(query, '', results, true));
            });
        }
    });
};
