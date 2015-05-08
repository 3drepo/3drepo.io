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
'pluginLevels',
function($stateProvider, parentStates, pluginLevels) {
	$stateProvider
	.state(parentStates["project"] + '.project', {
		url: '/:project',
		templateUrl: 'account.html',
		resolve: {
			StateManager: "StateManager",
			auth: function authCheck(Auth) { return Auth.init(); },
			init: function(StateManager, $stateParams) {
				StateManager.registerPlugin('ProjectData', pluginLevels['project']);
				StateManager.setState($stateParams, {});
			}
		},
		views: {
			"@" : {
				templateUrl: 'project.html',
				controller: 'ProjectCtrl'
			}
		}
	})
}])
.controller('ProjectCtrl', ['$scope', 'StateManager', 'ViewerService', function($scope, StateManager, ViewerService)
{
	$scope.Data = StateManager.Data;

	ViewerService.init();

	$scope.$watch('StateManager.state.project', function () {
		ViewerService.loadModel();
	});
}]);

