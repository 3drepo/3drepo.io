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
	$scope.objectIsSelected = false;
	$scope.currentSelected  = null;
	$scope.mapPromise       = null;
	$scope.map              = {};

	$scope.IssuesService    = IssuesService;
	$scope.chat_updated     = $scope.IssuesService.updated;

	// Has to be a sub-object to tie in with Angular ng-model
	$scope.newComment       = {};
	$scope.newComment.text  = "";

	$scope.pickedPos        = null;
	$scope.pickedNorm       = null;

	$(document).on("objectSelected", function(event, object, zoom) {
		$scope.objectIsSelected = !(object === undefined);
		$scope.currentSelected  = object;
	});

	$scope.locateObject = function(id) {
		var issueIdx = $scope.IssuesService.issues.map(function (obj) { return obj._id; }).indexOf(id);

		if (issueIdx > -1)
		{
			var objectID = $scope.IssuesService.issues[issueIdx].parent;

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

	$scope.openIssue = function(issue)
	{
		// Tell the chat server that we want updates
		$scope.IssuesService.getIssue(issue["account"], issue["project"], issue["_id"]);
		$scope.newComment.text = "";
	}

	$scope.addNewComment = function(issue)
	{
		$scope.IssuesService.postComment(issue["account"], issue["project"], issue["_id"], issue["parent"], $scope.newComment.text).then(function () {
			setTimeout(function() {
				$scope.$apply();
			},0);
		});

		$scope.newComment.text = "";
	}

	$scope.complete = function(issue)
	{
		var issueObject = {
			_id: issue.id,
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
			var account = StateManager.state.account;
			var project = StateManager.state.project;
			var sid = $scope.currentSelected.getAttribute("DEF");

			$scope.IssuesService.newIssue(account, project, params.name, $scope.pickedPos, $scope.pickedNorm, sid, (new Date()).getTime());
		}, function () {
			// TODO: Error here
		});
	}

	$scope.pinClick = function(event)
	{
		debugger;
	}

	$scope.pinOver = function()
	{
		return false;
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

				$scope.IssuesService.getIssueStubs().then( function()
					{
						deferred.resolve();
					}, function (message) {
						deferred.resolve();
					});
			}, function(message) {
				deferred.resolve();
			});

			return $scope.mapPromise;
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
				scope.pickedNorm      = pickObj.pickNorm;

				scope.newIssue();
			});
		}
	};
}]);
/*
.directive('floating', ['ViewerService', function (ViewerService) {
	return {
		restrict: 'AE',
		scope: true,
		link: function link(scope, elem, attrs) {
			scope.viewerWidth = $(ViewerService.defaultViewer.viewer).width();
			scope.viewerHeight = $(ViewerService.defaultViewer.viewer).height();
			scope.halfWidth = scope.viewerWidth / 2;

			scope.pinPosition = attrs["position"].split(",").map(function(item) { return parseFloat(item); });
			scope.divWidth  = $(elem).width();
			scope.divHeight = $(elem).height();

			scope.element = elem[0];

			ViewerService.ready.then(function () {
				ViewerService.defaultViewer.onViewpointChanged(
					function (origEvent, event) {
						var pinPosition2D = ViewerService.defaultViewer.runtime.calcPagePos(scope.pinPosition[0], scope.pinPosition[1], scope.pinPosition[2]);
						var leftCoord = (pinPosition2D[0] - (scope.divWidth / 2));

						scope.element.style.left = leftCoord + "px";
						scope.element.style.top  = (pinPosition2D[1] - (scope.divHeight / 2)) + "px";
					}
				);

				ViewerService.defaultViewer.onMouseDown( function () {
					scope.element.style["pointer-events"] = "none";
				});

				ViewerService.defaultViewer.onMouseUp( function () {
					scope.element.style["pointer-events"] = "auto";
				});
			});
		}
	};
}]);
*/

