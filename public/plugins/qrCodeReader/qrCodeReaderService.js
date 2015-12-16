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

(function () {
	"use strict";

	angular.module('3drepo')
		.factory('QrCodeReaderService', QrCodeReaderService);

	QrCodeReaderService.$inject = ["$window", "$timeout"];

	function QrCodeReaderService($window, $timeout) {
		var cameraSwitch = false,
			source = null,
			videoStream = null;

		if ($window.MediaStreamTrack.getSources)
		{
			$window.MediaStreamTrack.getSources(function (srcs) {
				var videoSRCS = srcs.filter(function(item) { return item.kind === 'video'; });
				source = null;

				if (videoSRCS.length > 1)
				{
					videoSRCS = videoSRCS.filter(function(item) { return (item.facing === 'environment'); });
				}

				/*
				if (!videoSRCS.length)
				{
					callback("No valid cameras found");
				}
				*/

				source = videoSRCS[0];
			});
		}

		function decodeCanvas (scope, element, callback)
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
					if (!cameraSwitch)
					{
						if (videoStream) {
							videoStream.stop();
						}

						return callback(err);
					}

					callback(err);
				}
			}

			$timeout(function() {decodeCanvas(scope, element, callback);}, 200);
		}

		var captureQRCode = function(scope, element, callback)
		{
			$window.navigator.getUserMedia = $window.navigator.getUserMedia || $window.navigator.webkitGetUserMedia || $window.navigator.mozGetUserMedia;

			var constraints = {
				video: {
					optional: [{
						sourceId: source.id
					}]
				}
			};

			// Initialize camera
			$window.navigator.getUserMedia(constraints, function (mediaVideoStream) {
				element.src = $window.URL.createObjectURL(mediaVideoStream);

				videoStream = mediaVideoStream;
				$timeout(function() {decodeCanvas(scope, element, callback); }, 200);
			}, function(err) {
				callback(err);
			});
		};

		return {
			captureQRCode: captureQRCode
		};
	}
}());