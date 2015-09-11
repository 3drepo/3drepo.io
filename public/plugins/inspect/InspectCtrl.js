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
'parentStates',
function($stateProvider, $locationProvider, parentStates) {
	var states = parentStates["inspect"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider.state(states[i] + '.inspect', {
			url: '/inspect',
			resolve: {
				init : function(StateManager) { StateManager.refresh("inspect"); }
			}
		});
	}
}])
.controller('InspectCtrl', ['$scope', 'StateManager', 'ViewerService', '$window', '$modal', '$timeout', function($scope, StateManager, ViewerService, $window, $modal, $timeout)
{
	$scope.defaultViewer = ViewerService.defaultViewer;
	$scope.cameraSwitch  = false;

	$scope.startInspect = function()
	{
		StateManager.setStateVar('inspect', true);
		StateManager.updateState();
	}

	$scope.whereAmI = function()
	{
		$modal.open({
			templateUrl: "cameramodal.html",
			backdrop: false
		});

		cameraSwitch = true;
	}
}])
.factory('InspectData', function() {
	var o = {
		captureCamera : false
	};

	o.refresh = function () {
	};

	return o;
})
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('inspect', 'InspectData', function () {
		if (StateManager.state.inspect)
			return "inspect";
		else
			return null;
	});

	StateManager.setClearStateVars("inspect", ["inspect"]);
}]);


