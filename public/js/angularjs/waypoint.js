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

angular.module('3drepo', ['ui.router', 'ui.bootstrap', 'angular-bootstrap-select', 'ui.multiselect'])
.config([
'$stateProvider',
'$urlRouterProvider',
'$locationProvider',
'$httpProvider',
function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
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

	// Invalid URL redirect to 404 state
	$urlRouterProvider.otherwise('login');

	// This will be needed to remove angular's #, but there is an error at the moment
	// -> need to investigate
	$locationProvider.html5Mode(true);

	$httpProvider.defaults.withCredentials = true;
}])
.factory('iFrameURL', function() {
	var o = {};

	o.setURL = function(url)
	{
		o.url = url;
	}

	return o;
})
.controller('LoginCtrl', ['$scope', '$state', '$http', 'serverConfig', 'Auth', function($scope, $state, $http, serverConfig, Auth)
{
	$scope.user = { username: "", password: ""};

	$scope.goDefault = function() {
		Auth.isLoggedIn().then(function _loginGoDefaultSuccess(result) {
			if(result)
				$state.go('main');
			else
				$state.go('login');
		});
	}

	$scope.logOut = function()
	{
		Auth.logout().then(function _loginCtrlLogoutSuccess() {
			$scope.errorMessage = null;
			$scope.loggedIn = false;
			$scope.goDefault();
		}, function _loginCtrlLogoutFailure(reason) {
			$scope.errorMessage = reason;
			$scope.goDefault();
		});
	}

	$scope.$on("loggedOut", function(event, message) {
		$scope.errorMessage = message;
		$scope.loggedIn = !(message === null);
		$scope.goDefault();
	});

	$scope.loginPage = function() {
		$state.go('login');
	}

	$scope.signupPage = function() {
		$state.go('signup');
	}

	$scope.login = function() {
		Auth.login($scope.user.username, $scope.user.password).then(
			function _loginCtrlLoginSuccess(username) {
				$state.errorMessage = null;
				$scope.loggedIn = true;
				$scope.goDefault();
			}, function _loginCtrlLoginFailure(reason) {
				$scope.errorMessage = reason;
				$scope.loggedIn = false;
				$state.goDefault();
			}
		);
	};

	$scope.getThings = function(val) {
		return $http.get(serverConfig.apiUrl('search.json'),
		{
			params: {
				user_company_name: val
			}
		}).then(function _loginCtrlGetThingsSuccess(res) {
			var users = res.data.users;
			var companies = res.data.companies.map(function(obj){ return obj.name; });

			users = users.map(function(user) {
				return user + " (User)";
			});

			companies = companies.map(function(company) {
				return company + " (Company)";
			});

			return users.concat(companies);
		});
	};

	Auth.isLoggedIn().then(function _loginCtrlCheckLoggedInSuccess(result) {
		$scope.loggedIn = result;
	});
}])
.service('Wayfinder', ['$http', 'serverConfig', function($http, serverConfig) {
	var previous = null;

	var promise = $http.get(serverConfig.apiUrl('wayfinder.json')).success(function(json) {
		previous = json;
	});

	return {
		promise: promise,
		getPrevious: function() {
			if(previous && previous != "Unauthorized")
			{
				return previous.map(function(item) {
					var date = new Date(item.timestamp*1000);
					return { label: item.user + ' @ ' + date, value: item._id };
				});
			} else {
				return {};
			}
		}
	};
}])
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
}])
.factory('authInterceptor', ['$rootScope', '$q', function($rootScope, $q) {
	return {
		responseError: function(res)
		{
			if (res.status == 401) {
				$rootScope.$broadcast("notAuthorized", null);
			}

			return $q.reject(res);
		}
	};
}])
.config(function ($httpProvider) {
	var checkAuthorization = ['$q', '$location', function($q, $location) {
		var onSuccess = function (res) { return res;}
		var onError = function(res) {
			if (res.status == 401 || res.status == 400) {
				$location.path('/login');

				return $q.reject(res);
			} else {
				return $q.reject(res);
			}
		};

		return function (promise) {
			return promise.then(onSuccess, onError);
		};
	}];

	$httpProvider.interceptors.push(checkAuthorization);
});

jQuery.support.cors = true;
