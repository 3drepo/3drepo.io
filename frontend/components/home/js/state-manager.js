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

(function() {
	"use strict";

	config.$inject = [
		"$stateProvider", "$urlRouterProvider", "$locationProvider", "$httpProvider"
	];

	function config($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
		
		$locationProvider.html5Mode(true);

		$stateProvider.state("home", {
			name: "home",
			url: "/",
			resolve: {
				init: ["AuthService", "StateManager", "$q", function(AuthService, StateManager, $q) {
					StateManager.state.authInitialized = false;
					var finishedAuth = $q.defer();

					StateManager.state.changing = true;

					AuthService.init(false)
						.then(function () {
							StateManager.state.authInitialized = true;
							finishedAuth.resolve();
						})
						.catch(function(error) {
							console.error("Error initialising auth from state manager: ", error);
							finishedAuth.reject();
						});

					return finishedAuth.promise;
				}]
			}
		});

		$httpProvider.interceptors.push("AuthInterceptor");

		// Convert blah_test to blahTest
		function camelCase(name) {
			return name.replace(/-([a-z])/g, 
				function (g) { 
					return g[1].toUpperCase(); 
				}
			);
		}

		// TODO: We need to find a way to make ClientConfig come from the service
		var stateStack       = [window.ClientConfig.structure];
		var stateNameStack   = ["home"];

		while (stateStack.length > 0) {
			var stackLength      = stateStack.length;
			var parentState      = stateStack[0];
			var parentStateName  = stateNameStack[0];

			// First loop through the list of functions as these are
			// more specific than the
			if (parentState.functions) {
				for (var i = 0; i < parentState.functions.length; i++) {
					var childFunctionKebabCase = parentState.functions[i];
					var childFunction	       = camelCase(childFunctionKebabCase);
					var childFunctionName      = parentStateName + "." + childFunctionKebabCase;

					(function(childFunction, childFunctionKebabCase, childFunctionName) {
						$stateProvider.state(childFunctionName, {
							name: childFunction,
							url: childFunction,
							resolve: {
								init: ["StateManager", "$location", "$stateParams", function (StateManager, $location, $stateParams) {
									$stateParams[childFunctionKebabCase] = true;

									StateManager.setState($stateParams);
								}]
							}
						});
					})(childFunction, childFunctionKebabCase, childFunctionName);
				}
			}

			if (parentState.children) {
				for (var i = 0; i < parentState.children.length; i++) {
					var childState     = parentState.children[i];
					var childStateName = parentStateName + "." + childState.plugin;

					stateNameStack.push(childStateName);
					stateStack.push(parentState.children[i]);

					(function(childState){
						//console.log('childState.url', childState.url);
						$stateProvider.state(childStateName, {
							name: parentState.children[i].plugin,
							params: childState.params,
							url: childState.url || (parentStateName !== "home" ? "/" : "") + ":" + childState.plugin,
							reloadOnSearch : false,
							resolve: {
								init: ["StateManager", "$location", "$stateParams", function(StateManager, $location, $stateParams) {
									StateManager.setState($stateParams);
									//console.log('##state', StateManager.state);
								}]
							}
						});
					})(childState);
				}
			}

			stateStack.splice(0,1);
			stateNameStack.splice(0,1);
		}

		$urlRouterProvider.otherwise("");
	}

	function run($location, $rootScope, $state, StateManager, AuthService, $timeout, AnalyticService) {
		$rootScope.$on("$stateChangeStart",function(event, toState, toParams, fromState, fromParams){

			StateManager.state.changing = true;

			for(var i = 0; i < StateManager.functions.length; i++) {
				StateManager.setStateVar(StateManager.functions[i], false);
			}

			StateManager.clearQuery();

			var stateChangeObject = {
				toState    : toState,
				toParams   : toParams,
				fromState  : fromState,
				fromParams : fromParams
			};

			StateManager.startStateChange(stateChangeObject);
		});

		$rootScope.$on("$stateChangeSuccess",function(event, toState, toParams, fromState, fromParams){

			var stateChangeObject = {
				toState    : toState,
				toParams   : toParams,
				fromState  : fromState,
				fromParams : fromParams
			};

			StateManager.handleStateChange(stateChangeObject);
		});

		$rootScope.$on("$locationChangeSuccess", function() {

			AnalyticService.sendPageView(location);

			var queryParams = $location.search();

			if (Object.keys(queryParams).length === 0) {
				StateManager.clearQuery();
			} else {
				StateManager.setQuery(queryParams);
			}
		});
	}

	function StateManager(
		$mdDialog, $location, $q, $state, $rootScope, 
		$timeout, $window, AuthService, 
		ClientConfigService, ViewerService, IssuesService,
		CompareService
	) {
				
		var self = this;

		// Stores the state, required as ui-router does not allow inherited
		// stateParams, and we need to dynamically generate state diagram.
		// One day this might change.
		// https://github.com/angular-ui/ui-router/wiki/URL-Routing
		this.state = {
			changing: true
		};

		this.goHome = function() {

			// TODO: Do this properly using state manager
			var path = "/";

			if (AuthService.isLoggedIn() && AuthService.getUsername()) {
				path = "/" + AuthService.getUsername();
			}

			$location.path(path);
		};

		this.changedState = {};
		this.structure  = ClientConfigService.structure;
		this.destroy = function()  {
			delete this.state;
			this.state = {};

			delete this.ui;
			this.ui = {};

			delete this.Data;
			this.Data = {};
		};

		// Has a state variable changed. Is this necessary ?
		this.changed     = {};

		this.state       = { loggedIn : false };
		this.query       = {};
		this.functions   = [];

		var stateStack       = [ClientConfigService.structure];

		// Populate list of functions
		while (stateStack.length > 0) {
			var stackLength      = stateStack.length;
			var parentState      = stateStack[stackLength - 1];

			var functionName;

			if (parentState.functions) {
				for(var i=0; i<parentState.functions.length; i++) {
					functionName = parentState.functions[i];

					if (this.functions.indexOf(functionName) > -1) {
						console.error("Duplicate function name when loading in StateManager : " + functionName);
					} else {
						this.functions.push(functionName);
					}
				}
			}

			if (parentState.children) {
				for (var j = 0; j < parentState.children.length; j++) {
					stateStack.push(parentState.children[j]);
				}
			}

			stateStack.splice(0,1);
		}

		this.clearChanged = function() {
			for(var c in self.changed) {
				if (self.changed.hasOwnProperty(c)) {
					self.changed[c] = false;
				}
			}
		};

		self.clearChanged();

		this.stateChangeQueue = [];

		var compareStateChangeObjects = function(stateChangeA, stateChangeB) {
			return	(stateChangeA.toState	 === stateChangeB.toState) &&
				(stateChangeA.toParams	 === stateChangeB.toParams) &&
				(stateChangeA.fromState  === stateChangeB.fromState) &&
				(stateChangeA.fromParams === stateChangeB.fromParams);
		};

		this.startStateChange = function(stateChangeObject) {
			self.stateChangeQueue.push(stateChangeObject);
		};

		this.handleStateChange = function(stateChangeObject) {
			var param;
			var fromParams = stateChangeObject.fromParams;
			var toParams   = stateChangeObject.toParams;

			// Switch off all parameters that we came from
			// but are not the same as where we are going to
			for (param in fromParams) {
				if (fromParams.hasOwnProperty(param)) {
					if (!toParams.hasOwnProperty(param)) {
						self.setStateVar(param, null);
					}
				}
			}

			for (param in toParams) {
				if (toParams.hasOwnProperty(param)) {
					if (fromParams.hasOwnProperty(param)) {
						if (fromParams[param] !== toParams[param]) {
							self.setStateVar(param, toParams[param]);
						}
					} else {
						self.setStateVar(param, toParams[param]);
					}
				}
			}

			// Loop through structure. If a parent is null, then we must clear
			// it's children
			var stateStack       = [ClientConfigService.structure];
			var stateNameStack   = ["home"];
			var clearBelow       = false;

			while (stateStack.length > 0) {
				var stackLength      = stateStack.length;
				var parentState      = stateStack[stackLength - 1];
				var parentStateName  = stateNameStack[stackLength - 1];

				if (parentStateName !== "home" && !self.state[parentStateName]) {
					clearBelow = true;
				}

				if (parentState.children) {
					for (var i = 0; i < parentState.children.length; i++) {
						var childStateName = parentState.children[i].plugin;

						stateNameStack.push(childStateName);
						stateStack.push(parentState.children[i]);

						if (clearBelow) {
							self.setStateVar(childStateName, null);
						}
					}
				}

				stateStack.splice(0,1);
				stateNameStack.splice(0,1);
			}

			if (compareStateChangeObjects(stateChangeObject, self.stateChangeQueue[0])) {
				self.stateChangeQueue.pop();

				var functionList = self.functionsUsed();

				// If we are not trying to access a function
				// and yet there is no account set. Then
				// we need to go back to the account page if possible.
				if ((functionList.length === 0) && AuthService.isLoggedIn() && !self.state.account) {
					self.setStateVar("account", AuthService.getUsername());
					self.updateState();
				} else {
					self.updateState(true);
				}
			} else {
				self.stateChangeQueue.pop();
				self.handleStateChange(self.stateChangeQueue[self.stateChangeQueue.length - 1]);
			}
		};

		this.stateVars   = {};

		this.clearQuery = function(state) {
			for(var param in self.query) {
				delete self.query[param];
			}
		};

		this.functionsUsed = function () {
			var functionList = [];

			// First loop through the list of functions
			// belonging to parent structure.
			// Only deals with functions on home directory
			if (self.structure.functions) {
				for(i = 0; i < self.structure.functions.length; i++) {
					functionName = self.structure.functions[i];

					if (self.state[functionName]) {
						functionList.push(functionName);
						break;
					}
				}
			}

			return functionList;
		};

		this.genStateName = function () {
			var currentChildren = self.structure.children;
			var childidx        = 0;
			var stateName       = "home."; // Assume that the base state is there.
			var i               = 0;
			var functionList    = self.functionsUsed();
			var usesFunction    = (functionList.length > 0);

			if (usesFunction) {
				stateName += functionList.join(".") + ".";
			} else {
				while(childidx < currentChildren.length) {
					var child  = currentChildren[childidx];
					var plugin = child.plugin;

					if (self.state.hasOwnProperty(plugin) && self.state[plugin]) {
						stateName += plugin + ".";

						if (child.children) {
							currentChildren = child.children;
						} else {
							currentChildren = [];
						}

						childidx = -1;
					}

					childidx += 1;
				}
			}

			return stateName.substring(0, stateName.length - 1);
		};

		this.setStateVar = function(varName, value) {
			if (value === null) {
				delete self.state[varName];
			} else {
				if (self.state[varName] !== value) {
					self.state.changing = true;
					self.changedState[varName] = value;
				}
			}
			//console.log(varName, value);
			self.state[varName] = value;
		};

		this.setState = function(stateParams) {
			// Copy all state parameters and extra parameters
			// to the state

			if(stateParams.noSet){
				return;
			}

			for (var state in stateParams) {
				if (stateParams.hasOwnProperty(state)) {
					self.setStateVar(state, stateParams[state]);
				}
			}
		};

		this.setQuery = function(queryParams) {
			for(var param in queryParams) {
				if (queryParams.hasOwnProperty(param)) {
					self.query[param] = queryParams[param];
				}
			}
		};

		this.updateState = function(dontUpdateLocation) {
			var newStateName = self.genStateName();

			if (Object.keys(self.changedState).length) {
				self.changedState = {};
			}

			var updateLocation = !dontUpdateLocation ? true: false; // In case of null
			$state.transitionTo(newStateName, self.state, { location: updateLocation });

			// TODO: Do we have to use $timeout? :(
			$timeout(function () {
				self.state.changing = false;
			});
		};

		this.refreshHandler = function (event){

			var confirmationMessage = "This will reload the whole model, are you sure?";
			event.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
			return confirmationMessage;              // Gecko, WebKit, Chrome <34

		};

		this.popStateHandler = function (event, account, model) {

			// the fake state has already been popped by user at this moment
			var message = "This will go back to teamspaces page are you sure you want to continue?";
			var path = $location.path();


			if (path === "/" + account + "/" + model) {
				
				var title = "Go back to Teamspaces?";
				$mdDialog.show(

					$mdDialog.confirm()
						.clickOutsideToClose(true)
						.title(title)
						.textContent(message)
						.ariaLabel(title + " Dialog")
						.cancel("Cancel")
						.ok("Confirm")
						

				).then(function() {
					$location.path(account);
					ViewerService.reset();
					CompareService.reset();
					IssuesService.resetIssues();
				}, function() {
					
				});
			}

		};

		this.setHomeState = function(value) {
			for (var key in value) {
				if (key !== "updateLocation" && value.hasOwnProperty(key)) {
					self.setStateVar(key, value[key]);
				}
			}
			self.updateState();
		};

	}


	run.$inject = [
		"$location", "$rootScope", "$state", "StateManager", "AuthService", "$timeout", "AnalyticService"
	];

	StateManager.$inject = [
		"$mdDialog", "$location", "$q", "$state", "$rootScope",
		"$timeout", "$window", "AuthService",
		"ClientConfigService", "ViewerService", "IssuesService", "CompareService"
	];

	angular.module("3drepo")
		.config(config) 
		.run(run)
		.service("StateManager", StateManager);
			
})();
