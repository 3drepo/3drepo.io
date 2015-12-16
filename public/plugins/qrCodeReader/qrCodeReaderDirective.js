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
		.directive('cameraSwitchNew', function () {
			return {
				restrict: 'A',
				scope: {
					capture: '='
				},
				link: function link(scope, element, attrs) {
					if (attrs["cameraSwitchNew"] === "true") {
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
		});


	function qrCodeReader() {
		return {
			restrict: "EA",
			scope: {},
			controller: QrCodeReaderCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	QrCodeReaderCtrl.$inject = ["$scope", "$mdDialog", "EventService", "CameraService"];

	function QrCodeReaderCtrl($scope, $mdDialog, EventService, CameraService) {
		var vm = this;
		vm.CameraService = CameraService;
		vm.captureQRCode = vm.CameraService.captureQRCode;

		$scope.$watch(EventService.currentEvent, function (event) {
			if (event.type === EventService.EVENT.SHOW_QR_CODE_READER) {
				vm.CameraService.cameraSwitch = true;
				$mdDialog.show({
					controller: qrCodeReaderDialogController,
					templateUrl: 'qrCodeReaderDialog.html',
					parent: angular.element(document.body),
					targetEvent: event,
					clickOutsideToClose:true,
					fullscreen: true
				});
			}
		});

		function qrCodeReaderDialogController($scope, $mdDialog) {
			$scope.cancel = function() {
				vm.CameraService.cameraSwitch = false;
				$mdDialog.cancel();
			};
		}
	}
}());