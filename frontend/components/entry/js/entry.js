(function(){
	if (window) {
		var maintenanceMode = false;

		if (!window.ClientConfig) {
			console.error("ClientConfig has not been provided...");
			return;
		} else {

			console.log(window.ClientConfig.maintenanceMode);

			if (window.ClientConfig && window.ClientConfig.maintenanceMode === true) {
			  document.getElementById("maintenanceMode").style.display = "block";
			  maintenanceMode = true;
			}

			if (window.ClientConfig.VERSION) {
				console.log("======== 3D REPO - Version " + window.ClientConfig.VERSION + " ======");
			} else {
				console.log("No version number in config...");
			}

			if (window.ClientConfig.unitySettings) {
				// Assign unity settings
				window.Module = ClientConfig.unitySettings;
			} else {
				console.error("ClientConfig does not have any provided Unity settings!");
			}
		}

		if (!maintenanceMode) {

			// Add some offline UX
			window.addEventListener("load", function() {

				var offlineDiv = document.createElement("div");
				offlineDiv.className = "connection";
				document.body.appendChild(offlineDiv);

				function updateOnlineStatus() {
					var condition = navigator.onLine ? "Online" : "Offline";
					document.querySelector(".connection").innerHTML = condition;
					if (condition === "Online") {
						offlineDiv.className = "connection online";
						setTimeout(function(){
							document.querySelector(".connection").innerHTML = "";
						}, 1000 * 20); // Show it for twenty seconds
					} else {
						offlineDiv.className = "connection offline";
					}
				}

				window.addEventListener("online",  updateOnlineStatus);
				window.addEventListener("offline", updateOnlineStatus);
			});

			if (angular) {
				window.TDR = angular.module("3drepo", ["ui.router", "ngMaterial", "ngAnimate", "ngSanitize", "vcRecaptcha"]);
			}
		}

	}

})();
