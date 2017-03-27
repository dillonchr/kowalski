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

            let query = slackInterpreter(message);
            let searchUrl = urlographer(query);
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
    'ON IT MAN'
];
function getConfirmationResponse() {
    return CONF_RESPONSES[Math.floor(Math.random() * CONF_RESPONSES.length)];
}

module.exports = controller => {
    controller.on('direct_message', (b, m) => {
        if (m.text.indexOf(',') !== -1) {
            b.reply(m, {
                response_type: 'ephemeral',
                text: `:mag_right: ${getConfirmationResponse()}`
            });
            search(m.text)
                .then(x => b.reply(m, x));
        }
    });
};
