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
		abstract: true,
		template: "<home flex layout='column'></home>",
		resolve: {
			auth: ["AuthService", "StateManager", "$q", (AuthService, StateManager, $q) => {
				debugger
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

/* 	$stateProvider.state("app", {
		url: "/",
		abstract: true,
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
		},
		data: {
			sessionRequired: true
		}
	}); */

	$stateProvider.state("app.viewer", {
		url: "/viewer/:modelId",
		template: `
			<viewer
				id="viewer"
				flex="none"
				ng-if="!vm.isLiteMode && !vm.isLegalPage"
				device-memory="vm.deviceMemory"
				node="node"
				account="vm.state.account"
				model="vm.state.model"
				branch="vm.state.revision"
				revision = "vm.state.revision"
				style="pointer-events:none")"
			/>
		`,
		resolve: {
			init: ["StateManager", "$stateParams", (StateManager, $stateParams) => {
				StateManager.setState($stateParams);
				console.log('test')
			}]
		},
		data: {
			sessionRequired: true
		}
	});

	$stateProvider.state("app.dashboard", {
		url: "/dashboard",
		template: "<dashboard flex/>",
		resolve: {
			init: ["StateManager", "$stateParams", (StateManager, $stateParams) => {
				StateManager.setState($stateParams);
			}]
		},
		data: {
			sessionRequired: true
		}
	});

	$stateProvider.state("app.dashboard.pages", {
		url: "/*page",
		resolve: {
			init: ["StateManager", "$stateParams", (StateManager, $stateParams) => {
				StateManager.setState($stateParams);
			}]
		},
		data: {
			sessionRequired: true
		}
	});

	$stateProvider.state("app.login", {
		url: "/login",
		template: '<login login-message="vm.loginMessage"/>'
	});

	$stateProvider.state("app.signUp", {
		url: "/sign-up",
		template: "<sign-up />"
	});

	$stateProvider.state("app.passwordForgot", {
		url: "/password-forgot",
		template: "<password-forgot />"
	});

	$stateProvider.state("app.passwordChange", {
		url: "/password-change?token&username",
		template: `
			<password-change
				token="vm.query.token"
				username="vm.query.username"
			/>
		`
	});

	$stateProvider.state("app.registerRequest", {
		url: "/register-request",
		template: "<register-request />"
	});

	$stateProvider.state("app.registerVerify", {
		url: "/register-verify",
		template: "<register-verify />"
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
		StateManagerConfig
	]);
