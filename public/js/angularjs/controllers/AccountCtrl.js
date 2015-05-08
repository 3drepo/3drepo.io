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
	.state(parentStates["account"] + '.account', {
		url: '/:account',
		templateUrl: 'account.html',
		resolve: {
			StateManager: "StateManager",
			auth: function authCheck(Auth) { return Auth.init(); },
			init: function(StateManager, $stateParams) {
				StateManager.registerPlugin('AccountData', pluginLevels['account']);
				StateManager.setState($stateParams, {});
			}
		},
		views: {
			"@" : {
				templateUrl: 'account.html',
				controller: 'AccountCtrl'
			}
		}
	})
}])
.controller('AccountCtrl', ['$scope', 'StateManager', function($scope, StateManager)
{
	$scope.Data = StateManager.Data;

	$scope.defaultView = "projects";
	$scope.view = $scope.defaultView;

	$scope.setView = function(view){
		$scope.view = view;
	}

	$scope.goProject = function(account, project){
		StateManager.setStateVar("account", account);
		StateManager.setStateVar("project", project);
		StateManager.updateState();
	}

	$scope.isView = function(view){
		return $scope.view == view;
	}

	$scope.passwords = {};
	$scope.passwords.updateUserError = "";
	$scope.passwords.changePasswordError = "";

	$scope.errors = {};
	$scope.errors.oldPassword = "";
	$scope.errors.newPassword = "";

	$scope.updateUser = function() {
		$scope.Data.UserData.updateUser()
		.success(function(data, status) {
			$scope.setView($scope.defaultView);
		}).error(function(message, status) {
			$scope.updateUserError = "[" + message.message + "]";
		});
	};

	$scope.changePassword = function() {
		$scope.Data.UserData.updatePassword($scope.passwords.oldPassword, $scope.passwords.newPassword)
		.success(function(data, status) {
			$scope.setView($scope.defaultView);
		}).error(function(message, status) {
			$scope.errors.changePasswordError = "[" + message.message + "]";
		});
	};

	$scope.projectsShowList = true;
	$scope.toggleProjectsView = function() {
		$scope.projectsShowList = !$scope.projectsShowList;
	};

}]);


