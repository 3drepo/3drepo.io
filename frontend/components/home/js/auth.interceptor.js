/**
 *  Copyright (C) 2014 3D Repo Ltd
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

(function() {
	"use strict";
	angular.module("3drepo")
		.service("AuthInterceptor", AuthInterceptor);

	AuthInterceptor.$inject = [
		"$injector"
	];

	function AuthInterceptor($injector) {  

		var service = this;
		var dialogOpen = false;

		service.responseError = function(response) {

			var notLogin = response.data.place !== "GET /login";

			var unauthorized = response.status === 401 &&
								response.data.message === "You are not logged in";
			var sessionHasExpired = unauthorized && !dialogOpen && notLogin;

			if (sessionHasExpired) {
				sessionExpired();
			} else {
				throw response;
			}

		};

		service.request = function(config) {
			return config;
		};

		service.requestError = function(config) {
			return config;
		};

		service.response = function(res) {
			return res;
		};

		function sessionExpired() {

			var DialogService = $injector.get("DialogService");
			var AuthService = $injector.get("AuthService");
			var ViewerService = $injector.get("ViewerService");
			
			DialogService.sessionExpired().then(function(){
				ViewerService.reset();
				AuthService.logoutSuccess();
			});
			
		}

	}

	
	
})();
