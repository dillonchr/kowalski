const { budget } = require('funhouse-client');
const { trackError, whisper } = require('../utils/index');

const respondWithBalance = (b, m, userId) => {
    budget.balance(userId, (err, data) =>  {
        if (err) {
            trackError(err);
            return whisper(b, m, `budget error: ${err.message}`);
        }
        whisper(b, m, `Your budget is at *$${data.balance}*`);
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
                budget.bought(userId, price, description, (err, data) => {
                    if (err) {
                        trackError(err);
                        return whisper(b, m, `Budget broke: ${err.message}`);
                    }
                    whisper(b, m, `You now have $${data.balance} left`);
                });
            }  else if (isInPaycheckChannel && /^reset /i.test(action)) {
                // budget.onPaycheckReset()
                //     .then(() => reply(b, m, `Budget reset... calculating balance`))
                //     .then(() => respondWithBalance(b, m, userId));
            }
        }
    });
};

