angular.module('3drepo', ['ui.router', 'ui.bootstrap', 'angular-bootstrap-select', 'ui.multiselect'])
.run(['$rootScope', '$location', '$http', function($rootScope, $location, $http) {
	$rootScope.apiUrl = function(tail) {
		return server_config.apiUrl(tail);
	};

	$('.selectpicker').selectpicker();

	// Force login check
	$http.get($rootScope.apiUrl('login')).then(function() {} );
}])
.config([
'$stateProvider',
'$urlRouterProvider',
'$locationProvider',
'$httpProvider',
function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
	$stateProvider.state('login', {
		url: '/login',
		templateUrl: 'login.html',
		controller: 'LoginCtrl'
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
.controller('LoginCtrl', ['$scope', '$state', '$window', '$location', '$http', '$rootScope', function($scope, $state, $window, $location, $http, $rootScope)
{
	$scope.loggedIn = !!$window.sessionStorage.token;
	$scope.asyncSelected = "";
	$rootScope.bodylayout = "body-login";

	$scope.logOut = function($location) {
		if ($window.sessionStorage.token)
		{
			delete $window.sessionStorage.username;
			delete $window.sessionStorage.token;
			$scope.loggedIn = false;
			$scope.user = {};
		}

		$state.go('splash');
	}

	$scope.loginPage = function() {
		$state.go('login');
	}

	$scope.signupPage = function() {
		$state.go('signup');
	}

	$scope.login = function() {
		url = $rootScope.apiUrl('login')
		console.log('URL: ' + url);

		$http.post(url, $scope.user)
		.success(function (data, status, headers, config) {
			$window.sessionStorage.token = data.token;
			$window.sessionStorage.username = $scope.user.username;
			$scope.loggedIn = true;

			$state.go('main');
			$rootScope.bodylayout = "";
		})
		.error(function(data, status, headers, config) {
			$scope.logOut();
			console.log('Failed')
		});
	};

	$scope.goUser = function(username) {
		var o = { account: username };
		$state.go('home', o);
	};

	$scope.getThings = function(val) {
		return $http.get($rootScope.apiUrl('search.json'),
		{
			params: {
				user_company_name: val
			}
		}).then(function(res) {
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

	if ($window.sessionStorage.username)
	{
		$scope.user = {username: $window.sessionStorage.username, password: ''};
	} else {
		$scope.user = {username :'', password: ''};
	}
}])
.service('Wayfinder', ['$http', '$rootScope', function($http, $rootScope) {
	var previous = null;

	var promise = $http.get($rootScope.apiUrl('wayfinder.json')).success(function(json) {
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
.controller('MainCtrl', ['$scope', '$http', 'iFrameURL', '$location', '$window', '$rootScope', 'uid', 'mode', 'Wayfinder', function($scope, $http, iFrameURL, $location, $window, $rootScope, uid, mode, Wayfinder) {
	$scope.iFrameURL = iFrameURL;
	iFrameURL.setURL($rootScope.apiUrl('arup/KX_All/revision/master/head.x3d.src'));

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

		$http.get($rootScope.apiUrl('wayfinder/record.json'),
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
.factory('authInterceptor', ['$rootScope', '$q', '$window', '$location', function($rootScope, $q, $window, $location) {
	return {
		request: function (config) {
			//console.log(config)
			config.headers = config.headers || {};
			if ($window.sessionStorage.token) {
				$window.sessionStorage.Authorization = 'Bearer ' + $window.sessionStorage.token;
			}
			return config;
		},
		response: function (res) {
			return res || $q.when(res);
		},
		responseError: function(rej) {
			if (rej.status === 401)
			{
				delete $window.sessionStorage.token;
				delete $window.sessionStorage.user;

				$location.path('/login').search('');
			}

			return rej || $q.when(rej);
		}
	};
}]);

jQuery.support.cors = true;
