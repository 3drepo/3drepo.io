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
'parentStates',
function($stateProvider, parentStates) {
	var states = parentStates["project"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider
		.state(states[i] + '.project', {
			url: '/:project',
			templateUrl: 'account.html',
			resolve: {
				auth: function authCheck(Auth) { return Auth.init(); },
				init: function(StateManager, $stateParams) {
					StateManager.setState($stateParams, {});
					StateManager.refresh("project");
				}
			},
			views: {
				"@" : {
					templateUrl: 'project.html',
					controller: 'ProjectCtrl'
				}
			}
		})
	}
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('project', 'ProjectData', function () {
		if (StateManager.state.project)
			return "project";
		else
			return null;
	});
}])
.controller('ProjectCtrl', ['$scope', 'StateManager', 'ViewerService', function($scope, StateManager, ViewerService)
{
	ViewerService.init();

	$scope.$watch('state.project', function () {
		StateManager.setStateVar("branch", "master");
		StateManager.setStateVar("revision", "head");
		StateManager.updateState();		// Want to preserve URL structure
	});

	$scope.$watchGroup(['state.branch', 'state.revision'], function() {
		ViewerService.loadModel();
		ViewerService.defaultViewer.setNavMode("TURNTABLE");
	});

}]);

