var Container = require('wantsit').Container,
  Twitter = require('twitter'),
  restify = require('restify'),
  winston = require('winston')

if(!process.env.BARBARA_TWITTER_CONSUMER_KEY) {
  throw new Error('Please specify a twitter consumer key environmental variable')
}

if(!process.env.BARBARA_TWITTER_CONSUMER_SECRET) {
  throw new Error('Please specify a twitter consumer secret environmental variable')
}

if(!process.env.BARBARA_TWITTER_ACCESS_TOKEN_KEY) {
  throw new Error('Please specify a twitter access token key environmental variable')
}

if(!process.env.BARBARA_TWITTER_ACCESS_TOKEN_SECRET) {
  throw new Error('Please specify a twitter access token secret environmental variable')
}

process.env.BARBARA_DATABASE_URL = process.env.BARBARA_DATABASE_URL || 'http://localhost:8493'
process.env.BARBARA_TEMPERATURE_URL = process.env.BARBARA_TEMPERATURE_URL || 'http://localhost:7583'

var container = new Container()
container.createAndRegister('logger', winston.Logger, {
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
})
container.createAndRegister('twitter', Twitter, {
  consumer_key: process.env.BARBARA_TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.BARBARA_TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.BARBARA_TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.BARBARA_TWITTER_ACCESS_TOKEN_SECRET
})

container.register('temperatureClient', restify.createJsonClient({
  url: process.env.BARBARA_TEMPERATURE_URL
}))
container.register('databaseClient', restify.createJsonClient({
  url: process.env.BARBARA_DATABASE_URL
}))

container.register('matchers', [
  container.createAndRegister('temperatureQuery', require('./lib/matchers/TemperatureQuery'))
])

container.createAndRegister('twitterWatcher', require('./lib/components/TwitterWatcher'))
