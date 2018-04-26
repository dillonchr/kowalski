require('dotenv').config();
const os = require('os');
const trackError = require('./utils/track-error');

if (!process.env.token) {
    trackError(new Error('no token in environment'));
    process.exit(1);
}

const bot = require('./bot');

(require('./handlers/gdq'))(bot);
(require('./handlers/bookmancy/index'))(bot);
(require('./handlers/dailytext'))(bot);
// (require('./handlers/budget'))(bot);
// (require('./handlers/paycheck'))(bot);
// (require('./handlers/fired'))(bot);
// (require('./handlers/inflation'))(bot);
// (require('./handlers/cryptonics'))(bot);


bot.hears(['uptime'], reply => {
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
    if (uptime != 1) {
        unit = unit + 's';
    }
    reply(`:robot_face: I have been running for ${uptime} ${unit} on ${os.hostname()}.`);
});

bot.hears(['whoami'], (reply, m) => reply(`${m.author.username} \`${m.author.id}\``));
