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

    angular.module("3drepo")
        .controller('WalkthroughCtrl', WalkthroughCtrl);

    WalkthroughCtrl.$inject = ["WalkthroughService"];

    function WalkthroughCtrl (WalkthroughService) {
        var wt = this;
        wt.recordButtonClass = "btn walkthroughButton btn-success";
        wt.walkthroughs = WalkthroughService.getWalkthroughs();
        wt.currentWalkthrough = WalkthroughService.getCurrentWalkthrough();

        wt.record = function () {
            if (wt.currentWalkthrough !== -1) {
                if (WalkthroughService.isRecording()) {
                    WalkthroughService.stopRecording();
                    wt.recordButtonClass = "btn walkthroughButton btn-success";
                }
                else {
                    WalkthroughService.startRecording();
                    wt.recordButtonClass = "btn walkthroughButton btn-danger";
                }
            }
        };

        wt.play = function () {
            WalkthroughService.play();
        };

        wt.stop = function () {
            WalkthroughService.stop();
        };

        wt.userInControl = function () {
            WalkthroughService.userInControl();
        };

        wt.setCurrentWalkthrough = function (index) {
            WalkthroughService.setCurrentWalkthrough(index);
            wt.currentWalkthrough = WalkthroughService.getCurrentWalkthrough();
        };
    }
}());

