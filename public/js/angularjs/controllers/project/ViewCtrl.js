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
.controller('ViewCtrl', ['$scope', 'Data', '$state', function($scope,  Data, $state){

	$scope.Data = Data;
	$scope.view = Data.view;
	$scope.possible_views = ["info", "comments", "revisions", "log", "settings"];

	$scope.pageChanged = function() {
		Data.updatePaginatedView($scope.view);
	};

	$scope.isView = function(view){
		return $scope.view == view;
	};

	$scope.go = function(v){
		var o = {view: v};

		var vw = $state.current.name;

		if (vw.substr(vw.length - 5) == ".view")
			$state.go($state.current.name, o);
		else
			$state.go($state.current.name + '.view', o);
	}

	// TODO: Move somewhere else
	$scope.checkViewIsValid = function(){
		if( $scope.possible_views.indexOf(Data.view) == -1 ){
			$state.go("404");
		}
	}

	$scope.setRevision = function(rev) {
		var o = {
			branch: Data.branch,
			rid:	rev.name,
			view:	$scope.view
		};

		$state.go('main.revision.view', o);
	}

	$scope.checkViewIsValid();

	$scope.pageChanged();

}]);

