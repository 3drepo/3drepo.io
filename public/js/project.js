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

angular.module('3drepo', ['ui.router', 'ui.bootstrap'])
.run(['$rootScope', '$location', function($rootScope, $location) {
	$rootScope.apiUrl = function(tail) {
		return '//api.' + $location.host() + ($location.port() ? (':' + $location.port()) : '') + '/' + tail;
	};
}])
.config([
'$stateProvider',
'$urlRouterProvider',
'$locationProvider',
'$httpProvider',
function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
	$stateProvider
		.state('splash' ,{
			url: '/',
			templateUrl: 'splash.html',
			controller: 'SplashCtrl'
		}).state('signup', {
			url: '/signup',
			templateUrl: 'signup.html',
			controller: 'SignUpCtrl'
		}).state('login', {
			url: '/login',
			templateUrl: 'login.html',
			controller: 'LoginCtrl'
		}).state('home' ,{
			url: '/:account',
			templateUrl: 'home.html',
			controller: 'DashboardCtrl',
			resolve: {
				account : function($stateParams){
					return $stateParams.account;
				},
				initPromise: function(userData, $stateParams) {
					return userData.initPromise($stateParams.account);
				}
			}
		}).state('main' ,{
			url: '/:account/:project',
			views: {
				"@" : {
					templateUrl: 'mainpage.html',
					controller: 'MainCtrl',
					resolve: {
						account : function($stateParams){
							return $stateParams.account;
						},
						project: function($stateParams){
							return $stateParams.project;
						},
					}
				},
				"footer@main" : {
					templateUrl: 'info.html',
					controller: 'ViewCtrl',
					resolve: {
						view: function($stateParams){
							return "info";
						},
						initPromise: function(data, $stateParams) {
							return data.initPromise($stateParams.account, $stateParams.project, 'master', 'head', $stateParams.view);
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
					resolve: {
						view: function($stateParams){
							return $stateParams.view;
						},
						initPromise: function(data, $stateParams){
							return data.initPromise($stateParams.account, $stateParams.project, 'master', 'head', $stateParams.view);
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
						initPromise: function(data, $stateParams){
							return data.initPromise($stateParams.account, $stateParams.project, $stateParams.branch, 'head', $stateParams.view);
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
						initPromise: function(data, $stateParams){
							return data.initPromise($stateParams.account, $stateParams.project, $stateParams.branch, $stateParams.rid, $stateParams.view);
						}
					}
				}
			}
		})
		.state('404', {
		  url: '/404',
		  templateUrl: '404.html',
		});

	// Invalid URL redirect to 404 state
	$urlRouterProvider.otherwise('404');

	// Empty view redirects to info view by default
	$urlRouterProvider.when('/:account/:project', '/{account}/{project}/info');

	// This will be needed to remove angular's #, but there is an error at the moment
	// -> need to investigate
	$locationProvider.html5Mode(true);

	$httpProvider.defaults.withCredentials = true;
}])
.factory('data', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){

	/**
	 * This provider is used to store the data about the project
	 */

	// Overview of the data structure
	var o = {
		loading: true,
		info: {
			name: "",
			owner: "",
			readme: "",
			description: "",
			visibility: "",
			type: "",
			federation: [],
			users: [],
			branches: [],
			n_log: 0
		},
		current_branch: {
			name: "",
			n_revision: 0
		},
		current_revision: {
			name: "",
			n_comments: 0,
			author: "",
			date: "",
			message: "",
			branch: "master"
		},
		current_diff: {
			name: "",
		},
		comments:[
		],
		revisions: [
		],
		revisions_by_day:
		{
		},
		log: [
		]
	};

	o.projectTypes = [
		{label: 'Architectural', value : 1},
		{label: 'Aerospace', value: 2},
		{label: 'Automotive', value: 3},
		{label: 'Enginering', value: 4},
		{label: 'Other', value: 5}
	];

	o.userRoles = [
		{label: 'Owner', value: 1},
		{label: 'Admin', value: 2},
		{label: 'Viewer', value: 3}
	];

	/**
	 * Ajax requests
	 */

	// Fetch general info about the project
	o.fetchInfo = function(account, project){

		var deferred = $q.defer();

		o.account = account;
		o.project = project;

		setTimeout(function() {
			var res = {};
			res.name = project;

			$http.get($rootScope.apiUrl(account + '/' + project + '.json')).then(function(json) {
				res.owner       = json.data.owner;
				res.description = json.data.desc;
				res.type        = json.data.type;
				res.selected    = o.projectTypes[0];

				for(var i = 0; i < o.projectTypes.length; i++)
				{
					if (o.projectTypes[i].label.toLowerCase() == res.type.toLowerCase())
					{
						res.selected = o.projectTypes[i];
						break;
					}
				}

				res.visibility = json.data.read_access;

				return $http.get($rootScope.apiUrl(account + '/' + project + '/revision/master/head/readme.json'));
			}).then(function(json) {
				res.readme = json.data.readme;

				res.type = "federated";
				res.federation = [
					{
						name: "Helicopter project 1",
						revisions: [
							"HEAD",
							"Rev 1",
							"Rev 2",
						],
						revselected: "HEAD"
					},
					{
						name: "Boat project 1",
						revisions: [
							"HEAD",
							"Rev 3",
							"Rev 4",
						],
						revselected: "Rev 4"
					}
				];

				return $http.get($rootScope.apiUrl(account + '/' + project + '/users.json'));
			}).then(function(json) {
				res.users = json.data;

				return $http.get($rootScope.apiUrl(account + '/' + project + '/branches.json'));
			}).then(function(json) {
				res.branches = json.data.map(function (item) {
					if (item.name == "00000000-0000-0000-0000-000000000000")
						return "master";
					else
						return item.name;
				});

				res.n_log = 19;

				deferred.resolve(res);
			});
		},10);

		return deferred.promise;
	}

	// Fetch info about the current branch given the name of the branch
	o.fetchCurrentBranch = function(name){
		var deferred = $q.defer();

		setTimeout(function() {
			var res = {
				name: name,
				n_revisions: 0
			};

			deferred.resolve(res);

		}, 10);

		return deferred.promise;
	};

	// Fetch info about the current revision given the name of the revision
	o.fetchCurrentRevision = function(branch, rid){
		var deferred = $q.defer();

		var baseUrl = "";

		if (rid == 'head')
			baseUrl = $rootScope.apiUrl(o.account + '/' + o.project + '/revision/' + branch + '/' + rid);
		else
			baseUrl = $rootScope.apiUrl(o.account + '/' + o.project + '/revision/' + rid);

		setTimeout(function() {
			var res = {};

			$http.get(baseUrl + '.json').then(function(json) {
				res.name    = json.data.name;
				res.shortName = json.data.name.substr(0,20) + "...";
				res.author  = json.data.author;
				res.date    = json.data.date;
				res.message = json.data.message;
				res.n_comments = 24;
				res.branch  = json.data.branch;

				return $http.get(baseUrl + '/readme.json');
			}).then(function(json) {
				res.readme = json.data.readme;

				deferred.resolve(res);
			});
		}, 10);

		return deferred.promise;
	};

	o.fetchRevisions = function(branch){

		var deferred = $q.defer();

		setTimeout(function() {

			$http.get($rootScope.apiUrl(o.account + '/' + o.project + '/revisions/' + branch + '.json'))
			.then(function(data) {
				deferred.resolve(data.data);
			});
		}, 10);

		return deferred.promise;
	};

	o.month = function(month) {
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August",
			"September", "October", "November", "December"];

		return monthNames[month];
	};

	// Fetch some of the revisions grouped by day
	o.fetchRevisionsByDay = function(branch, first, last) {

		var deferred = $q.defer();

		setTimeout(function() {
			$http.get($rootScope.apiUrl(o.account + '/' + o.project + '/revisions/' + branch + '.json?start=' + first + '&end=' + last + '&full=true'))
			.then(function(json) {

				var res = {};

				for(var rev in json.data)
				{
					var dt = new Date(json.data[rev].timestamp);

					var day = dt.getDate();
					var month = o.month(dt.getMonth());
					var year  = dt.getFullYear();

					var dtStr = day + " " + month + " " + year;

					if (!(dtStr in res))
						res[dtStr] = [];

					json.data[rev].date = dtStr;
					res[dtStr].push(json.data[rev]);
				}

				deferred.resolve(res);
			});

		}, 10);

		return deferred.promise;
	};

	// Fetch some of the comments for the current revision
	o.fetchComments = function(first, last){

		var fetchFakeComments = function(branch, rev, first, last){

			console.log("Fetching comments [" + first + "," + last + "] for branch " + branch + " and rev " + rev);

			var res = [];
			for(var i=first; i<=last; i++){
				res.push("Etc.");
			}

			return res;

		};

		var deferred = $q.defer();

		setTimeout(function() {

			var res = fetchFakeComments(o.current_branch.name, o.current_revision.name, first, last);

			deferred.resolve(res);

		}, 10);

		return deferred.promise;
	};

	// Fetch some of the logs
	o.fetchLog = function(first, last){

		var fetchFakeLog = function(branch, rev, first, last){

			console.log("Fetching log [" + first + "," + last + "] for branch " + branch + " and rev " + rev);

			var res = [];
			for(var i=first; i<=last; i++){
				res.push("etc");
			}

			return res;

		};

		var deferred = $q.defer();

		setTimeout(function() {

			var res = fetchFakeLog(o.current_branch.name, o.current_revision.name, first, last);

			deferred.resolve(res);
		}, 10);

		return deferred.promise;
	};

	/**
	 * Setters, copying from the res into the data structure
	 */

	o.setInfo = function(res){
		angular.copy(res, o.info);
	}

	o.setCurrentBranch = function(res){
		angular.copy(res, o.current_branch);
		if (o.current_branch.name == "00000000-0000-0000-0000-000000000000")
			o.current_branch.name = "master";
	}

	o.setCurrentRevision = function(res){
		angular.copy(res, o.current_revision);
		o.info.readme = res.readme;
	}

	o.setCurrentDiff = function(rev_name){
		o.current_diff = {
			name: rev_name,
		};
	};

	o.setRevisions = function(res){
		angular.copy(res, o.revisions);
		o.current_branch.n_revisions = o.revisions.length;
	}

	o.setRevisionsByDay = function(res){
		angular.copy(res, o.revisions_by_day);
	}

	o.setComments = function(res){
		angular.copy(res, o.comments);
	}

	o.setLog = function(res){
		angular.copy(res, o.log);
	};

	/**
	 * Promises, used in the resolve to fetch data
	 */

	o.initPromise = function(account, project, branch, rid, info){

		// Enable loading animation
		o.loading = true;

		// Chain of promises
		// - fetch the general info
		// - fetch the current branch (selected by default)
		// - fetch the revisions
		// - set the current revision (selected by default)
		// - set the current diff
		// - the branch/revision waltz
		// - TODO: Cleanup into different routes
		return o.fetchInfo(account, project)
			.then(function(res){
				o.setInfo(res);
				o.info.selected = res.selected; // Must copy by reference

				if (branch)
					return o.fetchCurrentBranch(branch);
				else
					return o.fetchCurrentRevision(null, rid);
			})
			.then(function(res){
				if (branch)
				{
					o.setCurrentBranch(res);
					return o.fetchCurrentRevision(branch, 'head');
				} else {
					o.setCurrentRevision(res);
					return o.fetchCurrentBranch(o.current_revision.branch);
				}
			})
			.then(function(res){
				if (branch)
					o.setCurrentRevision(res)
				else
					o.setCurrentBranch(res);

				return o.fetchRevisions(o.current_branch.name);
			})
			.then(function(res){
				o.setRevisions(res);
				o.setCurrentDiff("None");

				// Disable loading animation
				o.loading = false;
			});
	};

	return o;
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
.factory('pagination', ['data', function(data){

	/**
	 * This provider deals with the pagination of the data
	 * So far the paginated data is:
	 * - comments
	 * - log
	 * - revision list
	 */

	var o = {
		totalItems: 0,
		currentPage: 1,
		itemsperpage: 5
	};

	o.init = function(view) {
		if(view == "comments"){
			o.totalItems = data.current_revision.n_comments;
		}
		else if(view == "log"){
			o.totalItems = data.info.n_log;
		}
		else if(view == "revisions"){
			o.totalItems = data.current_branch.n_revisions;
		}
	}

	o.fetch = function(view){

		if(view == "comments"){
			data.loading = true;
			data.fetchComments(data.current_revision.branch, (o.currentPage-1)*o.itemsperpage, Math.min(o.totalItems-1, (o.currentPage)*o.itemsperpage-1))
			.then(function(res){
				data.setComments(res);
				data.loading = false;
			});
		}
		else if(view == "log"){
			data.loading = true;
			data.fetchLog(data.current_revision.branch, (o.currentPage-1)*o.itemsperpage, Math.min(o.totalItems-1, (o.currentPage)*o.itemsperpage-1))
			.then(function(res){
				data.setLog(res);
				data.loading = false;
			});
		}
		else if(view == "revisions"){
			data.loading = true;
			data.fetchRevisionsByDay(data.current_revision.branch, (o.currentPage-1)*o.itemsperpage, Math.min(o.totalItems-1, (o.currentPage)*o.itemsperpage-1))
			.then(function(res){
				data.setRevisionsByDay(res);
				data.loading = false;
			});
		}
	}

	return o;

}])
.factory('users', ['data', function(data){

	var o = {
		selected: "",
		states : ['Tim Scully (tscully)', 'Jozef Dobos (jdobos)', 'Frederic Besse (fbesse)']
	};

	return o;

}])
.controller('ViewCtrl', ['$rootScope', '$scope', '$http', 'data', 'view', 'pagination', 'users', '$state', function($rootScope, $scope, $http, data, view, pagination, users, $state){

	$scope.data = data;
	$scope.view = view;
	$scope.possible_views = ["info", "comments", "revisions", "log", "settings"];

	$scope.pagination = pagination;
	$scope.users = users;

	$scope.loading = true;

	$scope.pageChanged = function() {
		$scope.pagination.init($scope.view);
		$scope.pagination.fetch($scope.view);
	};

	$scope.isView = function(view){
		return $scope.view == view;
	};

	$scope.go = function(v){
		var o = {view: v};

		var vw = $state.current.name;

		if (vw.substr(vw.length - 5) == ".view")
			$state.go($state.current.name, o);
		else
			$state.go($state.current.name + '.view', o);
	}

	$scope.checkViewIsValid = function(){
		if( $scope.possible_views.indexOf(view) == -1 ){
			$state.go("404");
		}
	}

	$scope.setBranch = function(branch) {
		$scope.branch = branch;
	}

	$scope.setRevision = function(rev) {
		$scope.rid = rev;
		var o = {
			branch: $scope.branch,
			rid:  $scope.rid.name,
			view: $scope.view
		};

		$state.go('main.revision.view', o);
	}

	$scope.checkViewIsValid();

	$scope.pageChanged();

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

	$scope.logOut = function($location) {
		if ($window.sessionStorage.token)
		{
			url = $rootScope.apiUrl('logout');

			$http.post(url, $scope.user)
			.success(function (data, status, headers, config) {
				delete $window.sessionStorage.username;

			});

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
			$state.go('home', {account : $scope.user.username});
		})
		.error(function(data, status, headers, config) {
			logOut();
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
.controller('MainCtrl', ['$scope', '$http', 'iFrameURL', 'account', 'project', '$location', '$window', '$rootScope', function($scope, $http, iFrameURL, account, project, $location, $window, $rootScope) {
	$scope.iFrameURL = iFrameURL;
	iFrameURL.setURL($rootScope.apiUrl(account + '/' + project + '/revision/master/head.x3d.src'));

	$scope.x3domreload = function() {
		x3dom.reload();
	};
}])
.controller('RevisionCtrl', ['$scope', '$http', 'iFrameURL', 'account', 'project', 'branch', 'rid', '$stateParams', '$rootScope', '$state', function($scope, $http, iFrameURL, account, project, branch, rid, $stateParams, $rootScope, $state) {
	$scope.branch = branch;
	$scope.rid = rid;

	if (branch)
		iFrameURL.setURL($rootScope.apiUrl(account + '/' + project + '/revision/' + branch + '/' + rid + '.x3d.src'));
	else
		iFrameURL.setURL($rootScope.apiUrl(account + '/' + project + '/revision/' + rid + '.x3d.src'));

}])
.factory('userData', ['$http', '$q', '$rootScope', function($http, $q, $rootScope){
	var o = {
		loading: true,
		user: {
			firstName: "",
			lastName: "",
			email: "",
			projects: []
		}
	};

	o.setInfo = function(res){
		angular.copy(res, o.user);
	};

	o.fetchInfo = function(account) {
		var deferred = $q.defer();

		setTimeout(function() {
			var res = {};

			$http.get($rootScope.apiUrl(account + '.json')).then(function(json) {
				res.firstName = json.data.firstName;
				res.lastName  = json.data.lastName;
				res.email     = json.data.email;
				res.projects  = json.data.projects;

				deferred.resolve(res);
			});
		},10);

		return deferred.promise;
	};

	/**
	 * Promises, used in the resolve to fetch data
	 */

	o.initPromise = function(account){
		// Enable loading animation
		o.loading = true;

		return o.fetchInfo(account)
			.then(function(res){
				o.setInfo(res);

				// Disable loading animation
				o.loading = false;
			});
	};

	return o;
}])
.controller('DashboardCtrl', ['$scope', 'account', 'userData', '$http', '$state', function($scope, account, userData, $http, $state){
	$scope.account = account;
	$scope.view = "dashboard";
	$scope.userData = userData;

	$scope.setView = function(view){
		$scope.view = view;

		console.log("VIEW: " + view);
	}

	$scope.goProject = function(account, project){
		var o = { account: account, project: project };
		$state.go("main", o);
	}

	$scope.isView = function(view){
		return $scope.view == view;
	}
}])
.controller('SplashCtrl', ['$scope', function($scope) {
}])
.controller('SignUpCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
	$scope.username = "";
	$scope.firstname = "";
	$scope.lastname = "";
	$scope.password = "";
	$scope.retype = "";
	$scope.email = "";
	$scope.valid = false;
	$scope.popoverText = "";

	$scope.signupSubmit = function() {

	};

	$scope.checkUsername = function() {
		setTimeout(function() {
			$http.head($rootScope.apiUrl($scope.username + '.json')).
				success(function(json, status) {
					if (status === 404)
					{
						$scope.valid = true;
						$scope.popoverText = "";
					} else {
						$scope.valid = false;
						$scope.popoverText = "Username already taken";
					}
				});
		},10);
	};
}]);

