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

controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.startConversation(message, function (err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function (response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function () {
                        process.exit();
                    }, 3000);
                }
            },
            {
                pattern: bot.utterances.no,
                default: true,
                callback: function (response, convo) {
                    convo.say('*Phew!*');
                    convo.next();
                }
            }
        ]);
    });
});


controller.hears(['uptime'], 'direct_message,direct_mention,mention', function (bot, message) {
    let hostname = os.hostname();
    let uptime = formatUptime(process.uptime());
    bot.reply(message, `:robot_face: I have been running for ${uptime} on ${hostname}.`);
});

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