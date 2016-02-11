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
		.config(bid4FreeConfig)
		.run(bid4FreeRun);

	bid4FreeConfig.$inject = ['$stateProvider', 'parentStates'];

	function bid4FreeConfig($stateProvider, parentStates) {
		var states = parentStates.bid4free;

		for (var i = 0; i < states.length; i++) {
			$stateProvider
				.state(states[i] + '.bid4free', {
					url: '/bid4free',
					resolve: {
						auth: function (Auth) {
							return Auth.init();
						},
						init: function(StateManager, $stateParams) {
							StateManager.setStateVar("branch", "master");
							StateManager.setStateVar("revision", "head");
							StateManager.setState($stateParams, {});
							StateManager.refresh("bid4free");
						}
					},
					views: {
						"@" : {
							templateUrl: 'bid4free.html'
						}
					}
				});
		}
	}

	bid4FreeRun.$inject = ['StateManager'];

	function bid4FreeRun (StateManager) {
		StateManager.registerPlugin('bid4free', 'Bid4FreeData', function () {
			if (StateManager.state.bid4free) {
				return "bid4free";
			}
			else {
				return null;
			}
		});

		StateManager.setClearStateVars("bid4free", ["bid4free"]);
	}
}());
