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
'$urlRouterProvider',
'$locationProvider',
function($stateProvider, $urlRouterProvider, $locationProvider) {
	$stateProvider
	.state('home' ,{
				url: '/:account',
				templateUrl: 'home.html',
				controller: 'DashboardCtrl',
				resolve: {
					StateManager:	'StateManager',
					plugin:			'homepage',
					auth: function authCheck(Auth) { return Auth.init();},
					init: function(Data, $stateParams) { Data.setState($stateParams, {}); }
				}
			});
}.controller('DashboardCtrl', ['$scope', 'StateManager', '$q', function($scope, StateManager, $q) {
	$scope.defaultView = "projects";
	$scope.view = $scope.defaultView;
	$scope.Data = Data;
	$scope.account = Data.state.account;

	$scope.setView = function(view){
		$scope.view = view;
	}

	$scope.goProject = function(account, project){
		Data.setStateVar("account", account);
		Data.setStateVar("project", project);
		Data.updateState();
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

	// If we've just come from a project, we
	// need to clean up
	$scope.$watch('Data.state.project', function() {
		if (!Data.state.project)
		{
			if($window.viewerManager)
			{
				$window.viewerManager.close();
				delete $window.viewerManager;
				$scope.defaultViewer = null;
			}

			if ($window.oculus)
				delete $window.oculus;

			if($window.collision)
				delete $window.collision;

			if($window.waypoint)
			{
				delete $window.waypoint;
				$scope.waypoint = null;
			}
		}
	});

}]);


