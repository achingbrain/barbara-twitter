var LOG = require("winston"),
	TwitterWatcher = require("../../components/TwitterWatcher"),
	Twitter = require("twitter"),
	EventEmitter = require("events").EventEmitter,
	sinon = require("sinon");

var twitterWatcher;
var matchers;
var twitter;

module.exports["TwitterWatcher"] = {
	setUp: function(done) {
		var actualTwitter = new Twitter();
		twitter = sinon.mock(actualTwitter);
		matchers = [];

		twitterWatcher = new TwitterWatcher();
		twitterWatcher._twitter = actualTwitter;
		twitterWatcher._matchers = matchers;

		done();
	},

	"Should respond to a tweet": function(test) {
		var stream = new EventEmitter();
		var tweet = {
			text: "foo",
			user: "bar"
		};

		matchers.push({
			process: function(passedTweet, next) {
				test.deepEqual(passedTweet, tweet);
				test.ok(next);

				test.done();
			}
		});

		twitter.expects("stream").once().callsArgWith(1, stream);

		twitterWatcher.afterPropertiesSet();

		stream.emit("data", tweet);
	},

	"Should try multiple tweet matchers": function(test) {
		var stream = new EventEmitter();
		var tweet = {
			text: "foo",
			user: "bar"
		};

		matchers.push({
			process: function(passedTweet, next) {
				next();
			}
		});
		matchers.push({
			process: function(passedTweet, next) {
				test.equal(passedTweet, tweet);
				test.ok(next);

				test.done();
			}
		});

		twitter.expects("stream").once().callsArgWith(1, stream);

		twitterWatcher.afterPropertiesSet();

		stream.emit("data", tweet);
	},

	"Should not match invalid tweet": function(test) {
		var stream = new EventEmitter();
		var tweet = {};

		matchers.push({
			process: function() {
				test.fail("Should not have processed invalid tweet");
			}
		});

		twitter.expects("stream").once().callsArgWith(1, stream);

		twitterWatcher.afterPropertiesSet();

		stream.emit("data", tweet);

		test.done();
	},

	"Should try all multiple tweet": function(test) {
		var stream = new EventEmitter();
		var tweet = {
			text: "foo",
			user: "bar"
		};

		var invoked = 0;

		matchers.push({
			process: function(passedTweet, next) {
				invoked++;

				next();
			}
		});
		matchers.push({
			process: function(passedTweet, next) {
				invoked++;

				next();
			}
		});
		matchers.push({
			process: function(passedTweet, next) {
				invoked++;

				next();
			}
		});

		twitter.expects("stream").once().callsArgWith(1, stream);

		twitterWatcher.afterPropertiesSet();

		stream.emit("data", tweet);

		test.equal(invoked, 3);
		test.done();
	}
};
