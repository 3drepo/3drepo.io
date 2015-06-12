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
.service('CameraService', ['$window', '$timeout', function($window, $timeout) {
	var self = this;
	self.cameraSwitch	= false;
	self.source			= null;

	$window.MediaStreamTrack.getSources(function (srcs) {
		var videoSRCS = srcs.filter(function(item) { return item.kind == 'video'; });
		var source = null;

		if (videoSRCS.length > 1)
		{
			videoSRCS = videoSRCS.filter(function(item) { return (item.facing == 'environment'); });
		}

		if (!videoSRCS.length)
		{
			callback("No valid cameras found");
		}

		self.source = videoSRCS[0];
	});

	this.decodeCanvas = function(scope, element, callback)
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
				if (!self.cameraSwitch)
				{
					if (self.videoStream)
						self.videoStream.stop();

					return callback(err);
				}

				callback(err);
			}
		}

		$timeout(function() { self.decodeCanvas(scope, element, callback); }, 200);
	}

	this.captureQRCode = function(scope, element, callback)
	{
		$window.navigator.getUserMedia = $window.navigator.getUserMedia || $window.navigator.webkitGetUserMedia || $window.navigator.mozGetUserMedia;

		var constraints = {
			video: {
				optional: [{
					sourceId: self.source.id
				}]
			}
		};

		// Initialize camera
		$window.navigator.getUserMedia(constraints, function (videoStream) {
			element.src = $window.URL.createObjectURL(videoStream);

			self.videoStream = videoStream;
			$timeout(function() { self.decodeCanvas(scope, element, callback); }, 200);
		}, function(err) {
			callback(err);
		});
	}
}])
.controller('HeaderCtrl', ['$scope', 'pageConfig', 'Auth', '$modal', '$timeout', '$window', 'CameraService', function($scope, pageConfig, Auth, $modal, $timeout, $window, CameraService){
	$scope.Auth = Auth;
	$scope.user = { username: "", password: ""};
	$scope.goDefault = pageConfig.goDefault;
	$scope.CameraService = CameraService;
	$scope.captureQRCode = $scope.CameraService.captureQRCode;

	$scope.logOut = function()
	{
		Auth.logout().then(function _logoutCtrlLogoutSuccess() {
			$scope.errorMessage = null;
			pageConfig.goDefault();
		}, function _logoutCtrlLogoutFailure(reason) {
			$scope.errorMessage = reason;
			pageConfig.goDefault();
		});
	}

	$scope.$on("notAuthorized", function(event, message) {
		pageConfig.goDefault();
	});

	$scope.whereAmI = function()
	{
		$scope.CameraService.cameraSwitch = true;

		var modalInstance = $modal.open({
			templateUrl: "cameramodal.html",
			controller: "DialogCtrl",
			backdrop: false,
			resolve: {
				params: {}
			}
		});

		modalInstance.result.then(function(params) {},
		function() {
			$scope.CameraService.cameraSwitch = false;
		});
	}

}])
.directive('cameraSwitch', function () {
	return {
		restrict: 'A',
		scope: {
			capture: '='
		},
		link: function link(scope, element, attrs) {
			if (attrs["cameraSwitch"] == "true") {
				scope.capture(scope, element[0], function(err, res) {
					if(!err)
						$window.location.replace(res);
					else
						console.log("QRCode error: " + err);
				});
			}
		}
	}
});
