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

// inject a dummy seaport - we'll overwrite this when the real one becomes available
container.register("seaport", {
	query: function() {
		return [];
	}
});

var bonvoyageClient = new bonvoyage.Client({
	serviceType: config.get("registry:name")
});
bonvoyageClient.find(function(error, seaport) {
	if(error) {
		LOG.error("Error finding seaport", error);

		return;
	}

	LOG.info("Found seaport server");
});
bonvoyageClient.on("seaportUp", function(seaport) {
	container.register("seaport", seaport);
});
