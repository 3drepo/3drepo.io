(function () {
	"use strict";

	angular.module("3drepo")
		.service("SWService", SWService);

	function SWService() {

		var path = "/"; //"/service-workers/";

		var service = {
			init : init
		};

		return service;
		
		//////////

		function init() {
			if ("serviceWorker" in navigator) {

				console.debug("ServiceWorker in navigator");

				var serviceWorkers = [
					"precache"
					//"google-analytics"
				];

				
				serviceWorkers.forEach(registerSW);

			}		
		}

		function registerSW(sw)  {
		
			var swPath = path + sw + ".js";
			console.debug("ServiceWorker path: ", swPath);

			navigator.serviceWorker.register(swPath).then(function(registration) {
				// Registration was successful
				console.debug("ServiceWorker (" + sw + ") registration successful with scope: ", registration.scope);
			}, function(err) {
				// registration failed :(
				console.debug("ServiceWorker (" + sw + ") registration failed: ", err);
			});

		}
		

		
	}
	
}());

