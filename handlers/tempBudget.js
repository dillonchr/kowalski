const fs = require("fs");
const { trackError } = require("../utils");
const TRANS_PATH = "/data/tempBudgetTrans.json";

let tempBudgetTransactions;

fs.readFile(TRANS_PATH, (err, data) => {
  if (err) {
    console.error(err);
    return trackError(err);
  }
  tempBudgetTransactions = JSON.parse(data);
});

const saveTransactions = () => {
  fs.writeFile(
    TRANS_PATH,
    JSON.stringify(tempBudgetTransactions),
    "utf-8",
    err => {
      if (err) {
        trackError(err);
      }
    }
  );
};

const addTrans = (price, description) => {
  tempBudgetTransactions.push({
    price,
    description
  });
  saveTransactions();
};

const getBalance = () => {
  return (
    "$" +
    tempBudgetTransactions
      .reduce((sum, trans) => sum - trans.price, 0)
      .toFixed(2)
  );
};

const is = {
  balance: s => /^balance/i.test(s),
  debit: s => /([\d.-]+),(.*)$/.test(s)
};

module.exports = bot => {
  bot.hearsAnythingInChannel(
    process.env.TEMP_BUDGET_CHANNEL_ID,
    ({ reply, content }) => {
      const action = content.trim();
      const sendBackBalance = () =>
        reply(`Temporary Budget Balance: ${getBalance()}`);

      if (is.balance(action)) {
        sendBackBalance();
      } else if (is.debit(action)) {
        try {
          const [ignore, price, description] = action.match(/([\d.-]+),(.*)$/);

          if (isNaN(price)) {
            return reply(`\`${price}\` isn\'t a proper amount.`);
          }

          addTrans(price, description);
          sendBackBalance();
        } catch (err) {
          trackError(err);
          reply(`Temporary Budget error: ${err.message}`);
        }
      }
    }
  );
};
