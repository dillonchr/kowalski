const { add, connect } = require('@dillonchr/reminders');

module.exports = bot => {
    bot.hears(['remind '], ({reply, content, author}) => {
        const command = content.trim().replace(/^remind /i, '');
        const userId = author.id;
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

    connect(({userId, message}) => {
        bot.sendMessage(userId, message);
    });
};


