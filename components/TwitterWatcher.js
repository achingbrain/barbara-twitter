var Autowire = require("wantsit").Autowire,
	LOG = require("winston");

var TwitterWatcher = function() {
	this._matchers = Autowire;
	this._twitter = Autowire;
};

TwitterWatcher.prototype.afterPropertiesSet = function() {
	this._twitter.stream("user", function(stream) {
		LOG.info("Connected to Twitter stream");

		stream.on("data", function(tweet) {

			if(!tweet.text || !tweet.user) {
				return;
			}

			for(var n = 0; n < this._matchers.length; n++) {
				if(this._matchers[n].process(tweet)) {
					break;
				}
			}
		}.bind(this));
	}.bind(this));
};

module.exports = TwitterWatcher;