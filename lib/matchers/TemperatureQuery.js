var Autowire = require('wantsit').Autowire
  restify = require('restify'),
  AbstractMatcher = require('./AbstractMatcher'),
  util = require('util')

var TemperatureQuery = function() {
  AbstractMatcher.call(this)

  this._logger = Autowire
  this._temperatureClient = Autowire
}
util.inherits(TemperatureQuery, AbstractMatcher)

TemperatureQuery.prototype.process = function(tweet, next) {
  var match = tweet.text.toLowerCase().match(/^(@evelinabrewshed)\s(.*)\stemp(erature)?$/)

  if(!match) {
    this._logger.info('TemperatureQuery', 'Did not match', tweet.text)

    return next()
  }

  var brewName = match[2].trim()

  this._logger.info('TemperatureQuery', 'Searching for', brewName)

  this._findBrewId(brewName, function(error, brewId) {
    if(error) {
      this._logger.error('TemperatureQuery', 'Could not find brew for name', brewName, error.message)

      return next()
    }

    this._checkTemperature(brewId, function(error, temperature) {
      if(error) {
        this._logger.error('TemperatureQuery', 'Could not read temperature of brew is', brewId, error.message)
      }

      if(error || !temperature || isNaN(temperature)) {
        return next()
      }

      this._reply(tweet, '@' + tweet.user.screen_name + ' ' + brewName + ' is ' + temperature + '°C')
    }.bind(this))
  }.bind(this))
}

TemperatureQuery.prototype._findBrewId = function(name, callback) {
  this._logger.info('TemperatureQuery Trying to find brew id from %s/brews?name=%s', process.env.BARBARA_DATABASE_URL, encodeURIComponent(name))

  restify.createJsonClient({
    url: process.env.BARBARA_DATABASE_URL
  }).get('/brews?name=' + encodeURIComponent(name), function(error, request, response, object) {
    callback(error, object ? object.id : null)
  }.bind(this))
}

TemperatureQuery.prototype._checkTemperature = function(brewId, callback) {
  this._temperatureClient.get('/config', function(error, request, response, object) {
    if(error) {
      this._logger.error('TemperatureWatcher Could not get config from %s/config %s', process.env.BARBARA_TEMPERATURE_URL, error.stack)

      return
    }

    if(object.brew.id != brewId) {
      return
    }

    // we're found the temperature sensor we're after
    client.get('/temperature', function(error, request, response, object) {
      callback(error, object ? object.celsius : null)
    })
  }.bind(this))
}

module.exports = TemperatureQuery
