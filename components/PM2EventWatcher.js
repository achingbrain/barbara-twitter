var PM2 = require("pm2-interface"),
	Autowire = require("wantsit").Autowire,
	LOG = require("winston");

var PM2EventWatcher = function() {
	this._twitter = Autowire;
	this._config = Autowire;
	this._bonvoyageClient = Autowire;

	this._pm2Instances = [];
}

PM2EventWatcher.prototype.afterPropertiesSet = function() {
	this._bonvoyageClient.on("seaportUp", this._seaportFound.bind(this));
	this._bonvoyageClient.on("seaportDown", function() {
		this._pm2Instances.forEach(function(pm2Instance) {
			pm2Instance.removeAllListeners("error");
		});

		this._pm2Instances = [];
	}.bind(this));
}

PM2EventWatcher.prototype._seaportFound = function(seaport) {
	seaport.get(this._config.get("pm2-events:name") + "@" + this._config.get("pm2-events:version"), function(services) {
		services.forEach(this._pm2Found.bind(this));
	}.bind(this));
}

PM2EventWatcher.prototype._pm2Found = function(service) {
	var pm2 = new PM2({
		bind_host: service.host
	});
	pm2.once("ready", function() {
		LOG.info("PM2Watcher", "Connected to pm2 on", service.host + ":" + service.port);

		pm2.bus.on("*", function(event, data){
			// event = process:exit or process:online

			if(event == "process:exception") {
				// ruh roh, uncaught exception was thrown
			}

			LOG.info("PM2Watcher", "Incoming event:", event, data.pm2_env.name);
		});

		pm2.rpc.getMonitorData({}, function(err, dt) {
			LOG.info("PM2Watcher", "Monitor data:", dt);
		});
	});
	pm2.on("error", function(error){
		LOG.error("PM2Watcher", "PM2 error", error ? error.message : null);
	});

	this._pm2Instances.push(pm2);
}

module.exports = PM2EventWatcher;