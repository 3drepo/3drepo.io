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

function StateManagerConfig($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
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
		url: "/dashboard/*path",
		template: "<dashboard flex/>",
		resolve: {
			init: ["StateManager", "$stateParams", (StateManager, $stateParams) => {
				StateManager.setState($stateParams);
			}]
		}
	});

	$httpProvider.interceptors.push("AuthInterceptor");
	$urlRouterProvider.otherwise("/dashboard");

/* 

	debugger
	const stateStack       = [window.ClientConfig.structure];
	const stateNameStack   = ["home"];

	while (stateStack.length > 0) {
		const stackLength = stateStack.length;
		const parentState = stateStack[0];
		const parentStateName = stateNameStack[0];

		// First loop through the list of functions as these are
		// more specific than the
		if (parentState.functions) {
			for (let i = 0; i < parentState.functions.length; i++) {
				const childFunctionKebabCase = parentState.functions[i];
				const childFunction	= camelCase(childFunctionKebabCase);
				const childFunctionName = parentStateName + "." + childFunctionKebabCase;

				handleFunctions(childFunction, childFunctionKebabCase, childFunctionName);
			}
		}

		if (parentState.children) {
			for (let i = 0; i < parentState.children.length; i++) {
				const childState     = parentState.children[i];
				const childStateName = parentStateName + "." + childState.plugin;

				stateNameStack.push(childStateName);
				stateStack.push(parentState.children[i]);

				handleChildState(childState, childStateName, parentState, parentStateName, i);
			}
		}

		stateStack.splice(0, 1);
		stateNameStack.splice(0, 1);
	}
 */
}

export const StateManagerConfigModule = angular
	.module("3drepo")
	.config([
		"$stateProvider",
		"$urlRouterProvider",
		"$locationProvider",
		"$httpProvider",
		StateManagerConfig
	]);
