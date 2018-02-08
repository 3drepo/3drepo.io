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
		"StateManager", "EventService", "APIService", "ClientConfigService", 
		"$location", "SWService", "AnalyticService", "ViewerService", 
		"$document", "TemplateService", "DialogService"
	];

	function HomeCtrl(
		$scope, $http, $templateCache, $element, $interval, $timeout, 
		$compile, $mdDialog, $window, AuthService, StateManager,
		EventService, APIService, ClientConfigService, $location,
		SWService, AnalyticService, ViewerService, $document, TemplateService, DialogService
	) {

		var vm = this;
		
		/*
		 * Init
		 */
		vm.$onInit = function() {

			vm.handlePaths();

			vm.setLoginPage();
			
			AnalyticService.init();
			SWService.init();
			
			vm.initKeyWatchers();
			vm.precacheTeamspaceTemplate();

			// Pages to not attempt a interval triggered logout from

			vm.doNotLogout = AuthService.doNotLogout;
			vm.legalPages = AuthService.legalPages;
			vm.loggedOutPages = AuthService.loggedOutPages;

			vm.loggedIn = false;
			vm.loginPage = true;
			vm.isLoggedOutPage = false;
			
			vm.functions = StateManager.functions;
			vm.pointerEvents = "inherit";
			vm.goToAccount = false;
			vm.goToUserPage = false;
			vm.keysDown = [];
			vm.firstState = true;

			// Required for everything to work
			vm.state = StateManager.state;
			vm.query = StateManager.query;

			vm.legalDisplays = [];
			if (angular.isDefined(ClientConfigService.legal)) {
				vm.legalDisplays = ClientConfigService.legal;
			}
			vm.legalDisplays.push({title: "Pricing", page: "http://3drepo.org/pricing"});
			vm.legalDisplays.push({title: "Contact", page: "http://3drepo.org/contact/"});

			vm.isLiteMode = vm.getLiteModeState();
			vm.handlePotentialMobile();

		};

		vm.getLiteModeState = function() {

			var stored = localStorage.getItem("liteMode");
			if (stored !== undefined && stored !== null) {
				if (stored === "false") {
					return false;
				} else if (stored === "true") {
					return true;
				}
			} 
			
			return false; // Default

		}

		vm.getSubdomain = function() {
			var host = $location.host();
			if (host.indexOf(".") < 0) {
				return "";
			} 
			return host.split(".")[0];
		};

		vm.setLoginPage = function() {

			if (ClientConfigService.customLogins !== undefined) {
			
				var sub = vm.getSubdomain();
				var custom = ClientConfigService.customLogins[sub];

				if (sub && custom) {
					if (
						custom.loginMessage
					) {
						vm.loginMessage = custom.loginMessage;
					}
					if (
						custom.backgroundImage &&
						typeof custom.backgroundImage === "string"
					) {
						vm.backgroundImage = custom.backgroundImage;
					}
					if (
						custom.topLogo &&
						typeof custom.topLogo === "string"
					) {
						vm.topLogo = custom.topLogo;
					}
					if (
						custom.css
					) {
						var link = document.createElement("link");
						link.setAttribute("rel", "stylesheet");
						link.setAttribute("type", "text/css");
						link.setAttribute("href", custom.css);
						document.getElementsByTagName("head")[0].appendChild(link);
					}
				} 

			}

			if (!vm.topLogo) {
				vm.topLogo = "/images/3drepo-logo-white.png";
			}
			if (!vm.backgroundImage) {
				vm.backgroundImage = "/images/viewer_background.png";
			}

		};

		vm.handlePaths = function() {
			
			// TODO: this is a bit of a hack, it would be nice to 
			// include this in the StateManager
			if (hasTrailingSlash()) {
				removeTrailingSlash();
			}

			// If it's a logged in page just redirect to the
			// users teamspace page
			AuthService.authPromise.then(function(){
				if (
					AuthService.loggedOutPage() && 
					AuthService.getUsername()
				) {
					$location.path("/" + AuthService.getUsername());
				}
			});	

		};

		$scope.$watch(function(){
			return $location.path();
		}, function() {

			vm.handlePaths();
			
		});


		/*
		* Watch the state to handle moving to and from the login page
		*/
		$scope.$watch("vm.state", function (oldState, newState) {

			var change = JSON.stringify(oldState) !== JSON.stringify(newState);

			vm.loggedIn = AuthService.isLoggedIn();

			if ( (newState && change) || (newState && vm.firstState)) {

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

					vm.loggedOutPages.forEach(function(page){
						vm.setPage(newState, page);
					});

					
				} else if (
					AuthService.getUsername() && 
					newState.account !== AuthService.getUsername() && 
					!newState.model
				) {
					// If it's some other random page that doesn't match 
					// anything sensible like legal, logged out pages, or account
					vm.isLoggedOutPage = false;
					vm.page = "";
					$location.search({}); // Reset query parameters
					$location.path("/" + AuthService.getUsername());
				} else if (
					!AuthService.getUsername() &&
					!legal &&
					!loggedOut
				) {

					// Login page or none existant page
					
					vm.isLoggedOutPage = false;
					vm.page = "";
				}

			}
		}, true);

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

			TemplateService.precache(preCacheTemplates);

		};

		vm.handlePotentialMobile = function() {
			
			// Regex test is as recommended by Mozilla: 
			// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
			
			var mobile = screen.width <= 768 || /Mobi/.test(navigator.userAgent);
			var setMemory = localStorage.getItem("deviceMemory");
			
			console.debug("Memory limit set to: ", setMemory);

			// We're in mobile, with no memory set
			// and it's not already in lite mode
			if (mobile && !setMemory && !vm.isLiteMode) {
				DialogService.showDialog(
					"lite-dialog.html",
					$scope,
					event,
					false,
					null,
					false
				)
				return;
			} 

			if (!vm.isLiteMode && mobile && setMemory) {
				// We're on mobile/tablet and we have a previous 
				// memory setting selected
				vm.deviceMemory = parseInt(setMemory);
				return;
			} 
			
			// if (!mobile && setMemory) {
			// 	// We've resized to normal mode i.e. when debugging etc
			// 	vm.setLiteMode(false);
			// 	localStorage.removeItem("deviceMemory");
			// } else
			
			
		};

		vm.setLiteMode = function(onOrOff) {
			vm.isLiteMode = onOrOff;
			localStorage.setItem("liteMode", onOrOff);
		}

		vm.showMemorySelected = false;

		vm.useLiteMode = function() {
			vm.setLiteMode(true);
			DialogService.closeDialog();
		}

		vm.useNormalMode = function() {
			vm.setLiteMode(false);
			vm.showMemorySelected = true;
			vm.deviceMemory = 2; // Default for mobile/tablet in normal mode
		}

		vm.memorySelected = function() {
			DialogService.closeDialog();
			if (vm.deviceMemory == 0) {
				vm.deviceMemory = 2;
			}
			localStorage.setItem("deviceMemory", vm.deviceMemory);
			if (vm.state.model) {
				location.reload();
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

		vm.logout = function () {
			AuthService.logout();
			ViewerService.reset();
		};

		vm.home = function () {
			ViewerService.reset();
			StateManager.goHome();
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
							
							StateManager.updateState(true);

							if(!StateManager.state.account){
								
								var username = AuthService.getUsername();
								if (!username) {
									console.error("Username is not defined for statemanager!");
								}
								StateManager.setHomeState({ 
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
						StateManager.setHomeState({ loggedIn: false, account: null });
					}

				} else if (event.type === EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING) {
					vm.pointerEvents = event.value.on ? "none" : "inherit";
				}
			}
		});

		vm.initKeyWatchers = function() {

			$document.bind("keydown", function(event) {
				if (vm.keysDown.indexOf(event.which) === -1) {
					
					vm.keysDown.push(event.which);
					
					// Recreate list so that it changes are registered in components
					vm.keysDown = vm.keysDown.slice();

				}
			});

			$document.bind("keyup", function(event) {
				// Remove all instances of the key (multiple instances can happen if key up wasn't registered)
				for (var i = (vm.keysDown.length - 1); i >= 0; i -= 1) {
					if (vm.keysDown[i] === event.which) {
						vm.keysDown.splice(i, 1);
					}
				}
				
				// Recreate list so that it changes are registered in components
				vm.keysDown = vm.keysDown.slice();
			});


		};

		/**
		 * Close the dialog
		 */
		$scope.closeDialog = function() {
			$mdDialog.cancel();
		};

	}
}());

