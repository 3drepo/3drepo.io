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
	var states = parentStates["account"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider
		.state(states[i] + '.account', {
			url: ':account',
			templateUrl: 'account.html',
			resolve: {
				auth: function authCheck(Auth) { return Auth.init(); },
				init: function(StateManager, $stateParams) {
					// On the login page the account variable is set to ""
					// we must override this.
					if ($stateParams["account"] == "")
						$stateParams["account"] = null;

					StateManager.setState($stateParams, {});
					StateManager.refresh("account");
				}
			},
			views: {
				"@" : {
					templateUrl: 'account.html',
					controller: 'AccountCtrl'
				}
			}
		})
	}
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('account', 'AccountData', function () {
		if(StateManager.state.account)
			return "account";
		else
			return null;
	});

	StateManager.setClearStateVars("account", ["account"]);
}])
.controller('AccountCtrl', ['$scope', 'StateManager', function($scope, StateManager)
{
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


