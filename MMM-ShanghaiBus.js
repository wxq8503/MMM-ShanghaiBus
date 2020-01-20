/* Magic Mirror
 * Module: MMM-ShanghaiBus
 * By Alan Wei
 * MIT Licensed
 */
Module.register("MMM-ShanghaiBus", {

    // Module config defaults.
    defaults:{
		text:"Happy Birthday!!!!",
		header: "Shanghai Bus",                    // Any text you want. useHeader must be true
		router: "69",
		direction: "0",
		station: "4",
		maxWidth: "100%",
        animationSpeed: 2000,
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 1 * 60 * 1000           // 1 minutes
	},
	getDom: function() {
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = "Boring Info . . . ShanghaiBus";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        // Bus ID names and icons
        var bus = document.createElement("div");
        bus.classList.add("small", "bright", "daily");
		if(this.busStatus === "等待发车"){
			bus.innerHTML = "<span>等待发车</span>";
		}else{
			bus.innerHTML = "<span>" + this.station_num + " "+ this.station_name + "</span><span>" + this.terminal + "|还有"+ this.stopdis + "站，距离" + this.distance +"米,大约" + this.time + "s 后到达" +"</span>";
		}
		wrapper.appendChild(bus);
		return wrapper;
		
    },


	start:function(){
		//this.sendSocketNotification("main",{message:"test1"});
		this.stopdis = "N/A";
		this.distance = "N/A";
		this.time = "N/A";
		this.busStatus = "等待发车";
		this.station_num = "N/A";
		this.station_name = "N/A";
		this.scheduleUpdate();
		//this.sendSocketNotification('GET_BUS_STOP_INFO', {'routerNum':this.config.router+"路", 'routerDirection':this.config.direction, 'stopID':this.config.station});
	},
	
	processBus: function(data) {
        //this.forecast = data;
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
			
			this.terminal = payload.terminal;
			this.stopdis = payload.stopdis;
			this.distance = payload.distance;
			this.time = payload.time;
			this.busStatus = payload.status;
			this.station_num = payload.station_num;
			this.station_name = payload.station_name;
			console.log('socketNotificationReceived() in main module..'+"<span>" + this.terminal + "|还有"+ this.stopdis + "站，距离" + this.distance +"米,大约" + this.time + "s 后到达" +"</span>");
            this.loaded = true;
            this.updateDom(1000);
			this.updateDom(this.config.animationSpeed);
		} else {
			this.processBus(payload);
			Log.info('received Something else');
			this.updateDom(this.config.animationSpeed);
		}
    }
	
});
