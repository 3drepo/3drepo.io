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
	.factory("AnalyticService", AnalyticService);

AnalyticService.$inject = [];

function AnalyticService(){
	"use strict";

	
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

	return {
		sendPageView: sendPageView,
		sendEvent: sendEvent,
		setUserId: setUserId
	};
}