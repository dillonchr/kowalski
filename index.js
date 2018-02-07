require('dotenv').config();
const Botkit = require('botkit/lib/Botkit.js');
const os = require('os');
const trackError = require('./utils/track-error');

if (!process.env.token) {
    trackError(new Error('no token in environment'));
    process.exit(1);
}

const controller = Botkit.slackbot({debug: false});
const bot = controller.spawn({token: process.env.token}).startRTM();

(require('./handlers/gdq'))(controller);
(require('./handlers/bookmancy/index'))(controller);
(require('./handlers/dailytext'))(controller);
(require('./handlers/budget'))(controller);
(require('./handlers/paycheck'))(controller);
(require('./handlers/fired'))(controller);
(require('./handlers/inflation'))(controller);
(require('./handlers/cryptonics'))(controller);

controller.hears(['uptime'], 'direct_message,direct_mention,mention', (b, m) => {
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
    b.reply(m, `:robot_face: I have been running for ${uptime} ${unit} on ${os.hostname()}.`);
});

controller.hears(['whoami'], 'direct_message', (b, m) => b.reply(m, {response_type: 'ephemeral', text: m.user}));