var Autowire = require("wantsit").Autowire,
	LOG = require("winston");

var AbstractMatcher = function() {
	this._twitter = Autowire;
};

AbstractMatcher.prototype._reply = function(tweet, message) {
	LOG.info("TemperatureQuery", "Replying to", tweet.id_str, "with", message);

	this._twitter.updateStatus(message + "\r\n\r\n" + (new Date()).getTime(), {
		in_reply_to_status_id: tweet.id_str
	}, function(result) {
		LOG.info("Posted", result);
	});
};

module.exports = AbstractMatcher;