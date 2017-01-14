let express = require('express');
let app = express();

module.exports = x => {
    app.all('/wakeup', (req, res) => res.send({
        response_type: 'ephemeral',
        text: `I'm up, I'm up.`,
        mrkdown: true
    }));

    app.listen(process.env.PORT || 3000, x => console.log('Location confirmed. Sending supplies.'));
};
