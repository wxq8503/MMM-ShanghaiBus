/* Magic Mirror
 * Module: MMM-ShanghaiBus
 * By Alan Wei
 * MIT Licensed
 */
Module.register("MMM-ShanghaiBus", {

    // Module config defaults.
    defaults:{
		text:"Shanghai Bus!!!!",
		header: "Shanghai Bus",                    // Any text you want. useHeader must be true
		routers: [
			{
				routerName: "69路",
				direction: 1,
				checkStation: 4,
				showStations: 4
			},

			
		],
		//routerName: "69路",
		//direction: "0",
		//checkStation: "4",
		//showStations: 4,
		maxWidth: "100%",
        animationSpeed: 2000,
        initialLoadDelay: 30 * 1000,
        retryDelay: 2500,
		alertTime: 120,							// 当公交车到站时间小于此时间是发出通知
        updateInterval: 1 * 60 * 1000           // 1 minutes
	},
	
	getStyles: function() {
        return ['MMM-ShanghaiBus.css'];
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
		
		for (var router in this.returned_data) {
			console.log("Hello world--" + router);
			var routerItem = this.returned_data[router];
			
			var routersid = routerItem['routersid'];
			Log.info("var routersid: " + routersid);
			var result_flag = routerItem['result_flag'];
			var checkSum = routerItem['checkSum']
			var routerName = routerItem['routerName'];
			var terminal = routerItem['terminal'];
			var stopdis = routerItem['stopdis'];
			var distance = routerItem['distance'];
			var time = routerItem['time'];
			var busStatus = routerItem['status'];
			var station_num = routerItem['station_num'];
			var station_name = routerItem['station_name'];
			var checkstationIndex = routerItem['checkstationIndex'];
			var updatetime = routerItem['updatetime'];
			
			var json_stations = eval(routerItem['stationsListData']);
			console.log("json_stations:" + json_stations);
			
			// Bus ID names and icons
			var busRouterInfo = document.createElement("div");
			busRouterInfo.classList.add("small", "bright", "daily", "busDirection");
				
			console.log("this.result_flag: " + checkSum + result_flag);
			
			if (result_flag == "wrong_router_name") {
				busRouterInfo.innerHTML = "<span>Error catched, maybe wrong router name,</span><span>" + checkSum + "</span>";
				busRouterInfo.classList.add("error");
				wrapper.appendChild(busRouterInfo);

			}else{
		
				var routerInfo_FromTo = json_stations[0].routerInfo_FromTo;
				var routerInfo_StartEnd = json_stations[0].routerInfo_StartEnd;
				
				console.log("routerInfo_FromTo:" + routerInfo_FromTo);
				console.log("routerInfo_StartEnd:" + routerInfo_StartEnd);
				
				/*
				<div class="upgoing cur ">
					<p><span>虹桥镇(环镇南路)</span>→ <span>永兴路公兴路</span></p>
					<div class="time"><em class="s">05:05</em><em class="m">23:30</em></div>
				</div>
				*/
				var now=new Date();
				var hours=now.getHours();
				var minutes=now.getMinutes();
				var seconds=now.getSeconds();

				busRouterInfo.innerHTML = "<div class=\"upgoing cur \">\n" + routerInfo_FromTo + "\n<div class=\"time\"><em class=\"routername\">" + routerName + "</em>" + routerInfo_StartEnd + "</div>\n" + updatetime + "</div>";
				
				// Bus ID names and icons
				var bus = document.createElement("div");
				bus.classList.add("small", "bright", "daily", "stationBox");
				
				//bus.innerHTML = "<div class=\"stationBox\">";
				
				var busStopInfo = "<span>等待发车</span>";
				var busStaionsCount = json_stations.length - 1;
				
				if(busStaionsCount>1){
					var i = 0;
					var current = "";
					
					if(time < this.config.alertTime){
						var addAlertClass = " alert";
					}else{
						var addAlertClass = "";
					}
					
					for (var station of json_stations){
						//console.log(station);
						
						if(i>0){
							if(i==Number(checkstationIndex)){
								current = "current";
								if(busStatus === "等待发车"){
									busStopInfo = "<span>等待发车</span>";
								}else{
									busStopInfo = "" + terminal + "，还有"+ stopdis + "站，距离" + distance +"米，</br>约" + time + "s 后到达" +"";
								}
							}else{
								current = "";
								busStopInfo = "<span>等待发车</span>";
							}
							bus.innerHTML = bus.innerHTML + "<div class=\"stationCon " + current + "\">\n<span class=\"point\"></span>\n<div style=\"width:1px; height:1px; display:none\"></div>\n<div class=\"stationList\"><span class=\"arroeL\"></span>\n<div class=\"stationBor\">\n<div class=\"station\"><span class=\"num\">" + station.station_num + "</span><span class=\"name\">" + station.station_name + "</span>\n<div class=\"icon\"></div></div>\n<div class=\"near"+ addAlertClass + "\">" + busStopInfo + "</div></div></div></div>\n";		
						}
						i++;
					}	
				}
				
				wrapper.appendChild(busRouterInfo);
				wrapper.appendChild(bus);
			}
			//console.log("Hello world-- result_flag" + routerItem['result_flag']);
			//console.log('socketNotificationReceived() in main module..'+"<span>" + station_num + " "+ station_name +"</span>");
			//console.log('socketNotificationReceived() in main module..'+"<span>" + terminal + "|还有"+ stopdis + "站，距离" + distance +"米,大约" + time + "s 后到达" +"</span>");
		}
		return wrapper;
		
		
		console.log("this.result_flag: " + this.checkSum + this.result_flag);
		if (this.result_flag == "wrong_router_name") {
            wrapper.innerHTML = "<span>Error catched, maybe wrong router name,</span><span>" + this.checkSum + "</span>";
            wrapper.classList.add("error");
            return wrapper;
        }
		
		// Bus ID names and icons
        var busRouterInfo = document.createElement("div");
        busRouterInfo.classList.add("small", "bright", "daily", "busDirection");
		/*
		<div class="upgoing cur ">
			<p><span>虹桥镇(环镇南路)</span>→ <span>永兴路公兴路</span></p>
			<div class="time"><em class="s">05:05</em><em class="m">23:30</em></div>
		</div>
		*/
		var routerInfo_FromTo = this.json_stations[0].routerInfo_FromTo;
		var routerInfo_StartEnd = this.json_stations[0].routerInfo_StartEnd;
		
		console.log(routerInfo_FromTo);
		console.log(routerInfo_StartEnd);
		
		busRouterInfo.innerHTML = "<div class=\"upgoing cur \">\n" + routerInfo_FromTo + "\n<div class=\"time\"><em class=\"routername\">" + this.routerName + "</em>" + routerInfo_StartEnd + "</div>\n</div>";
		
		//busRouterInfo.innerHTML = "<div class=\"upgoing cur \">\n<span>" + from + "</span>→ <span>" + to + "</span>\n<div class=\"time\"><em class=\"s\">" + start + "</em><em class=\"m\">" + end + "</em></div>\n</div>"	
        // Bus ID names and icons
        var bus = document.createElement("div");
        bus.classList.add("small", "bright", "daily", "stationBox");
		
		//bus.innerHTML = "<div class=\"stationBox\">";
		
		var busStopInfo = "<span>等待发车</span>";
		var busStaionsCount = this.json_stations.length - 1;
		
		if(this.config.showStations > busStaionsCount){
			this.config.showStations = busStaionsCount;
		}
		if(this.config.showStations < 1){
			this.config.showStations = 1;
		}
		if(this.config.checkStation > busStaionsCount){
			this.config.checkStation = busStaionsCount;
		}
		if(this.config.checkStation < 1){
			this.config.checkStation = 1;
		}
		
		if(busStaionsCount>1){
			var i = 0;
			var current = "";
			var startStation = this.config.checkStation-Math.floor(this.config.showStations/2);
			if(startStation<1){
				startStation = 1;
			}
			var stopStation = startStation + this.config.showStations;
			console.log("busStaionsCount: " + busStaionsCount);
			console.log("ShowFrom: " + startStation);
			console.log("ShowEnd: " + (stopStation-1));
			
			if(this.time < this.config.alertTime){
				var addAlertClass = " alert";
			}else{
				var addAlertClass = "";
			}
			
			for (var station of this.json_stations){
				//console.log(station);
				if(i==Number(this.config.checkStation)){
					current = "current";
					if(this.busStatus === "等待发车"){
						busStopInfo = "<span>等待发车</span>";
					}else{
						busStopInfo = "" + this.terminal + "，还有"+ this.stopdis + "站，距离" + this.distance +"米，</br>约" + this.time + "s 后到达" +"";
					}
				}else{
					current = "";
					busStopInfo = "<span>等待发车</span>";
				}
				
				if(i>startStation-1 && i< stopStation){
					bus.innerHTML = bus.innerHTML + "<div class=\"stationCon " + current + "\">\n<span class=\"point\"></span>\n<div style=\"width:1px; height:1px; display:none\"></div>\n<div class=\"stationList\"><span class=\"arroeL\"></span>\n<div class=\"stationBor\">\n<div class=\"station\"><span class=\"num\">" + station.station_num + "</span><span class=\"name\">" + station.station_name + "</span>\n<div class=\"icon\"></div></div>\n<div class=\"near"+ addAlertClass + "\">" + busStopInfo + "</div></div></div></div>\n";		
				}
				i++;
			}
		}
		
		wrapper.appendChild(busRouterInfo);
		wrapper.appendChild(bus);
		
		
		return wrapper;
		
    },


	start:function(){
		this.routerName = 'N/A';
		this.stopdis = "N/A";
		this.distance = "N/A";
		this.time = "N/A";
		this.busStatus = "等待发车";
		this.station_num = "N/A";
		this.station_name = "N/A";
		this.routerStations = [];
		this.json_stations = {};
		this.scheduleUpdate();
		this.routersid = '';
		this.result_flag = "error";
		this.returned_data = [];
		this.checkStation = 1;
		this.showStations = 1;
		//this.checkSum = this.config.routerName + '|' + this.config.direction + '|' + this.config.checkStation;
		//this.getSTOPINFO();
	},
	
	processBus: function(data) {
        Log.info('received RETURN_BUS_STOP_INFO 1:' + data.length);
		//Log.info('received RETURN_BUS_STOP_INFO 2:' + payload.returnResult[3]["Hello"]);
		this.returned_data = data;
		for (var router in data) {
			console.log("Hello world--" + router);
			var routerItem = data[router];
			
			this.routersid = routerItem['routersid'];
			Log.info("this.routersid: " + this.routersid);
			this.result_flag = routerItem['result_flag'];
			this.routerName = routerItem['routerName'];
			this.terminal = routerItem['terminal'];
			this.stopdis = routerItem['stopdis'];
			this.distance = routerItem['distance'];
			this.time = routerItem['time'];
			this.busStatus = routerItem['status'];
			this.station_num = routerItem['station_num'];
			this.station_name = routerItem['station_name'];
			this.json_stations = eval(routerItem['stationsListData']);
		
			console.log("Hello world-- result_flag" + routerItem['result_flag']);
			console.log('socketNotificationReceived() in main module..'+"<span>" + this.station_num + " "+ this.station_name +"</span>");
			console.log('socketNotificationReceived() in main module..'+"<span>" + this.terminal + "|还有"+ this.stopdis + "站，距离" + this.distance +"米,大约" + this.time + "s 后到达" +"</span>");
		}
        this.loaded = true;
    },
	
	scheduleUpdate: function() {
        setInterval(() => {
            this.getSTOPINFO();
        }, this.config.updateInterval);
        this.getSTOPINFO(this.config.initialLoadDelay);
		//this.getSTOPINFO();
    },
	
	getSTOPINFO: function() {
		//this.sendSocketNotification('GET_BUS_STOP_INFO', {'routerName':this.config.routerName, 'routerDirection':this.config.direction, 'stopID':this.config.checkStation});
		Log.info('Send socket notification:' +  this.config.routers);
		/*
		var routerItems = [];
		for (var router in this.config.routers) {
			console.log("Hello world 2--" + router);
			var routerItem = this.config.routers[router];
			//routerItems.push(this.getSID(routerItem.routerName.replace(/ /g,""), routerItem.direction, routerItem.checkStation));
			console.log("Hello world 3--" + routerItem);
			this.checkSum = routerItem.routerName.replace(/ /g,"") + '|' + routerItem.direction + '|' + routerItem.checkStation;
			this.sendSocketNotification('GET_BUS_STOP_INFO', {'routerName':routerItem.routerName.replace(/ /g,""), 'routerDirection':routerItem.direction, 'stopID':routerItem.checkStation});
		}
		*/
		this.sendSocketNotification('GET_BUS_STOP_INFO', {'routers': this.config.routers});
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
			this.processBus(payload.returnResult);
			/*
			Log.info('received RETURN_BUS_STOP_INFO 1:' + payload.returnResult.length);
			//Log.info('received RETURN_BUS_STOP_INFO 2:' + payload.returnResult[3]["Hello"]);
			this.returned_data = payload.returnResult;
			for (var router in payload.returnResult) {
				console.log("Hello world--" + router);
				var routerItem = payload.returnResult[router];
				
				this.routersid = routerItem['routersid'];
				Log.info("this.routersid: " + this.routersid);
				this.result_flag = routerItem['result_flag'];
				this.routerName = routerItem['routerName'];
				this.terminal = routerItem['terminal'];
				this.stopdis = routerItem['stopdis'];
				this.distance = routerItem['distance'];
				this.time = routerItem['time'];
				this.busStatus = routerItem['status'];
				this.station_num = routerItem['station_num'];
				this.station_name = routerItem['station_name'];
				this.json_stations = eval(routerItem['stationsListData']);
			
				console.log("Hello world-- result_flag" + routerItem['result_flag']);
				console.log('socketNotificationReceived() in main module..'+"<span>" + this.station_num + " "+ this.station_name +"</span>");
				console.log('socketNotificationReceived() in main module..'+"<span>" + this.terminal + "|还有"+ this.stopdis + "站，距离" + this.distance +"米,大约" + this.time + "s 后到达" +"</span>");
			}
			
			this.routersid = payload.routersid;
			Log.info("this.routersid: " + this.routersid);
			this.result_flag = payload.result_flag;
			this.routerName = payload.routerName;
			this.terminal = payload.terminal;
			this.stopdis = payload.stopdis;
			this.distance = payload.distance;
			this.time = payload.time;
			this.busStatus = payload.status;
			this.station_num = payload.station_num;
			this.station_name = payload.station_name;
			this.json_stations = eval(payload.stationsListData);
			
			//var stationInfo = this.json_stations[Number(this.station_num)-1];
			//console.log(payload.stationsListData);
			//console.log(this.json_stations);
			//this.routerStations = payload.stationsList;
			//console.log('socketNotificationReceived() in main module..'+"<span>" + this.routerStations +"</span>");
			console.log('socketNotificationReceived() in main module..'+"<span>" + this.station_num + " "+ this.station_name +"</span>");
			console.log('socketNotificationReceived() in main module..'+"<span>" + this.terminal + "|还有"+ this.stopdis + "站，距离" + this.distance +"米,大约" + this.time + "s 后到达" +"</span>");
            this.loaded = true;
			*/
			this.updateDom(this.config.animationSpeed);
		} else {
			//this.processBus(payload);
			Log.info('received Something else');
			this.updateDom(this.config.animationSpeed);
		}
    }
	
});
