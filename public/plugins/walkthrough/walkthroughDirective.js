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
		.directive("walkthrough", walkthroughVr);

	function walkthroughVr() {
		return {
			restrict: "EA",
			scope: {
				account: "@",
				project: "@",
				autoPlay: "@",
				animate: "@",
				fps: "@",
				rollerCoaster: "@"
			},
			template: "walkthrough.html",
			controller: WalkthroughCtrl,
			controllerAs: "wt",
			bindToController: true
		};
	}

	var DEFAULT_FRAMES_PER_SECOND = 30;
	var USER_CONTROL_WAIT         = 60000;
	
	WalkthroughCtrl.$inject = ["$scope", "$q", "$interval", "$timeout", "WalkthroughService", "EventService"];
	
	function WalkthroughCtrl($scope, $q, $interval, $timeout, WalkthroughService, EventService) {
		var wt = this;
		
		wt.initialized = false;
		
		// Animation login
		wt.frames = [];
		
		wt.loading       = null;
		wt.frame         = 0;
		wt.autoPlay      = angular.isDefined(wt.autoPlay) ? wt.autoPlay : false;
		
		wt.fps           = angular.isDefined(wt.fps) ? wt.fps : DEFAULT_FRAMES_PER_SECOND;

		wt.rollerCoaster = angular.isDefined(wt.rollerCoaster);
		wt.animate       = angular.isDefined(wt.animate);
		
		wt.currentWalkthrough = wt.autoPlay ? wt.autoPlay : -1;
		
		wt.recording   = [];
		
		wt.isPlaying   = false;
		wt.isRecording = false;
		
		wt.playInterval      = null;
		wt.recordingInterval = null;
		wt.userWatchDog      = null;

        wt.stop = function () {
			if (wt.isPlaying)
			{
				$interval.cancel(wt.playInterval);
				wt.isPlaying = false;
			}
        };
		
		wt.play = function() {
			if (!wt.initialized)
			{
				wt.initialized = true;
				wt.isPlaying = true;
				$timeout.cancel(wt.userWatchDog);
				
				// Loop through the viewer frames
				wt.frame = 0;
				wt.playInterval = $interval(wt.tickFunction, wt.msPerFrame);
				
			}
		};

		wt.startRecording = function () {
            if (wt.currentWalkthrough !== -1) {
                wt.isRecording = true;
                wt.recording = [];
                wt.recordingInterval = $interval(function () {
					var viewpointPromise = $q.defer();
					
					EventService.send(EventService.EVENT.VIEWER.GET_CURRENT_VIEWPOINT,
					{
						promise: viewpointPromise.promise
					});
					
					viewpointPromise.then(function (viewpoint) {
                    	wt.recording.push({
	                        position: viewpoint.position,
    	                    up: viewpoint.up,
        	                view_dir: viewpoint.view_dir
            	        });
					});
                }, wt.msPerFrame);
            }			
		};
		
		wt.stopRecording = function () {	
            wt.isRecording = false;
            $interval.cancel(wt.recordingInterval);
			
			WalkthroughService.saveRecording(wt.account, wt.project, wt.currentWalkthrough, wt.recording);
        };
			
		wt.tickFunction = function() {
			if (wt.loading) {
				wt.loading.then(function() {
					EventService.send(EventService.EVENT.VIEWER.SET_CAMERA,
					{
						position:          wt.frames[wt.frame].position,
						up:                wt.frames[wt.frame].up,
						view_dir:          wt.frames[wt.frame].view_dir,
						rollerCoasterMode: wt.rollerCoaster,
						animate:           wt.animate
					});

					if (wt.frame === (wt.numFrames - 1)) {
						wt.frame = 0;
					}
					else {
						wt.frame += 1;
					}
				});
			}
		};

		/*
		wt.loadFrames = function () {
			var url = "/public/plugins/walkthroughVr/" + wt.account + "/" + wt.project + "/frames.csv";
			
			wt.loading = $q.defer();
			// Get the exported frames
			$http.get(url)
				.then(function (response) {
					var lines, line,
						i, length;
						
					wt.frames = [];

					// Convert the frames to viewer frames
					lines = response.data.split("\n");
					lines.splice(lines.length - 1);
					for(i = 0, length = lines.length; i < length; i += 1) {
						line = lines[i].split(",");
						wt.frames.push({
							position: [parseFloat(line[0]), parseFloat(line[2]), -1 * parseFloat(line[1])],
							view_dir: [parseFloat(line[3]), parseFloat(line[5]), -1 * parseFloat(line[4])],
							up: [parseFloat(line[6]), parseFloat(line[8]), -1 * parseFloat(line[7])]
						});
					}

					wt.numFrames = wt.frames.length;
					wt.loading.resolve();
			});			
		};*/
		
		// Button control logic
		wt.recordButtonClass = "btn walkthroughButton btn-success";

        wt.record = function () {
            if (wt.currentWalkthrough !== -1) {
                if (wt.isRecording) {
                    wt.stopRecording();
                    wt.recordButtonClass = "btn walkthroughButton btn-success";
                }
                else {
                    wt.startRecording();
                    wt.recordButtonClass = "btn walkthroughButton btn-danger";
                }
            }
        };

        wt.userInControl = function () {
            wt.stop();
			
			$interval.cancel(wt.userWatchDog);
			wt.userWatchDog = $timeout(function () {
				wt.play();
			}, USER_CONTROL_WAIT);
        };

        wt.setCurrentWalkthrough = function (index) {
            wt.currentWalkthrough = index;
			wt.loading = WalkthroughService.getWalkthroughs(wt.account, wt.project, index);
        };
		
		// If the account changes then re-load the frames
		$scope.$watchGroup(["account", "project"], function() {
			wt.currentWalkthrough = 0;
			wt.loading = WalkthroughService.getWalkthroughs(wt.account, wt.project);
			//wt.play();
		});
		
		$scope.$watch(["fps"], function (newFPS) {
			wt.fps = newFPS;
			wt.msPerFrame = Math.floor(1000.0 / wt.fps);
		});
		
		$scope.$on("$destroy", function handler() {
			wt.stop();
		});
		
		wt.setCurrentWalkthrough(wt.currentWalkthrough);
	}
}());