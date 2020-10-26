const fs = require("fs");
const { trackError } = require("../utils");
const ZOOM_PATH = "/data/zoom";

let expirationTimerId = -1;

function publishZoomUrl(url) {
  fs.writeFile(ZOOM_PATH, url, "utf-8", err => {
    if (err) {
      trackError(err);
    } else {
      clearTimeout(expirationTimerId);
      expirationTimerId = setTimeout(removeZoomUrl, 60000);
    }
  });
}

function removeZoomUrl() {
  fs.unlink(ZOOM_PATH, err => {
    if (err) {
      trackError(err);
    }
  });
}

module.exports = bot => {
  bot.hears(["shindig "], async function (message) {
    const action = message.content.trim();

    try {
      const [ignore, url] = action.match(/^shindig ([^ ]+)$/i);

      if (url) {
        if (url === "remove") {
          removeZoomUrl();
          clearTimeout(expirationTimerId);
          await message.react("🗑");
        } else {
          publishZoomUrl(url);
          await message.react("🎬");
        }
      }
    } catch (err) {
      trackError(err);
      message.reply(`Shindig error: ${err.message}`);
    }
  });
};
