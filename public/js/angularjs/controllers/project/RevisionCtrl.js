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

	$scope.setRevision = function(rev) {
		var o = {
			branch: Data.branch,
			rid:	rev.name,
			view:	Data.view
		};

		$window.viewer.loadURL(serverConfig.apiUrl(Data.account + '/' + Data.project + '/revision/' + rev.name + '.x3d.src'))
		refreshTree(Data.account, Data.project, Data.branch, rev.name);

		$state.go('main.revision.view', o);
	}

	$scope.setDiff = function (rev) {
		$window.otherView.loadURL(serverConfig.apiUrl(Data.account + '/' + Data.project + '/revision/' + rev.name + '.x3d.src'));

		var baseUrl = serverConfig.apiUrl(Data.account + '/' + Data.project + '/revision/' + Data.revision + '/diff/' + rev.name + '.json');

		//var deferred = $q.defer();

		$http.get(baseUrl, { withCredentials : true})
		.then(function(json) {
			var diffColors = {
				added:		json.data["added"],
				modified:	json.data["modified"],
				deleted:	json.data["deleted"]
			};

			viewer.setDiffColors(diffColors, true);
			otherView.setDiffColors(diffColors, false);
		});
	}

	$scope.$watch('Data.diffEnabled', function () {
		if (Data.diffEnabled)
			viewer.diffView();
	});

}]);


