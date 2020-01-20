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

module.exports = NodeHelper.create({
	start: function () {
		console.info('MMM-ShanghaiBus helper started...');
	},


  // Override socketNotificationReceived method.
	socketNotificationReceived: function(notification, payload) {
		var self=this;
		console.log('Starting socketNotificationReceived()-'+notification);
		if (notification === 'GET_BUS_SID') {
			this.getSID(payload.routerNum);
		} else if (notification === 'GET_BUS_STOP_INFO'){
			console.log(notification + " -- " + payload.routerNum);
			this.getSID(payload.routerNum, payload.routerDirection, payload.stopID);
		}
	},
	
	getBusStopInfo: function(sid, direction, stopid, stationsListData) {
        var self = this;
		
		var terminal = "N/A";
		var stopdis = "N/A";
		var distance = "N/A";
		var time = "N/A";
		var status = "等待发车";
		var stationsLength = stationsListData.length;
		var stationInfo = stationsListData[Number(stopid)-1];
		console.log(stationsListData);
		console.log(stationInfo);
		var station = JSON.parse(stationInfo);
		
		console.info("Starting get all bus stations sid: " + sid);
		console.log(stationsLength);
		
		var referer = 'https://shanghaicity.openservice.kankanews.com/public/bus/mes/sid/'+ sid +'?stoptype='+ direction;
		console.info("Starting get all bus stations referer: " + referer);
		//var request = require("request");
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
			//console.info("BusStopInfo 2--Starting get sid for bus sid: " + sid);
			if (!error && response.statusCode == 200) {
				console.log(body);
				var obj = JSON.parse(body);
				if (JSON.parse(body).hasOwnProperty('error')) {
					console.log('ERROR: ShanghaiBus API returned an error message:');
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
				self.sendSocketNotification('RETURN_BUS_STOP_INFO', {'stopdis':stopdis, 'distance':distance, 'time':time, 'terminal':terminal, 'status':status, 'station_num':station_num, 'station_name':station_name, 'url':"test"});
			}else{
				console.log(response.statusCode);
				return "error";
			}
		});
    },
	
	getBusStations: function(sid, direction, stopid, getBusStopInfo) {
        var self = this;
		console.info("Starting get all bus stations: ");
        
		//var request = require("request");
		//var sid = self.getSID(routerNum);
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
			console.log(response.headers['content-encoding']);
			var header=response.headers;
            console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
            //检查响应内容编码方式是否为“gzip”格式
            if(response.headers['content-encoding']=='gzip'){
				//数据解压
                zlib.unzip(body, function(err, dezipped) {
					self.getStationsList(dezipped.toString(), sid, direction, stopid);
                });
            } else {
				self.getStationsList(body.toString(), sid, direction, stopid);
			}
			
			//self.getBusStopInfo(sid, direction, stopid);
			//self.sendSocketNotification('RETURN_BUS_STOP_INFO', {'stopdis':stopdis, 'distance':distance, 'time':time, 'terminal':terminal, 'status':status, 'url':"test"});
			//self.sendSocketNotification('RETURN_BUS_STATIONS', {'sid':sid, 'url':"test"});
		});
    },
	
	getStationsList:function(DezippedBody, sid, direction, stopid, getBusStopInfo){
		var self = this;
		//console.log(DezippedBody);
		var $ = cheerio.load(DezippedBody);
			var stationList = $('div .station');
			console.log("stations_num:" + stationList.length);
			var stationsListData = [];
			stationList.each(function(item) {
				var station = $(this);
				var station_num = station.find('span.num').text();
				var station_name = station.find('span.name').text();
				console.log("station_num:" + station_num);
				console.log("station_name:" + station_name);
				stationsListData.push(
					{
						"station_num" : station_num,
						"station_name" : station_name
					}
				);
			});
		self.getBusStopInfo(sid, direction, stopid, stationsListData);
	},
	
	getSID:function(routerNum, direction, stopid, getBusStations) {
		var self = this;
	  
        console.info("getSID 1--Starting get sid for bus router: " + routerNum + " on stop " + stopid);
        //var request = require("request");
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
				 'content-length': '17',
				 'connection': 'keep-alive',
				 'host': 'shanghaicity.openservice.kankanews.com' 
			 },
			form: {
				idnum: routerNum 
				} 
			};
			//console.info("getSID 2--Starting get sid for bus router: " + routerNum);
			request(options, function (error, response, body) {
				if (error) throw new Error(error);
				//console.info("getSID 3--Starting get sid for bus router: " + routerNum);
				if (!error && response.statusCode == 200) {
					console.log(body);
					var obj = JSON.parse(body);
					var sid = obj.sid;
					//self.getBusStopInfo(sid, direction, stopid);
					self.getBusStations(sid, direction, stopid);
				}else{
					console.log(response.statusCode);
					return "error";
				}
			});
    },
	
});