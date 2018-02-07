const { fired } = require('funhouse-client');
const is = {
    fired: s => /^fired\s?/i.test(s),
    list: s => /^list/i.test(s),
    update: s => /^update/i.test(s)
};

module.exports = (c) => {
    c.hears('fired', 'direct_message,direct_mention', (b, m) => {
        const message = m.text.trim();
        const reply = options => {
            if (typeof text === 'string') {
                options = {
                    response_type: 'ephemeral',
                    text: options
                };
            }
            b.reply(m, options);
        };

        if (is.fired(message)) {
            const isUpdate = is.update(message.substr(6));
            const call = isUpdate ? fired.update : fired.list;
            console.log(isUpdate ? 'updating' : 'listing');

            if (isUpdate) {
                reply('Updating and comparing rosters');
            } else {
                reply('Fetching current roster');
            }

            call((err, emps) => {
                if (err) {
                    trackError(err);
                    return reply(`Error occurred!: ${err.message}`);
                }
                reply({
                    text: isUpdate ? (emps && emps.length ? ' :smiling_imp: We got some fresh meat' : ':face_with_rolling_eyes: No one new') : ':fire: Here\'s who\'s been fired',
                    response_type: 'ephemeral',
                    attachments: emps
                        .map(e => ({
                            fallback: e.name,
                            color: '#FF0000',
                            author_name: e.position,
                            title: e.name,
                            text: e.bio,
                            thumb_url: e.profilePic,
                            ts: Math.floor(e.fireDate / 1000)
                        }))
                });
            });
        } else {
            console.log('where did you go?');
        }
    });
};

