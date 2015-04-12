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
.controller('LoginCtrl', ['$scope', '$state', 'pageConfig', 'serverConfig', 'Auth', function($scope, $state, pageConfig, serverConfig, Auth)
{
	$scope.loggedIn = null;
	$scope.user = { username: "", password: ""};

	$scope.login = function() {
		Auth.login($scope.user.username, $scope.user.password).then(
			function _loginCtrlLoginSuccess(username) {
				$scope.errorMessage = null;
				pageConfig.goDefault();
				$scope.user.username = null;
				$scope.user.password = null;
			}, function _loginCtrlLoginFailure(reason) {
				$scope.errorMessage = reason;
				pageConfig.goDefault();
				$scope.user.password = null;
			}
		);
	};

	$scope.featuredProjects = [
		{img: '/public/images/dummies/kc.jpg', title: 'Kings Cross', description: 'Project description', additionalClass: 'w2'},
		{img: '/public/images/dummies/kc.jpg', title: 'Title', description: 'Project description'},
		{img: '/public/images/dummies/kc.jpg', title: 'Title', description: 'Project description'},
		{img: '/public/images/dummies/kc.jpg', title: 'Title', description: 'Project description', additionalClass: 'w2'},
		{img: '/public/images/dummies/kc.jpg', title: 'Title', description: 'Project description'},
		{img: '/public/images/dummies/kc.jpg', title: 'Title', description: 'Project description'}
	];
}]);

