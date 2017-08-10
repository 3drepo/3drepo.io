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

				var serviceWorkers = [
					"precache"
					//"google-analytics"
				];

				
				serviceWorkers.forEach(registerSW);

			}		
		}

		function registerSW(sw)  {
		
			console.log("ServiceWorker in navigator");
			window.addEventListener("load", function() {

				var swPath = path + sw + ".js";
				console.log("ServiceWorker path: ", swPath);

				navigator.serviceWorker.register(swPath).then(function(registration) {
					// Registration was successful
					console.log("ServiceWorker (" + sw + ") registration successful with scope: ", registration.scope);
				}, function(err) {
					// registration failed :(
					console.log("ServiceWorker (" + sw + ") registration failed: ", err);
				});
			});
	
		}
		

		
	}
	
}());

