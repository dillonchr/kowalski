require("dotenv").config();
const os = require("os");
const trackError = require("./utils/track-error");
const { Client } = require("discord.js");

if (!process.env.DISCORD_TOKEN) {
  trackError(new Error("no token in environment"));
  process.exit(1);
}

const handlers = [];
const client = new Client();
client.on("ready", () => {
  // eslint-disable-next-line no-console
  console.log("Location confirmed. Sending supplies.");
});
client.on("message", message => {
  if (message.author.username !== client.user.username) {
    for (const h of handlers) {
      if (h(message)) {
        break;
      }
    }
  }
});
client.login(process.env.DISCORD_TOKEN);

const bot = {
  hears: (queries, handler) => {
    handlers.push(message => {
      const lowercaseContent = message.content.toLowerCase();
      if (queries.some(q => lowercaseContent.includes(q))) {
        message.reply = (msg, opts) => message.channel.send(msg, opts);
        handler(message);
        return true;
      }
    });
  },
  hearsAnythingInChannel: (channelId, handler) => {
    handlers.push(message => {
      if (channelId === message.channel.id) {
        message.reply = (msg, opts) => message.channel.send(msg, opts);
        handler(message);
        return true;
      }
    });
  }
};

require("./handlers/paycheck")(bot);
require("./handlers/budget")(bot);
require("./handlers/tempBudget")(bot);
require("./handlers/weight")(bot);
require("./handlers/gdq")(bot);
require("./handlers/bookmancy/index")(bot);
require("./handlers/dailytext")(bot);
require("./handlers/inflation")(bot);
require("./handlers/cryptonics")(bot);
require("./handlers/reminders")(bot);
require("./handlers/sf/gg")(bot);
require("./handlers/xe")(bot);

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
