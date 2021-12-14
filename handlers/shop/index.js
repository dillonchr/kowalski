const { trackError } = require("../../utils");
const sqlite3 = require("sqlite3");
const DB_PATH = "/data/shop.sqlite";
const db = new sqlite3.Database(DB_PATH);

function printItem(id, name, extraMessage = "") {
  return `\`${parseInt(id, 10)
    .toString(16)
    .padStart(4, "0")}\` **${name}** ${extraMessage}`;
}

module.exports = bot => {
  bot.hears(["shop"], async ({ channel, content, reply }) => {
    if (null != channel && "dm" === channel.type) {
      const action = content.trim().split(" ");
      if ("shop" === action.shift().toLowerCase()) {
        switch (action.shift().toLowerCase()) {
          case "add":
            {
              const item = action.join(" ");
              db.run("INSERT INTO shop (name) VALUES (?)", [item], function (
                err
              ) {
                if (err) {
                  reply(`Uh oh! Couldn't add ${item}`);
                } else {
                  reply(printItem(this.lastID, item, "added!"));
                }
              });
            }
            break;

          case "remove":
          case "buy":
          case "bought":
          case "bot":
          case "r":
          case "b":
            {
              const id = action.shift();
              console.log({ bought: id });
              db.run("DELETE FROM shop WHERE id=?", [id], function (err) {
                if (err) {
                  reply(`Uh oh! Couldn't remove \`id:${id}\``);
                } else {
                  reply("I gotchu");
                }
              });
            }
            break;

          case "list":
          case "show":
            db.all("SELECT id,name FROM shop", function (err, rows) {
              if (err) {
                reply("Oh no! I can't see anything in there.");
              } else if (0 < rows.length) {
                reply(
                  rows.map(({ id, name }) => printItem(id, name)).join("\n")
                );
              } else {
                reply("Nothing's in the list yet!");
              }
            });
            break;

          case "clear":
            db.run("DELETE FROM shop", function (err) {
              if (err) {
                reply("Whoops! Can't clear.");
              } else {
                reply("Done deal.");
              }
            });
            break;

          default:
            console.log("didn't understand " + content);
            break;
        }
      }
    }
  });
};
