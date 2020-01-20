/* Magic Mirror
 * Module: MMM-ShanghaiBus
 * By Alan Wei
 * MIT Licensed
 */
Module.register("MMM-ShanghaiBus", {

    // Module config defaults.
    defaults: {
		apiKey: "cf158bdb8a5975a7758e10f497032708",                               // Get FREE API key from wunderground.com
		tempUnits: "C",		                      // C  or F
        stateOrCountry: "NY",                     // State if in US. Country if not in US
        city: "New_York",                         // city, no spaces. Use underscore.
        useHeader: false,                         // true if you want a header      
        header: "Shanghai Bus",                    // Any text you want. useHeader must be true
		router: "69",
		direction: "0",
		station: "4",
        maxWidth: "100%",
        animationSpeed: 2000,
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 1 * 60 * 1000,           // 5 minutes

    },

    getStyles: function() {
        return ["MMM-ShanghaiBus.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);
		this.sendSocketNotification('GET_BUS_STOP_INFO——Start', {'routerNum':this.config.router+"路", 'routerDirection':this.config.direction, 'stopID':this.config.station});
		this.getSTOPINFO();
        //this.forecast = [];
        this.scheduleUpdate();
    },
	
    getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
			this.sendSocketNotification('GET_BUS_STOP_INFO——aaa', {'routerNum':this.config.router+"路", 'routerDirection':this.config.direction, 'stopID':this.config.station});
            wrapper.innerHTML = "Boring weather . . . ShanghaiBus";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "light");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        // Bus ID names and icons
        var bus = document.createElement("div");
        bus.classList.add("small", "bright", "daily");
		bus.innerHTML = "<span>This is a test!</span>";
		wrapper.appendChild(bus);
		return wrapper;
		
    },
	

    processWeather: function(data) {
        this.forecast = data;
//        console.log(this.forecast);
        this.loaded = true;
    },

	processBus: function(data) {
        this.forecast = data;
//        console.log(this.forecast);
        this.loaded = true;
    },
	scheduleUpdate: function() {
        setInterval(() => {
            this.getSTOPINFO();
        }, this.config.updateInterval);
        this.getSTOPINFO(this.config.initialLoadDelay);
    },
	
	getSTOPINFO: function() {
        Log.info("Get Bus Stop Info: " + this.name);
		this.sendSocketNotification('GET_BUS_STOP_INFO', {'routerNum':this.config.router+"路", 'routerDirection':this.config.direction, 'stopID':this.config.station});
    },
	
    socketNotificationReceived: function(notification, payload) {
        Log.log(this.name + " received a socket notification: " + notification + " - Payload: " + payload);
		if (notification === "WEATHER_RESULT") {
            this.processBus(payload);
            this.updateDom(this.config.animationSpeed);
        } else if (notification === "RETURN_BUS_STATIONS"){
			this.processBus(payload);
			Log.info('received RETURN_BUS_STATIONS');
			this.updateDom(this.config.animationSpeed);
		} else if (notification === "RETURN_BUS_STOP_INFO"){
			this.processBus(payload);
			Log.info('received RETURN_BUS_STOP_INFO');
			this.trafficComparison = payload.trafficComparison;
            this.loaded = true;
            this.updateDom(1000);
			this.updateDom(this.config.animationSpeed);
		} else {
			this.processBus(payload);
			Log.info('received Something else');
			this.updateDom(this.config.animationSpeed);
		}
    },
});
