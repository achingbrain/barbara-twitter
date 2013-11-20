var Autowire = require("wantsit").Autowire,
	LOG = require("winston"),
	AbstractMatcher = require("./AbstractMatcher"),
	util = require("util");

var DefaultMatcher = function() {
	AbstractMatcher.call(this);
};
util.inherits(DefaultMatcher, AbstractMatcher);

DefaultMatcher.prototype.process = function(tweet) {
	this._reply(tweet, "I'm sorry @" + tweet.user.screen_name + ", I'm afraid I can't do that.");
};

module.exports = DefaultMatcher;