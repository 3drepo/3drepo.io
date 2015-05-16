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

angular.module('3drepo')
.config([
'$stateProvider',
'$locationProvider',
function($stateProvider, $locationProvider) {
	$stateProvider.state('base', {
		name : 'base',
		resolve: {
			StateManager: 'StateManager',
			init : function(StateManager) { StateManager.refresh("base"); }
		}
	});

	// Removes Angular's # at the end of the URL
	$locationProvider.html5Mode(true);
}])
.factory('BaseData', ['StateManager', 'uiState', function(StateManager, uiState) {
	var o = {};

	o.refresh = function () {
		// In the base we reset all the UI components
		for (uicomp in o.uiComps)
			StateManager.ui[uicomp] = false;
	};

	o.uiComps = [];

	for(k in uiState)
	{
		for(var i = 0; i < uiState[k].length; i++)
		{
			var plugin = uiState[k][i];

			if (o.uiComps.indexOf(plugin) == -1)
				o.uiComps.push(plugin);
		}
	}

	return o;
}])
.run(['$rootScope', '$state', 'Auth', 'pageConfig', 'uiState', 'StateManager', function($rootScope, $state, Auth, pageConfig, uiState, StateManager) {
	StateManager.registerPlugin('base', 'BaseData', function () {
		return "base"; // Always valid
	});

	$rootScope.ui		= StateManager.ui;
	$rootScope.Data		= StateManager.Data;
	$rootScope.state	= StateManager.state;

	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams)
	{
		console.log('$stateChangeStart to '+JSON.stringify(toState)+'- fired when the transition begins. toState,toParams : \n',toState, toParams);

		/*
		if(publicViews.indexOf(toState.name) == -1)
		{
			if (Auth.loggedIn == null) {
				// Not sure whether or not we are logged in.
				// Extreme case where resolve in state hasn't fired.
				event.preventDefault();

				Auth.init()
				.then(function() {
					$state.transitionTo(toState, toParams); // Try again
				});
			} else if (Auth.loggedIn) {
				if (toState.name == "main")
				{
					event.preventDefault();
					toParams['view'] = "info";
					$state.transitionTo("main.view", toParams);
				}
			} else {
				event.preventDefault();
				pageConfig.goDefault();
			}
		}
		*/
	});

	$rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams, error){
	  console.log('$stateChangeError - fired when an error occurs during transition.');
	  console.log(arguments);
	});
	$rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
		var uiComps = uiState[toState.name];

		if (uiComps)
			for (var i = 0; i < uiComps.length; i++)
				StateManager.ui[uiComps[i]] = true;
	});
	// $rootScope.$on('$viewContentLoading',function(event, viewConfig){
	//   // runs on individual scopes, so putting it in "run" doesn't work.
	//   console.log('$viewContentLoading - view begins loading - dom not rendered',viewConfig);
	// });
	$rootScope.$on('$viewContentLoaded',function(event){
	  console.log('$viewContentLoaded - fired after dom rendered',event);
	});
	$rootScope.$on('$stateNotFound',function(event, unfoundState, fromState, fromParams){
	  console.log('$stateNotFound '+unfoundState.to+'  - fired when a state cannot be found by its name.');
	  console.log(unfoundState, fromState, fromParams);
	});
}]);

