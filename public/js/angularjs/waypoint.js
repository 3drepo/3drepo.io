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
	$stateProvider.state('login', {
		url: '/login',
		templateUrl: 'login.html'
	}).state('main', {
		url: '/demo?uid?mode',
		templateUrl: 'mainpage.html',
		controller: 'MainCtrl',
		WayfinderData: 'WayfinderData',
		params: { uid: { value: null }, mode: { value: null } },
		resolve: {
			mode: function($stateParams) {
				return $stateParams.mode;
			},
			uid: function($stateParams, WayfinderData) {
				WayfinderData.PointData.refresh($stateParams.uid, $stateParams.mode);

				return $stateParams.uid;
			},
			init: function(WayfinderData)
			{
				WayfinderData.Wayfinder.refresh();
			}
		}
	}).state('404', {
	  url: '/404',
	  templateUrl: '404.html',
	});

	// Remove # from URL
	$locationProvider.html5Mode(true);
}])
.controller('MainCtrl', ['$scope', '$state', '$window', 'serverConfig', 'uid', 'mode', 'WayfinderData',
	function($scope, $state, $window, serverConfig, uid, mode, WayfinderData) {
		WayfinderData.init();

		$scope.text		= WayfinderData.text;
		$scope.recorder = WayfinderData.recorder;
		$scope.arrow	= WayfinderData.arrow;
		$scope.spheres	= WayfinderData.spheres;

		$scope.showReadme		= true;
		$scope.showVisControls	= false;

		$scope.visualizeThese = null;

		$scope.visNav = "FLY";

		$scope.Wayfinder = WayfinderData.Wayfinder;

		$scope.renderStartAndEnd = function()
		{
			spheres.addSphere(WayfinderData.startPoint, WayfinderData.blobRadius, WayfinderData.scaleY, [0, 1, 0], WayfinderData.trans);
			spheres.addSphere(WayfinderData.endPoint, WayfinderData.blobRadius, WayfinderData.scaleY, [1,0,0], WayfinderData.trans);
		}

		$scope.startWalking = function() {
			viewer.reset();
			arrow.addArrow(WayfinderData.endPoint, [1,0,0], 0.3);

			text.updateText('Step on pad to begin', [0,1,0], 2000);

			viewer.setNavMode("WALK");
		}

		$scope.begin = function() {
			$scope.showReadme = false;
			$scope.startWalking();
		};

		$scope.visualize = function() {
			$scope.renderStartAndEnd();
			var uids = $scope.visualizeThese.map(function(o) { return o.value; });
			$state.transitionTo('main', { uid : uids }, { location: true, inherit: true, relative: $state.$current, notify: false});
			$scope.showReadme = false;
			$scope.showVisControls = true;
			viewer.reset();
		}

		$scope.flythrough = function() {
			var uids = $scope.visualizeThese.map(function(o) { return o.value; });
			$state.transitionTo('main', { uid : uids, mode: 'flythru' }, { location: true, inherit: true, relative: $state.$current, notify: false});
			$scope.showReadme = false;
			viewer.reset();
		}

		$scope.changeNav = function() {
			viewer.setNavMode($scope.visNav);
		}

		$scope.backToMenu = function()
		{
			$state.transitionTo('main', { uid: null, mode: null}, { location: true, inherit: true, relative: $state.$current, notify: false});
			$scope.showReadme = true;
			$scope.showVisControls = false;
			viewer.reset();
			viewer.setCameraPosition(0.0, 0.0, 0.0);
		}
	}
]);

