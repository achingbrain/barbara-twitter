var Autowire = require("wantsit").Autowire
	LOG = require("winston"),
	restify = require("restify");

var TemperatureQuery = function() {
	this._config = Autowire;
	this._seaport = Autowire;
	this._twitter = Autowire;
};

TemperatureQuery.prototype.process = function(tweet) {
	var match = tweet.text.toLowerCase().match(/^(@evelinabrewshed)\s(.*)\stemp(erature)?$/);

	if(!match) {
		LOG.info("TemperatureQuery", "Did not match", tweet.text);

		return false;
	}

	var brewName = match[2].trim();

	LOG.info("TemperatureQuery", "Searching for", brewName);

	this._findBrewId(brewName, function(error, brewId) {
		if(error) {
			LOG.error("TemperatureQuery", "Could not find brew for name", brewName, error.message);

			this._reply(tweet, "I'm sorry @" + tweet.user.screen_name + ", I'm afraid I can't do that.");

			return;
		}

		this._checkTemperature(brewId, function(error, temperature) {
			if(error) {
				LOG.error("TemperatureQuery", "Could not read temperature of brew is", brewId, error.message);
			}

			if(error || !temperature || isNaN(temperature)) {
				this._reply(tweet, "I'm sorry @" + tweet.user.screen_name + ", I'm afraid I can't do that.");

				return;
			}

			this._reply(tweet, "@" + tweet.user.screen_name + " " + brewName + " is " + temperature + "°C");
		}.bind(this));
	}.bind(this));
};

TemperatureQuery.prototype._pad = function(number) {
	return ("0" + number).slice(-2)
}

TemperatureQuery.prototype._reply = function(tweet, message) {
	var now = new Date();
	var timestamp = "\r\n\r\n" + now.getFullYear() + "-" + this._pad(now.getMonth() + 1) + "-" + this._pad(now.getDate()) + " " + this._pad(now.getHours()) + ":" + this._pad(now.getMinutes()) + ":" + this._pad(now.getSeconds());

	LOG.info("TemperatureQuery", "Replying to", tweet.id_str, "with", message + timestamp);

	this._twitter.updateStatus(message + timestamp, {
		in_reply_to_status_id: tweet.id_str
	}, function(result) {
		LOG.info("Posted", result);
	});
};

TemperatureQuery.prototype._findBrewId = function(name, callback) {
	this._seaport.get(this._config.get("statto:name") + "@" + this._config.get("statto:version"), function(services) {
		LOG.info("TemperatureQuery", "Trying to find brew id from", "http://" + services[0].host + ":" + services[0].port + "/brews?name=" + encodeURIComponent(name));

		restify.createJsonClient({
			url: "http://" + services[0].host + ":" + services[0].port
		}).get("/brews?name=" + encodeURIComponent(name), function(error, request, response, object) {
			callback(error, object ? object.id : null);
		}.bind(this));
	});
}

TemperatureQuery.prototype._checkTemperature = function(brewId, callback) {
	this._seaport.get(this._config.get("temperature:name") + "@" + this._config.get("temperature:version"), function(services) {
		// we've found all of the available temperature sensors, loop
		// through them until we find the one that's looking at our brew
		services.forEach(function(service) {
			var client = restify.createJsonClient({
				url: "http://" + service.host + ":" + service.port
			});
			client.get("/config", function(error, request, response, object) {
				if(error) {
					LOG.error("TemperatureWatcher", "Could not get config from", url + "/config", error);

					return;
				}

				if(object.brew.id != brewId) {
					return;
				}

				// we're found the temperature sensor we're after
				client.get("/temperature", function(error, request, response, object) {
					callback(error, object ? object.celsius : null);
				});
			});
		});
	});
}

module.exports = TemperatureQuery;