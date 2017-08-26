require('dotenv').config();

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

let Botkit = require('botkit/lib/Botkit.js');
let os = require('os');
let controller = Botkit.slackbot({
    debug: false,
});

let bot = controller.spawn({
    token: process.env.token
}).startRTM();

(require('./server/main'))();
(require('./gdq-schedule/main'))(controller);
(require('./bookmancy/main'))(controller);
(require('./daily-text/main'))(controller);
(require('./paycheck/main'))(controller);
(require('./fired/main'))(controller);

controller.hears(['uptime',], 'direct_message,direct_mention,mention', function (b, m) {
    b.reply(m, `:robot_face: I have been running for ${formatUptime(process.uptime())} on ${os.hostname()}.`);
});

controller.hears(['whoami'], 'direct_message', (b, m) => b.reply(m, {
        response_type: 'ephemeral',
        text: m.user
    }));

function formatUptime(uptime) {
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

    uptime = uptime + ' ' + unit;
    return uptime;
}