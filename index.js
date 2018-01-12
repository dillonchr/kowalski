require('dotenv').config();
const Botkit = require('botkit/lib/Botkit.js');
const os = require('os');

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}
const controller = Botkit.slackbot({debug: false});
const bot = controller.spawn({token: process.env.token}).startRTM();

(require('./gdq-schedule/main'))(controller);
(require('./bookmancy/main'))(controller);
(require('./daily-text/main'))(controller);
(require('./budget/main'))(controller);
(require('./paycheck/main'))(controller);
(require('./fired/main'))(controller);
(require('./inflation/main'))(controller);
(require('./crypter/main'))(controller);

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