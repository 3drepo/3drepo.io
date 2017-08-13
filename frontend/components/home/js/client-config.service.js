angular.module("3drepo")
	.service("ClientConfigService", ClientConfigService);

function ClientConfigService() {

	window.ClientConfig = window.ClientConfig || {};

	ClientConfig.api_algorithm = createRoundRobinAlgorithm();
	ClientConfig.apiUrls = ClientConfig.api_algorithm.apiUrls;
	ClientConfig.apiUrl = ClientConfig.api_algorithm.apiUrl.bind(ClientConfig.api_algorithm);

	var C = ClientConfig.C;

	ClientConfig.GET_API = C.GET_API;
	ClientConfig.POST_API = (ClientConfig.apiUrls[C.POST_API]) ? C.POST_API : ClientConfig.GET_API;
	ClientConfig.MAP_API = (ClientConfig.apiUrls[C.MAP_API]) ? C.MAP_API : ClientConfig.GET_API;


	return ClientConfig;

	/*******************************************************************************
	 * Round robin API configuration
	 * @param {Object} variable - variable to coalesce
	 * @param {Object} value - value to return if object is null or undefined
	 *******************************************************************************/
	function createRoundRobinAlgorithm() {

		var roundRobin = {
			apiUrls : ClientConfig.apiUrls,
			apiUrlCounter: {}
		};

		for (var k in ClientConfig.apiUrls) {
			if(ClientConfig.apiUrls.hasOwnProperty(k)){
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