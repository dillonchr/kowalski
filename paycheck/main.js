const paycheck = new (require('./paycheck'))();
const is = {
    module: s => /^paycheck /i.test(s),
    balance: s => /^balance/i.test(s),
    bought: s => /^pay /i.test(s),
    reset: s => /^reset/i.test(s)
};

function reply(b, m, text) {
    b.reply(m, {
        response_type: 'ephemeral',
        text: text
    });
}

module.exports = controller => {
    //    TODO: don't hack this way
    (require('../budget/main'))(controller, paycheck);

    controller.on('direct_message', (b, m) => {
        const message = m.text.trim();
        if (is.module(message)) {
            const action = message.substr(9);

            if (is.balance(action)) {
                paycheck.balance()
                    .then(bal => reply(b, m, `You have $${bal}`));
            } else if (is.bought(action)) {
                paycheck.pay(action.substr(4))
                    .then(res => reply(b, m, `You have $${res} left`))
                    .catch(err => reply(b, m, err));
            } else if (is.reset(action)) {
                paycheck.reset(action.substr(6))
                    .then(bal => reply(b, m, `Budget reset to $${bal} :+1:`));
            }
        }
    });
};

