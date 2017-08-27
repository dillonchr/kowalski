const request = require('./request-builder');
const slackResponder = require('./slack-responder');
const CONF_RESPONSES = [
    'Looking it up',
    'Checking it out',
    'Working on it',
    'Searching now',
    'ON IT MAN',
    'She\'s going as fast as she can, Captain!',
    'Get ready for this',
    'I hope you have enough RAM',
    'Save a tree. Use 3G.'
];

function getConfirmationResponse() {
    return CONF_RESPONSES[Math.floor(Math.random() * CONF_RESPONSES.length)];
}

function search(message) {
    const [author, title, publisher, year, format] = message.split(',').map(s => s.trim());
    const query = {
        author: author,
        title: title,
        publisher: publisher,
        year: !isNaN(format) ? format : year,
        format: !isNaN(year) ? year : format
    };

    return request(query)
        .then(x => {
            const searchTitle = message.split(',').map(s => s.trim()).join(' - ');
            return slackResponder(searchTitle, x.url, x.results);
        })
        .catch(err => {
            console.error(err.message || err.toString());
            console.error(err.stack);
            return {
                "response_type": "ephemeral",
                "text": "There was a problem processing your search. Try again soon."
            };
        });
};

function confirmSearch(b, m) {
    b.reply(m, {
        response_type: 'ephemeral',
        text: `:mag_right: ${getConfirmationResponse()}`
    });
}

module.exports = {
    search: search,
    onSearch: confirmSearch
};