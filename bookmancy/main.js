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
            // res({
            //     "response_type": "ephemeral",
            //     "text": `Checking out ${Object.keys(query).reverse().map(k => k + ': ' + query[k]).join(', ')}`
            // });
        } catch (err) {
            res({
                "response_type": "ephemeral",
                "text": "There was a problem processing your search. Try again soon."
            });
            console.error(err);
        }
    });
}

function isUserShopping(controller, m) {
    controller.storage.users
        .get(m.user, (err, user) => {
            if (!user) {
                user = {
                    id: m.user,
                    isBookShopping: true
                };
            }
            return user.isBookShopping;
        });
}

module.exports = controller => {
    controller.hears(['(start|stop) book shopping mode', ':book:'], 'direct_message', (b, m) => {
        let toggle = /book/i.test(m.text);
        let isStarting = m.match && m.match.length && m.match[1] && m.match[1].toLowerCase() === 'start';
        isUserShopping(controller, m)
            .then(isShopping => {
                if (toggle) {
                    isStarting = !isShopping;
                }
                if (isStarting) {
                    if (user.isBookShopping) {
                        b.reply(m, 'You are already in book shopping mode!');
                    } else {
                        user.isBookShopping = true;
                        controller.storage.users.save(user, (err, id) => b.reply(m, 'Okay, book shopping mode enabled.'));
                    }
                } else {
                    if (!user.isBookShopping) {
                        b.reply(m, 'You haven\'t even started book shopping mode yet.');
                    } else {
                        user.isBookShopping = false;
                        controller.storage.users.save(user, (err, id) => b.reply(m, 'Okay, book shopping mode disabled.'));
                    }
                }
            });
    });

    controller.on('direct_message', (b, m) => {
        if (m.text.indexOf(',') !== -1) {
            isUserShopping(controller, m)
                .then(isShopping => {
                    if (isShopping) {
                        search(m.text)
                            .then(x => b.reply(m, x));
                    }
                });
        }
    });
};
