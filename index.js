import dotenv from "dotenv";
dotenv.config();
import os from "os";
import trackError from "./utils/track-error.js";
import { Client, GatewayIntentBits, Partials } from "discord.js";

import paycheckHandler from "./handlers/paycheck.js";
import budgetHandler from "./handlers/budget.js";
import tempBudgetHandler from "./handlers/tempBudget.js";
import gdqHandler from "./handlers/gdq.js";
import bookmancyHandler from "./handlers/bookmancy/index.js";
import inflationHandler from "./handlers/inflation.js";
import cryptonicsHandler from "./handlers/cryptonics.js";
import remindersHandler from "./handlers/reminders.js";
import shopHandler from "./handlers/shop/index.js";

if (!process.env.DISCORD_TOKEN) {
  trackError(new Error("no token in environment"));
  process.exit(1);
}

const handlers = [];
const client = new Client({
  intents:
    GatewayIntentBits.Guilds |
    GatewayIntentBits.GuildMessages |
    GatewayIntentBits.DirectMessages |
    GatewayIntentBits.MessageContent,
  partials: [Partials.Channel],
});
client.on("ready", () => {
  // eslint-disable-next-line no-console
  console.log("Location confirmed. Sending supplies.");
});
client.on("messageCreate", (message) => {
  if (message.author.username !== client.user.username) {
    for (const h of handlers) {
      if (h(message)) {
        break;
      }
    }
  }
});
client.login(process.env.DISCORD_TOKEN);

function replyBuilder(originalMessage, responseMsg, opts) {
  if (!originalMessage.channel) {
    client.channels.fetch(originalMessage.channelId).then((channel) => {
      channel.send(responseMsg, opts);
    });
  } else {
    originalMessage.channel.send(responseMsg, opts);
  }
}

const bot = {
  hears: (queries, handler) => {
    handlers.push((message) => {
      const lowercaseContent = message.content.toLowerCase();
      if (queries.some((q) => lowercaseContent.includes(q))) {
        message.reply = (msg, opts) => replyBuilder(message, msg, opts);
        handler(message);
      }
    });
  },
  hearsAnythingInChannel: (channelId, handler) => {
    handlers.push((message) => {
      if (channelId === message.channelId) {
        message.reply = (msg, opts) => replyBuilder(message, msg, opts);
        handler(message);
      }
    });
  },
};

paycheckHandler(bot);
budgetHandler(bot);
tempBudgetHandler(bot);
gdqHandler(bot);
bookmancyHandler(bot);
inflationHandler(bot);
cryptonicsHandler(bot);
remindersHandler(bot);
shopHandler(bot);

bot.hears(["uptime"], ({ reply }) => {
  let uptime = process.uptime();
  let unit = "second";
  if (uptime > 60) {
    uptime = uptime / 60;
    unit = "minute";
  }
  if (uptime > 60) {
    uptime = uptime / 60;
    unit = "hour";
  }
  if (uptime > 24) {
    uptime = uptime / 24;
    unit = "day";
  }
  if (uptime > 30) {
    uptime = uptime / 30;
    unit = "month";
  }
  if (uptime != 1) {
    unit = unit + "s";
  }
  reply(
    `:robot_face: I have been running for ${uptime} ${unit} on ${os.hostname()}.`
  );
});

bot.hears(["whoami"], ({ reply, author }) =>
  reply(`${author.username} \`${author.id}\``)
);
