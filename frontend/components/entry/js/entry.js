
if (window) {
	if (!window.ClientConfig) {
		console.error("ClientConfig has not been provided...");
	} 

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
}


angular.module("3drepo", ["ui.router", "ngMaterial", "ngAnimate", "ngSanitize", "vcRecaptcha"]);