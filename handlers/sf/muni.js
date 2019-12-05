const fetch = require('@dillonchr/fetch')
const moment = require('moment')

const getUrl = (stops) => stops.reduce((url, {route, stop}) => `${url}&stops=${route}|${stop}`, 'http://webservices.nextbus.com/service/publicJSONFeed?command=predictionsForMultiStops&a=sf-muni')

const getNextStopTimes = (buses, done) => {
  fetch({url: getUrl(buses)}, done)
}

const getNextStopFromPrediction = (result) => {
  const { routeTitle: bus, direction } = result
  if (!direction) {
    return `**#${bus}** - *N/A*`
  }
  const dir = Array.isArray(direction) ? direction[0] : direction
  const { prediction } = dir
  const nextStop = Array.isArray(prediction) ? prediction[0] : prediction
  const seconds = +nextStop.seconds
  const min = ~~(seconds/60)
  const sec = (seconds%60).toString().padStart(2, '0')
  const eta = moment(+nextStop.epochTime).utcOffset(-7).format('h:mm:ss a')
  return `**#${bus} ${dir.title}** - ${eta} - ${min}m ${sec}s`
}

const getSecondsUntilNextBus = (buses, done) => {
  getNextStopTimes(buses, (err, res) => {
    if (err) {
      return done(err)
    }
    try {
      let response;
      if (Array.isArray(res.predictions)) {
        response = res.predictions
          .map(getNextStopFromPrediction)
          .join('\n')
      } else {
        response = getNextStopFromPrediction(res.predictions)
      }
      done(null, response)
    } catch(err) {
      done(err)
    }
  })
}

const replyWithErrorHandling = (reply, err, message) => {
  if (err) {
    reply(`Something blew up when fetching predictions: ${err.toString()}`)
  } else {
    reply(message)
  }
}

const ROUTES = {
  home: [
    {route: 2, stop: 6604},
    {route: 3, stop: 6604}
  ],
  pg: [
    {route: 30, stop: 6523}
  ],
  mtg: [
    {route: 2, stop: 6594},
    {route: 3, stop: 6594},
    {route: 47, stop: 6828},
    {route: 49, stop: 6828}
  ],
  union: [
    {route: 2, stop: 6126},
    {route: 3, stop: 6126}
  ],
  crissy: [
    {route: 2, stop: 6594},
    {route: 3, stop: 6594},
    {route: 47, stop: 6830},
    {route: 49, stop: 6830},
    {route: 30, stop: 6801}
  ]
}

module.exports = (bot) => {
  bot.hears(['muni'], ({reply, content}) => {
    const cmd = content.match(/^muni ([a-z]+)/i)
    if (cmd) {
      const key = cmd[1]
      if (ROUTES[key]) {
        getSecondsUntilNextBus(ROUTES[key], replyWithErrorHandling.bind(this, reply))
      }
    }
  })
}

