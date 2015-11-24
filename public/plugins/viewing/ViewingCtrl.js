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
        .controller('ViewingCtrl', ViewingCtrl);

    ViewingCtrl.$inject = ["$scope", "ViewerService"];

    function ViewingCtrl ($scope, ViewerService) {
        var vw = this;
        vw.currentViewing = 0;
        vw.viewings = [
            {icon: "fa-mouse-pointer", mode: "TURNTABLE"},
            {icon: "fa-arrows", mode: "HELICOPTER"},
            {icon: "fa-child", mode: "WALK"},
   	    {icon: "fa-home", mode: "HOME"},
            {icon: "fa-eye", mode: "EYE"}
        ];

        vw.setCurrentViewing = function(index) {

			if (vw.viewings[index].mode === "HOME") {
				ViewerService.defaultViewer.showAll();

				var navModeIndex = vw.viewings.map(function(item) {
					return item.mode;
				}).indexOf(ViewerService.defaultViewer.nav.type);

				vw.currentViewing = navModeIndex;
			} else if (vw.viewings[index].mode === "EYE") {
                ViewerService.defaultViewer.revealAll();
            } else {
				vw.currentViewing = index;
	            ViewerService.defaultViewer.setNavMode(vw.viewings[index].mode);
			}
		};
    }
}());

