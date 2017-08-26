let request = require('./request-builder');
let urlographer = require('./url-builder');
let slackResponder = require('./slack-responder');
let slackInterpreter = require('./slack-interpreter');

function search(message) {
    return new Promise((res, rej) => {
        try {
            if (message === 'help') {
                return res.send({
                    response_type: 'ephemeral',
                    text: 'search for book prices with `author, title, publisher, year, format`',
                    mrkdown: true
                });
            }

            const [author, title, publisher, year, format] = message.split(',');
            const query = {
                author: author && author.trim(),
                title: title && title.trim(),
                publisher: publisher && publisher.trim(),
                year: year && year.trim(),
                format: isNaN(format) ? format && format.trim() : year && trim()
            };
            const searchUrl = urlographer(query);
            request(searchUrl)
                .then(x => res(slackResponder(query, searchUrl, x)), err => console.error(err.toString()));
        } catch (err) {
            res({
                "response_type": "ephemeral",
                "text": "There was a problem processing your search. Try again soon."
            });
            console.error(err);
        }
    });
}

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

module.exports = controller => {
    controller.on('direct_message', (b, m) => {
        if (!/^budget /i.test(m.text) && m.text.indexOf(',') !== -1) {
            b.reply(m, {
                response_type: 'ephemeral',
                text: `:mag_right: ${getConfirmationResponse()}`
            });
            search(m.text)
                .then(x => b.reply(m, x));
        }
    });
};
