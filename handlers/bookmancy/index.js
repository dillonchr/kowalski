const {bookmancy} = require('funhouse-client');
const {trackError} = require('../../utils');
const funhouseResponseTransformer = require('./funhouse-response-transformer');
const confirmMessage = require('./confirmation-messages');
const is = {
    abe: s => /^abe /i.test(s),
    ebay: s => /^ebay /i.test(s),
    sold: s => /^sold /i.test(s),
    live: s => /^live /i.test(s)
};

module.exports = bot => {
    bot.hears(['ebay', 'abe'], (reply, m) => {
        if (is.abe(m.content)) {
            confirmMessage(reply);
            const messagePieces = m.content.substr(4).split(',').map(s => s.trim());
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
                    return reply(`Search error: ${err.message}`);
                }

                const searchTitle = messagePieces.join(' - ');
                reply(funhouseResponseTransformer(searchTitle, results.url, results.results));
            });
        } else if (is.ebay(m.content)) {
            confirmMessage(reply);
            const isLive = /^live /i.test(m.content.substr(5));
            const query = m.content.substr(5).replace(/live|sold/i, '').trim();
            bookmancy({source: 'ebay', query, live: isLive, sold: !isLive}, (err, results) => {
                if (err) {
                    trackError(err);
                    return reply(`Search error: ${err.message}`);
                }
                reply(funhouseResponseTransformer(query, '', results, true));
            });
        }
    });
};
