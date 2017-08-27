const bookmancy = require('./bookmancy');
const ebay = new (require('./ebay-searcher'))();
const slackResponder = require('./slack-responder');
const is = {
    abe: s => /^abe /i.test(s),
    ebay: s => /^ebay /i.test(s),
    sold: s => /^sold/i.test(s),
    live: s => /^live/i.test(s),
    all: s => /^all/i.test(s),
};

module.exports = c => {
    c.on('direct_message,direct_mention', (b, m) => {
        if (is.abe(m.text)) {
            const query = m.text.substr(4);
            bookmancy.onSearch(b, m);
            bookmancy.search(query)
                .then(x => b.reply(m, x));
        } else if(is.ebay(m.text)) {
            const command = m.text.substr(5);
            let promise, query;

            if (is.sold(command)) {
                query = m.text.substr(10).trim();
                promise = ebay.searchSoldListings(query);
            } else if (is.live(command)) {
                query = m.text.substr(10).trim();
                promise = ebay.searchLiveListings(query);
            } else if (is.all(command)) {
                query = m.text.substr(9).trim()
                promise = ebay.search(query);
            }

            if (promise) {
                bookmancy.onSearch(b, m);
                promise.then(r => b.reply(m, slackResponder(query, '', r, true)));
            } else {
                b.reply(m, 'Unknown ebay search type. Try `sold, live, or all`');
            }
        }
    });
};
