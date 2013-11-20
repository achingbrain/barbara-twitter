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

			var i = -1;

			var next = function() {
				i++;

				if(!this._matchers[i]) {
					LOG.warn("TwitterWatcher", "No more matchers for tweet with message", tweet.text);

					return;
				}

				this._matchers[i].process(tweet, next);
			}.bind(this);
			next();
		}.bind(this));
	}.bind(this));
};

module.exports = TwitterWatcher;