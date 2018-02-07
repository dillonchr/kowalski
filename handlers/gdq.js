const { gdq } = require('funhouse-client');
const { trackError } = require('../utils');

module.exports = (controller) => {
    controller.hears(['gdq', ':video_game:'], 'direct_message,direct_mention,mention', (b, m) => {
        gdq((err, g) => {
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
                if (err) {
                    trackError(err);
                }
                b.reply(m, 'Sorry, I got nothin\'.');
            }
        });
    });
};
