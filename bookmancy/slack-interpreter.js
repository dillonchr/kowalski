module.exports = slackInterpreter = (cmd) => {
    let query = cmd.split(',');
    let i = query.length;
    let author = '';
    let title = '';
    let publisher = '';
    let format = '';
    let year = '';

    while (i--) {
        const val = query[i].trim();
        if (i === 0) {
            author = val;
        } else if (i === 1) {
            title = val;
        } else if (i === 2) {
            publisher = val;
        } else if (i === 4 || (i === 3 && isNaN(val))) {
            format = val;
        } else if (i === 3) {
            year = val;
        }
    }

    return {
        author: author.trim(),
        title: title.trim(),
        publisher: publisher.trim(),
        year: year.trim(),
        format: format.trim()
    };
};
