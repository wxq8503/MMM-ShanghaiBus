## MMM-ShanghaiBus

**Get Info for Shanghai Bus**

## Fetch information for the designed router
用于获取公交车站的站点停靠信息，
*All information fetched from below offical website:
*所有的信息有来自于以下官网
https://shanghaicity.openservice.kankanews.com/public/bus

## Demo

* top_center
![Demo](images/demo.png)


## Installation and requirements

* `git clone https://github.com/wxq8503/MMM-ShanghaiBus` into the `~/MagicMirror/modules` directory.

request

## Config.js entry and options

    {
		module: 'MMM-ShanghaiBus',
		position: 'top_center',
		config: {
			routerName: "69路",			//公交车	
			direction: "1",				//方向，0或者1，表示上行，下行
			checkStation: 4,			//要查看的站点信息，
			showStations: 3,			//要显示几个站点
			updateInterval: 30 * 1000           // 30 seconds
		}
	},



