module.exports = slacker = (searchTitle, searchUrl, x, isEbay = false) => {
    const MAX_RESULTS = 50;
    const RESULTS_LIMIT = 5;
    /**
     * slack doesn't need full results listed, just first three
     * @type {*}
     */
    const sharedResults = x.slice(0, RESULTS_LIMIT);
    /**
     * counting unshown results here
     * @type {string}
     */
    const hiddenResultsIdenifier = x.length === MAX_RESULTS ? 'many' : x.length - RESULTS_LIMIT > 0 ? 'some' : 'no';
    /**
     * color-coding the message based on result count
     * @type {string}
     */
    const hiddenResultsColor = '#' + (hiddenResultsIdenifier === 'many' ?
        '01897B' : hiddenResultsIdenifier === 'some' ? 'FDD838' : 'EF5A53');
    /**
     * building response in var for debugging
     * FIXME: just return stringified response after tested fully
     * @type {{attachments: [*]}}
     */
    return {
        response_type: 'in_channel',
        text: `Searched for \`${searchTitle}\``,
        mrkdown: true,
        attachments: [
            {
                author_name: "Bookmancy Price Results",
                color: hiddenResultsColor,
                text: `There are ${hiddenResultsIdenifier} more results in the search above :point_up:`,
                title: `See Search Results For: ${searchTitle}`,
                title_link: searchUrl,
                footer: `${isEbay ? 'ebay' : 'AbeBooks'} API`,
                footer_icon: isEbay ? 'https://pages.ebay.com/favicon.ico' : 'https://www.abebooks.com/images/gateway/heroes/bookbird-avatar.png'
            }
        ]
            .concat(sharedResults.map(r => {
                const title = [`$${r.price}`, r.shipping, r.year && '(' + r.year + ')']
                    .filter(s => !!s)
                    .join(' ');
                const text = r.about.length > 120 ? r.about.substr(0, 120) + '...' : r.about;

                return {
                    color: hiddenResultsColor,
                    title: title,
                    text: text,
                    fallback: r.price,
                    thumb_url: r.image,
                    title_link: r.url,
                    ts: r.date
                };
            }))
    };
};