angular.module('3drepo')
.factory('AnalyticService', AnalyticService);

function AnalyticService(){
	"use strict";

	
	function isGoogleAnalyticEnabled(){
		return typeof ga !== "undefined" && ga !== null
	}


	function sendPageView(location){
		if(!isGoogleAnalyticEnabled()){
			return;
		}

		ga("send", "pageview", location.pathname + location.search);
	}

	return {
		sendPageView: sendPageView
		sendEvent: sendEvent
	}
}