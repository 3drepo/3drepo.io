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
			url: '/login',
			templateUrl: 'login.html'
		}).state('home' ,{
			url: '/:account',
			templateUrl: 'home.html',
			controller: 'DashboardCtrl',
			resolve: {
				Data: 'Data',
				auth: function authCheck(Auth) {
					return Auth.init();
				},
				account: function($stateParams){
					return $stateParams.account;
				},
				init: function(Data, $stateParams)
				{
					Data.changeView('home', null, $stateParams);
				}
			}
		}).state('main' ,{
			url: '/:account/:project',
			views: {
				"@" : {
					templateUrl: 'mainpage.html',
					controller: 'MainCtrl',
					Data: 'Data',
					resolve: {
						auth: function authCheck(Auth) {
							return Auth.init();
						},
						account : function($stateParams){
							return $stateParams.account;
						},
						project: function($stateParams){
							return $stateParams.project;
						},
						init: function(Data, $state, $stateParams) {
							Data.changeView('main', null, $stateParams);
						}
					}
				},
				"footer@main" : {
					templateUrl: 'info.html',
					controller: 'ViewCtrl',
					resolve: {
						view: function($stateParams){
							return "info";
						}
					}
				}
			}
		}).state('main.view', {
			url: '/:view',
			views : {
				"footer@main" : {
					templateUrl: viewUrl,
					controller: 'ViewCtrl',
					Data: 'Data',
					resolve: {
						view: function($stateParams){
							return $stateParams.view;
						},
						init: function(Data, view, $stateParams){
							Data.changeView('main.view', view, $stateParams);
						}
					}
				}
			}
		}).state('main.branch', {
			url: '/revision/:branch/head',
			resolve: {
				branch: function($stateParams) {
					return $stateParams.branch;
				},
				init: function(Data, $stateParams)
				{
					Data.changeView('main.branch', null, $stateParams);
				}
			}
		}).state('main.branch.view', {
			url: '/:view',
			views : {
				"footer@main" : {
					templateUrl: viewUrl,
					controller: 'ViewCtrl',
					resolve: {
						view: function($stateParams){
							return $stateParams.view;
						},
						init: function(Data, $stateParams)
						{
							Data.changeView('main.branch.view', view, $stateParams);
						}
					}
				}
			}
		}).state('main.revision', {
			url: '/revision/:rid',
			views: {
				"viewer@main" : {
					resolve: {
						rid: function($stateParams) {
							return $stateParams.rid;
						},
						branch: function($stateParams) {
							return null;
						},
						account : function($stateParams){
							return $stateParams.account;
						},
						project: function($stateParams){
							return $stateParams.project;
						},
						init: function(Data, $stateParams)
						{
							Data.changeView('main.revision', null, $stateParams);
						}
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
						view: function($stateParams){
							return $stateParams.view;
						},
						init: function(Data, view, $stateParams)
						{
							Data.changeView('main.revision.view', view, $stateParams);
						}
					}
				}
			}
		})
		.state('404', {
		  url: '/404',
		  templateUrl: '404.html',
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
}])
.controller('MainCtrl', ['$scope', '$window', 'account', 'project', 'serverConfig', 'Data', function($scope, $window, account, project, serverConfig, Data) {
	$window.oculus = new Oculus();

	$window.viewer = new Viewer();
	$window.viewer.loadURL(serverConfig.apiUrl(account + '/' + project + '/revision/master/head.x3d.src'));
	initTree(account, project, 'master', null);

	$scope.Data = Data;

	$window.viewer.enableClicking();
}]);

