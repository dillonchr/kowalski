import funhousePkg from "@dillonchr/funhouse";
const { gdq } = funhousePkg;
import { trackError } from "../utils/index.js";
import moment from "moment";

const timestampToDisplayTime = (timestamp) => {
  return moment(timestamp).utcOffset("-05:00").format("h:mm A");
};

function handleGdq(err, g) {
  if (Array.isArray(g) && g.length) {
    const response = g
      .filter((g) => !g.done)
      .slice(0, 5)
      .map(({ runners, title, start, ends, estimate }) => {
        return [
          `**${title}**`,
          `Starts: **${timestampToDisplayTime(start)}**`,
          `Estimate: _${estimate}_`,
          `Ends: **${timestampToDisplayTime(ends)}**`,
          `${runners}`,
          "",
        ].join("\n");
      })
      .join("\n");
    reply(response || "No upcoming runs :video_game:");
  } else {
    if (err) {
      trackError(err);
    }
    reply("Sorry, I got nothin'.");
  }
}

export default (bot) => {
  bot.hears(["gdq", ":video_game:"], ({ reply }) => {
    gdq(handleGdq);
  });
};
