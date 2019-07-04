require('dotenv').config();
const os = require('os');
const trackError = require('./utils/track-error');

if (!process.env.DISCORD_TOKEN) {
    trackError(new Error('no token in environment'));
    process.exit(1);
}

const bot = require('@dillonchr/discordbot');

(require('./handlers/gdq'))(bot);
(require('./handlers/bookmancy/index'))(bot);
(require('./handlers/dailytext'))(bot);
(require('./handlers/budget'))(bot);
(require('./handlers/paycheck'))(bot);
(require('./handlers/inflation'))(bot);
(require('./handlers/cryptonics'))(bot);
(require('./handlers/reminders'))(bot);
(require('./handlers/europe'))(bot);
(require('./handlers/weight'))(bot);

bot.hears(['uptime'], ({reply}) => {
    let uptime = process.uptime();
    let unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime > 24) {
        uptime = uptime / 24;
        unit = 'day';
    }
    if (uptime > 30) {
        uptime = uptime / 30;
        unit = 'month';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }
    reply(`:robot_face: I have been running for ${uptime} ${unit} on ${os.hostname()}.`);
});

bot.hears(['whoami'], ({reply, author}) => reply(`${author.username} \`${author.id}\``));

