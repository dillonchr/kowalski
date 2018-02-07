module.exports = (b, m, text) => {
    b.reply(m, {
        response_type: 'ephemeral',
        text
    });
};
