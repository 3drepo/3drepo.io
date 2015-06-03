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
.controller('HeaderCtrl', ['$scope', 'pageConfig', 'Auth', '$modal', '$timeout', '$window', function($scope, pageConfig, Auth, $modal, $timeout, $window){
	$scope.Auth = Auth;
	$scope.user = { username: "", password: ""};
	$scope.goDefault = pageConfig.goDefault;

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

	$scope.cameraSwitch  = false;

	$scope.whereAmI = function()
	{
		$modal.open({
			templateUrl: "cameramodal.html",
			backdrop: false
		});

		cameraSwitch = true;
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
});
