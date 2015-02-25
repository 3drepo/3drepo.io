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
.controller('SignUpCtrl', ['$scope', 'serverConfig', '$http', '$state', 'Auth', function($scope, serverConfig, $http, $state, Auth) {
	$scope.username = "";
	$scope.password = "";
	$scope.email = "";
	$scope.valid = false;
	$scope.popoverText = "";
	$scope.signupError = "";

	$scope.signupSubmit = function() {
		if (!$scope.valid)
		{
			$scope.signupError = "[Username already taken]";
		} else {
			var user = {
				username: $scope.username,
				email: $scope.email,
				password: $scope.password
			};

			$http.post(serverConfig.apiUrl($scope.username), user).
				success(function(json, status) {
					Auth.login($scope.username, $scope.password).then( function() {
						$state.go('home', {account: $scope.username});
					}, function() {
						$scope.signupError = "[Error re-logging in]";
					});
				}).error(function(message, status) {
					$scope.signupError = "[" + message.message + "]";
				});
		}
	};

	$scope.checkUsername = function() {
		$http.head(serverConfig.apiUrl($scope.username + '.json')).
			success(function(json, status) {
				$scope.valid = false;
				$scope.popoverText = "[Username already taken]";
			}).error(function(json, status) {
				if (status === 404)
				{
					$scope.valid = true;
					$scope.popoverText = "";
				}
			});
	};

	Auth.isLoggedIn().then( function (result) {
		if(result)
			$state.go('home', {account: Auth.username});
	});

}]);


