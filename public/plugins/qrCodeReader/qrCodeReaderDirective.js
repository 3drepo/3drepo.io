/**
 *  Copyright (C) 2015 3D Repo Ltd
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

	angular.module("3drepo")
		.directive("qrCodeReader", qrCodeReader)
		.directive('qrCodeCameraSwitch', qrCodeCameraSwitch);

	function qrCodeReader() {
		return {
			restrict: "EA",
			scope: {},
			controller: QrCodeReaderCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	QrCodeReaderCtrl.$inject = ["$scope", "$mdDialog", "EventService", "QrCodeReaderService"];

	function QrCodeReaderCtrl($scope, $mdDialog, EventService, QrCodeReaderService) {
		var vm = this;
		$scope.captureQRCode = QrCodeReaderService.captureQRCode;
		$scope.cameraOn = QrCodeReaderService.cameraOn;

		$scope.$watch(EventService.currentEvent, function (event) {
			if (event.type === EventService.EVENT.SHOW_QR_CODE_READER) {
				$scope.cameraOn.status = true;
				$mdDialog.show({
					controller: qrCodeReaderDialogController,
					templateUrl: 'qrCodeReaderDialog.html',
					parent: angular.element(document.body),
					targetEvent: event,
					clickOutsideToClose:true,
					fullscreen: true,
					scope: $scope,
					preserveScope: true,
					onRemoving: removeDialog
				});
			}
		});

		$scope.closeDialog = function() {
			$scope.cameraOn.status = false;
			$mdDialog.cancel();
		};

		function removeDialog () {
			$scope.closeDialog();
		}

		function qrCodeReaderDialogController($scope) {
		}
	}

	function qrCodeCameraSwitch () {
		return {
			restrict: 'A',
			scope: {
				capture: '='
			},
			link: function link(scope, element, attrs) {
				if (attrs.qrCodeCameraSwitch === "true") {
					scope.capture(scope, element[0], function(err, res) {
						if(!err) {
							window.location.replace(res);
						}
						else {
							console.log("QRCode error: " + err);
						}
					});
				}
			}
		};
	}
}());