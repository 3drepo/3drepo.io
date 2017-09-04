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

(function () {
	"use strict";

	angular.module("3drepo")
		.component("home", {
			restrict: "E",
			templateUrl: "templates/home.html",
			bindings: {
				account: "@",
				password: "@",
				loggedInUrl: "@",
				loggedOutUrl: "@"
			},
			controller: HomeCtrl,
			controllerAs: "vm"
		});

	HomeCtrl.$inject = [
		"$scope", "$http", "$templateCache", "$element", "$interval", 
		"$timeout", "$compile", "$mdDialog", "$window", "AuthService", 
		"StateManager", "EventService", "UtilsService", "ClientConfigService", 
		"$location", "SWService", "AnalyticService", "ViewerService"
	];

	function HomeCtrl(
		$scope, $http, $templateCache, $element, $interval, $timeout, 
		$compile, $mdDialog, $window, AuthService, StateManager,
		EventService, UtilsService, ClientConfigService, $location,
		SWService, AnalyticService, ViewerService
	) {

		var vm = this;
		
		/*
		 * Init
		 */
		vm.$onInit = function() {

			// TODO: this is a bit of a hack, it would be nice to 
			// include this in the StateManager
			if (hasTrailingSlash()) {
				removeTrailingSlash();
			}

			AnalyticService.init();
			SWService.init();

			vm.precacheTeamspaceTemplate();

			vm.loggedIn = false;
			vm.loginPage = true;
			vm.isLoggedOutPage = false;
			
			vm.state = StateManager.state;
			vm.query = StateManager.query;
			vm.functions = StateManager.functions;
			vm.pointerEvents = "inherit";
			vm.goToAccount = false;
			vm.goToUserPage = false;
			vm.keysDown = [];

			vm.isMobileFlag = true;

			vm.legalDisplays = [];
			if (angular.isDefined(ClientConfigService.legal)) {
				vm.legalDisplays = ClientConfigService.legal;
			}
			vm.legalDisplays.push({title: "Pricing", page: "http://3drepo.org/pricing"});
			vm.legalDisplays.push({title: "Contact", page: "http://3drepo.org/contact/"});

			// Pages to not attempt a interval triggered logout from
			vm.doNotLogout = [
				"/terms", 
				"/privacy",
				"/signUp", 
				"/passwordForgot", 
				"/registerRequest", 
				"/registerVerify"
			];


			vm.legalPages = [
				"terms", 
				"privacy",
				"cookies"
			];

			vm.loggedOutPages = [
				"sign-up",
				"password-forgot",
				"register-request",
				"register-verify"
			];

			$timeout(function () {

				/*
				* Watch the state to handle moving to and from the login page
				*/
				$scope.$watch("vm.state", function (oldState, newState) {

					var change = JSON.stringify(oldState) !== JSON.stringify(newState);

					// Determine whether to show the Login directive or 
					// logged in content directives
					if (newState.loggedIn !== undefined) {
						vm.loggedIn = newState.loggedIn;
					}

					if (newState && change) {

						// If it's a legal page
						var legal = vm.pageCheck(newState, vm.legalPages);
						var loggedOut = vm.pageCheck(newState, vm.loggedOutPages);

						if (legal) {

							vm.isLegalPage = true;
							vm.isLoggedOutPage = false;

							vm.legalPages.forEach(function(page){
								vm.setPage(newState, page);
							});

						} else if (loggedOut && !newState.loggedIn) {

							// If its a logged out page which isnt login
							
							vm.isLegalPage = false;
							vm.isLoggedOutPage = true;

							console.log("loggedOut page", newState);

							
							vm.loggedOutPages.forEach(function(page){
								vm.setPage(newState, page);
							});

							
						} else if (newState.account !== AuthService.getUsername()) {
							// If it's some other random page that doesn't match 
							// anything sensible like legal, logged out pages, or account
							vm.isLoggedOutPage = false;
							vm.page = "";
							$location.path("/" + AuthService.getUsername());
						}

						console.log("New State:", newState)

					}			
				}, true);
			});

			vm.isMobileFlag = vm.isMobile();

			if (angular.isDefined(vm.account) && angular.isDefined(vm.password)) {
				AuthService.login(vm.account, vm.password);
			}

		};

		vm.pageCheck = function(state, pages) {
			return pages.filter(function(page) { 
				return state[page] === true;
			}).length;
		};

		vm.setPage = function(state, page) {
			if(state[page] === true) {
				vm.page = page;
			}
		};

		vm.precacheTeamspaceTemplate = function() {

			// The account teamspace template is hefty. If we cache it ASAP
			// we can improve the percieved performance for the user

			var preCacheTemplates = [
				"templates/account-teamspaces.html",
				"templates/account-info.html",
				"templates/sign-up.html",
				"templates/register-request.html"
			];

			preCacheTemplates.forEach(function(templatePath){
				$http.get(templatePath).then(function(response) {
					$templateCache.put(templatePath, response.data);
				});
			});

		};

		vm.isMobile = function() {

			var mobile = screen.width <= 768;

			if (mobile) {
				vm.handleMobile();
			}

			console.debug("Is mobile? ", mobile);
			return mobile;

		};

		vm.handleMobile = function() {

			var message = "We have detected you are on a " +
			"mobile device and will show the 3D Repo lite experience for " +
			"smoother performance.";

			$mdDialog.show(

				$mdDialog.confirm()
					.clickOutsideToClose(true)
					.title("3D Repo Lite")
					.textContent(message)
					.ariaLabel("3D Repo Lite Dialog")
					.ok("OK")
					
			);

		};


		function hasTrailingSlash() {
			// Check if we have a trailing slash in our URL
			var absUrl = $location.absUrl();
			var trailingCheck = absUrl.substr(-1);
			if (trailingCheck === "/") {
				return true;
			}
			return false;
		}

		function removeTrailingSlash() {
			// Remove the trailing slash from the URL
			var currentPath = $location.path();
			var minusSlash = currentPath.slice(0, -1);
			$location.path(minusSlash);
		}

		vm.logout = function () {
			AuthService.logout();
		};

		vm.home = function () {
			ViewerService.reset();
			EventService.send(EventService.EVENT.GO_HOME);
		};

		/**
		 * Display legal text
		 *
		 * @param event
		 * @param display
		 */
		vm.legalDisplay = function (event, display) {
			$window.open("/" + display.value);
		};

		$scope.$watch(EventService.currentEvent, function(event) {
			if (angular.isDefined(event) && angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.USER_LOGGED_IN) {
					if (!event.value.error) {
						if(!event.value.initialiser) {
							StateManager.setStateVar("loggedIn", true);
							EventService.send(EventService.EVENT.UPDATE_STATE);

							if(!StateManager.state.account){
								var username = AuthService.getUsername();
								if (!username) {
									console.error("Username is not defined for statemanager!")
								}
								EventService.send(EventService.EVENT.SET_STATE, { 
									account: username
								});
							}
						}
					} else {

						EventService.send(EventService.EVENT.USER_LOGGED_OUT);
					
					}
				} else if (event.type === EventService.EVENT.USER_LOGGED_OUT) {
					
					// TODO: Use state manager
					// Only fire the Logout Event if we're on the home page
					var currentPage = $location.path();

					if (vm.doNotLogout.indexOf(currentPage) === -1) {
						//EventService.send(EventService.EVENT.CLEAR_STATE);
						EventService.send(EventService.EVENT.SET_STATE, { loggedIn: false, account: null });
					}

				} else if (event.type === EventService.EVENT.SHOW_TEAMSPACES) {
					//EventService.send(EventService.EVENT.CLEAR_STATE);
					$location.path(AuthService.getUsername());
				} else if (event.type === EventService.EVENT.GO_HOME) {

					//EventService.send(EventService.EVENT.CLEAR_STATE);

					// TODO: Do this properly using state manager
					
					if (AuthService.isLoggedIn()) {
						$location.path(AuthService.getUsername());
						//EventService.send(EventService.EVENT.SET_STATE, { account: AuthService.getUsername() });
					} else {
						$location.path("");
					}
				} else if (event.type === EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING) {
					vm.pointerEvents = event.value.on ? "none" : "inherit";
				}
			}
		});


		/**
		 * Keep a list of keys held down
		 * For changes to be registered by directives and especially components the list needs to be recreated
		 *
		 * @param event
		 */
		vm.keyAction = function (event) {
			var i, tmp;
			// Update list, but avoid repeat
			if (event.type === "keydown") {
				if (vm.keysDown.indexOf(event.which) === -1) {
					// Recreate list so that it changes are registered in components
					tmp = vm.keysDown;
					delete vm.keysDown;
					
					vm.keysDown = angular.copy(tmp);
					vm.keysDown.push(event.which);

				}
			} else if (event.type === "keyup") {
				// Remove all instances of the key (multiple instances can happen if key up wasn't registered)
				for (i = (vm.keysDown.length - 1); i >= 0; i -= 1) {
					if (vm.keysDown[i] === event.which) {
						vm.keysDown.splice(i, 1);
					}
				}
				// Recreate list so that it changes are registered in components
				tmp = vm.keysDown;
				delete vm.keysDown;
				vm.keysDown = angular.copy(tmp);
			}
		};


		/**
		 * Close the dialog
		 */
		$scope.closeDialog = function() {
			$mdDialog.cancel();
		};

	}
}());

