import moment from "moment";
import {
  formatAmount,
  formattedBalance,
  spend,
  reset,
  updateReset,
  autoDebitGetList,
  autoDebitListAll,
  autoDebitAdd,
  autoDebitRemove,
} from "../pkgs/bankrupt/bankrupt.js";

export const is = {
  balance: (s) => /^balance/i.test(s),
  help: (s) => /^help$/i.test(s),
  debit: (s) => /([\d.-]+),(.*)$/.test(s),
  budget: (s) => /^budget /i.test(s),
  reset: (s) => /^reset$/i.test(s),
  updateReset: (s) => /^set reset [0-9.]+$/.test(s),
  eatingOut: (s) => /^food /i.test(s),
  shopping: (s) => /^shop(ping)? /i.test(s),
  addAutoDebit: (s) => /^new ad [12] [0-9.]+,/i.test(s),
  removeAutoDebit: (s) => /^remove ad [12] \d+$/i.test(s),
  listAutoDebits: (s) => /^list ad ?[12]?$/i.test(s),
};

const EMOJIS = [
  "🤑",
  "💸",
  "💵",
  "💰",
  "💳",
  "💶",
  "🪙",
  "🧀",
  "🍞",
  "🥓",
  "🏦",
  "🏧",
  "🫘",
  "🦴",
  "🥬",
  "🎂",
  "📃",
  "🥗",
];
const emote = () => EMOJIS[~~(Math.random() * EMOJIS.length)];

function jazzedUpReply(reply, replyStr) {
  return reply(
    replyStr.replace(/\$100.00$/, "💯").replace(/\$-?0\.00$/, "$0 💀")
  );
}

export function handleBudget(message, action) {
  if (is.budget(action)) {
    return true;
  }
  return false;
}

export async function handleBalance(message, action) {
  if (is.balance(action)) {
    const { reply } = message;
    await jazzedUpReply(
      reply,
      `You have ${formattedBalance(message.channelId)}`
    );
    return true;
  }
  return false;
}

export async function handleUpdateReset(message, action) {
  if (is.updateReset(action)) {
    const { reply } = message;
    const [amount] = action.match(/[0-9.]+$/);
    const [oa, na] = updateReset(message.channelId, amount);
    if (null != oa) {
      await reply(
        `Changed reset amount to: ${formatAmount(na)} from: ${formatAmount(oa)}`
      );
    } else {
      await reply(`Set reset amount to: ${formatAmount(na)}`);
    }
    return true;
  }
  return false;
}

export async function handleReset(message, action) {
  if (is.reset(action)) {
    const { reply } = message;
    await jazzedUpReply(
      reply,
      `Remaining balance before paycheck reset: ${formattedBalance(
        message.channelId
      )}`
    );
    const [balance, ads] = reset(message.channelId);
    await jazzedUpReply(
      reply,
      `Paycheck balance reset to ${formatAmount(balance)}\nAutodebits:\n${autoDebitListToNumberedList(ads)}`
    );
    return true;
  }
  return false;
}

export async function handleListAutoDebits(message, action) {
  if (is.listAutoDebits(action)) {
    const { reply } = message;
    const pcn = action.match(/[12]$/);
    if (null != pcn) {
      const ads = autoDebitGetList(message.channelId, parseInt(pcn[0]));
      await reply(autoDebitListToNumberedList(ads));
    } else {
      const ads = autoDebitListAll(message.channelId);
      await reply(
        ads.reduce(
          (msg, subads, i) =>
            `${msg}\n\nPaycheck ${i + 1}:\n${autoDebitListToNumberedList(subads)}`,
          ""
        )
      );
    }
    return true;
  }
  return false;
}

export async function handleAddAutoDebit(message, action) {
  if (is.addAutoDebit(action)) {
    const { reply } = message;
    const [ignore, pcn, amount, desc] = action.match(
      /ad ([12]) ([0-9.]+), (.*)$/i
    );
    const ads = autoDebitAdd(
      message.channelId,
      parseInt(pcn),
      parseFloat(amount),
      desc
    );
    await reply(
      `Updated Autodebits for Paycheck ${pcn}:\n${autoDebitListToNumberedList(ads)}`
    );
    return true;
  }
  return false;
}

export async function handleRemoveAutoDebit(message, action) {
  if (is.removeAutoDebit(action)) {
    const { reply } = message;
    const [ignore, pcn, index] = action.match(/ad ([12]) (\d+)$/);
    const ads = autoDebitRemove(
      message.channelId,
      parseInt(pcn),
      parseInt(index)
    );
    await reply(
      `Updated Autodebits for Paycheck ${pcn}:\n${autoDebitListToNumberedList(ads)}`
    );
    return true;
  }
  return false;
}

export async function handleDebit(message, action) {
  if (is.debit(action)) {
    const { reply } = message;
    const [ignore, price] = action.match(/([\d.-]+),(.*)$/);
    if (isNaN(price)) {
      await reply(`Be reasonable! \`${price}\` isn\'t a proper amount.`);
      return true;
    }

    const remainingBal = spend(message.channelId, price);
    await jazzedUpReply(reply, `${emote()} ${formatAmount(remainingBal)}`);
    return true;
  }
  return false;
}

export default (bot) => {
  bot.hearsAnythingInChannel(
    process.env.PAYCHECK_CHANNEL_ID,
    async (message) => {
      const action = message.content.trim();

      if (handleBudget(message, action)) return;
      if (await handleBalance(message, action)) return;
      if (await handleUpdateReset(message, action)) return;
      if (await handleReset(message, action)) return;
      if (await handleListAutoDebits(message, action)) return;
      if (await handleAddAutoDebit(message, action)) return;
      if (await handleRemoveAutoDebit(message, action)) return;
      if (await handleDebit(message, action)) return;
    }
  );
};

function autoDebitListToNumberedList(ads) {
  return (
    ads.reduce(
      (msg, [amount, desc], i) => `${msg}\n${i}: \`${amount}\` ${desc}`,
      ""
    ) || "I don't have anything to show."
  );
}
