let gdq = require('./gdq-schedule');

module.exports = (controller) => {
    controller.hears(['gdq', ':video_game:'], 'direct_message,direct_mention,mention', (b, m) => {
        gdq()
            .then(g => {
                if (g && g.length) {
                    b.reply(m, {
                        attachments: g.slice(0, 5).map(({ runners, title, start, ends, estimate }) => ({
                            author_name: runners,
                            title,
                            text: `Starts at *${start.format('h:mm A')}* and has an estimate of _${estimate}_, so expected to end at *${ends.format('h:mm A')}*.`,
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
};
