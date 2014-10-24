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

var app = angular.module('3drepoapp', ['ui.event', 'ui.router']);

app.factory('X3DController', ['$rootScope', function($rootScope) {
    var x3dmessage = {};

    x3dmessage.id = '';
    x3dmessage.obj = {};

    x3dmessage.setBroadcast = function(id, obj, msg) {
        this.id = id;
        this.obj = obj;
        this.msg = msg;
        this.broadcast();
    };

    x3dmessage.broadcast = function() {
        $scope.$broadcast('x3dbroadcast');
    };

    return x3dmessage;
}]);

app.controller("x3dBasicController", ['$scope', 'X3DController', function($scope, X3DController) {
	$scope.obj_object = null;
	
	$scope.pickObject = function(obj)
	{
		if ($scope.old_object)
			$($scope.old_object).attr('emissiveColor', "0 0 0");

		$(obj).children('appearance').children('material').attr('emissiveColor', '1.0 0.5 0');
		$scope.old_object = obj;
	}
	
	$scope.x3donclick = function(event) {
        var id = event.target.id;
        var obj = event.target;
        var msg = "onclick";

		$scope.pickObject(obj);
		
        X3DController.setBroadcast(id, obj, msg);
    }
}]);

