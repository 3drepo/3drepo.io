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

var viewUrl = function ($stateParams)
{
	// Each view is associated with a template
	// However only a few views are possible
	// Check that we have a view that exists otherwise redirects to info
	var possible_views = ["info", "comments", "revisions", "log", "settings", "cobie"];
	var view = $stateParams.view;

	if( possible_views.indexOf(view) == -1 ){
		view = "info";
	}

	return view + '.html';
}

angular.module('3drepo')
.config([
'$stateProvider',
'parentStates',
function($stateProvider, parentStates) {
	var states = parentStates["view"];

	for(var i = 0; i < states.length; i++) {
		var newState = {
			url: '/:view',
			resolve: {
				auth: function authCheck(Auth) { return Auth.init(); },
				init: function(StateManager, $stateParams) {
					StateManager.setState($stateParams, {});
					StateManager.refresh("view");
				}
			},
			views: {}
		};

		newState.views['footer@' + states[i] + ".view"] =
		{
			templateUrl: viewUrl
		};

		$stateProvider.state(states[i] + '.view', newState);
	}
}])
.run(['$rootScope', 'parentStates', 'StateManager', function($rootScope, parentStates, StateManager) {
	StateManager.registerPlugin('view', 'ViewData',  function () {
		if (StateManager.state.view)
			return "view";
		else
			return null;
	});

	$rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
		var states = parentStates["view"];

		for(var i = 0; i < states.length; i++)
		{
			if (states[i] == toState.name)
			{
				StateManager.setStateVar('view', 'info');
				StateManager.updateState();
				break;
			}
		}
	  console.log('$stateChangeSuccess to '+toState.name+'- fired once the state transition is complete.');
	});
}])
.controller('ViewCtrl', ['$scope', 'StateManager', 'serverConfig', '$state', function($scope, StateManager, serverConfig, $state){
	$scope.view = StateManager.state.view;

	$scope.pageChanged = function() {
		StateManager.Data.ViewData.updatePaginatedView($scope.view);
	};

	$scope.go = function(v){
		var bp = $('#bottom-panel');

		if (bp.hasClass('collapsed')) {
			// if the bottom panel is collapsed and the tab was clicked, expand
			bp.removeClass('collapsed');
		} else if (v === $state.params.view) {
			// if the panel is expanded and the same view was clicked again, collapse
			bp.addClass('collapsed');
		}

		StateManager.setStateVar("view", v);
		StateManager.updateState();
	}


	$scope.pageChanged();
}]);

