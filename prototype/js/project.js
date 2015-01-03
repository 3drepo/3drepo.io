angular.module('3drepo', ['ui.router', 'ui.bootstrap'])
.config([
'$stateProvider',
'$urlRouterProvider',
'$locationProvider',
function($stateProvider, $urlRouterProvider, $locationProvider) {
  $stateProvider
    .state('info', {
      url: '/info',
      templateUrl: 'info.html',
      controller: 'MainCtrl',
			resolve:{
			  	view: function(){
          			return "info";
      			},
      			initPromise: function(data){
	  				return data.fakePromise();
      			}
			}
    })
    .state('comments', {
      url: '/comments',
      templateUrl: 'comments.html',
      controller: 'MainCtrl',
			resolve:{
			  	view: function(){
          			return "comments";
      			},
      			initPromise: function(data){
      				return data.fakePromise();
      			}
			}
    })
    .state('revisions', {
      url: '/revisions',
      templateUrl: 'revisions.html',
      controller: 'MainCtrl',
			resolve:{
			  	view: function(){
		      		return "revisions";
		  		},
      			initPromise: function(data){
      				return data.fakePromise();
      			}
			}
    })
    .state('log', {
      url: '/log',
      templateUrl: 'log.html',
      controller: 'MainCtrl',
			resolve:{
			  	view: function(){
          			return "log";
      			},
      			initPromise: function(data){
      				return data.fakePromise();
      			}
			}
    })
    .state('settings', {
      url: '/settings',
      templateUrl: 'settings.html',
      controller: 'MainCtrl',
			resolve:{
			  	view: function(){
          			return "settings";
      			},
      			initPromise: function(data){
      				return data.fakePromise();
      			}
			}
    });

  $urlRouterProvider.otherwise('info');
  // $locationProvider.html5Mode(true);

}])
.factory('fakeserver', function(){
	var o = {

	};

	o.fetchComments = function(branch, rev, first, last){
		console.log("Fetching comments [" + first + "," + last + "] for branch " + branch + " and rev " + rev);

		var fake_authors = ["jozef", "tim", "fred"];

		var res = [];
		for(var i=first; i<=last; i++){
			var c = {
				author: fake_authors[Math.floor((Math.random() * 3))],
				date: "15 october 2014, 12:36",
				message: "Comment " + i
			}
			res.push(c);
		}

		return res;
	};

	return o;
})
.factory('data', function($http, fakeserver, $q){
	var o = {
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
		},
		current_branch: {
			name: ""
		},
		current_revision: {
			name: "",
			n_comments: 0,
			author: "",
	    	date: "",
	    	message: "",
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
  		}
	  	,
		log: [
	    ]
	};

	o.fetchInfo = function(){
		o.info.name = "OfficeFed";
	    o.info.owner = "Tim";
	    o.info.readme = "## We are leading the transformation of the Queen Elizabeth Olympic Park Stadium into an all-round multi-use venue\n\n		  \nWe are using sustainable construction methods like incorporating recycled features of the existing facility into the new Stadium and re-using crushed demolition material. \n\nAt construction peak the project will employ up to 400 people, and we are working to ensure the employment of local people where possible. We have also committed to create apprenticeships which will amount to 7% of the total workforce.\n\nThe new venue will host five matches during the Rugby World Cup 2015 and will be the permanent home of West Ham United Football Club from 2016.\n                    \nBalfour Beatty, the international infrastructure group, today announces that it has been awarded a &pound;154 million contract to carry out the full transformation works to the London 2012 Olympic Stadium for its operator, E20 Stadium LLP, a joint venture between the London Legacy Development Corporation and Newham Council. This new contract encompasses the &pound;41 million Stadium roof contract Balfour Beatty was awarded in the summer.\n                    \nBalfour Beatty will lead the transformation of the Stadium into an all-round multi-use venue, delivering a lasting sporting, cultural and commercial legacy in East London.\n                    \nThe new venue will host five matches during the Rugby World Cup 2015 and will be the permanent home of West Ham United Football Club from 2016. The venue will also become the new national competition Stadium for athletics in the UK as well as hosting elite international athletics events and other sporting, cultural and community events. A new community athletics track will also be provided next to the main Stadium.\n\nSustainable construction methods will include features of the existing facility being recycled and incorporated into the new Stadium and the re-use of crushed demolition material, existing balustrades and sanitary ware.\n\n\nAt construction peak the project will employ up to 400 people. Balfour Beatty will work with WorkPlace, Newham Council's employment service, to ensure the employment of local people where possible. Balfour Beatty has also committed to create apprenticeships which will amount to 7% of the total workforce.\n\nOnce reconfigured the Stadium's cable net roof, 84 metres wide at its deepest point, will be the largest cantilevered roof in the world covering every Stadium seat, improving acoustics and spectator experience.\n\nBalfour Beatty Chief Executive, Andrew McNaughton said: \"We are delighted to be continuing our activity at the Queen Elizabeth Olympic Park supporting the legacy commitment made as part of the London 2012 Olympic and Paralympic Games.\n\nDuring construction, our firm commitment to the use of local labour and the creation of apprenticeships will continue to benefit the local community and the wider industry and, upon completion, the Stadium will provide a first-class sporting and cultural facility for many generations to come. Balfour Beatty is proud to be associated with this project.\"\n\nWorks commence on site early in 2014 and are due for completion in the spring of 2016.";
		o.info.description = "Description of the project";
		o.info.visibility = "public";
		o.info.type = "federated";
		o.info.federation = [
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
    	o.info.users = [
	    	{
	    		name: "Tim Scully",
	    		role: "Admin"
	    	},
	    	{
	    		name: "Jozef Dobos",
	    		role: "Admin"
	    	},
	    	{
	    		name: "Frederid Besse",
	    		role: "Admin"
	    	}
	    ];
		o.info.branches = [
		    {
		    	name: "master",
		    },
		    {
		    	name: "experimental",
		    }
    	];
	}

	o.setCurrentBranch = function(branch){
		o.current_branch = branch;
		o.fetchRevisions(branch);
		o.setCurrentRevision(o.revisions[0]);
		o.setCurrentDiff("None");
		o.fetchRevisionsByDay(branch);
	}

	o.setCurrentRevision = function(rev){

		o.current_revision = {
			name: rev.name,
			n_comments: 18,
			author: "jozef",
	    	date: "14 october 2014, 02:00",
	    	message: "commit message 1",
		};
	};

	o.setCurrentDiff = function(rev_name){
		o.current_diff = {
			name: rev_name,
		};
	};

	o.fetchRevisions = function(branch){
		o.revisions = [
	  		{
	  			name: "rev1",
	  		},
	  		{
	  			name: "rev2",
	  		},
	  		{
	  			name: "rev23",
	  		},
  		];
	};

	o.fetchRevisionsByDay = function(branch) {
		o.revisions_by_day = {
  			"15 october 2014": [
	  		{
	  			name: "rev23",
	  			author: "jozef",
	  			date: "14 october 2014, 03:00",
	  			message: "commit message 2",
	  		}
  			],
  			"14 october 2014": [
  			{
	  			name: "rev1",
	  			author: "jozef",
	  			date: "15 october 2014, 01:00",
	  			message: "commit message 1",
	  		},
	  		{
	  			name: "rev2",
	  			author: "jozef",
	  			date: "14 october 2014, 02:00",
	  			message: "commit message 2",
	  		},
  			]
  		};
	};

	o.fakePromise = function(){
		var deferred = $q.defer();

  		setTimeout(function() {
		    deferred.resolve('Response from the server');

		    // Fake initialise, should be using server response instead
			o.initialise();
		  }, 250);

		return deferred.promise;
	}

	o.initialise = function(){
		o.fetchInfo();
      	o.setCurrentBranch(o.info.branches[0]);
      	o.fetchLog();
	}

	o.fetchComments = function(first, last){
		var comments = fakeserver.fetchComments(o.current_branch.name, o.current_revision.name, first, last);
		o.comments = comments;
	};

	o.fetchLog = function(){
		o.log = [
		    {
		    	type: "visibility",
		    	author: "Jozef",
		    	keyword: "public",
		    	date: "15 october 2014, 05:00"
		    },
		    {
		    	type: "branch-add",
		    	author: "Fred",
		    	keyword: "Experimental",
		    	date: "15 october 2014, 04:00"
		    },
		    {
		    	type: "project-type",
		    	author: "Tim",
		    	keyword: "Aerospatial",
		    	date: "15 october 2014, 03:00"
		    },
		    {
		    	type: "user-add",
		    	author: "Fred",
		    	keyword: "Tim",
		    	date: "15 october 2014, 02:00"
		    },
		    {
		    	type: "creation",
		    	author: "Jozef",
		    	date: "15 october 2014, 01:00"
		    },
	    ];
	}

	return o;
})
.directive('markdown', function () {
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
.factory('pagination', function(data){

	var o = {
		totalItems: 12,
		currentPage: 1,
		itemsperpage: 5
	};

	o.fetch = function(view){

		if(view == "comments"){
			data.fetchComments((o.currentPage-1)*o.itemsperpage, Math.min(o.totalItems-1, (o.currentPage)*o.itemsperpage-1));
		}
	}

	return o;

})
.factory('users', function(data){

	var o = {
		selected: "",
		states : ['Tim Scully (tscully)', 'Jozef Dobos (jdobos)', 'Frederic Besse (fbesse)']
	};

	return o;

})
.controller('MainCtrl', function($scope, $http, data, view, pagination, users){

	$scope.data = data;

	$scope.view = view;
	$scope.pagination = pagination;
	$scope.users = users;

  	$scope.pageChanged = function() {
    	$scope.pagination.fetch($scope.view);
  	};

	$scope.isView = function(view){
    return $scope.view == view;
  }

  $scope.pageChanged();

});