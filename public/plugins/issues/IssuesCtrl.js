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

angular.module('3drepo')
.controller('IssuesCtrl', ['$scope', '$modal', 'StateManager', 'IssuesService', '$rootScope', '$http', '$q', 'serverConfig', function($scope, $modal, StateManager, IssuesService, $rootScope, $http, $q, serverConfig)
{
	$scope.IssuesService    = IssuesService;
	$scope.objectIsSelected = false;
	$scope.currentSelected  = null;
	$scope.mapPromise       = null;
	$scope.map              = {};
	$scope.io               = io(serverConfig.chatHost, {path :  serverConfig.chatPath});
	$scope.newComment       = {};
	$scope.newComment.text  = "";
	$scope.pickedPos       = null;

	$(document).on("objectSelected", function(event, object, zoom) {
		// If the background is selected
		if (object === undefined)
		{
			$scope.objectIsSelected = false;
		} else {
			$scope.objectIsSelected = true;
			$scope.currentSelected  = object;
		}

		IssuesService.getIssueStubs(object);
	});

	$scope.refresh = function() {
		IssuesService.getObjectIssues($scope.currentSelected, true);
	}

	$scope.locateObject = function(id) {
		var issueIdx = IssuesService.issues.map(function (obj) { return obj._id; }).indexOf(id);

		if (issueIdx > -1)
		{
			var objectID = IssuesService.issues[issueIdx].parent;

			$scope.mapPromise.then(function() {
				var uid = $scope.SIDMap[objectID];
				var object = $("#model__" + uid);

				if (object.length)
					$(document).trigger("objectSelected", object[0]);
			}, function(message) {
				console.log(message);
			});
		}
	}

	$scope.postComment = function(object)
	{
		// We should post to either the object's project and account if one is selected.
		// Otherwise, we should post to the over arching project
		var postAccount = null;
		var postProject = null;

		if (!$scope.currentSelected)
		{
			postAccount = StateManager.state.account;
			postProject = StateManager.state.project;
		} else {
			debugger;
		}

		var sid = $scope.currentSelected.getAttribute("DEF");
		var issuePostURL = serverConfig.apiUrl(postAccount + "/" + postProject + "/issues/" + sid);

		$.ajax({
			type:	"POST",
			url:	issuePostURL,
			data: {"data" : JSON.stringify(object)},
			dataType: "json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				$scope.newComment.text = "";
				$scope.refresh();
			}
		});
	}

	$scope.openIssue = function(id)
	{
		debugger;
	}

	$scope.addNewComment = function(id)
	{
		var issueObject = {
			_id: id,
			comment: $scope.newComment.text
		};

		$scope.postComment(issueObject);

		issueObject["account"] = StateManager.state.account;
		issueObject["project"] = StateManager.state.project;

		$scope.io.emit("post_message", issueObject);
	}

	$scope.complete = function(id)
	{
		var issueObject = {
			_id: id,
			complete: true
		};

		$scope.postComment(issueObject);
	}

	$scope.newIssue = function()
	{
		var modalInstance = $modal.open({
			templateUrl: 'newissuemodal.html',
			controller: 'DialogCtrl',
			backdrop: false,
			resolve: {
				params: {
					name: "",
					date: null,
					pickedObj: $scope.pickedObj
				}
			}
		});

		modalInstance.result.then(function (params) {
			var issueObject = {};

			issueObject["name"]		= params.name;
			//issueObject["deadline"] = params.date.getTime();
			issueObject["deadline"] = (new Date()).getTime();

			if ($scope.pickedPos)
				issueObject["pickedPos"] = $scope.pickedPos.toGL();

			var sid = $scope.currentSelected.getAttribute("DEF");
			var issuePostURL = serverConfig.apiUrl(StateManager.state.account + "/" + StateManager.state.project + "/issues/" + sid);

			$.ajax({
				type:	"POST",
				url:	issuePostURL,
				data: {"data" : JSON.stringify(issueObject)},
				dataType: "json",
				xhrFields: {
					withCredentials: true
				},
				success: function(data) {
					console.log("Success: " + data);
					$scope.refresh();
				}
			});
		}, function () {
			// TODO: Error here
		});
	}

	$scope.$watchGroup(['StateManager.state.branch', 'StateManager.state.revision'], function () {
		var account		= StateManager.state.account;
		var project		= StateManager.state.project;
		var branch		= StateManager.state.branch;
		var revision	= StateManager.state.revision;

		if (revision == 'head' || (branch && !revision))
			var baseUrl = serverConfig.apiUrl(account + '/' + project + '/revision/' + branch + '/head/map.json');
		else
			var baseUrl = serverConfig.apiUrl(account + '/' + project + '/revision/' + revision + '/map.json');

		if (!$scope.mapPromise) {
			var deferred = $q.defer();
			$scope.mapPromise = deferred.promise;

			$http.get(baseUrl)
			.then(function(json) {
				$scope.SIDMap = json.data["map"];

				deferred.resolve();
			}, function(message) {
				deferred.resolve();
			});
		}
	});
}])
.directive('simpleDraggable', ['ViewerService', function (ViewerService) {
	return {
		restrict: 'A',
		link: function link(scope, element, attrs) {
			angular.element(element).attr("draggable", "true");

			element.bind("dragend", function (event) {
				// For some reason event.clientX is offset by the
				// width of other screens for a multi-screen set-up.
				var dragEndX = event.clientX - screen.availLeft;
				var dragEndY = event.clientY;

				var pickObj = ViewerService.pickPoint(dragEndX, dragEndY);

				scope.currentSelected = pickObj.pickObj._xmlNode;
				scope.pickedPos       = pickObj.pickPos;

				scope.newIssue();
			});
		}
	};
}]);

