const {gdq} = require('funhouse-client');
const {trackError} = require('../utils');
const moment = require('moment');

const timestampToDisplayTime = (timestamp) => {
    return moment(timestamp).utcOffset('-05:00').format('h:mm A');
};

module.exports = bot => {
    bot.hears(['gdq', ':video_game:'], reply => {
        gdq((err, g) => {
            if (g && g.length) {
                const response = g.filter(g => !g.done)
                    .slice(0, 5)
                    .map(
                        ({runners, title, start, ends, estimate}) => [
                            `**${title}**`,
                            `Starts: **${timestampToDisplayTime(start)}**`,
                            `Estimate: _${estimate}_`,
                            `Ends: **${timestampToDisplayTime(ends)}**`,
                            `${runners}`,
                            ''
                        ].join('\n')
                    )
                    .join('\n');
                reply(response);
            } else {
                if (err) {
                    trackError(err);
                }
                reply('Sorry, I got nothin\'.');
            }
        });
    });
};
