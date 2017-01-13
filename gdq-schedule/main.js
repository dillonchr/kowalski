let gdq = require('./gdq-schedule');

module.exports = (controller) => {
    controller.hears(['gdq'], 'direct_message,direct_mention,mention', (b, m) => {
        gdq()
            .then(g => {
                if (g && g.length) {
                    b.reply(m, {
                        attachments: g.slice(0, 5).map(e => ({
                            author_name: e.runners,
                            title: e.title,
                            text: `Starts at *${e.start.format('h:mm A')}* and has an estimate of _${e.estimate}_, so expected to end at *${e.ends.format('h:mm A')}*.`,
                            footer: 'GDQ',
                            footer_icon: 'https://gamesdonequick.com/static/res/img/favicon/favicon.ico',
                            mrkdwn_in: ['text']
                        }))
                    });
                } else {
                    b.reply(m, 'Sorry, I got nothin\'.');
                }
            })
    });
}