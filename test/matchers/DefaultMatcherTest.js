var LOG = require("winston"),
	DefaultMatcher = require("../../matchers/DefaultMatcher"),
	Twitter = require("twitter"),
	sinon = require("sinon");

var defaultMatcher;
var twitter;

module.exports["DefaultMatcher"] = {
	setUp: function(done) {
		var actualTwitter = new Twitter();
		twitter = sinon.mock(actualTwitter);

		defaultMatcher = new DefaultMatcher();
		defaultMatcher._twitter = actualTwitter;

		done();
	},

	"Should reply with default message": function(test) {
		var tweet = {
			id_str: "id_str",
			text: "foo",
			user: {
				screen_name: "sender"
			}
		};

		twitter.expects("updateStatus").once().withArgs(sinon.match.string, sinon.match.object, sinon.match.func);

		defaultMatcher.process(tweet);

		twitter.verify();

		test.done();
	}
};
