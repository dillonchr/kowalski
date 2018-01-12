const bookmancy = require('bookmancy');
const slackResponder = require('./slack-responder');
const confirmMessage = require('./confirmation-messages');
const is = {
    abe: s => /^abe /i.test(s),
    ebay: s => /^ebay /i.test(s),
    sold: s => /^sold /i.test(s),
    live: s => /^live /i.test(s)
};

module.exports = c => {
    c.on('direct_message,direct_mention', (b, m) => {
        if (is.abe(m.text)) {
            confirmMessage(b, m);
            const messagePieces = m.text.substr(4).split(',').map(s => s.trim());
            const [author, title, publisher, year, format] = messagePieces;
            const query = {
                author,
                title,
                publisher,
                year: format && !isNaN(format) ? format : !isNaN(year) && year,
                format: isNaN(year) ? year : format
            };
            
            bookmancy.abe.searchWithUrlInResponse(query)
                .then(({results, url}) => {
                    const searchTitle = messagePieces.join(' - ');
                    b.reply(m, slackResponder(searchTitle, url, results));
                })
                .catch(err => {
                    console.error(err.message || err.toString(), err.stack);
                    b.reply(m, {
                        response_type: 'ephemeral',
                        text: 'There was a problem processing your search. Try again soon.'
                    });
                });
        } else if(is.ebay(m.text)) {
            confirmMessage(b, m);
            const command = m.text.substr(5);
            const isLive = is.live(command);
            const query = command.replace(isLive ? /live/i : /sold/i, '').trim();
            return bookmancy.ebay[`search${isLive ? 'Live' : 'Sold'}Listings`](query)
                .then(r => b.reply(m, slackResponder(query, '', r, true)));
        }
    });
};
