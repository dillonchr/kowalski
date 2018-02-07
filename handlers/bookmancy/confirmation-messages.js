const CONF_RESPONSES = [
    'Looking it up',
    'Checking it out',
    'Working on it',
    'Searching now',
    'ON IT MAN',
    'She\'s going as fast as she can, Captain!',
    'Get ready for this',
    'I hope you have enough RAM',
    'Save a tree. Use 3G.',
    'Somebody call 911!',
    'JUST BUY IT ALREADY!!',
    'Do you want it though? I mean really?',
    'I\'m not even working on this one.'
];

module.exports = (b, m) => {
    b.reply(m, {
        response_type: 'ephemeral',
        text: `:mag_right: ${CONF_RESPONSES[Math.floor(Math.random() * CONF_RESPONSES.length)]}`
    });
}
