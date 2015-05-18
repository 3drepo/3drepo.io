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
.controller('DiffSelectorCtrl', ['$scope', 'StateManager', 'DiffViewerService', function($scope,  StateManager, DiffViewerService){
	$scope.diffEnabled = false;

	$scope.setDiffBranch = function(branch) {
		StateManager.setStateVar("diffbranch", branch);
		StateManager.updateState();

		$scope.diffEnabled = true;
	}

	$scope.setDiffRevision = function(rev) {
		StateManager.setStateVar("diffrevision", rev.name);
		StateManager.updateState();

		$scope.diffEnabled = true;
	}

	$scope.toggleDiff = function() {
		if (!$scope.diffEnabled)
		{
			$scope.diffEnabled = true;
			StateManager.setStateVar("diffbranch", "master");
			StateManager.setStateVar("diffrevision", "head");
			StateManager.updateState();
		} else {
			$scope.diffEnabled = false;
			StateManager.setStateVar("diffbranch", null);
			StateManager.setStateVar("diffrevision", null);
			StateManager.updateState();
		}
	}

	$scope.$watchGroup(['state.project'], function () {
		// If the project is changed then we need to reset
		// the diff viewer
		if (!StateManager.state.diffbranch) {
			$scope.diffEnabled = false;
		} else {
			$scope.diffEnabled = true;
		}

		DiffViewerService.switchDiff($scope.diffEnabled);
	});

	$scope.$watchGroup(['state.diffbranch', 'state.diffrevision'], function() {
		DiffViewerService.switchDiff($scope.diffEnabled);

		if ($scope.diffEnabled)
		{
			DiffViewerService.loadModel();
			DiffViewerService.diffViewer.setNavMode("TURNTABLE");
		}
	});
}]);


