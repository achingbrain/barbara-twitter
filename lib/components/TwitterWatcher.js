var Autowire = require('wantsit').Autowire

var TwitterWatcher = function() {
  this._matchers = Autowire
  this._twitter = Autowire
  this._logger = Autowire
}

TwitterWatcher.prototype.afterPropertiesSet = function() {
  this._twitter.stream('user', function(stream) {
    this._logger.info('TwitterWatcher', 'Connected to Twitter stream')

    stream.on('data', function(tweet) {
      this._logger.info('TwitterWatcher', 'Incoming data')

      if(!tweet.text || !tweet.user) {
        this._logger.info('TwitterWatcher', 'Doesn\'t look like a tweet')

        return
      }

      this._logger.info('TwitterWatcher', 'Processing', tweet.text)
      this._logger.info('TwitterWatcher', tweet)

      var i = -1

      var next = function() {
        i++

        if(!this._matchers[i]) {
          this._logger.warn('TwitterWatcher', 'No more matchers for tweet with message', tweet.text)

          return
        }

        this._matchers[i].process(tweet, next)
      }.bind(this)
      next()
    }.bind(this))
  }.bind(this))
}

module.exports = TwitterWatcher