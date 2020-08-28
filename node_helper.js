/* Magic Mirror
 * Module: MMM-ShanghaiBus
 *
 * By Alan Wei at https://github.com/wxq8503/MMM-ShanghaiBus
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
const zlib = require('zlib');
var routerItems = [];
var routerItemCount = 1;

module.exports = NodeHelper.create({
	
	start: function () {
		console.info('MMM-ShanghaiBus helper started...');
		routerItems = [];
	},
	

  // Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {
		var self=this;
		routerItems = [];
		console.log(this.name + ' Starting socketNotificationReceived()-'+notification);
		if (notification === 'GET_BUS_SID') {
			this.getSID(payload.routerName);
		} else if (notification === 'GET_BUS_STOP_INFO'){
			//this.getSID(payload.routerName, payload.routerDirection, payload.stopID, getBusStations);
			//console.log("Hello world 1--" + payload);
			routerItemCount = payload.routers.length;
			console.log("Hello world Item Count: --" + routerItemCount);
			self.fetchRouters(payload.routers);
		}
	},
	
	sendback: function(){
		var self = this;
		console.log("Hello world 4--" + routerItems);
		self.sendSocketNotification('RETURN_BUS_STOP_INFO', {'returnResult': routerItems});
	},
	
	fetchRouters: function(routers, callback){
		var self = this;
		routerItems = [];
		for (var router in routers) {
			//console.log("Hello world 2--" + router);
			var routerItem = routers[router];
			this.getSID(routerItem.routerName.replace(/ /g,""), routerItem.direction, routerItem.checkStation, routerItem.showStations);
			//routerItems.push(this.getSID(routerItem.routerName.replace(/ /g,""), routerItem.direction, routerItem.checkStation, routerItem.showStations));
			//console.log("Hello world 3--" + routerItems);
			//console.log("Hello world 3-length--" + routerItems.length);
			//this.getSID(routerItem.routerName.replace(/ /g,""), routerItem.direction, routerItem.checkStation, routerItem.showStations);
		}
		//console.log("Hello world 3-length--" + routerItems.length);

		//self.sendSocketNotification('RETURN_BUS_STOP_INFO', {'returnResult': routerItems});
	},
	
	getBusStopInfo: function(routerName, sid, direction, stopid, checkSum, stationsListData, checkstationIndex) {
        var self = this;
		
		var terminal = "N/A";
		var stopdis = "N/A";
		var distance = "N/A";
		var time = "N/A";
		var status = "等待发车";
		var stationsLength = stationsListData.length;
		var json_stations = eval(stationsListData);
		//var stationInfo = json_stations[Number(stopid)];
		var stationInfo = json_stations[Number(checkstationIndex)];
		var result_flag = 'error';
		
		console.log(checkSum + "--" + stationsListData);
		console.log("Starting get all bus stations sid: " + checkSum + "--" + sid);
		console.log("Stations numbers: " + stationsLength + "--" + checkSum);
		
		var now=new Date();
		var hours=now.getHours();//>9?now.getHours() :"0"+now.getHours();;
		var minutes=now.getMinutes();//>9?now.getMinutes() :"0"+now.getMinutes();
		var seconds=now.getSeconds();//>9?now.getSeconds() :"0"+now.getSeconds();
		
		if(hours < 10) hours = "0" + hours;
        if(minutes < 10) minutes = '0' + minutes; 
        if(seconds < 10) seconds = '0' + seconds; 
		
		var updatetime = "<div class=\"station--\"><span class=\"num\">上次更新时间：</span><span class=\"name\">" + hours + ":" + minutes + ":" + seconds + "</span>\n</div>"
		if(stationsLength == 1){
			var temp = {'result_flag':"wrong_router_name", 'routerName':routerName,  'routersid':sid, 'stopdis':stopdis, 'distance':distance, 'time':time, 'terminal':terminal, 'status':status, 'station_num':0, 'station_name':"N/A", 'stationsListData':json_stations, 'checkSum':checkSum, 'checkstationIndex': checkstationIndex, 'updatetime':updatetime};
			//self.sendSocketNotification('RETURN_BUS_STOP_INFO', temp);
			routerItems.push(temp);
			return null;
			return temp;
		}
		
		console.log(checkSum + "--站点：" + stationInfo.station_num + "--" + stationInfo.station_name);
		
		var referer = 'https://shanghaicity.openservice.kankanews.com/public/bus/mes/sid/'+ sid +'?stoptype='+ direction;
		var options = { 
				method: 'POST',
				url: 'https://shanghaicity.openservice.kankanews.com/public/bus/Getstop',
				headers: 
				{
					 'cache-control': 'no-cache',
					 'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
					 'accept-encoding': 'gzip, deflate, br',
					 'referer': referer,
					 'sec-fetch-mode': 'cors',
					 'sec-fetch-site': 'same-origin',
					 'accept': '*/*',
					 'content-type': 'application/x-www-form-urlencoded',
					 'user-agent': 'Mozilla/5.0 (Linux; Android 9; BND-AL10 Build/HONORBND-AL10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044705 Mobile Safari/537.36 MMWEBID/8812 MicroMessenger/7.0.5.1440(0x27000537) Process/tools NetType/WIFI Language/en',
					 'x-requested-with': 'XMLHttpRequest',
					 'origin': 'https://shanghaicity.openservice.kankanews.com',
					 'connection': 'keep-alive',
					 'host': 'shanghaicity.openservice.kankanews.com' 
				 },
				form: 
				{ 
					stoptype: direction,
					stopid: stopid,
					sid: sid 
				} 
		   };
        //console.info("BusStopInfo 1--Starting get sid for bus sid: " + sid);
		request(options, function (error, response, body) {
			if (error) throw new Error(error);
			console.log("BusStopInfo 2--Starting get sid for bus sid: " + checkSum + "--" + sid);
			if (!error && response.statusCode == 200) {
				console.log(body);
				var obj = JSON.parse(body);
				if (JSON.parse(body).hasOwnProperty('error')) {
					console.log(checkSum + "--" + "等待发车");
				}else{
					terminal = obj[0].terminal;
					stopdis = obj[0].stopdis;
					distance = obj[0].distance;
					time = obj[0].time;
					status = "已发车";
					console.log("车牌：" + terminal);
					console.log("还有：" + stopdis + "站");
					console.log("距离：" + distance);
					console.log("时间：" + time);
				}
				result_flag = 'success';
			}else{
				console.log(response.statusCode);
			}
			var temp = {'result_flag':result_flag, 'routerName':routerName,  'routersid':sid, 'stopdis':stopdis, 'distance':distance, 'time':time, 'terminal':terminal, 'status':status, 'station_num':stationInfo.station_num, 'station_name':stationInfo.station_name, 'stationsListData':json_stations, 'checkSum':checkSum, 'checkstationIndex': checkstationIndex, 'updatetime':updatetime};
			//console.log(temp);
			routerItems.push(temp);
			console.log("getBusStopInfo: " + routerItems.length);
			console.log("getBusStopInfo: " + routerItems);
			
			if(routerItemCount === routerItems.length){
				//console.log("Hello world 3--" + routerItems);
				self.sendSocketNotification('RETURN_BUS_STOP_INFO', {'returnResult': routerItems});
			}
		
			return null;
			return temp;
			//self.sendSocketNotification('RETURN_BUS_STOP_INFO', temp);
		});
    },
	
	getBusStations: function(routerName, sid, direction, stopid, checkSum, showStations){//, getStationsList) {
        var self = this;
		console.info("Starting get all bus stations of : " + routerName);
       
		var options = { 
			method: 'GET',
			url: 'http://shanghaicity.openservice.kankanews.com/public/bus/mes/sid/' + sid,
			qs: { stoptype: direction },
			encoding: null,
			headers: 
			{ 
				 'cache-control': 'no-cache',
				 'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
				 'accept-encoding': 'gzip, deflate, br',
				 'referer': 'https://shanghaicity.openservice.kankanews.com/public/bus',
				 'sec-fetch-mode': 'cors',
				 'sec-fetch-site': 'same-origin',
				 'accept': '*/*',
				 'content-type': 'application/x-www-form-urlencoded',
				 'user-agent': 'Mozilla/5.0 (Linux; Android 9; BND-AL10 Build/HONORBND-AL10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044705 Mobile Safari/537.36 MMWEBID/8812 MicroMessenger/7.0.5.1440(0x27000537) Process/tools NetType/WIFI Language/en',
				 'x-requested-with': 'XMLHttpRequest',
				 'origin': 'https://shanghaicity.openservice.kankanews.com',
				 'connection': 'keep-alive',
				 'host': 'shanghaicity.openservice.kankanews.com' 
				 }
			 };

		request(options, function (error, response, body) {
			
			if (error) throw new Error(error);
			//console.log(response.headers['content-encoding']);
			var header=response.headers;
            //console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
            //检查响应内容编码方式是否为“gzip”格式
            if(response.headers['content-encoding']=='gzip'){
				//数据解压
                zlib.unzip(body, function(err, dezipped) {
					self.getStationsList(dezipped.toString(), routerName, sid, direction, stopid, checkSum, showStations);
                });
            } else {
				self.getStationsList(body.toString(), routerName, sid, direction, stopid, checkSum, showStations);
			}
			
		});
    },
	
	getStationsList:function(DezippedBody, routerName, sid, direction, stopid, checkSum, showStations){
		var self = this;
		//console.log(DezippedBody);
		var $ = cheerio.load(DezippedBody);
		var stationsListData = [];
		
		var stationFromTo = $('div .cur p');
		var routerInfo_FromTo = stationFromTo.html();
		console.log("routerInfo:" + checkSum + "--" + routerInfo_FromTo);
		var stationStartEnd = $('div .cur .time');
		var routerInfo_StartEnd = stationStartEnd.html();
		console.log("routerInfo:" + checkSum + "--" + routerInfo_StartEnd);

		stationsListData.push(
			{
				"routerInfo_FromTo" : routerInfo_FromTo,
				"routerInfo_StartEnd" : routerInfo_StartEnd
			}
		);
		
		var stationList = $('div .station');
		var stationsCount = stationList.length;
		
		console.log("stations_num:" + checkSum + "--" + stationsCount);
		if(stopid > stationsCount ){
			stopid = stationsCount;
		}
		if(stopid < 1 ){
			stopid = 1;
		}
		
		if(showStations > stationsCount ){
			showStations = stationsCount;
		}
		var startStation = stopid-Math.floor(showStations/2);
		if(startStation<1){
			startStation = 1;
		}
		var stopStation = startStation + showStations - 1;
		if(stopStation > stationsCount ){
			stopStation = stationsCount;
		}
		
		console.log("station_start:" + startStation);
		console.log("station_stop:" + stopStation);
		var i = 1;
		var checkstationIndex = 1;
		stationList.each(function(item) {
			var station = $(this);
			var station_num = station.find('span.num').text();
			var station_name = station.find('span.name').text();
			if(Number(station_num) >= startStation && Number(station_num) <= stopStation){
				if(Number(station_num) === stopid){
					checkstationIndex = i;
				}
				stationsListData.push(
					{
						"station_num" : station_num,
						"station_name" : station_name
					}
				);
				i++;
				console.log("station_num:" + station_num);
				console.log("station_name:" + station_name);
			}

		});
		
		self.getBusStopInfo(routerName, sid, direction, stopid, checkSum, stationsListData, checkstationIndex);
	},
	
	
	getSID:function(routerName, direction, stopid, showStations) {
		var self = this;
		var checkSum = routerName + '|' + direction + '|' + stopid;
		console.log('checkSum:' + checkSum);
        console.info("getSID 1--Starting get sid for bus router: " + routerName + " on stop " + stopid);
		var options = { 
			method: 'POST',
			url: 'https://shanghaicity.openservice.kankanews.com/public/bus/get',
			headers: 
			{ 
				 'cache-control': 'no-cache',
				 'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
				 'accept-encoding': 'gzip, deflate, br',
				 'referer': 'https://shanghaicity.openservice.kankanews.com/public/bus',
				 'sec-fetch-mode': 'cors',
				 'sec-fetch-site': 'same-origin',
				 'accept': '*/*',
				 'content-type': 'application/x-www-form-urlencoded',
				 'user-agent': 'Mozilla/5.0 (Linux; Android 9; BND-AL10 Build/HONORBND-AL10; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044705 Mobile Safari/537.36 MMWEBID/8812 MicroMessenger/7.0.5.1440(0x27000537) Process/tools NetType/WIFI Language/en',
				 'x-requested-with': 'XMLHttpRequest',
				 'origin': 'https://shanghaicity.openservice.kankanews.com',
				 'connection': 'keep-alive',
				 'host': 'shanghaicity.openservice.kankanews.com' 
			 },
			form: {
				idnum: routerName 
				} 
			};
			console.info("getSID 2--Starting get sid for bus router: " + routerName + " on stop " + stopid);
			request(options, function (error, response, body) {
				if (error) throw new Error(error);
				console.info("getSID 3--Starting get sid for bus router: " + routerName + " on stop " + stopid);
				if (!error && response.statusCode == 200) {
					console.log("getSID return body:" + body);
					var obj = JSON.parse(body);
					var sid = obj.sid;
					self.getBusStations(routerName, sid, direction, stopid, checkSum, showStations);
				}else{
					console.log(response.statusCode);
					return "error";
				}
			});
    },
	
});