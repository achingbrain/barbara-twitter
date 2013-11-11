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

			for(var n = 0; n < this._matchers.length; n++) {
				if(this._matchers[n].process(tweet)) {
					LOG.info("TwitterWatcher", "Success!");

					return;
				}
			}

			LOG.info("TwitterWatcher", "Failure!");
		}.bind(this));
	}.bind(this));
};

module.exports = TwitterWatcher;