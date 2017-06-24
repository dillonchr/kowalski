const budget = new (require('./budget'))();
const is = {
    budget: s => /^budget /i.test(s),
    balance: s => /^balance/i.test(s),
    bought: s => /^bought/i.test(s),
    canBuy: s => /^can/i.test(s),
    help: s => /^help/i.test(s)
};

function reply(b, m, text) {
    b.reply(m, {
        response_type: 'ephemeral',
        text: text
    });
}

module.exports = (controller, paycheckInstance) => {
    budget.paycheck = paycheckInstance;

    controller.on('direct_message', (b, m) => {
        const message = m.text.trim();
        if (is.budget(message)) {
            const action = message.substr(7);
            const uId = m.user;

            if (is.help(action)) {
                const helpText = [
                    '`budget balance`\ngets balance and transactions',
                    '`budget bought {name}, {price}`\nadd transaction with a short `name` and the `price`',
                    '`budget canbuy {amount}`\nchecks if you can afford to spend amount'
                ].join('\n\n');
                b.reply(m, helpText);
            } else if (is.balance(action)) {
                budget.balance(uId)
                    .then(({bal, trans}) => {
                        const title = `Your balance is *$${bal}*`;
                        const fields = trans.reverse().map(t => ({
                            short: false,
                            title: t.description,
                            value: `- $${t.price.toFixed(2)}`
                        }));
                        b.reply(m, {
                            text: title,
                            attachments: [
                                {
                                    fallback: title,
                                    color: bal >= 20 ? '#36a64f' : bal >= 1 ? '#FECC43' : '#FF0000',
                                    fields: fields
                                }
                            ]
                        });
                });
            } else if (is.bought(action)) {
                budget.bought(uId, ...action.substr(7).split(','))
                    .then(({bal}) => reply(b, m, `You have $${bal} left`))
                    .catch(err => reply(b, m, err));
            } else if (is.canBuy(action)) {
                const amount = action.match(/\d+\.?\d+/);
                if (amount && amount.length > 0) {
                    budget.canBuy(uId, amount[0])
                        .then(a => reply(b, m, !!a ? 'You can do it!' : 'Not enough funds.'));
                } else {
                    reply(b, m, 'I don\'t see the price in this message...');
                }
            }
        }
    });
};

