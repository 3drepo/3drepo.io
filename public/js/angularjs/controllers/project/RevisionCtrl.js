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
.controller('RevisionCtrl', ['$scope', 'Data', 'serverConfig', '$window', '$q', '$http', '$state', function($scope,  Data, serverConfig, $window, $q, $http, $state){
	$scope.Data = Data;

	// Initialize to true so we load at least
	// once at the start
	$scope.refreshViewer	= true;
	$scope.refreshDiffView	= true;

	$scope.setBranch = function(branch) {
		Data.setStateVar("branch", branch);
		Data.refresh();
	}

	$scope.setRevision = function(rev) {
		Data.setStateVar("revision", rev.name);
		if(Data.changed.revision)
			$scope.refreshViewer = false;

		Data.updateState();
	}

	$scope.setDiffBranch = function(branch) {
		Data.setStateVar("diffBranch", branch);
		Data.refresh();
	}

	$scope.setDiff = function (rev) {
		Data.setStateVar("diffRevision", rev.name);
		if(Data.changed.diffRevision)
			$scope.refreshDiffView = false;

		Data.updateState();
	}

	$scope.toggleDiff = function() {
		if (Data.state.diffEnabled) {
			Data.setStateVar("diffBranch", null);
			Data.setStateVar("diffRevision", null);
			Data.setStateVar("diffEnabled", false);
			Data.refresh();
			Data.updateState();
		} else {
			Data.setStateVar("diffBranch", Data.state.branch);
			Data.setStateVar("diffRevision", Data.state.revision);
			Data.setStateVar("diffEnabled", true);
			Data.refresh();
			Data.updateState();
		}
	}

	$scope.$watchGroup(['Data.state.diffEnabled', 'Data.state.diffBranch', 'Data.state.diffRevision'], function () {
		viewerManager.diffView(Data.state.diffEnabled);

		if (Data.state.diffEnabled)
		{
			if($scope.refreshDiffView)
			{
				viewerManager.loadURL("diffView", Data.state.account, Data.state.project, Data.state.diffBranch, Data.state.diffRevision);

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

				viewer.setDiffColors(diffColors, true);
				otherView.setDiffColors(diffColors, false);
				otherView.disableClicking();
			});
		}
	});

	$scope.$watchGroup(['Data.state.branch', 'Data.state.revision'], function() {
		if($scope.refreshViewer)
		{
			viewerManager.loadURL("viewer", Data.state.account, Data.state.project, Data.state.branch, Data.state.revision);

			$scope.refreshViewer = false;
		}

		refreshTree(Data.state.account, Data.state.project, Data.state.branch, Data.state.revision);
	});


}]);


