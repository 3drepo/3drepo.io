/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function StateManagerConfig($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $provide) {
	$locationProvider.html5Mode(true);

	$stateProvider.state("app", {
		url: "",
		template: "<home flex layout='column'></home>",
		resolve: {
			init: ["AuthService", "StateManager", "$q", (AuthService, StateManager, $q) => {
				StateManager.state.authInitialized = false;
				const finishedAuth = $q.defer();

				AuthService.init()
					.then(() => {
						StateManager.state.authInitialized = true;
						finishedAuth.resolve();
					})
					.catch((error) => {
						console.error("Error initialising auth from state manager: ", error);
						finishedAuth.reject();
					});

				return finishedAuth.promise;
			}]
		}
	});

	$stateProvider.state("app.viewer", {
		url: "/viewer/:modelId",
		resolve: {
			init: ["StateManager", "$stateParams", (StateManager, $stateParams) => {
				StateManager.setState($stateParams);
			}]
		}
	});

	$stateProvider.state("app.dashboard", {
		url: "/dashboard",
		template: "<dashboard flex/>",
		resolve: {
			init: ["StateManager", "$stateParams", (StateManager, $stateParams) => {
				StateManager.setState($stateParams);
			}]
		}
	});

	$stateProvider.state("app.dashboard.pages", {
		url: "/*page",
		resolve: {
			init: ["StateManager", "$stateParams", (StateManager, $stateParams) => {
				StateManager.setState($stateParams);
			}]
		}
	});

	$httpProvider.interceptors.push("AuthInterceptor");
	$urlRouterProvider.otherwise("/dashboard");
}

export const StateManagerConfigModule = angular
	.module("3drepo")
	.config([
		"$stateProvider",
		"$urlRouterProvider",
		"$locationProvider",
		"$httpProvider",
		"$provide",
		StateManagerConfig
	]);
