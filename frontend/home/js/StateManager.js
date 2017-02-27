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

	angular.module("3drepo")
	.config([
	"$stateProvider", "$urlRouterProvider", "$locationProvider", "structure",
	function($stateProvider, $urlRouterProvider, $locationProvider, structure) {

		$locationProvider.html5Mode(true);

		$stateProvider.state("home", {
			name: "home",
			url: "/",
			resolve: {
				init: function(Auth, StateManager, $q)
				{
					StateManager.state.authInitialized = false;

					var finishedAuth = $q.defer();

					StateManager.state.changing = true;

					Auth.init().then(function (loggedIn) {
						StateManager.state.authInitialized = true;
						StateManager.state.loggedIn = loggedIn;

						finishedAuth.resolve();
					});

					return finishedAuth.promise;
				}
			}
		});

		var stateStack       = [structure];
		var stateNameStack   = ["home"];

		//console.log("stateStack", stateStack);
		while (stateStack.length > 0)
		{
			var stackLength      = stateStack.length;
			var parentState      = stateStack[0];
			var parentStateName  = stateNameStack[0];

			// First loop through the list of functions as these are
			// more specific than the
			if (parentState.functions)
			{
				for (var i = 0; i < parentState.functions.length; i++)
				{
					var childFunction	  = parentState.functions[i];
					var childFunctionName = parentStateName + "." + childFunction;

					(function(childFunction) {
						$stateProvider.state(childFunctionName, {
							name: childFunction,
							url: childFunction,
							resolve: {
								init: function (StateManager, $location, $stateParams) {
									$stateParams[childFunction] = true;

									StateManager.setState($stateParams);
								}
							}
						});
					})(childFunction);
				}
			}

			if (parentState.children)
			{
				for (var i = 0; i < parentState.children.length; i++)
				{
					var childState     = parentState.children[i];
					var childStateName = parentStateName + "." + childState.plugin;

					stateNameStack.push(childStateName);
					stateStack.push(parentState.children[i]);

					(function(childState){
						$stateProvider.state(childStateName, {
							name: parentState.children[i].plugin,
							url: childState.url || (parentStateName !== "home" ? "/" : "") + ":" + childState.plugin,
							reloadOnSearch : false,
							resolve: {
								init: function(StateManager, $location, $stateParams)
								{
									StateManager.setState($stateParams);
								}
							}
						});
					})(childState);
				}
			}

			stateStack.splice(0,1);
			stateNameStack.splice(0,1);
		}

		$urlRouterProvider.otherwise("");
	}])
	.run(["$location", "$rootScope", "$state", "uiState", "StateManager", "Auth", "$timeout", "AnalyticService", "BrowserDetect",
		function($location, $rootScope, $state, uiState, StateManager, Auth, $timeout, AnalyticService, BrowserDetect) {
		$rootScope.$on("$stateChangeStart",function(event, toState, toParams, fromState, fromParams){
			console.log("stateChangeStart: " + JSON.stringify(fromState) + " --> " + JSON.stringify(toState));

			StateManager.state.changing = true;

			for(var i = 0; i < StateManager.functions.length; i++)
			{
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
			console.log("stateChangeSuccess: " + JSON.stringify(fromState) + " --> " + JSON.stringify(toState));

			var stateChangeObject = {
				toState    : toState,
				toParams   : toParams,
				fromState  : fromState,
				fromParams : fromParams
			};

			if(toState.url !== 'notSupported' && BrowserDetect.browser === 'Explorer'){
				$location.path('/notSupported');
			}

			StateManager.handleStateChange(stateChangeObject);
		});

		$rootScope.$on('$locationChangeStart', function(event, next, current) {
			console.log("locationChange");
		});

		$rootScope.$on('$locationChangeSuccess', function() {
			console.log("locationChangeSucc");

			AnalyticService.sendPageView(location);

			var queryParams = $location.search();

			if (Object.keys(queryParams).length === 0)
			{
				StateManager.clearQuery();
			} else {
				StateManager.setQuery(queryParams);
			}
		});
	}])
	.service("StateManager", ["$q", "$state", "$rootScope", "$timeout", "structure", "EventService", "$window", "Auth", function($q, $state, $rootScope, $timeout, structure, EventService, $window, Auth) {
		var self = this;

		$window.StateManager = this;

		// Stores the state, required as ui-router does not allow inherited
		// stateParams, and we need to dynamically generate state diagram.
		// One day this might change.
		// https://github.com/angular-ui/ui-router/wiki/URL-Routing
		this.state = {
			changing: true
		};

		this.changedState = {};

		this.structure  = structure;

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

		var stateStack       = [structure];

		// Populate list of functions
		while (stateStack.length > 0)
		{
			var stackLength      = stateStack.length;
			var parentState      = stateStack[stackLength - 1];

			var i = 0;
			var functionName;

			if (parentState.functions)
			{
				for(i=0; i<parentState.functions.length; i++)
				{
					functionName = parentState.functions[i];

					if (this.functions.indexOf(functionName) > -1) {
						console.error("Duplicate function name when loading in StateManager : " + functionName);
					} else {
						this.functions.push(functionName);
					}
				}
			}

			if (parentState.children)
			{
				for (var i = 0; i < parentState.children.length; i++)
				{
					stateStack.push(parentState.children[i]);
				}
			}

			stateStack.splice(0,1);
		}

		this.clearChanged = function()
		{
			for(var i in self.changed) {
				if (self.changed.hasOwnProperty(i)) {
					self.changed[i] = false;
				}
			}
		};

		self.clearChanged();

		this.stateChangeQueue = [];

		var compareStateChangeObjects = function(stateChangeA, stateChangeB)
		{
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
			for (param in fromParams)
			{
				if (fromParams.hasOwnProperty(param))
				{
					if (!toParams.hasOwnProperty(param))
					{
						self.setStateVar(param, null);
					}
				}
			}

			for (param in toParams)
			{
				if (toParams.hasOwnProperty(param))
				{
					if (fromParams.hasOwnProperty(param))
					{
						if (fromParams[param] !== toParams[param])
						{
							self.setStateVar(param, toParams[param]);
						}
					} else {
						self.setStateVar(param, toParams[param]);
					}
				}
			}

			// Loop through structure. If a parent is null, then we must clear
			// it's children
			var stateStack       = [structure];
			var stateNameStack   = ["home"];
			var clearBelow       = false;

			while (stateStack.length > 0)
			{
				var stackLength      = stateStack.length;
				var parentState      = stateStack[stackLength - 1];
				var parentStateName  = stateNameStack[stackLength - 1];

				if (parentStateName !== "home" && !self.state[parentStateName])
				{
					clearBelow = true;
				}

				if (parentState.children)
				{
					for (var i = 0; i < parentState.children.length; i++)
					{
						var childStateName = parentState.children[i].plugin;

						stateNameStack.push(childStateName);
						stateStack.push(parentState.children[i]);

						if (clearBelow)
						{
							self.setStateVar(childStateName, null);
						}
					}
				}

				stateStack.splice(0,1);
				stateNameStack.splice(0,1);
			}

			if (compareStateChangeObjects(stateChangeObject, self.stateChangeQueue[0]))
			{
				self.stateChangeQueue.pop();

				var functionList = self.functionsUsed();

				// If we are not trying to access a function
				// and yet there is no account set. Then
				// we need to go back to the account page if possible.
				if ((functionList.length === 0) && self.state.loggedIn && !self.state.account)
				{
					self.setStateVar("account", Auth.username);
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

		this.clearState = function(state) {
			for (var state in self.state)
			{
				if ((["changing", "authInitialized", "loggedIn"].indexOf(state) === -1) && self.state.hasOwnProperty(state))
				{
					self.setStateVar(state, null);
				}
			}
		};

		this.clearQuery = function(state) {
			for(var param in self.query)
			{
				delete self.query[param];
			}
		};

		this.functionsUsed = function ()
		{
			var functionList = [];

			// First loop through the list of functions
			// belonging to parent structure.
			// Only deals with functions on home directory
			if (self.structure.functions)
			{
				for(i = 0; i < self.structure.functions.length; i++)
				{
					functionName = self.structure.functions[i];

					if (self.state[functionName])
					{
						functionList.push(functionName);
						break;
					}
				}
			}

			return functionList;
		}

		this.genStateName = function ()
		{
			var currentChildren = self.structure.children;
			var childidx        = 0;
			var stateName       = "home."; // Assume that the base state is there.
			var i               = 0;
			var functionList    = self.functionsUsed();
			var usesFunction    = (functionList.length > 0);

			if (usesFunction)
			{
				stateName += functionList.join(".") + ".";
			} else
			{
				while(childidx < currentChildren.length)
				{
					var child  = currentChildren[childidx];
					var plugin = child.plugin;

					if (self.state.hasOwnProperty(plugin) && self.state[plugin])
					{
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

		this.setStateVar = function(varName, value)
		{
			if (value === null)
			{
				delete self.state[varName];
			} else {
				if (self.state[varName] !== value) {
					self.state.changing = true;
					self.changedState[varName] = value;
				}
			}

			self.state[varName] = value;
		};

		this.setState = function(stateParams) {
			// Copy all state parameters and extra parameters
			// to the state
			for (var state in stateParams) {
				if (stateParams.hasOwnProperty(state)) {
					self.setStateVar(state, stateParams[state]);
				}
			}
		};

		this.setQuery = function(queryParams)
		{
			for(var param in queryParams)
			{
				if (queryParams.hasOwnProperty(param))
				{
					self.query[param] = queryParams[param];
				}
			}
		};

		this.updateState = function(dontUpdateLocation)
		{
			var newStateName = self.genStateName();

			if (Object.keys(self.changedState).length)
			{
				EventService.send(EventService.EVENT.STATE_CHANGED, self.changedState);
				self.changedState = {};
			}

			var updateLocation = !dontUpdateLocation ? true: false; // In case of null
			$state.transitionTo(newStateName, self.state, { location: updateLocation });

			$timeout(function () {
				self.state.changing = false;
			});
		};

		$rootScope.$watch(EventService.currentEvent, function(event) {
			if (angular.isDefined(event) && angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.SET_STATE) {
					for (var key in event.value)
					{
						if (key !== "updateLocation" && event.value.hasOwnProperty(key))
						{
							self.setStateVar(key, event.value[key]);
						}
					}

					self.updateState();
				} else if (event.type === EventService.EVENT.CLEAR_STATE) {
					self.clearState();
				}
			}
		});
	}]);

})();
