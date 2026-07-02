export default (b, m, text) => {
    b.reply(m, {
        response_type: 'ephemeral',
        text
    });
};
