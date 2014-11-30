angular.module('3drepo', [])
.factory('project', ['$http', function($http){

  var o = {
    name: "OST Federated",
    owner: "jozef",
    readme: "We are leading the transformation of the Queen Elizabeth Olympic Park Stadium into an all-round multi-use venue\n\n		  \nWe are using sustainable construction methods like incorporating recycled features of the existing facility into the new Stadium and re-using crushed demolition material. \n\nAt construction peak the project will employ up to 400 people, and we are working to ensure the employment of local people where possible. We have also committed to create apprenticeships which will amount to 7% of the total workforce.\n\nThe new venue will host five matches during the Rugby World Cup 2015 and will be the permanent home of West Ham United Football Club from 2016.\n                    \nBalfour Beatty, the international infrastructure group, today announces that it has been awarded a &pound;154 million contract to carry out the full transformation works to the London 2012 Olympic Stadium for its operator, E20 Stadium LLP, a joint venture between the London Legacy Development Corporation and Newham Council. This new contract encompasses the &pound;41 million Stadium roof contract Balfour Beatty was awarded in the summer.\n                    \nBalfour Beatty will lead the transformation of the Stadium into an all-round multi-use venue, delivering a lasting sporting, cultural and commercial legacy in East London.\n                    \nThe new venue will host five matches during the Rugby World Cup 2015 and will be the permanent home of West Ham United Football Club from 2016. The venue will also become the new national competition Stadium for athletics in the UK as well as hosting elite international athletics events and other sporting, cultural and community events. A new community athletics track will also be provided next to the main Stadium.\n\nSustainable construction methods will include features of the existing facility being recycled and incorporated into the new Stadium and the re-use of crushed demolition material, existing balustrades and sanitary ware.\n\n\nAt construction peak the project will employ up to 400 people. Balfour Beatty will work with WorkPlace, Newham Council's employment service, to ensure the employment of local people where possible. Balfour Beatty has also committed to create apprenticeships which will amount to 7% of the total workforce.\n\nOnce reconfigured the Stadium's cable net roof, 84 metres wide at its deepest point, will be the largest cantilevered roof in the world covering every Stadium seat, improving acoustics and spectator experience.\n\nBalfour Beatty Chief Executive, Andrew McNaughton said: \"We are delighted to be continuing our activity at the Queen Elizabeth Olympic Park supporting the legacy commitment made as part of the London 2012 Olympic and Paralympic Games.\n\nDuring construction, our firm commitment to the use of local labour and the creation of apprenticeships will continue to benefit the local community and the wider industry and, upon completion, the Stadium will provide a first-class sporting and cultural facility for many generations to come. Balfour Beatty is proud to be associated with this project.\"\n\nWorks commence on site early in 2014 and are due for completion in the spring of 2016.",
    description: "Description of the project",
    visibility: "public",
    type: "federated",
    federation: [
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
    ],
    users: [
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
    ],
    branches: [
	    {
	    	name: "master",
	    	revisions: [
	    		{
	    			name: "rev1",
	    			author: "jozef",
	    			date: "15 october 2014, 01:00",
	    			message: "commit message 1",
	    			comments:[
	    				{
	    					author: "jozef",
	    					date: "15 october 2014, 12:36",
	    					message: "Comment 1."
	    				},
	    				{
	    					author: "tim",
	    					date: "15 october 2014, 12:35",
	    					message: "Comment 2."
	    				},
	    				{
	    					author: "fred",
	    					date: "15 october 2014, 12:34",
	    					message: "Comment 3."
	    				}
	    			]
	    		},
	    		{
	    			name: "rev2",
	    			author: "jozef",
	    			date: "14 october 2014, 02:00",
	    			message: "commit message 2",
	    			comments:[
	    				{
	    					author: "jozef",
	    					date: "15 october 2014, 12:36",
	    					message: "Comment 4."
	    				},
	    				{
	    					author: "tim",
	    					date: "15 october 2014, 12:35",
	    					message: "Comment 5."
	    				},
	    			]
	    		},
	    		{
	    			name: "rev23",
	    			author: "jozef",
	    			date: "14 october 2014, 03:00",
	    			message: "commit message 2",
	    			comments:[
	    				{
	    					author: "jozef",
	    					date: "15 october 2014, 12:36",
	    					message: "Comment 4."
	    				},
	    				{
	    					author: "tim",
	    					date: "15 october 2014, 12:35",
	    					message: "Comment 5."
	    				},
	    			]
	    		},
	    	]
	    },
	    {
	    	name: "experimental",
	    	revisions: [
	    		{
	    			name: "rev3",
	    			author: "jozef",
	    			date: "15 october 2014, 12:34",
	    			message: "commit message 3",
	    			comments:[
	    				{
	    					author: "jozef",
	    					date: "15 october 2014, 12:36",
	    					message: "Comment 7."
	    				},
	    			]
	    		},
	    		{
	    			name: "rev4",
	    			author: "jozef",
	    			date: "14 october 2014, 12:34",
	    			message: "commit message 4",
	    			comments:[
	    				{
	    					author: "jozef",
	    					date: "15 october 2014, 12:36",
	    					message: "Comment 10."
	    				},
	    				{
	    					author: "tim",
	    					date: "15 october 2014, 12:35",
	    					message: "Comment 11."
	    				},
	    				{
	    					author: "fred",
	    					date: "15 october 2014, 12:34",
	    					message: "Comment 12."
	    				}
	    			]
	    		},
	    	]
	    }
    ],
    log: [
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
    ]
  };

  return o;
}])
.controller('ProjectCtrl', ['$scope', '$http', 'project', function($scope, $http, project){

	$scope.project = project;

  $scope.view = "info";

  $scope.current_branch = project.branches[0];
  $scope.current_revision = $scope.current_branch.revisions[0];
  $scope.current_diff_name = "None";

  $scope.setView = function(view){
    $scope.view = view;
  }

  $scope.isView = function(view){
    return $scope.view == view;
  }

  $scope.setBranch = function(branch){
  	$scope.current_branch = branch;
  	$scope.current_revision = branch.revisions[0];
  	$scope.rev_by_day = $scope.sortRevisionByDay($scope.current_branch);
  	$scope.current_diff_name = "None";
  }

	$scope.setRevision = function(rev){
  	$scope.current_revision = rev;
  	// If the new revision is the one that we are diffing against
  	// set the diff to None
  	if(rev.name == $scope.current_diff_name){
  		$scope.current_diff_name = "None";
  	}
  }

	$scope.setDiffName = function(diff_name){
  	$scope.current_diff_name = diff_name;
  }

  $scope.sortRevisionByDay = function(branch){
  	var sorted = {};
  	var length = branch.revisions.length;
  	for(var i=0; i<length; i++){
  		var revision = branch.revisions[i];
  		var day = revision["date"].split(",")[0];

  		if(!sorted.hasOwnProperty(day)){
				sorted[day] = [];  			
	  	}

	  	sorted[day].push(revision);
  	}

  	return sorted;
  }

  $scope.log = function(msg){
  	console.log(msg);
  }

  $scope.setType = function(type){
  	$scope.project.type = type;
  }
  
	$scope.setVisibility = function(visibility){
  	$scope.project.visibility = visibility;
  }

  // Initialise the revisions by day for the timeline
	$scope.rev_by_day = $scope.sortRevisionByDay($scope.current_branch);

}]);