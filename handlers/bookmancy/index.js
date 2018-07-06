const {bookmancy} = require('@dillonchr/funhouse');
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
            reply(confirmMessage());
            const messagePieces = m.content.substr(4).split(',').map(s => s.trim());
            const [author, title, publisher, year, format] = messagePieces;
            const query = {
                author,
                title,
                publisher,
                year: format && !isNaN(format) ? format : !isNaN(year) && year,
                format: isNaN(year) ? year : format,
                source: 'abe',
                includeUrl: true
            };
            bookmancy(query, (err, response) => {
                if (err) {
                    trackError(err);
                    return reply(`Search error: ${err.message}`);
                }

                const searchTitle = messagePieces.join(' - ');
                reply(funhouseResponseTransformer(searchTitle, response.url, response.results));
            });
        } else if (is.ebay(m.content)) {
            reply(confirmMessage());
            const searchSansEbay = m.content.substr(5);
            const isLive = is.live(searchSansEbay);
            const isSold = is.sold(searchSansEbay);
            const searchTitle = searchSansEbay.replace(/^live|sold/i, '').trim();
            const query = {
                author: searchTitle,
                source: 'ebay'
            };
            if (isLive) {
                query.live = true;
            }
            if (isSold) {
                query.sold = true;
            }
            bookmancy(query, (err, response) => {
                if (err) {
                    trackError(err);
                    return reply(`Search error: ${err.message}`);
                }
                reply(funhouseResponseTransformer(searchTitle, '', response.results, true));
            });
        }
    });
};
