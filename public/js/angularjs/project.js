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

var viewUrl = function ($stateParams)
{
	// Each view is associated with a template
	// However only a few views are possible
	// Check that we have a view that exists otherwise redirects to info
	var possible_views = ["info", "comments", "revisions", "log", "settings", "cobie"];
	var view = $stateParams.view;

	if( possible_views.indexOf(view) == -1 ){
		view = "info";
	}

	return view + '.html';
}

var publicViews = ["login", "signup"];

angular.module('3drepo')
.config([
'$stateProvider',
'$urlRouterProvider',
'$locationProvider',
function($stateProvider, $urlRouterProvider, $locationProvider) {
	$stateProvider
		/*
		.state('splash' ,{
			url: '/',
			templateUrl: 'splash.html',
			controller: 'SplashCtrl'
		}).*/
		.state('signup', {
			url: '/signup',
			templateUrl: 'signup.html',
			controller: 'SignUpCtrl'
		})
		.state('login', {
			url: '/',
			templateUrl: 'login.html'
		}).state('home' ,{
			url: '/:account',
			templateUrl: 'home.html',
			controller: 'DashboardCtrl',
			resolve: {
				Data: 'Data',
				auth: function authCheck(Auth) { return Auth.init();},
				init: function(Data, $stateParams) { Data.setState($stateParams, { "clearState" : true }); }
			}
		}).state('main' ,{
			url: '/:account/:project',
			Data: 'Data',
			resolve: {
				auth: function authCheck(Auth) { return Auth.init();},
				init: function(Data, $stateParams) { Data.setState($stateParams, { "clearState" : true }); }
			},
			views: {
				"@" : {
					templateUrl: 'mainpage.html',
					controller: 'MainCtrl',
				},
				"footer@main" : {
					templateUrl: 'info.html',
					controller: 'ViewCtrl',
				}
			}
		}).state('main.view', {
			url: '/:view',
			views : {
				"footer@main" : {
					templateUrl: viewUrl,
					controller: 'ViewCtrl',
					resolve: {
						init: function(Data, $stateParams) { Data.setState($stateParams, {}); }
					}
				}
			}
		}).state('main.branch', {
			url: '/revision/:branch/head',
			resolve: {
				init: function(Data, $stateParams) { Data.setState($stateParams, {}); }
			}
		}).state('main.branch.view', {
			url: '/:view',
			views : {
				"footer@main" : {
					templateUrl: viewUrl,
					controller: 'ViewCtrl',
					resolve: {
						init: function(Data, $stateParams) { Data.setState($stateParams, {}); }
					}
				}
			}
		}).state('main.revision', {
			url: '/revision/:revision',
			views: {
				"viewer@main" : {
					resolve: {
						init: function(Data, $stateParams) { Data.setState($stateParams, {}); }
					}
				}
			}
		}).state('main.revision.view', {
			url: '/:view',
			views : {
				"footer@main" : {
					templateUrl: viewUrl,
					controller: 'ViewCtrl',
					resolve: {
						init: function(Data, $stateParams) { Data.setState($stateParams, {}); }
					}
				}
			}
		}).state('main.revision.diff', {
			url: '/diff/:diffRevision',
			views : {
				"viewer@main" : {
					resolve: {
						init: function(Data, $stateParams) { Data.setState($stateParams, {"diffEnabled" : true}); }
					}
				}
			}
		}).state('main.revision.diff.view', {
			url: '/:view',
			views : {
				"footer@main" : {
					templateUrl: viewUrl,
					controller: 'ViewCtrl',
					resolve: {
						init: function(Data, $stateParams) { Data.setState($stateParams, {"diffEnabled" : true}); }
					}
				}
			}
		}).state('main.wayfinder', {
			url: '/wayfinder/?uid',
			views: {
				"viewer@main" : {
					resolve: {
						init: function(Data, $stateParams) { Data.setState($stateParams, {"wayfinderEnabled" : true}); }
					}
				}
			}
		}).state('main.wayfinder.view', {
			url: '/wayfinder/:view/?uid',
			views : {
				"footer@main" : {
					templateUrl: viewUrl,
					controller: 'ViewCtrl',
					resolve: {
						init: function(Data, $stateParams) { Data.setState($stateParams, {"wayfinedEnabled" : true}); }
					}
				}
			}
		});

	// Empty view redirects to info view by default
	$urlRouterProvider.when('/:account/:project', '/{account}/{project}/info');

	// Removes Angular's # at the end of the URL
	$locationProvider.html5Mode(true);
}])
.run(['$rootScope', '$window', '$state', 'Auth', 'pageConfig', function($rootScope, $window, $state, Auth, pageConfig) {
	$rootScope.state = $state;

	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams)
	{
		console.log('$stateChangeStart to '+JSON.stringify(toState)+'- fired when the transition begins. toState,toParams : \n',toState, toParams);

		if ($window.floating)
			$window.floating.clearFloats();

		if(publicViews.indexOf(toState.name) == -1)
		{
			if (Auth.loggedIn == null) {
				// Not sure whether or not we are logged in.
				// Extreme case where resolve in state hasn't fired.
				event.preventDefault();

				Auth.init()
				.then(function() {
					$state.transitionTo(toState, toParams); // Try again
				});
			} else if (Auth.loggedIn) {
				if (toState.name == "main")
				{
					event.preventDefault();
					toParams['view'] = "info";
					$state.transitionTo("main.view", toParams);
				}
			} else {
				event.preventDefault();
				pageConfig.goDefault();
			}
		}
	});

	$rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams, error){
	  console.log('$stateChangeError - fired when an error occurs during transition.');
	  console.log(arguments);
	});
	$rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
	  console.log('$stateChangeSuccess to '+toState.name+'- fired once the state transition is complete.');
	});
	// $rootScope.$on('$viewContentLoading',function(event, viewConfig){
	//   // runs on individual scopes, so putting it in "run" doesn't work.
	//   console.log('$viewContentLoading - view begins loading - dom not rendered',viewConfig);
	// });
	$rootScope.$on('$viewContentLoaded',function(event){
	  console.log('$viewContentLoaded - fired after dom rendered',event);
	});
	$rootScope.$on('$stateNotFound',function(event, unfoundState, fromState, fromParams){
	  console.log('$stateNotFound '+unfoundState.to+'  - fired when a state cannot be found by its name.');
	  console.log(unfoundState, fromState, fromParams);
	});
}])
.controller('MainCtrl', ['$scope', '$window', 'serverConfig', 'Data', function($scope, $window, serverConfig, Data) {

	// Java bits
	$window.viewerManager = new ViewerManager();
	$window.viewerManager.getDefaultViewer().enableClicking();

	$window.oculus = new Oculus();
	$window.gamepad = new Gamepad();
	$window.gamepad.init();
	$window.collision = new Collision();
	$window.waypoint = new Waypoint($window.viewerManager.getDefaultViewer());
	$scope.waypoint = $window.waypoint;

	// Data service
	$scope.Data = Data;
	$scope.settings = Data.ProjectData.settings;
	//$scope.Data.updateState();

	// UI Components
	$scope.showReadme = false;
	$scope.showMultiSelect = false;
	$scope.showSingleSelect = false;

	// When the settings have loaded, update various components
	Data.ProjectData.loadingPromise.promise.then(function() {
		$window.viewerManager.getDefaultViewer().updateSettings(Data.ProjectData.settings);
		$window.waypoint.updateSettings(Data.ProjectData.settings);
	});

	initTree(Data.state.account, Data.state.project, 'master', null);

	// TODO: Move all of this stuff to a ToolsCtrl
	$scope.okReadme = function () {
		$scope.showReadme = false;
		$window.waypoint.unpause();
		$window.waypoint.begin();
	}

	$scope.goWayfinder = function() {
		$window.viewerManager().getDefaultViewer().setNavMode("WAYFINDER");
		$scope.setWaypointMode("RECORD");
	}

	$scope.setViewerMode = function(mode) {
		$window.viewerManager().getDefaultViewer().setNavMode(mode);

		if(mode == 'WAYFINDER')
			$scope.setWaypointMode("RECORD");
		else
			$scope.setWaypointMode("NONE");
	}

	$scope.showAll = function() {
		$scope.setWaypointMode("NONE");
		$window.viewerManager.getDefaultViewer().showAll();
	}

	$scope.reset = function() {
		$scope.setWaypointMode("NONE");
		$window.viewerManager.getDefaultViewer().reset();
	}

	$scope.flyThrough = function() {
		$scope.setWaypointMode("NONE");
		$window.viewerManager.getDefaultViewer().flyThrough(getDefaultViewer().viewpoints);
	}

	$scope.setCurrentViewpoint = function(idx)
	{
		$scope.setWaypointMode("NONE");
		$window.viewerManager.getDefaultViewer().setCurrentViewpoint(idx);
	}

	$scope.setWaypointMode = function(mode) {
		$scope.showReadme = false;
		$scope.showMultiSelect = false;
		$scope.showSingleSelect = false;

		if (mode == 'RECORD') {
			$window.waypoint.pause();
			$scope.showReadme = true;
		} else if (mode == 'VIEWING') {
			$scope.showMultiSelect = true;
		} else if (mode == 'FLYTHROUGH') {
			$scope.showSingleSelect = true;
		}

		$window.waypoint.setNavMode(mode);
	}

	$scope.visualizeThese = null;

	$scope.visualize = function() {
		var uids = $scope.visualizeThese.map(function(o) { return o.value; });
		$state.transitionTo('main.wayfinder.view', { uid : uids, view: Data.view }, { location: true, inherit: true, relative: $state.$current, notify: false});

		if (uids)
		{
			$scope.setWaypointMode
		}
	}


}]);

