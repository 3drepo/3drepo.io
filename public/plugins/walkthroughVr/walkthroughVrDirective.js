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
			scope: {},
			controller: WalkthroughVrCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	WalkthroughVrCtrl.$inject = ["$http", "$interval", "EventService"];

	function WalkthroughVrCtrl($http, $interval, EventService) {
		var vm = this;

		// Get the exported frames
		$http.get("/public/plugins/walkthroughVr/frames.csv")
			.then(function (response) {
				var lines, line,
					i, length,
					frames = [], frame, numFrames;

				// Convert the frames to viewer frames
				lines = response.data.split("\n");
				lines.splice(lines.length - 1);
				for(i = 0, length = lines.length; i < length; i += 1) {
					line = lines[i].split(",");
					frames.push({
						position: [parseFloat(line[0]), parseFloat(line[2]), -1 * parseFloat(line[1])],
						view_dir: [parseFloat(line[3]), parseFloat(line[5]), -1 * parseFloat(line[4])],
						up: [parseFloat(line[6]), parseFloat(line[8]), -1 * parseFloat(line[7])]
					});
				}
				//console.log(frames);

				// Loop through the viewer frames
				frame = 0;
				numFrames = frames.length;
				$interval(function () {
					//console.log(frames[frame].position);
					EventService.send(EventService.EVENT.VIEWER.SET_CAMERA,
					{
						position: frames[frame].position,
						up:       frames[frame].up,
						view_dir: frames[frame].view_dir,
						animate: false
					});

					if (frame === (numFrames - 1)) {
						frame = 0;
					}
					else {
						frame += 1;
					}
				}, 33);
				
			});
	}
}());