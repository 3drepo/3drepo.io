(function () {
	"use strict";

	angular.module("3drepo")
		.service("SWService", SWService);

	SWService.$inject = ["DialogService"];

	function SWService(DialogService) {

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
					"service-worker"
					//"google-analytics"
				];

				serviceWorkers.forEach(registerSW);

			}		
		}

		function registerSW(sw)  {
		
			var swPath = path + sw + ".js";
			console.debug("ServiceWorker path: ", swPath);
			var newVersionDialogOpen = false;

			navigator.serviceWorker.register(swPath).then(function(registration) {
				// Registration was successful
				console.debug("ServiceWorker (" + sw + ") registration successful with scope: ", registration.scope);

				// updatefound is fired if service-worker.js changes.
				registration.onupdatefound = function() {
					// The updatefound event implies that registration.installing is set; see
					// https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
					registration.installing.onstatechange = function() {

						if (!newVersionDialogOpen) {
							newVersionDialogOpen = true;
							setTimeout(function(){
								var title = "Update Available";
								var content = "A new version of 3D Repo is available! We will now reload the page.";
								DialogService.text(title, content, false).then(function(){
									location.reload();
								});
							}, 1000);
						}
							
					};
				};

				
				if (typeof registration.update == "function") {
					console.debug("Updating Service Worker...");
					registration.update();
				}
				
			}, function(err) {
				// registration failed :(
				console.debug("ServiceWorker (" + sw + ") registration failed: ", err);
			});

		}
		

		
	}
	
}());

