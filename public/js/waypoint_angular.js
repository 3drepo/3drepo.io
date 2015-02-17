
angular.module('3drepo', ['ui.router', 'ui.bootstrap', 'angular-bootstrap-select', 'ui.multiselect'])
.service('serverConfig', function() {
	this.apiUrl = server_config.apiUrl;

	this.democompany = server_config.democompany;
	this.demoproject = server_config.demoproject;
})
.service('Auth', ['$injector', '$q', 'serverConfig', function($injector, $q, serverConfig) {
	this.loggedIn = null;
	this.username = null;
	var self = this;

	this.isLoggedIn = function() {
		var deferred = $q.defer();

		// If we are not logged in, check
		// with the API server whether we
		// are or not
		if(self.loggedIn === null)
		{
			var http = $injector.get('$http');

			// Initialize
			http.get(serverConfig.apiUrl('login')).success(function() {
				self.loggedIn = true;
				deferred.resolve(self.loggedIn);
			}).error(function() {
				self.loggedIn = false;
				deferred.resolve(self.loggedIn);
			});
		} else {
			deferred.resolve(self.loggedIn);
		}

		return deferred.promise;
	}

	this.getUsername = function() { return this.username; }

	this.login = function(username, password) {
		var deferred = $q.defer();

		var postData = {username: username, password: password};
		var http = $injector.get('$http');

		http.post(serverConfig.apiUrl('login'), postData)
		.success(function () {
			self.username = username;
			self.loggedIn = true;
			deferred.resolve(username);
		})
		.error(function(data, status) {
			self.username = null;
			self.loggedIn = false;

			if (status == 401)
			{
				deferred.reject("Unauthorized");
			} else if (status == 400) {
				deferred.reject("Invalid username/password");
			} else {
				deferred.reject("Unknown error");
			}
		});

		return deferred.promise;
	}

	this.logout = function() {
		var deferred = $q.defer();
		var http = $injector.get('$http');

		http.post(serverConfig.apiUrl('logout'), {})
		.success(function _authLogOutSuccess() {
			self.username = null;
			self.loggedIn = false;

			deferred.resolve();
		})
		.error(function _authLogOutFailure() {
			deferred.reject("Unable to logout.");
		});

		return deferred.promise;
	}
}])
.factory('authInterceptor', ['$rootScope', '$q', 'Auth', function($rootScope, $q, Auth) {
	return {
		responseError: function(res)
		{
			var deferred = $q.defer();
			if (res.status == 401) {
				Auth.logout().then(function _authInterceptorSuccess()
				{
					$rootScope.$broadcast('loggedOut', null);
					deferred.resolve();
				}, function _authInterceptorFailure(reason) {
					$rootScope.$broadcast("loggedOut", reason);
					deferred.resolve();
				});
			}

			return deferred.promise;
		}
	};
}])
.run(['$location', 'Auth', function($location, Auth) {
	Auth.isLoggedIn().then(function (isLoggedIn)
	{
		if (!isLoggedIn)
			$location.path('/login');
	});
}])
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
