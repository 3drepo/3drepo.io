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
        .service('WalkthroughService', WalkthroughService);

    WalkthroughService.$inject = ["$interval", "$timeout", "$http", "ViewerService", "StateManager", "serverConfig"];

    function WalkthroughService($interval, $timeout, $http, ViewerService, StateManager, serverConfig) {
        var defaultViewer = ViewerService.defaultViewer,
            recordingInterval = null,
            playingInterval = null,
            position = 0,
            recording = false,
            playing = false,
            walkthroughs = new Array(5),
            currentWalkthrough = -1,
            state = StateManager.state,
            userControlTimeout = null,
            inUserControl = false;

        function getWalkthroughData(index) {
            var url = "/" + state.account + "/" + state.project + "/" + index + "/walkthrough.json",
                i = 0,
                length = 0;

            $http.get(serverConfig.apiUrl(url))
                .then(function(data) {
                    for (i = 0, length = data.data.length; i < length; i++) {
                        walkthroughs[data.data[i].index] = data.data[i].cameraData;
                    }
                });
        }
        getWalkthroughData("all");

        var startRecording = function () {
            var viewpoint = {};
            if (currentWalkthrough !== -1) {
                recording = true;
                walkthroughs[currentWalkthrough] = [];
                recordingInterval = $interval(function () {
                    viewpoint = defaultViewer.getCurrentViewpointInfo();
                    walkthroughs[currentWalkthrough].push({
                        position: viewpoint.position,
                        up: viewpoint.up,
                        view_dir: viewpoint.view_dir
                    });
                }, 250);
            }
        };

        var stopRecording = function () {
            var postUrl = "/" + state.account + "/" + state.project + "/walkthrough";

            recording = false;
            $interval.cancel(recordingInterval);

            $http.post(serverConfig.apiUrl(postUrl), {index: currentWalkthrough, cameraData: walkthroughs[currentWalkthrough]})
                .then(function(json) {
                    //console.log(json);
                });
        };

        var play = function () {
            var numCameraPositions = 0;

            if ((currentWalkthrough !== -1) && angular.isDefined(walkthroughs[currentWalkthrough])) {
                numCameraPositions = walkthroughs[currentWalkthrough].length;
                playing = true;
                playingInterval = $interval(function () {
                    defaultViewer.updateCamera(
                        walkthroughs[currentWalkthrough][position].position,
                        walkthroughs[currentWalkthrough][position].up,
                        walkthroughs[currentWalkthrough][position].view_dir
                    );
                    if (position === (numCameraPositions - 1)) {
                        position = 0;
                    }
                    else {
                        position += 1;
                    }
                }, 500);
            }
        };

        var stop = function () {
            playing = false;
            $interval.cancel(playingInterval);
            $timeout.cancel(userControlTimeout);
        };

        var userInControl = function () {
            if (playing) {
                $interval.cancel(playingInterval);
                $timeout.cancel(userControlTimeout);
                userControlTimeout = $timeout(function () {
                    play();
                }, 60000);
            }
        };

        var isRecording = function () {
            return recording;
        };

        var setCurrentWalkthrough = function(index) {
            currentWalkthrough = index;
            stop();
            // Go to the start position of the selected walkthrough if it exists
            if (angular.isDefined(walkthroughs[currentWalkthrough])) {
                position = 0;
                play();
            }
            else {
                getWalkthroughData(currentWalkthrough);
            }
        };

        var getCurrentWalkthrough = function () {
            return currentWalkthrough;
        };

        var getWalkthroughs = function () {
            return walkthroughs;
        };

        return {
            isRecording: isRecording,
            startRecording: startRecording,
            stopRecording: stopRecording,
            play: play,
            stop: stop,
            userInControl: userInControl,
            setCurrentWalkthrough: setCurrentWalkthrough,
            getCurrentWalkthrough: getCurrentWalkthrough,
            getWalkthroughs: getWalkthroughs
        };
    }
}());
