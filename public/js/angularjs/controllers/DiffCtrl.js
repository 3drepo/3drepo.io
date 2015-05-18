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
.config([
'$stateProvider',
'parentStates',
function($stateProvider, parentStates) {
	var states = parentStates["diff"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider
		.state(states[i] + '.diffbranch', {
			url: '/diff/branch/:diffbranch/head',
			resolve: {
				init: function(StateManager, $stateParams) {
					StateManager.setState($stateParams, {});
					StateManager.refresh('diff');
				}
			}
		})
		.state(states[i] + '.diffrevision', {
			url: '/diff/revision/:diffrevision',
			resolve: {
				init: function(StateManager, $stateParams) {
					StateManager.setState($stateParams, {});
					StateManager.refresh('diff');
				}
			}
		});
	}
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('diff', 'DiffData', function () {
		if (!StateManager.state.diffrevision && StateManager.state.diffbranch)
			StateManager.state.diffrevision = 'head';

		if (StateManager.state.diffbranch && (StateManager.state.diffrevision == 'head'))
			return "diffbranch";
		else if (StateManager.state.diffrevision)
			return "diffrevision";
		else
			return null;
	});

	StateManager.setClearStateVars("diffrevision", ["diffrevision"]);
	StateManager.setClearStateVars("diffbranch", ["diffbranch"]);
}]);

/*
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

*/
