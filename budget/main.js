const budget = require('./budget');
const is = {
    budget: s => /^budget /i.test(s),
    balance: s => /^balance/i.test(s),
    bought: s => /^bought/i.test(s),
    reset: s => /^reset/i.test(s),
    canBuy: s => /^can/i.test(s)
};

function reply(b, m, text) {
    b.reply(m, {
        response_type: 'ephemeral',
        text: text
    });
}

module.exports = controller => {
    controller.on('direct_message', (b, m) => {
        const message = m.text.trim();
        if (is.budget(message)) {
            const action = message.substr(7);
            const uId = m.user;

            if (is.balance(action)) {
                budget.balance(uId)
                    .then(bal => reply(b, m, `You have $${bal}`));
            } else if (is.bought(action)) {
                budget.bought(uId, ...action.substr(7).split(','))
                    .then(res => reply(b, m, `You have $${res} left`))
                    .catch(err => reply(b, m, err));
            } else if (is.reset(action)) {
                budget.resetBudget(uId)
                    .then(() => reply(b, m, 'Budget reset :+1:'));
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

