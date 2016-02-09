/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
	"use strict";

	angular.module("3drepo")
		.config(bid4freeWorkspaceConfig)
		.run(bid4freeWorkspaceRun);

	bid4freeWorkspaceConfig.$inject = ['$stateProvider', 'parentStates'];

	function bid4freeWorkspaceConfig($stateProvider, parentStates) {
		var states = parentStates.bid4freeWorkspace;

		for (var i = 0; i < states.length; i++) {
			$stateProvider
				.state(states[i] + '.bid4freeWorkspace', {
					url: '/:bid4freeWorkspace',
					resolve: {
						auth: function (Auth) {
							return Auth.init();
						},
						init: function(StateManager, $stateParams) {
							StateManager.setStateVar("branch", "master");
							StateManager.setStateVar("revision", "head");
							StateManager.setState($stateParams, {});
							StateManager.refresh("bid4freeWorkspace");
						}
					},
					views: {
						"@" : {
							templateUrl: 'bid4freeWorkspacePage.html'
						}
					}
				});
		}
	}

	bid4freeWorkspaceRun.$inject = ['StateManager'];

	function bid4freeWorkspaceRun (StateManager) {
		StateManager.registerPlugin('bid4freeWorkspace', 'Bid4freeWorkspaceData', function () {
			if (StateManager.state.bid4freeWorkspace) {
				return "bid4freeWorkspace";
			}
			else {
				return null;
			}
		});

		StateManager.setClearStateVars("bid4freeWorkspace", ["bid4freeWorkspace"]);
	}
}());
