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
.config([
'$stateProvider',
'$locationProvider',
'parentStates',
function($stateProvider, $locationProvider, parentStates) {
	var states = parentStates["inspect"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider.state(states[i] + '.inspect', {
			url: '/inspect',
			resolve: {
				init : function(StateManager) { StateManager.refresh("inspect"); }
			}
		});
	}
}])
.controller('InspectCtrl', ['$scope', 'StateManager', 'ViewerService', '$window', '$modal', '$timeout', function($scope, StateManager, ViewerService, $window, $modal, $timeout)
{
	$scope.defaultViewer = ViewerService.defaultViewer;
	$scope.cameraSwitch  = false;

	$scope.startInspect = function()
	{
		StateManager.setStateVar('inspect', true);
		StateManager.updateState();
	}

	$scope.whereAmI = function()
	{
		$modal.open({
			templateUrl: "cameramodal.html",
			backdrop: false
		});

		cameraSwitch = true;
	}

	$scope.gotcha = function(event)
	{
		debugger;
	}

	$scope.decodeCanvas = function(scope, element, callback)
	{
		var width  = element.videoWidth;
		var height = element.videoHeight;

		if (width && height) {
			if(!scope.canvas) {
				scope.canvas				= document.createElement('canvas');
				scope.canvas.id				= 'qr-canvas';
				scope.canvas.width			= width;
				scope.canvas.style.width	= width + "px";
				scope.canvas.height			= height;
				scope.canvas.style.height	= height + "px";

				element.appendChild(scope.canvas);
			}

			var ctx = scope.canvas.getContext("2d");
			ctx.clearRect(0,0, width, height);
			ctx.drawImage(element, 0, 0, width, height);

			try {
				return callback(null, qrcode.decode());
			} catch (err) {
				callback(err);
			}
		}

		$timeout(function() { $scope.decodeCanvas(scope, element, callback); }, 200);
	}

	$scope.captureQRCode = function(scope, element, callback)
	{
		// Initialize camera
		$window.navigator.webkitGetUserMedia({video: true}, function (videoStream) {
			element.src = $window.URL.createObjectURL(videoStream);

			$timeout(function() { $scope.decodeCanvas(scope, element, callback); }, 200);
		}, function(err) {
			callback(err);
		});
	}
}])
.factory('InspectData', function() {
	var o = {
		captureCamera : false
	};

	o.refresh = function () {
	};

	return o;
})
.directive('cameraSwitch', function ($window) {
	return {
		restrict: 'A',
		scope: {
			capture: '='
		},
		link: function link(scope, element, attrs) {
			if (attrs.cameraSwitch) {
				scope.capture(scope, element[0], function(err, res) {
					if(!err)
						$window.location.replace(res);
					else
						console.log("QRCode error: " + err);
				});
			}
		}
	}
})
.directive('simpleDraggable', ['ViewerService', function (ViewerService) {
	return {
		restrict: 'A',
		link: function link(scope, element, attrs) {
			angular.element(element).attr("draggable", "true");

			element.bind("dragend", function (event) {
				console.log(event.originalEvent.screenX + " " + event.originalEvent.screenY);
				var pickObj = ViewerService.pickPoint(event.originalEvent.screenX, event.originalEvent.screenY);

				debugger;
			});
		}
	};
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('inspect', 'InspectData', function () {
		if (StateManager.state.inspect)
			return "inspect";
		else
			return null;
	});

	StateManager.setClearStateVars("inspect", ["inspect"]);
}]);


