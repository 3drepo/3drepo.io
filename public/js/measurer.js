/**x3dmouselink
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
var app = angular.module('3drepoapp'); 

app.controller('MeasurerCtrl', ['$scope', 'navigation', 'x3dlink', 'x3dmouselink', function($scope, navigation, x3dlink, x3dmouselink) {
	$scope.startPoint   = {x: 0.0, y: 0.0, z: 0.0};
	$scope.endPoint     = {x: 0.0, y: 0.0, z: 0.0};
	$scope.visible      = false;
	$scope.toggleMeasure = false;
	x3dmouselink.add_listener($scope);
	x3dlink.add_listener($scope);

	$scope.clicked_callback = function(id, event) {
		if ($scope.toggleMeasure)
		{
			// If invisible, then start a new line
			if(!$scope.visible){
				$scope.set_start_point(event.worldX, event.worldY, event.worldZ);
				$scope.set_end_point(event.worldX, event.worldY, event.worldZ);

				event.target.onmouseover = x3dmouselink.mouseover_callback();
				event.target.onmousemove = x3dmouselink.mousemove_callback();

				$scope.visible = true;
			}
			else{
				$scope.visible = false;
			}
		}
	};

	$scope.mouseover_callback = function(event) {
		// That forces the scope to refresh with async events
		// See http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
		$scope.$apply(
			function(){
				$scope.set_end_point(event.worldX, event.worldY, event.worldZ);
			});
	};

	$scope.mousemove_callback = function(event) {
		// That forces the scope to refresh with async events
		// See http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
		$scope.$apply(
			function(){
				$scope.set_end_point(event.worldX, event.worldY, event.worldZ);
			});
	};

	$scope.set_start_point = function(x, y, z){
		$scope.startPoint.x = x;
		$scope.startPoint.y = y;
		$scope.startPoint.z = z;
	}

	$scope.set_end_point = function(x, y, z){
		$scope.endPoint.x = x;
		$scope.endPoint.y = y;
		$scope.endPoint.z = z;
	}

	$scope.pointString = function(){
		var s = "";
		s += $scope.startPoint.x + " " + $scope.startPoint.y + " " + $scope.startPoint.z + ",";
		s += $scope.endPoint.x + " " + $scope.endPoint.y + " " + $scope.endPoint.z;
		return s;
	}

	$scope.render = function(){
		return $scope.toggleMeasure && $scope.visible;
	}

	$scope.distance = function(){
		return Math.sqrt( Math.pow($scope.endPoint.x - $scope.startPoint.x, 2) + 	
											Math.pow($scope.endPoint.y - $scope.startPoint.y, 2) + 
											Math.pow($scope.endPoint.z - $scope.startPoint.z, 2) );
	}

	$scope.$on('toggleMeasure', function(e) {
		$scope.toggleMeasure = !$scope.toggleMeasure;

		if ($scope.toggleMeasure)
			navigation.change_cursor("crosshair");
		else
			navigation.change_cursor("default");
	});
}]);

