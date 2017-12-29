const budget = new (require('./budget'))();

function reply(b, m, text) {
    b.reply(m, {
        response_type: 'ephemeral',
        text
    });
}

module.exports = (controller, paycheckInstance) => {
    budget.paycheck = paycheckInstance;

    controller.on('direct_message,direct_mention,ambient', (b, m) => {
        const isInPaycheckChannel = m.channel === 'G5JA6R84V';

        if (m.event !== 'ambient' || isInPaycheckChannel) {
            const action = m.text.trim();
            const userId = m.user;
            
            if (/^(budget )?balance/i.test(action)) {
                budget.balance(userId)
                    .then(({bal, trans}) => {
                        const text = `Your balance is *$${bal}*`;
                        b.reply(m, {
                            text,
                            attachments: [
                                {
                                    fallback: text,
                                    color: bal >= 20 ? '#36a64f' : bal >= 1 ? '#FECC43' : '#FF0000',
                                    fields: trans.reverse().map(t => ({
                                        short: false,
                                        title: t.description,
                                        value: `- $${t.price.toFixed(2)}`
                                    }))
                                }
                            ]
                        });
                });
            } else if (/^budget /i.test(action)) {
                budget.bought(userId, ...action.substr(7).split(','))
                    .then(({bal}) => reply(b, m, `You have $${bal} left`))
                    .catch(err => reply(b, m, err));
            }
        }
    });
};

