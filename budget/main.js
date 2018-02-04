const { budget } = require('funhouse-client');

const reply = (b, m, text) => b.reply(m, {response_type: 'ephemeral', text});

const respondWithBalance = (b, m, userId) => {
    budget.balance(userId, (err, {balance}) =>  {
        b.reply(m, `Your balance is *$${balance}*`);
    });
};

module.exports = controller => {
    controller.on('direct_message,direct_mention,ambient', (b, m) => {
        const isInPaycheckChannel = m.channel === 'G5JA6R84V';

        if (m.event !== 'ambient' || isInPaycheckChannel) {
            const action = m.text.trim();
            const userId = m.user;
            
            if (/^(budget )?balance/i.test(action)) {
                respondWithBalance(b, m, userId);
            } else if (/^budget /i.test(action)) {
                const [ price, description ] = action.substr(7).split(',');
                budget.bought(userId, price, description, (err, {balance}) => {
                    reply(b, m, err || `You have $${balance} left`);
                });
            }  else if (isInPaycheckChannel && /^reset /i.test(action)) {
                // budget.onPaycheckReset()
                //     .then(() => reply(b, m, `Budget reset... calculating balance`))
                //     .then(() => respondWithBalance(b, m, userId));
            }
        }
    });
};

