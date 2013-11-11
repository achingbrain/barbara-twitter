var Autowire = require("wantsit").Autowire,
	LOG = require("winston");

var TwitterWatcher = function() {
	this._matchers = Autowire;
	this._twitter = Autowire;
};

TwitterWatcher.prototype.afterPropertiesSet = function() {
	this._twitter.stream("user", function(stream) {
		LOG.info("TwitterWatcher", "Connected to Twitter stream");

		stream.on("data", function(tweet) {
			LOG.info("TwitterWatcher", "Incoming data");

			if(!tweet.text || !tweet.user) {
				LOG.info("TwitterWatcher", "Doesn't look like a tweet");

				return;
			}

			LOG.info("TwitterWatcher", "Processing", tweet.text);
			LOG.info("TwitterWatcher", tweet);

			this._matchers.forEach(function(matcher) {
				matcher.process(tweet);
			})
		}.bind(this));
	}.bind(this));
};

module.exports = TwitterWatcher;