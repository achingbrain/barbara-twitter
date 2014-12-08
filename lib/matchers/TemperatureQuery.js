var Autowire = require('wantsit').Autowire
  restify = require('restify'),
  AbstractMatcher = require('./AbstractMatcher'),
  util = require('util')

var TemperatureQuery = function() {
  AbstractMatcher.call(this)

  this._logger = Autowire
  this._databaseClient = Autowire
}
util.inherits(TemperatureQuery, AbstractMatcher)

TemperatureQuery.prototype.process = function(tweet, next) {
  var match = tweet.text.toLowerCase().match(/^(@evelinabrewshed)\s(.*)\stemp(erature)?$/)

  if(!match) {
    this._logger.info('TemperatureQuery', 'Did not match', tweet.text)

    return next()
  }

  var name = match[2].trim()

  this._logger.info('TemperatureQuery', 'Searching for', name)

  this._databaseClient.get('/brews/' + encodeURIComponent(name) + '/temperatures', function(error, request, response, temperatures) {
    if(error || !Array.isArray(temperatures)) {
      return next()
    }

    this._reply(tweet, '@' + tweet.user.screen_name + ' ' + name + ' is ' + temperatures[0].celsius + '°C')
  })
}

module.exports = TemperatureQuery
