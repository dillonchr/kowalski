module.exports = (searchTitle, searchUrl, x = [], isEbay = false) => {
  const MAX_RESULTS = 50;
  const RESULTS_LIMIT = 7;
  /**
   * slack doesn't need full results listed, just first three
   * @type {*}
   */
  const sharedResults = x.slice(0, RESULTS_LIMIT);
  /**
   * counting unshown results here
   * @type {string}
   */
  // prettier-ignore
  const hiddenResultsIdenifier =
    x.length >= MAX_RESULTS ? "many" :
      x.length - RESULTS_LIMIT > 0 ? "some" : "no";

  return [`Searched for \`${searchTitle}\``, ""]
    .concat(
      sharedResults.map(r => {
        const shipping =
          !!r.shipping && !isNaN(r.shipping) && `+ $${r.shipping}s/h`;
        const year = r.year && `(${r.year})`;

        return [
          [`**$${r.price}**`, shipping, year].filter(s => !!s).join(" "),
          r.about.length > 120 ? r.about.substr(0, 120) + "..." : r.about,
          ""
        ].join("\n");
      })
    )
    .concat([
      !isEbay ? searchUrl : undefined,
      !isEbay
        ? `There are ${hiddenResultsIdenifier} more results in the search above :point_up:`
        : undefined
    ])
    .join("\n");
};
