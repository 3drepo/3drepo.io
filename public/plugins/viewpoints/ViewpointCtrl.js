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
.controller('ViewpointCtrl', ['$scope', 'StateManager', 'ViewerService', '$modal', '$rootScope', function($scope, StateManager, ViewerService, $modal, $rootScope)
{
	$scope.ViewerService = ViewerService;
	$scope.viewpoints	 = ViewerService.defaultViewer.viewpoints;
	$scope.viewpointname = "";
	$scope.sid			 = "";

	$scope.showAll = function() {
		ViewerService.defaultViewer.showAll();
	}

	$scope.reset = function() {
		ViewerService.defaultViewer.reset();
	}

	$scope.flyThrough = function() {
		ViewerService.defaultViewer.flyThrough(ViewerService.defaultViewer.viewpoints);
	}

	$scope.setCurrentViewpoint = function(id)
	{
		ViewerService.defaultViewer.setCurrentViewpoint(id);
	}

	$scope.newViewpoint = function()
	{
		var modalInstance = $modal.open({
			templateUrl: 'newviewpointmodal.html',
			controller: 'DialogCtrl',
			backdrop: false,
			resolve: {
				params: {
					name: ""
				}
			}
		})

		modalInstance.result.then(function (params) {
			var thisViewer = ViewerService.defaultViewer;
			var viewpoint = thisViewer.getCurrentViewpointInfo();

			// Add this automatically to the root,
			// this may differ from that returned by the API server
			var rootTrans = $("#model__root")[0]._x3domNode.getCurrentTransform().inverse();

			viewpoint["name"] = params.name;
			if($scope.sid)
				viewpoint["shared_id"] = $scope.sid;

			var cameraPostURL = server_config.apiUrl(StateManager.state.account + "/" + StateManager.state.project + "/" + StateManager.state.branch + "/viewpoint");

			$.ajax({
				type:	"POST",
				url:	cameraPostURL,
				data: {"data" : JSON.stringify(viewpoint)},
				dataType: "json",
				xhrFields: {
					withCredentials: true
				},
				success: function(data) {
					console.log("Success: " + data);
				}
			});

		}, function () {
			debugger;
		});

	}

	$rootScope.$on("sidNotFound", function (event, args) {
		// Here the user tried to access an object that doesn't
		// exist, so the default behaviour is to record a viewpoint
		$scope.sid = args['uuid'];

		$modal.open({
			templateUrl:	'newviewpointinfomodal.html',
			controller:		'DialogCtrl',
			backdrop:		false,
			resolve: { params : {} }
		});
	});

	$scope.ok = function()
	{
		$modalInstance.close($scope.selected.item);
	}

	$scope.setViewerMode = function(mode)
	{
		defaultViewer.setNavMode(mode);
	}
}]);

