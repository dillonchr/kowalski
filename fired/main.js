const fired = new (require('./fired'))();
const is = {
    fired: s => /^fired /i.test(s),
    list: s => /^list/i.test(s),
    update: s => /^update/i.test(s)
};

module.exports = (c) => {
    c.on('direct_message,direct_mention', (b, m) => {
        const message = m.text.trim();
        if (is.fired(message)) {
            function reply(options) {
                if (typeof text === 'string') {
                    options = {
                        response_type: 'ephemeral',
                        text: options
                    };
                }
                b.reply(m, options);
            }

            const isUpdate = is.update(message.substr(6));
            const promise = fired[isUpdate ? 'update' : 'list']();

            if (isUpdate) {
                reply('Updating and comparing rosters');
            } else {
                reply('Fetching current roster');
            }

            promise
                .then(emps => reply({
                    text: isUpdate ? (emps && emps.length ? ' :smiling_imp: We got some fresh meat' : ':face_with_rolling_eyes: No one new') : ':fire: Here\'s who\'s been fired',
                    response_type: 'ephemeral',
                    attachments: emps
                        .sort((a, b) => b.fireDate - a.fireDate)
                        .map(e => ({
                            fallback: e.name,
                            color: '#FF0000',
                            author_name: e.position,
                            title: e.name,
                            text: e.bio,
                            thumb_url: e.profilePic,
                            ts: Math.floor(e.fireDate / 1000)
                        }))
                }))
                .catch(err => reply(`Error occurred!: ${err.message || err.toString()}`));
        }
    });
};

