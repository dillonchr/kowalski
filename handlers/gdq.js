const {gdq} = require('@dillonchr/funhouse');
const {trackError} = require('../utils');
const moment = require('moment');

module.exports = bot => {
    bot.hears(['gdq', ':video_game:'], reply => {
        gdq((err, g) => {
            if (g && g.length) {
                const response = g
                    .filter(g => !g.done)
                    .slice(0, 5)
                    .map(
                        ({runners, title, start, ends, estimate}) => {
                            return [
                                `**${title}**`,
                                `Starts: **${moment(start).format('h:mm A')}**`,
                                `Estimate: _${estimate}_`,
                                `Ends: **${moment(ends).format('h:mm A')}**`,
                                `${runners}`,
                                ''
                            ].join('\n');
                        }
                    )
                    .join('\n');
                reply(response || 'No upcoming runs :video_game:');
            } else {
                if (err) {
                    trackError(err);
                }
                reply('Sorry, I got nothin\'.');
            }
        });
    });
};
