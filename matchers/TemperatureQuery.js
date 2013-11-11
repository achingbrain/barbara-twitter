var Autowire = require("wantsit").Autowire
	LOG = require("winston"),
	restify = require("restify");

var TemperatureQuery = function() {
	this._config = Autowire;
	this._seaport = Autowire;
	this._twitter = Autowire;
};

TemperatureQuery.prototype.process = function(tweet) {
	var match = tweet.text.toLowerCase().match(/(@evelinabrewshed)\s(.*)\stemp(erature)?/);

	if(!match) {
		return false;
	}

	var brewName = match[2].trim();

	this._findBrewId(brewName, function(error, brewId) {
		this._checkTemperature(brewId, function(error, temperature) {
			this._twitter.updateStatus("@" + tweet.user.screen_name + " " + brewName + " is " + temperature + "°C", {
				in_reply_to_status_id: tweet.id
			}, function(result) {
				LOG.info("Posted", result);
			});
		}.bind(this));
	}.bind(this));
};

TemperatureQuery.prototype._findBrewId = function(name, callback) {
	this._seaport.get(this._config.get("statto:name") + "@" + this._config.get("statto:version"), function(services) {
		restify.createJsonClient({
			url: "http://" + services[0].host + ":" + services[0].port
		}).get("/brews?name=" + encodeURIComponent(name), function(error, request, response, object) {
			callback(error, object.id);
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