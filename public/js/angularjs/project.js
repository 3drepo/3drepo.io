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
	var possible_views = ["info", "comments", "revisions", "log", "settings"];
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
			controller: 'RevisionCtrl',
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
					controller: 'RevisionCtrl',
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
.run(['$rootScope', '$window', '$state', function($rootScope, $window, $state) {
	$rootScope.state = $state;

	$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams)
	{
		if ($window.floating)
			$window.floating.clearFloats();

		if (toState.name == "main")
		{
			$state.go("main.view", {view:"info"});
		}
	});
}])
.directive('markdown', function () {
	/**
	 * This directive allows us to convert markdown syntax into
	 * formatted text
	 */

	var converter = new Showdown.converter();
	return {
	  restrict: 'A',
	  link: function (scope, element, attrs) {
		  function renderMarkdown() {
			  var htmlText = converter.makeHtml(scope.$eval(attrs.markdown)  || '');
			  element.html(htmlText);
		  }
		  scope.$watch(attrs.markdown, renderMarkdown);
		  renderMarkdown();
	  }
  };
})
.service('iFrameURL', function() {
	this.ready = null;
	this.url = "";
	var self = this;

	this.setURL = function(url)
	{
		// TODO: Terrible hack for demo, fix using directives.
		$('#masterInline')[0].setAttribute("url", url);
		x3dom.reload();
		//this.url = url;
		//this.ready = true;
	}
})
.controller('MainCtrl', ['$scope', 'iFrameURL', 'account', 'project', 'serverConfig', 'Auth', function($scope, iFrameURL, account, project, serverConfig, Auth) {
	$scope.iFrameURL = iFrameURL;

	iFrameURL.setURL(serverConfig.apiUrl(account + '/' + project + '/revision/master/head.x3d.src'));

	initTree(account, project);

	$scope.x3domreload = function() {
		x3dom.reload();
	};

	$scope.$watch(function() { return iFrameURL; }, function(newObj) { $scope.iFrameURL = newObj; });
}])
.controller('RevisionCtrl', ['$scope', 'iFrameURL', 'account', 'project', 'branch', 'rid', '$stateParams', 'serverConfig', function($scope, iFrameURL, account, project, branch, rid, $stateParams, serverConfig) {
	$scope.branch = branch;
	$scope.rid = rid;

	if (branch)
		iFrameURL.setURL(serverConfig.apiUrl(account + '/' + project + '/revision/' + branch + '/' + rid + '.x3d.src'));
	else
		iFrameURL.setURL(serverConfig.apiUrl(account + '/' + project + '/revision/' + rid + '.x3d.src'));
}]);

