angular.module("3drepo")
	.service("configService", configService);

function configService() {

	var config = window.ClientConfig || {};

	config.api_algorithm = createRoundRobinAlgorithm();
	config.apiUrls = config.api_algorithm.apiUrls;
	config.apiUrl = config.api_algorithm.apiUrl.bind(config.api_algorithm);

	var C = config.C;

	config.GET_API = C.GET_API;
	config.POST_API = (config.apiUrls[C.POST_API]) ? C.POST_API : config.GET_API;
	config.MAP_API = (config.apiUrls[C.MAP_API]) ? C.MAP_API : config.GET_API;


	return config;

	/*******************************************************************************
	 * Round robin API configuration
	 * @param {Object} variable - variable to coalesce
	 * @param {Object} value - value to return if object is null or undefined
	 *******************************************************************************/
	function createRoundRobinAlgorithm() {

		var roundRobin = {
			apiUrls : config.apiUrls,
			apiUrlCounter: {}
		};

		for (var k in config.apiUrls) {
			if(config.apiUrls.hasOwnProperty(k)){
				roundRobin.apiUrlCounter[k] = 0;
			}
		}
		
		// self variable will be filled in by frontend
		roundRobin.apiUrl = function(type, path) {
			var typeFunctions = this.apiUrls[type];
			var functionIndex = this.apiUrlCounter[type] % Object.keys(typeFunctions).length;

			this.apiUrlCounter[type] += 1;

			return this.apiUrls[type][functionIndex](path);
		};

		return roundRobin;

	}

}