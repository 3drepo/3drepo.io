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
		Wayfinder: 'Wayfinder',
		params: { uid: { value: null }, mode: { value: null } },
		resolve: {
			uid: function($stateParams) {
				return $stateParams.uid;
			},
			mode: function($stateParams) {
				return $stateParams.mode;
			},
			init: function(Wayfinder)
			{
				Wayfinder.refresh();
			}
		}
	}).state('404', {
	  url: '/404',
	  templateUrl: '404.html',
	});

	// Remove # from URL
	$locationProvider.html5Mode(true);
}])
.controller('MainCtrl', ['$scope', '$location', '$window', 'serverConfig', 'uid', 'mode', 'Wayfinder',
	function($scope, $location, $window, serverConfig, uid, mode, Wayfinder) {
		$window.viewer = new Viewer();
		$scope.viewer = $window.viewer;

		viewer.loadURL(serverConfig.apiUrl(serverConfig.democompany + '/' + serverConfig.demoproject + '/revision/master/head.x3d.src'));

		var avatarHeight = 1.83;
		var collDistance = 0.1;
		var stepHeight	= 0.4;
		var speed		= 2.0;
		var startPoint	= [-26.06, -0.21, 15.28];
		var endPoint   = [-26.06, -0.21, -7.28];
		var scaleY     = 0.05;
		var trans	  = 0.3;
		var blobRadius = 1.5;

		viewer.changeCollisionDistance(collDistance);
		viewer.changeAvatarHeight(avatarHeight);
		viewer.changeStepHeight(stepHeight);
		viewer.setSpeed(speed);
		viewer.setNavMode("NONE");

		var avrStart = startPoint.slice(0);
		avrStart[1] += avatarHeight;
		avrStart[2] += 9.0;

		viewer.setStartingPoint(avrStart[0], avrStart[1], avrStart[2]);

		$window.text = new Text();
		var startRGB = [1.0, 0.0, 0.0];
		$window.text.init(startRGB);
		$scope.text  = $window.text;

		$window.arrow = new Arrow();
		$scope.arrow  = $window.arrow;

		$window.recorder = new Recorder(startPoint, endPoint, blobRadius);
		$scope.recorder = $window.recorder;

		$window.spheres = new Spheres();
		$scope.spheres = $window.spheres;

		$scope.visualizeThese = null;

		$scope.visNav = "FLY";

		$scope.viscontrolon = true;

		/*
		if(uid)
		{
			var uidData = null;
			$('#readme').hide();
			walkInitialize(true);

			if (uid instanceof Array)
				uidData = uid;
			else
				uidData = [uid];

			$http.get(serverConfig.apiUrl('wayfinder/record.json'),
				{ params : { uid: JSON.stringify(uidData) }})
			.success(function(data, status) {
				if(mode == 'flythru')
					runFlyThru(data);
				else
				{
					$scope.viscontrolon = false;
					plotSpheres(data);
				}
			});
		}
		*/

		$scope.previous = Wayfinder.previous;

		$scope.viewerReload = viewer.reload;

		$scope.startWalking = function() {
			viewer.reset();
			spheres.addSphere(startPoint, blobRadius, scaleY, [0, 1, 0], trans);
			spheres.addSphere(endPoint, blobRadius, scaleY, [1,0,0], trans);
			arrow.addArrow(endPoint, [1,0,0], 0.3);

			text.updateText('Step on pad to begin', [0,1,0], 2000);

			viewer.setNavMode("WALK");
		}

		$scope.begin = function() {
			$('#readme').hide();
			$scope.startWalking();
		};

		$scope.visualize = function() {
			$state.go('main', { url : $scope.visualizeThese });
		}

		$scope.flythrough = function() {
			$state.go('main', { url : $scope.visualizeThese, mode: 'flythru' });
		}

		$scope.changeNav = function() {
			viewer.setNavMode($scope.visNav);
		}

		$scope.backToMenu = function()
		{
			$state.go('main', {});
		}
	}
]);

