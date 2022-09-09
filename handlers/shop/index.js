const { trackError } = require("../../utils");
const sqlite3 = require("sqlite3");
const DB_PATH = "/data/shop.sqlite";
const db = new sqlite3.Database(DB_PATH);

function printItem(id, name, extraMessage = "") {
  return `\`${String(id).padStart(4, "0")}\` **${name}** ${extraMessage}`;
}

function* toIds(xrange) {
  for (const num of xrange.split(",")) {
    const pieces = num.split("..");
    if (1 < pieces.length) {
      const [start, end] = pieces;
      for (let i = parseInt(start); i <= parseInt(end); i++) {
        yield i;
      }
    } else {
      yield parseInt(num);
    }
  }
}

function toDedupedIds(xrange) {
  return Array.from(toIds(xrange)).filter((p, i, a) => a.indexOf(p) === i);
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
              const ids = toDedupedIds(action.shift());
              console.log({ bought: ids });
              // unhappy with this, but couldn't figure out how to actually parameterize it from node
              db.run(
                `DELETE FROM shop WHERE id IN (${ids.join(",")})`,
                [],
                function (err) {
                  if (err) {
                    console.log({ err });
                    reply(
                      `Sorry, please try sending just the ID of the item, not its name`
                    );
                  } else {
                    reply("I gotchu");
                  }
                }
              );
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
            {
              let deleteCommand = "DELETE FROM shop";
              if (action.join(" ").length) {
                deleteCommand += ` WHERE id NOT IN (${toDedupedIds(
                  action.shift()
                ).join(",")})`;
              }
              console.log({ deleteCommand });
              db.run(deleteCommand, function (err) {
                if (err) {
                  reply("Whoops! Can't clear.");
                } else {
                  reply("Done deal.");
                }
              });
            }
            break;

          case "x":
            {
              try {
                console.log({ ids: toDedupedIds(action.shift()) });
              } catch (err) {
                console.log({ err });
              }
            }
            break;

          default:
            console.log("didn't understand " + content);
            break;
        }
      }
    }
  });
};
