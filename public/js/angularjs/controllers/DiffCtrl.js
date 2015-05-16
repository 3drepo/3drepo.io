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
.controller('DiffCtrl', ['$scope', 'StateManager', 'serverConfig', '$q', '$http', 'Branches', 'CurrentBranch', 'CurrentRevision', 'ViewerService', function($scope,  StateManager, serverConfig, $q, $http, Branches, CurrentDiffBranch, CurrentDiffRevision, ViewerService){
	// Initialize to true so we load at least
	// once at the start
	$scope.refreshDiffView	= true;

	$scope.setDiffBranch = function(branch) {
		StateManager.setStateVar("diffBranch", branch);
		StateManager.updateState();
	}

	$scope.setDiff = function (rev) {
		StateManager.setStateVar("diffRevision", rev.name);
		if(StateManager.changed.diffRevision)
			$scope.refreshDiffView = false;

		StateManager.updateState();
	}

	$scope.toggleDiff = function() {
		if (StateManager.state.diff) {
			StateManager.setStateVar("diffBranch", null);
			StateManager.setStateVar("diffRevision", null);
			StateManager.setStateVar("diffEnabled", false);
			StateManager.refresh();
			StateManager.updateState();
		} else {
			StateManager.setStateVar("diffBranch", Data.state.branch);
			StateManager.setStateVar("diffRevision", Data.state.revision);
			StateManager.setStateVar("diffEnabled", true);
			StateManager.refresh();
			StateManager.updateState();
		}
	}

	$scope.$watchGroup(['Data.state.diffEnabled', 'Data.state.diffBranch', 'Data.state.diffRevision'], function () {
		viewerManager.diffView(Data.state.diffEnabled);

		if (StateManager.state.diff)
		{
			if($scope.refreshDiffView)
			{
				/*
				var diffHandle = viewerManager.getHandleByName("diffView");
				viewerManager.loadURL(diffHandle, Data.state.account, Data.state.project, Data.state.diffBranch, Data.state.diffRevision);
				*/

				viewerManager.loadModel();

				$scope.refreshDiffView = false;
			}

			var baseUrl = serverConfig.apiUrl(Data.state.account + '/' + Data.state.project + '/revision/' + Data.state.revision + '/diff/' + Data.state.diffRevision + '.json');

			$http.get(baseUrl, { withCredentials : true})
			.then(function(json) {
				var diffColors = {
					added:		json.data["added"],
					modified:	json.data["modified"],
					deleted:	json.data["deleted"]
				};

				viewerManager.setDiffColors(diffColors);
			});
		} else {
			$scope.refreshDiffView = true; // Ready for when it's re-enabled
		}
	});

}]);


