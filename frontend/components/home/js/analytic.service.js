/**
 *  Copyright (C) 2016 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

angular.module("3drepo")
	.service("AnalyticService", AnalyticService);

AnalyticService.$inject = ["ClientConfigService"];

function AnalyticService(ClientConfigService){
	"use strict";

	var service = {
		init : init,
		sendPageView: sendPageView,
		sendEvent: sendEvent,
		setUserId: setUserId
	};

	return service;

	////////////

	// If not in development load Google Analytics

	function init() {

		if (ClientConfigService.development) {
			console.debug("Development - Not loading Google Analyitics or remarketing")
		}

		if (ClientConfigService && 
			!ClientConfigService.development && 
			ClientConfigService.gaTrackId
		) {
			insertGA();
			insertRemarketing();
		}

	}

	function addScriptBySrc(src) {
		var script = document.createElement("script");
		script.setAttribute("src", src);
		script.setAttribute("async", true);
		document.head.appendChild(script);
	}

	function addScriptByText(js) {
		var script = document.createElement("script");
		script.setAttribute("text", js);
		document.head.appendChild(script);
	}

	function insertRemarketing() {

		var script = "" + 
			"/* <![CDATA[ */" +
			" var google_conversion_id = !{googleConversionId}; " +
			" var google_custom_params = window.google_tag_params; " + 
			" var google_remarketing_only = true; " +
			"/* ]]> */";

		var src = "//www.googleadservices.com/pagead/conversion.js";

		addScriptByText(script);
		addScriptBySrc(src);
	
	}

	function insertGA() {
		console.debug("Initialising GA...");

		(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,"script","https://www.google-analytics.com/analytics.js","ga");

		if (ClientConfigService.userId) {
			ga("create", ClientConfigService.gaTrackId, "auto", { userId: ClientConfigService.userId });
		} else {
			ga("create", ClientConfigService.gaTrackId, "auto");
		}
	}
	
	function isGoogleAnalyticEnabled(){
		return typeof ga !== "undefined" && ga !== null;
	}


	function sendPageView(location){
		if(!isGoogleAnalyticEnabled()){
			return;
		}

		ga("send", "pageview", location.pathname + location.search);
	}

	function sendEvent(event){
		if(!isGoogleAnalyticEnabled()){
			return;
		}

		event.hitType = "event";

		ga("send", event);
	}

	function setUserId(userId){
		if(!isGoogleAnalyticEnabled()){
			return;
		}

		ga("set", "userId", userId);
	}

	
}