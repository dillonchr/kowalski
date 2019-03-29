const { add, connect } = require('@dillonchr/reminders');

module.exports = bot => {
    bot.hears(['remind '], (reply, m) => {
        const command = m.content.trim().replace(/^remind /i, '');
        const userId = m.author.id;
        add({
            command,
            userId,
            commandCallback: (err, res) => {
                reply(err || res);
            },
            onRemind: ({message}) => {
                reply(message);
            }
        });
    });

    /*connect(({userId, message}) => {
        bot.sendMessage({to: userId, message});
    });*/
};


