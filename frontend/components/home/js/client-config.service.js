angular.module("3drepo")
	.service("ClientConfigService", ClientConfigService);

function ClientConfigService() {

	var Config;
	
	if (window) {
		Config = window.ClientConfig || {};
	} else {
		Config = {};
	}

	Config.api_algorithm = createRoundRobinAlgorithm();
	Config.apiUrls = Config.api_algorithm.apiUrls;
	Config.apiUrl = Config.api_algorithm.apiUrl.bind(Config.api_algorithm);

	var C = Config.C;

	Config.GET_API = C.GET_API;
	Config.POST_API = (Config.apiUrls[C.POST_API]) ? C.POST_API : Config.GET_API;
	Config.MAP_API = (Config.apiUrls[C.MAP_API]) ? C.MAP_API : Config.GET_API;


	return ClientConfig;


	function createRoundRobinAlgorithm() {
		
		var roundRobin = {
			apiUrls : Config.apiUrls,
			apiUrlCounter: {},
			apiUrl : function(type, path) {
				var typeFunctions = this.apiUrls[type];
				var functionIndex = this.apiUrlCounter[type] % Object.keys(typeFunctions).length;
		
				this.apiUrlCounter[type] += 1;
		
				return this.apiUrls[type][functionIndex] + "/" + path;
			}
		};
	
		for (var k in Config.apiUrls) {
			if(Config.apiUrls.hasOwnProperty(k)){
				roundRobin.apiUrlCounter[k] = 0;
			}
		}
		
		return roundRobin;
	
	}

}