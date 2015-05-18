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
	var states = parentStates["login"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider
		.state(states[i] + '.login', {
			url: '',
			views: {
				"@" : {
					templateUrl: 'login.html'
				}
			}
		})
	}
}])
.run(['StateManager', 'Auth', function(StateManager, Auth) {
	StateManager.registerPlugin('login', null, function () {
		if (Auth.loggedIn)
			return "login";
		else
			return null
	});
}])
.controller('LoginCtrl', ['$scope', 'StateManager', 'pageConfig', 'Auth', function($scope, StateManager, pageConfig, Auth)
{
	$scope.user = { username: "", password: ""};

	$scope.login = function() {
		Auth.login($scope.user.username, $scope.user.password).then(
			function _loginCtrlLoginSuccess(username) {
				$scope.errorMessage = null;
				pageConfig.goDefault();
				$scope.user.username = null;
				$scope.user.password = null;
				StateManager.setStateVar("user", username);
			}, function _loginCtrlLoginFailure(reason) {
				$scope.errorMessage = reason;
				pageConfig.goDefault();
				$scope.user.password = null;
				StateManager.setStateVar("user", null);
			}
		);
	};
}]);

