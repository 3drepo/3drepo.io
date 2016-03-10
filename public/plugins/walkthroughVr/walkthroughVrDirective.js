/**
 *  Copyright (C) 2016 3D Repo Ltd
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
		.directive("walkthroughVr", walkthroughVr);

	function walkthroughVr() {
		return {
			restrict: "EA",
			scope: {
				account: "@",
				project: "@"
			},
			controller: WalkthroughVrCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	WalkthroughVrCtrl.$inject = ["$scope", "$q", "$http", "$interval", "EventService"];

	function WalkthroughVrCtrl($scope, $q, $http, $interval, EventService) {
		var vm = this;
		
		vm.initialized = false;
		vm.frames = [];
		
		vm.loading = null;
		vm.frame = 0;
		
		var FRAMES_PER_SECOND = 30;
		var MILLISECONDS_PER_FRAME = Math.floor(1000 / FRAMES_PER_SECOND);

		vm.tickFunction = function() {
			vm.loading.promise.then(function() {
				EventService.send(EventService.EVENT.VIEWER.SET_CAMERA,
				{
					position: vm.frames[vm.frame].position,
					up:       vm.frames[vm.frame].up,
					view_dir: vm.frames[vm.frame].view_dir,
					rollerCoasterMode: true,
					animate: false
				});

				if (vm.frame === (vm.numFrames - 1)) {
					vm.frame = 0;
				}
				else {
					vm.frame += 1;
				}
			});
		};

		vm.startWalkthrough = function() {
			if (!vm.initialized)
			{
				vm.initialized = true;

				// Loop through the viewer frames
				vm.frame = 0;
				vm.intervalPromise = $interval(vm.tickFunction, MILLISECONDS_PER_FRAME);
			}
		};

		vm.loadFrames = function () {
			var url = "/public/plugins/walkthroughVr/" + vm.account + "/" + vm.project + "/frames.csv";
			
			vm.loading = $q.defer();
			// Get the exported frames
			$http.get(url)
				.then(function (response) {
					var lines, line,
						i, length;
						
					vm.frames = [];

					// Convert the frames to viewer frames
					lines = response.data.split("\n");
					lines.splice(lines.length - 1);
					for(i = 0, length = lines.length; i < length; i += 1) {
						line = lines[i].split(",");
						vm.frames.push({
							position: [parseFloat(line[0]), parseFloat(line[2]), -1 * parseFloat(line[1])],
							view_dir: [parseFloat(line[3]), parseFloat(line[5]), -1 * parseFloat(line[4])],
							up: [parseFloat(line[6]), parseFloat(line[8]), -1 * parseFloat(line[7])]
						});
					}

					vm.numFrames = vm.frames.length;
					vm.loading.resolve();
			});			
		};
		
		$scope.$watchGroup(["account", "project"], function(newValue) {
			vm.loadFrames();
			vm.startWalkthrough();
		});
		
		$scope.$on("$destroy", function handler() {
			$interval.cancel(vm.intervalPromise);
		});
	}
}());