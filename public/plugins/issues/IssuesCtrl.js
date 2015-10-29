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
.controller('IssuesCtrl', ['$scope', '$modal', 'StateManager', 'IssuesService', '$rootScope', '$http', '$q', 'serverConfig', 'ViewerService', function($scope, $modal, StateManager, IssuesService, $rootScope, $http, $q, serverConfig, ViewerService)
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

	$scope.expanded         = $scope.IssuesService.expanded;

	$(document).on("objectSelected", function(event, object, zoom) {
		$scope.objectIsSelected = !(object === undefined);

		if (object !== undefined) {
			$scope.selectedID  		= object.getAttribute("DEF");
		} else {
			$scope.selectedID = undefined;

			if (!object.hasOwnProperty("fake")) {
				$scope.selectedID  		= object.getAttribute("DEF");
			}
		}
	});

	$(document).on("partSelected", function(event, part, zoom) {
		$scope.objectIsSelected = !(part === undefined);

		$scope.IssuesService.mapPromise.then(function () {
			$scope.selectedID       = $scope.IssuesService.IDMap[part.partID];
		});
	});

	$scope.openIssue = function(issue)
	{
		// Tell the chat server that we want updates
		$scope.IssuesService.getIssue(issue["account"], issue["project"], issue["_id"]);
		$scope.newComment.text = "";

		var newPos = issue["viewpoint"]["position"];
		var newViewDir = issue["viewpoint"]["view_dir"];
		var newUpDir = issue["viewpoint"]["up"];

		ViewerService.defaultViewer.setCamera(newPos, newViewDir, newUpDir);

		/*
		if (issue["viewpoint"]["clippingPlanes"])
			if (issue["viewpoint"]["clippingPlanes"].length)
				ViewerService.defaultViewer.setClippingPlanes(issue["viewpoint"]["clippingPlanes"]);
		*/

		if (!$scope.expanded[issue["_id"]])
			$(document).trigger("pinClick", { fromViewer : false, object: $("#" + issue["_id"])[0] });
		else
			$(document).trigger("pinClick", { fromViewer : false, object: null } );
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

	$scope.drawPin = function()
	{
		if ($scope.currentSelected)
			$scope.IssuesService.drawPin($scope.pickedPos, $scope.pickedNorm, $scope.currentSelected._xmlNode);
	}

	$scope.newIssue = function()
	{
		if ($scope.selectedID)
		{
			var modalInstance = $modal.open({
				templateUrl: 'newissuemodal.html',
				controller: 'DialogCtrl',
				backdrop: false,
				resolve: {
					params: {
						name: "",
						pickedObj: $scope.pickedObj
					}
				}
			});

			modalInstance.result.then(function (params) {
				var account = StateManager.state.account;
				var project = StateManager.state.project;
				var sid 	= $scope.selectedID;

				position = $scope.pickedPos;

				// For a normal, transpose is the inverse of the inverse transpose :)
				norm = $scope.pickedNorm;

				$scope.IssuesService.newIssue(account, project, params.name, sid, position, norm, sid);
			}, function () {
				// TODO: Error here
			});
		}
	}

	$scope.$watchGroup(['StateManager.state.branch', 'StateManager.state.revision'], function () {
		var account		= StateManager.state.account;
		var project		= StateManager.state.project;

		if (account !== undefined && project !== undefined) {
			return $scope.IssuesService.getIssueStubs();
		} else {
			return(Promise.resolve("Undefined Account and Project"));
		}
	});
}])
.directive('simpleDraggable', ['ViewerService', function (ViewerService) {
	return {
		restrict: 'A',
		link: function link(scope, element, attrs) {
			angular.element(element).attr("draggable", "true");

			/*
			element.bind("dragstart", function (event) {
				scope.viewArea = ViewerService.defaultViewer.getViewArea();
				scope.scene    = scope.viewArea._scene;
				scope.ctx      = scope.scene._nameSpace.doc.ctx;

				var gl = scope.ctx.ctx3d;
				var mat_view      = scope.viewArea._last_mat_view;
				var mat_scene     = scope.viewArea._last_mat_scene;

				scope.ps = scope.scene._webgl.pickScale;

				// Already scale by pickScale
				scope.sceneWidth  = scope.scene._webgl.fboPick.width;
				scope.sceneHeight = scope.scene._webgl.fboPick.height;

				// remember correct scene bbox
				var min = x3dom.fields.SFVec3f.copy(scope.scene._lastMin);
				var max = x3dom.fields.SFVec3f.copy(scope.scene._lastMax);
				// get current camera position
				var from = mat_view.inverse().e3();

				// get bbox of scene bbox and camera position
				var _min = x3dom.fields.SFVec3f.copy(from);
				var _max = x3dom.fields.SFVec3f.copy(from);

				if (_min.x > min.x) { _min.x = min.x; }
				if (_min.y > min.y) { _min.y = min.y; }
				if (_min.z > min.z) { _min.z = min.z; }

				if (_max.x < max.x) { _max.x = max.x; }
				if (_max.y < max.y) { _max.y = max.y; }
				if (_max.z < max.z) { _max.z = max.z; }

				// temporarily set scene size to include camera
				scope.scene._lastMin.setValues(_min);
				scope.scene._lastMax.setValues(_max);

				// get scalar scene size and adapted projection matrix
				scope.sceneSize = scope.scene._lastMax.subtract(scope.scene._lastMin).length();
				scope.cctowc = scope.viewArea.getCCtoWCMatrix();

				// restore correct scene bbox
				scope.scene._lastMin.setValues(min);
				scope.scene._lastMax.setValues(max);

				//scope.ctx.renderPickingPass(gl, scope.scene, mat_view, mat_scene, from, scope.sceneSize, 0, 0, 0, scope.sceneWidth, scope.sceneHeight);

				var t = scope.ctx.pickRect(scope.viewArea, 0, 0, scope.sceneWidth / scope.ps, scope.sceneHeight / scope.ps);

				console.log(mat_view);
				console.log(mat_scene);

				scope.pixelData = scope.scene._webgl.fboPick.pixelData.slice(0);
			}),

			element.bind("drag", function (event) {
				var dragEndX = event.clientX;
				var dragEndY = event.clientY;

				//console.log("DX: " + dragEndX + " DY: " + dragEndY);

	            var pickPos = new x3dom.fields.SFVec3f(0, 0, 0);
		        var pickNorm = new x3dom.fields.SFVec3f(0, 0, 1);

				var index = 0;
				var pixelOffset = 1.0 / scope.scene._webgl.pickScale;
				var denom = 1.0 / 256.0;
				var dist, line, lineoff, right, up;

				var pixelIndex = (dragEndY * scope.sceneWidth + dragEndX) * scope.ps;
				var rightPixel = pixelIndex + 1;
				var topPixel   = pixelIndex + scope.sceneWidth;

				var pixelData      = scope.pixelData.slice(pixelIndex * 4, (pixelIndex + 1) * 4);
				var rightPixelData = scope.pixelData.slice(rightPixel * 4, (rightPixel + 1) * 4);
				var topPixelData   = scope.pixelData.slice(topPixel * 4, (topPixel + 1) * 4);

				//console.log(pixelData.toString());
				//console.log(rightPixelData.toString());
				//console.log(topPixelData.toString());

				var objId = pixelData[index + 3] + 256 * pixelData[index + 2];

				dist = (pixelData[index    ] / 255.0) * denom +
				       (pixelData[index + 1] / 255.0);

				line = scope.viewArea.calcViewRay(dragEndX, dragEndY, scope.cctowc);

				console.log("DIST: " + dist + " LINE: " + line);

				pickPos = line.pos.add(line.dir.multiply(dist * scope.sceneSize));

				// get right pixel
				dist = (rightPixelData[index    ] / 255.0) * denom +
				       (rightPixelData[index + 1] / 255.0);

				lineoff = scope.viewArea.calcViewRay(dragEndX + pixelOffset, dragEndY, scope.cctowc);

				right = lineoff.pos.add(lineoff.dir.multiply(dist * scope.sceneSize));
				right = right.subtract(pickPos).normalize();

				// get top pixel
				dist = (topPixelData[index    ] / 255.0) * denom +
				       (topPixelData[index + 1] / 255.0);

				lineoff = scope.viewArea.calcViewRay(dragEndX, dragEndY - pixelOffset, scope.ctowc);

				up = lineoff.pos.add(lineoff.dir.multiply(dist * scope.sceneSize));
				up = up.subtract(pickPos).normalize();

				pickNorm = right.cross(up).normalize();
				var pickObj = x3dom.nodeTypes.Shape.idMap.nodeID[objId];

				console.log("PN: " + pickNorm.toGL());
				console.log("PP: " + pickPos.toGL());

				scope.currentSelected = pickObj;
				scope.pickedPos       = pickPos;
				scope.pickedNorm      = pickNorm;

				scope.drawPin();
			}),
			*/

			element.bind("dragend", function (event) {
				// For some reason event.clientX is offset by the
				// width of other screens for a multi-screen set-up.
				// This only affects the dragend event.
				var dragEndX = event.clientX - screen.availLeft;
				var dragEndY = event.clientY;

				var pickObj = ViewerService.pickPoint(dragEndX, dragEndY);

				if (!pickObj.partID)
					scope.selectedID 		= pickObj.pickObj._xmlNode.getAttribute("DEF");
				else
					scope.selectedID		= scope.IssuesService.IDMap[pickObj.partID];

				scope.pickedPos       	= pickObj.pickPos;
				scope.pickedNorm      	= pickObj.pickNorm;

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

