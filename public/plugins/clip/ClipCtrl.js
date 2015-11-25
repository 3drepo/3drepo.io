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

angular.module('3drepo')
.controller('ClipCtrl', ['$scope', 'ViewerService', function($scope, ViewerService)
{
	$scope.sliderMaxValue = 1000.0;

	$scope.clipPlaneID = -1;
	$scope.slider = $scope.sliderMaxValue;

	$scope.pdf = {};

	$scope.addClipPlane = function()
	{
		// Create a clipping plane with default X
		$scope.clipPlaneID = ViewerService.defaultViewer.addClippingPlane("X");
	}

	$scope.changeAxis = function (axs)
	{
		ViewerService.defaultViewer.clearClippingPlanes();
		
		var clipPlane = ViewerService.defaultViewer.getClippingPlane($scope.clipPlaneID);

		// If there is no clipping plane then create one
		if (!clipPlane)
		{
			$scope.addClipPlane();
			clipPlane = ViewerService.defaultViewer.getClippingPlane($scope.clipPlaneID);
		}

		// Change to the selected axis
		clipPlane.changeAxis(axs);

		$scope.slider = $scope.sliderMaxValue;
	}

	$scope.$watch('slider', function() {
		var clipPlane = ViewerService.defaultViewer.getClippingPlane($scope.clipPlaneID);

		if (clipPlane)
			clipPlane.movePlane($scope.slider / $scope.sliderMaxValue);
	});

	$scope.openPDF = function(pdfURL) {
		$scope.pdfURL = pdfURL;

		var modalInstance = $modal.open({
			templateUrl: 'pdfviewer.html',
			controller: 'DialogCtrl',
			backdrop: false,
			size: 'lg',
			resolve: {
				params: function() {
					return {
						pdfURL: $scope.pdfURL
					};
				}
			}
		});
	}
}]);

