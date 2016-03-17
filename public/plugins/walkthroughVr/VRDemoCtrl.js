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

(function() {
	"use strict";
	
	angular.module("3drepo")
	.controller("VRDemoCtrl", ["$scope", function($scope)
	{
		$scope.showMenu = true;
		$scope.demoOne  = false;
		$scope.demoTwo  = false;
		
		$scope.goDemoOne = function($event) {
			$scope.showMenu = false;
			$scope.demoOne = true;
			$scope.demoTwo = false;
			
			$event.preventDefault();
		};
		
		$scope.goDemoTwo = function($event) {
			$scope.showMenu = false;
			$scope.demoOne = false;
			$scope.demoTwo = true;
			
			$event.preventDefault();			
		};
		
		$scope.backToMenu = function() {
			if (!document.webkitIsFullScreen && !document.msFullscreenElement && !document.mozFullScreen) {
				$scope.showMenu = true;
				$scope.demoOne = false;
				$scope.demoTwo = false;
			}			
		};
		
		document.addEventListener("webkitfullscreenchange", $scope.backToMenu, false);
		document.addEventListener("mozfullscreenchange", $scope.backToMenu, false);
		document.addEventListener("fullscreenchange", $scope.backToMenu, false);
		document.addEventListener("MSFullscreenChange", $scope.backToMenu, false);
	}]);
}());