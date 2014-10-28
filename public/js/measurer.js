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
var app = angular.module('3drepoapp'); 

app.controller('MeasurerCtrl', ['$scope', 'navigation', 'x3dlink', function($scope, navigation, x3dlink) {
	$scope.startPoint   = {x: 0.0, y: 0.0, z: 0.0};
	$scope.endPoint     = {x: 0.0, y: 0.0, z: 0.0};
	$scope.visible      = true;
	$scope.distance     = 0.0;
	$scope.isStartPoint = true;
	$scope.pointString  = "";
	$scope.renderFlag   = "true";
	$scope.toggleMeasure = false;

	x3dmouselink.add_listener($scope);
	x3dlink.add_listener($scope);

	$scope.togglePoint = function()
	{
		if ($scope.toggleMeasure)
		{
			$scope.isStartPoint = !$scope.isStartPoint;
			$scope.renderFlag = $scope.visible.toString();
		}
	}

	$scope.clicked_callback = function(id) {
		if ($scope.toggleMeasure)
		{
			$scope.togglePoint();
		}
	});

	$scope.mouseover_callback = function(event) {
		
	});

	$scope.mousemove_callback = function(event) {

	});

	$scope.updatePoint = function(event)
	{
		if(isStartPoint)
		{
			$scope.startPoint = [event.worldX, event.worldY, event.worldZ];
		} else {
			$scope.endPoint = [event.worldX, event.worldY, event.worldZ];
		}

		$scope.pointString += $scope.startPoint.x + " " + $scope.startPoint.y + " " + $scope.startPoint.z + ",";
		$scope.pointString += $scope.endPoint.x + " " + $scope.endPoint.y + " " + $scope.endPoint.z;

		$scope.distance = Math.sqrt( Math.pow($scope.endPoint.x - $scope.startPoint.x, 2) + 
				Math.sqrt(Math.pow($scope.endPoint.y - $scope.startPoint.y), 2) + 
				Math.sqrt(Math.pow($scope.endPoint.z - $scope.startPoint.z), 2));
	};

	$scope.$on('toggleMeasure', function(e) {
		$scope.toggleMeasure = !$scope.toggleMeasure;

		if ($scope.toggleMeasure)
			navigation.change_cursor("crosshair");
		else
			navigation.change_cursor("default");
	});
}]);

