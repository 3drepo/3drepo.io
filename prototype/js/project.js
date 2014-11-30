angular.module('3drepo', [])
.factory('project', ['$http', function($http){

  var o = {
    name: "Car Project 1",
    owner: "jozef",
    readme: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.",
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
	    	type: "branch",
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