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
		params: { uid: { value: null }, mode: { value: null } },
		resolve: {
			uid: function($stateParams) {
				return $stateParams.uid;
			},
			mode: function($stateParams) {
				return $stateParams.mode;
			},
			WayfinderData : function(Wayfinder) {
				return Wayfinder.promise;
			}
		}
	}).state('404', {
	  url: '/404',
	  templateUrl: '404.html',
	});

	// This will be needed to remove angular's #, but there is an error at the moment
	// -> need to investigate
	$locationProvider.html5Mode(true);
}])
.factory('iFrameURL', function() {
	var o = {};

	o.setURL = function(url)
	{
		o.url = url;
	}

	return o;
})
.controller('MainCtrl', ['$scope', '$http', 'iFrameURL', '$location', '$window', 'serverConfig', 'uid', 'mode', 'Wayfinder', function($scope, $http, iFrameURL, $location, $window, serverConfig, uid, mode, Wayfinder) {
	$scope.iFrameURL = iFrameURL;
	iFrameURL.setURL(serverConfig.apiUrl(serverConfig.democompany + '/' + serverConfig.demoproject + '/revision/master/head.x3d.src'));

	$scope.visualizeThese = null;

	$scope.visNav = "FLY";

	$scope.viscontrolon = true;

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

	$scope.previous = Wayfinder.getPrevious();

	$scope.x3domreload = function() {
		x3dom.reload();
		$scope.loadedfunc = 'onLoadedEvent()';
	};

	$scope.begin = function() {
		$('#readme').hide();
		walkInitialize();
	};

	$scope.visualize = function() {
		$location.path('/demo').search('uid=' + $scope.visualizeThese.map(function(item) { return item.value; }).join('&uid='));
	}

	$scope.flythrough = function() {
		$location.path('/demo').search('mode=flythru&uid=' + $scope.visualizeThese.map(function(item) { return item.value; }).join('&uid='));
	}

	$scope.changeNav = function()
	{
		$('#nav')[0].setAttribute('type', $scope.visNav);
	}

	$scope.backToMenu = function()
	{
		$location.path('/demo').search('');
	}
}]);

