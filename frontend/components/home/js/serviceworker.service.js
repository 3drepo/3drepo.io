(function () {
	"use strict";

	angular.module("3drepo")
		.service("SWService", SWService);

	SWService.$inject = ["DialogService"];

	function SWService(DialogService) {

		var path = "/"; //"/service-workers/";
		var newVersionDialogOpen = false;
		var sw = "service-worker"; // The name of the service worker

		var service = {
			init : init
		};

		return service;
		
		//////////

		function init() {
			if ("serviceWorker" in navigator) {

				registerSW(sw);

			}		
		}

		function debugSW(message) {
			console.debug("ServiceWorker (" + sw + ") - " + message);
		}

		function registerSW(sw)  {
		
			var swPath = path + sw + ".js";
			debugSW("path: " + swPath);

			navigator.serviceWorker.register(swPath).then(function(registration) {
				
				// Registration was successful
				debugSW("registration successful: " + registration);
		
				registration.onupdatefound = function() {
					debugSW("onupdatefound fired" + registration);
					handleSWRegistration(registration);
				};
				
				if (typeof registration.update == "function") {
					debugSW("updating Service Worker...");
					registration.update();
				}
				
			}, function(err) {
				// registration failed :(
				debugSW("registration failed: " + err);
			});

		}

		function handleSWRegistration(registration) {
			
			debugSW("calling handleSWRegistration asdas");

			if (registration.waiting) {
				debugSW("waiting " + registration.waiting);
				registration.waiting.onstatechange = onStateChange("waiting");
			}
		
			if (registration.installing) {
				debugSW("installing " + registration.installing);
				registration.installing.onstatechange = onStateChange("installing");
			}
		
			if (registration.active) {
				debugSW("active " + registration.active);
				registration.active.onstatechange = onStateChange("active");
			}
		}
	
		function onStateChange(from) {
			return function(event) {
				debugSW("statechange " + from + " to " + event.target.state);
				if (from === "installing" && event.target.state === "activated") {
					showDialog();
				}
			};
		}
	
		function showDialog() {
	
			if (!newVersionDialogOpen) {
				newVersionDialogOpen = true;
				setTimeout(function(){
					DialogService.newUpdate();
				}, 500);
			}
	
		}
	
	}
	

	
}());

