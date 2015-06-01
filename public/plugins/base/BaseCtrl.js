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
			if (uicomp in StateManager.ui)
				StateManager.ui[uicomp] = false;

		for (statevar in StateManager.state)
			StateManager.state[statevar] = null;
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
.controller('BaseCtrl', ['$scope', 'StateManager', function($scope, StateManager)
{
	$scope.ui		= StateManager.ui;
	$scope.Data		= StateManager.Data;
	$scope.state	= StateManager.state;
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('base', 'BaseData', function () {
		return "base"; // Always valid
	});
}]);

