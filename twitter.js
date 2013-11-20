var LOG = require("winston"),
	util = require("util"),
	config = require("nconf"),
	Container = require("wantsit").Container,
	bonvoyage = require("bonvoyage"),
	Twitter = require("twitter"),
	path = require("path");

// set up arguments
config.argv().env().file(path.resolve(__dirname, "config.json"));

var container = new Container();
container.register("config", config);

container.createAndRegister("twitter", Twitter, config.get("twitter"));

container.register("matchers", [
	container.createAndRegister("temperatureQuery", require(path.resolve(__dirname, "./matchers/TemperatureQuery")))
]);

container.createAndRegister("twitterWatcher", require(path.resolve(__dirname, "./components/TwitterWatcher")));
container.createAndRegister("pm2EventWatcher", require(path.resolve(__dirname, "./components/PM2EventWatcher")));

// inject a dummy seaport - we'll overwrite this when the real one becomes available
container.register("seaport", {
	query: function() {
		return [];
	}
});

container.createAndRegister("bonvoyageClient", bonvoyage.Client, {
	serviceType: config.get("registry:name")
});
container.find("bonvoyageClient").on("seaportUp", function(seaport) {
	container.register("seaport", seaport);
});
