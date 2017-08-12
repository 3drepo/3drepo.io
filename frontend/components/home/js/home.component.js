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
		"$timeout", "$compile", "$mdDialog", "$window",
		"AuthService", "StateManager", "EventService", "UtilsService", 
		"ClientConfigService", "$location", "SWService", "AnalyticService"
	];

	function HomeCtrl(
		$scope, $http, $templateCache, $element, $interval, $timeout, 
		$compile, $mdDialog, $window, AuthService, StateManager,
		EventService, UtilsService, ClientConfigService, $location,
		SWService, AnalyticService
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
			vm.loggedOutPage = false;
			
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


			vm.legal = [
				"legal", 
				"privacy",
				"cookies"
			];

			vm.loginRedirects = [
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

					var change = JSON.stringify(oldState) === JSON.stringify(newState);

					// Determine whether to show the Login directive or 
					// logged in content directives
					if (newState.loggedIn !== undefined) {
						vm.loggedIn = newState.loggedIn;
					}

					if (newState && change) {
						// If it's a legal page
						if (newState["terms"] || newState["privacy"] || newState["cookies"]) {
							vm.isLegalPage = true;
							vm.loggedOutPage = false;
						} else if (
							// If its a logged out page which isnt login
							newState["password-forgot"] || newState["register-request"] || 
							newState["sign-up"] || newState["register-verify"]
						) {
							vm.isLegalPage = false;
							vm.loggedOutPage = true;
						}

						handleStateChange();
					
					}
					
				}, true);

			});

			vm.isMobileFlag = vm.isMobile();

			if (angular.isDefined(vm.account) && angular.isDefined(vm.password)) {
				AuthService.login(vm.account, vm.password);
			}

		};

		vm.precacheTeamspaceTemplate = function() {

			// The account teamspace template is hefty. If we cache it ASAP
			// we can improve the percieved performance for the user
			var templatePath = "templates/account-teamspaces.html";
			$http.get(templatePath).then(function(response) {
				$templateCache.put(templatePath, response.data);
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

		function handleStateChange() {

			// TODO: Inserting DOM like this is an anti pattern

			clearDirective();
			var functionToInsert = getFunctionToInsert();

			if (functionToInsert != null) {
				insertFunctionDirective(functionToInsert);
			} 
		}

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

		function clearDirective() {
			if (vm.elementRef) {
				vm.elementRef.remove();
				vm.elementScope.$destroy();
			}
		}

		function getFunctionToInsert() {
			// Check for static(function) pages to see if we need
			// render one of them
			var func;
			for (var i = 0; i < vm.functions.length; i++) {
				func = vm.functions[i];

				if (vm.state[func]) {
					return func;
				}
			}

			return null;
		}

		function insertFunctionDirective(insertFunc) {

			// Create element related to function func
			var directiveMarkup = "<" + insertFunc +
				" username='vm.query.username'" +
				" token='vm.query.token'" +
				" query='vm.query'>" +
				"</" + insertFunc + ">";

			// Waits for the DOM to be rendered (AngularJS: ???)
			$timeout(function(){

				angular.element(function(){
					if (vm.isLegalPage) {
						insertLegalDirective(directiveMarkup);
					} else {
						insertLoggedOutDirective(directiveMarkup);
					}
				});
				
			});
			
		}

		//TODO: DRY this up

		function insertLegalDirective(markup) {

			// TODO: this all needs cleaning up, confusing 
			// as to what is being insert where and why

			var legalEl = $element[0].querySelector("#homeLegalContainer");
			vm.homeLegalContainer = angular.element(legalEl);

			var directiveElement = angular.element(markup);
			vm.elementScope = $scope.$new();
			vm.elementRef = $compile(directiveElement)(vm.elementScope);
			vm.homeLegalContainer.append(directiveElement);
			
			vm.homeLegalContainer[0].style.zIndex = 2;
			
		}

		function insertLoggedOutDirective(markup) {

			var loggedOutEl = $element[0].querySelector("#homeLoggedOut");
			vm.homeLoggedOut = angular.element(loggedOutEl);

			var directiveElement = angular.element(markup);
			vm.elementScope = $scope.$new();
			vm.elementRef = $compile(directiveElement)(vm.elementScope);
			vm.homeLoggedOut.append(directiveElement);
			vm.homeLoggedOut[0].style.zIndex = 2;
		}

		vm.logout = function () {
			AuthService.logout();
		};

		vm.home = function () {
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

