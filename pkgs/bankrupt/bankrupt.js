const { read, save } = require("./persist.js");
const { BANKRUPT_DEFAULT_PAYCHECK_AMOUNT } = process.env;
const DefaultPaycheckAmt = BANKRUPT_DEFAULT_PAYCHECK_AMOUNT || 1000;

// this is the in-memory paycheck and budget information
let register = {};

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  trailingZeroDisplay: "stripIfInteger"
});

async function onInit() {
  register = await read();
}

function balance(id) {
  if (null != id && !(id in register)) {
    register[id] = 0.0;
  }
  return register[id];
}
function formattedBalance(id) {
  return formatAmount(balance(id));
}
function formatAmount(amount) {
  return USD_FORMATTER.format(amount);
}

function spend(id, amount) {
  if (null != id) {
    register[id] = balance(id) - amount;
    save(register);
    return register[id];
  }
}

function reset(id, amount = DefaultPaycheckAmt) {
  const linkedBudgetConfig = register[`linked-budget-${id}`];
  if (null != linkedBudgetConfig) {
    const { ids, cut } = linkedBudgetConfig;
    const beginningBal = cut / ids.length;
    for (const budgetId of ids) {
      reset(budgetId, balance(budgetId) + beginningBal);
      amount -= beginningBal;
    }
  }
  register[id] = amount;
  save(register);
  return balance(id);
}

/* do not await */ onInit();

module.exports = {
  balance,
  formatAmount,
  formattedBalance,
  spend,
  reset
};
