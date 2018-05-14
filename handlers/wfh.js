const {wfh} = require('funhouse-client');
const {trackError} = require('../utils');

module.exports = bot => {
    bot.hears(['wfh'], reply => {
        reply(':mag: :foggy: :homes: :hourglass:');
        wfh((err, info) => {
            if (err) {
                trackError(err);
                reply('Whoops! ' + err.message);
            } else {
                if (info.wfh) {
                    reply(info.who.reduce((str, who) => `${str}\n${who}`, 'People working from :house: today:'));
                } else {
                    reply(':office: :disappointed:');
                }
            }
        });
    });
};
