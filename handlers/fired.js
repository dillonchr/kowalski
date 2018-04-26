const {fired} = require('funhouse-client');
const moment = require('moment');
const {trackError} = require('../utils');
const is = {
    fired: s => /^fired\s?/i.test(s),
    update: s => /^update/i.test(s)
};

module.exports = bot => {
    bot.hears(['fired'], (reply, m) => {
        const message = m.content.trim();
        if (is.fired(message)) {
            const isUpdate = is.update(message.substr(6));
            const call = isUpdate ? fired.update : fired.list;

            if (isUpdate) {
                reply('Updating and comparing rosters');
            } else {
                reply('Fetching current exes');
            }

            call((err, emps) => {
                if (err) {
                    trackError(err);
                    return reply(`Error occurred!: ${err.message}`);
                }
                const response = [
                    isUpdate ? (emps && emps.length ? ' :smiling_imp: We got some fresh meat' : ':face_with_rolling_eyes: No one new') : undefined,
                    ''
                ]
                    .concat(emps.slice(0, 5).map(e => [
                        `**${e.name}** - *${e.position}* - :fire: ${moment(e.fireDate).format('MMM Do YY')}`,
                        e.bio,
                        ''
                    ].join('\n')))
                    .join('\n');
                reply(response);
            });
        } else {
            console.log('where did you go?');
        }
    });
};

