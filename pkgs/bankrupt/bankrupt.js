import { read, save } from "./persist.js";
const { BANKRUPT_DEFAULT_PAYCHECK_AMOUNT } = process.env;
const DefaultPaycheckAmt = BANKRUPT_DEFAULT_PAYCHECK_AMOUNT || 1000;

// this is the in-memory paycheck and budget information
let register = {};

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  trailingZeroDisplay: "stripIfInteger",
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

function regResetKey(id) {
  return `reset-${id}`;
}

function regGetResetAmt(id) {
  return register[regResetKey(id)];
}

function _pay(id, amount) {
  if (null != id) {
    register[id] = balance(id) + amount;
    // save(register); TODO: reinstate if later it's not called in reset only
    // return register[id];
  }
}

function reset(id) {
  let amount = regGetResetAmt(id) ?? DefaultPaycheckAmt;
  for (const [budgetId, beginningBal] of budgetConfigRecs(id)) {
    _pay(budgetId, beginningBal);
    amount -= beginningBal;
  }
  const dateOfMon = new Date().getDate();
  const paycheckNumber = dateOfMon < 12 || 26 < dateOfMon ? 1 : 2;
  register[id] = amount - autoDebitAmount(id, paycheckNumber);
  save(register);
  return [balance(id), autoDebitGetListFull(id, paycheckNumber)];
}

function updateReset(id, amount) {
  const key = regResetKey(id);
  const oldReset = register[key];
  register[key] = parseFloat(amount);
  save(register);
  return [oldReset, amount];
}

/* budget mgmt */
function budgetConfig(id) {
  return register[`linked-budget-${id}`];
}
function budgetConfigRecs(id) {
  const config = budgetConfig(id);
  if (null != config) {
    const { ids, cut } = config;
    const beginningBal = cut / ids.length;
    return ids.map((id) => [id, beginningBal]);
  }
  return [];
}

/* autodebits */
function autoDebitKey(id, paycheckNum) {
  return `ad-${id}-pc-${paycheckNum}`;
}
function autoDebitGetList(id, paycheckNum) {
  return register[autoDebitKey(id, paycheckNum)] ?? [];
}
function autoDebitAmount(id, paycheckNum) {
  return autoDebitGetList(id, paycheckNum).reduce(
    (sum, [current]) => sum + current,
    0.0
  );
}
function autoDebitGetListFull(id, paycheckNum) {
  const budgets = budgetConfig(id);
  const list =
    null != budgets ? [[budgets.cut, `Budgets (${budgets.ids.length})`]] : [];
  const adList = register[autoDebitKey(id, paycheckNum)];
  return null != adList ? [...list, ...adList] : list;
}
function autoDebitAdd(id, paycheckNum, amount, description) {
  const updatedList = [
    ...autoDebitGetList(id, paycheckNum),
    [amount, description],
  ];
  register[autoDebitKey(id, paycheckNum)] = updatedList;
  save(register);
  return updatedList;
}
function autoDebitRemove(id, paycheckNum, index) {
  const list = autoDebitGetList(id, paycheckNum);
  if (index < list.length) {
    list.splice(index, 1);
    register[autoDebitKey(id, paycheckNum)] = list;
    save(register);
    return list;
  }
  return [];
}
function autoDebitListAll(id) {
  return [1, 2].map((n) => autoDebitGetList(id, n));
}

/* do not await */ onInit();

export {
  autoDebitAdd,
  autoDebitGetList,
  autoDebitListAll,
  autoDebitRemove,
  balance,
  formatAmount,
  formattedBalance,
  spend,
  reset,
  updateReset,
};
