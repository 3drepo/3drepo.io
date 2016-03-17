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
	.config([
	"$stateProvider", "$urlRouterProvider", "$locationProvider", "structure",
	function($stateProvider, $urlRouterProvider, $locationProvider, structure) {
		
		$locationProvider.html5Mode(true);
		
		$stateProvider.state("home", {
			name: "home",
			url: "/"
		});
		
		var stateStack       = [structure];
		var stateNameStack   = ["home"];
		
		while (stateStack.length > 0)
		{
			var stackLength      = stateStack.length;
			var parentState      = stateStack[stackLength - 1];
			var parentStateName  = stateNameStack[stackLength - 1]; 
			
			if (parentState.children)
			{
				for (var i = 0; i < parentState.children.length; i++)
				{
					var childState     = parentState.children[i];
					var childStateName = parentStateName + "." + childState.plugin;
					
					stateNameStack.push(childStateName);
					stateStack.push(parentState.children[i]);
					
					$stateProvider.state(childStateName, {
						name: parentState.children[i].plugin,
						url: (parentStateName !== "home" ? "/" : "") + ":" + childState.plugin,
						resolve: {
							init: function(StateManager, $stateParams)
							{
								StateManager.setState($stateParams, {});
							}
						}
					});
				}
			}
			
			stateStack.splice(0,1);
			stateNameStack.splice(0,1);
		}
		
		$urlRouterProvider.otherwise("");
	}])
	.run(["$rootScope", "$state", "uiState", "StateManager", function($rootScope, $state, uiState, StateManager) {
		$rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams)
		{
			if (!$rootScope.requestState && !$rootScope.requestParams)
			{
				// Record the request URL so that if something
				// goes wrong we can log back into it.
				$rootScope.requestState = toState;
				$rootScope.requestParams = toParams;
			}
		});

		$rootScope.$on("$stateChangeSuccess",function(event, toState, toParams, fromState, fromParams){
			// console.log("$stateChangeSuccess to "+JSON.stringify(toState)+"- fired when the transition finishes. toState,toParams : \n",toState, toParams);

			// var uiComps = uiState[toState.name];

			// Split the list of states separated by dots
			// var toStates    = toState.name.split(".");
			// var fromStates  = fromState.name.split(".");
			
			StateManager.handleStateChange(fromParams, toParams);

			/*
			var i = 0;

			for(i = 0; i < fromStates.length; i++) {
				// Loop through all the states and clear all the variables of ones,
				// we are not using
				if (toStates.indexOf(fromStates[i]) === -1) {
					StateManager.clearStateVars(fromStates[i]);
				}
			}

			// Turn off all UI components
			for (var uicomp in StateManager.ui) {
				if (StateManager.ui.hasOwnProperty(uicomp)) {
					StateManager.ui[uicomp] = false;
				}
			}

			// Turn on the required UI components
			if (uiComps) {
				for (i = 0; i < uiComps.length; i++) {
					StateManager.ui[uiComps[i]] = true;
				}
			}
			*/
			
			/*
			if ($rootScope.requestState.name === toState.name)
			{
				// We have successfully made it, after a number
				// of tries
				$rootScope.requestState = null;
				$rootScope.requestParams = null;
			}
			*/
		});
	}])
	.service("StateManager", ["$state", "$rootScope", "structure", "EventService", function($state, $rootScope, structure, EventService) {
		var self = this;

		// Stores the state, required as ui-router does not allow inherited
		// stateParams, and we need to dynamically generate state diagram.
		// One day this might change.
		// https://github.com/angular-ui/ui-router/wiki/URL-Routing
		this.state      = {};
		
		this.changedState = {};
		
		this.structure   = structure;

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

		this.clearChanged = function()
		{
			for(var i in self.changed) {
				if (self.changed.hasOwnProperty(i)) {
					self.changed[i] = false;
				}
			}
		};

		self.clearChanged();

		this.handleStateChange = function(fromParams, toParams) {
			var param;
			
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
					}
				}
			}
			
			// Loop through structure. If a parent is null, then we must clear
			// it's children
			var currentChildren = self.structure.children;
			
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
							
			self.updateState();	
		};

		this.stateVars    = {};

		this.clearState = function(state) {
			for (var state in self.state)
			{
				self.setStateVar(state, null);
			}
		};

		this.genStateName = function ()
		{
			var currentChildren	= self.structure.children;
			var childidx 		= 0;
			var stateName 		= "home.";	// Assume that the base state is there.

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

			return stateName.substring(0, stateName.length - 1);
		};

		this.setStateVar = function(varName, value)
		{
			if (self.state[varName] !== value) {
				self.changedState[varName] = value;
			}

			self.state[varName] = value;
		};

		this.setState = function(stateParams, extraParams)
		{
			console.log("Setting state - " + JSON.stringify(stateParams));

			// Copy all state parameters and extra parameters
			// to the state
			for(var state in stateParams)
			{
				if (stateParams.hasOwnProperty(state))
				{
					self.setStateVar(state, stateParams[state]);
				}
			}
		};

		this.updateState = function(dontUpdateLocation)
		{
			var newStateName = self.genStateName();
			
			console.log("Moving to " + newStateName + " ...");

			if (Object.keys(self.changedState).length)
			{
				EventService.send(EventService.EVENT.STATE_CHANGED, self.changedState);
				self.changedState = {};
			}
			
			var updateLocation = !dontUpdateLocation ? true: false; // In case of null
			$state.transitionTo(newStateName, self.state, { location: updateLocation });
		};
		
		$rootScope.$watch(EventService.currentEvent, function(event) {
			if (angular.isDefined(event) && angular.isDefined(event.type)) {
				if (event.type === EventService.EVENT.SET_STATE) {
					for (var key in event.value)
					{
						if (event.value.hasOwnProperty(key))
						{
							self.setStateVar(key, event.value[key]);
						}
					}
					
					self.updateState();
				}
			}
		});
	}]);

})();
