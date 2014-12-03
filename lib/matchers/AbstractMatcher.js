var Autowire = require('wantsit').Autowire

var AbstractMatcher = function() {
  this._twitter = Autowire
  this._logger = Autowire
}

AbstractMatcher.prototype._reply = function(tweet, message) {
  this._logger.info('TemperatureQuery', 'Replying to', tweet.id_str, 'with', message)

  this._twitter.updateStatus(message + '\r\n\r\n' + (new Date()).getTime(), {
    in_reply_to_status_id: tweet.id_str
  }, function(result) {
    this._logger.info('Posted', result)
  }.bind(this))
}

module.exports = AbstractMatcher
