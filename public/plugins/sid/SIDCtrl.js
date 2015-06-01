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
	var states = parentStates["sid"];

	for(var i = 0; i < states.length; i++) {
		$stateProvider
		.state(states[i] + '.sid', {
			url: '/:sid',
			resolve: {
				init: function(StateManager, $stateParams) {
					StateManager.setState($stateParams, {});
					StateManager.refresh('sid');
				}
			}
		});
	}
}])
.run(['StateManager', function(StateManager) {
	StateManager.registerPlugin('sid', 'SIDData', function () {
		if (StateManager.state.sid)
			return "sid";
		else
			return null;
	});

	StateManager.setClearStateVars("sid", ["sid"]);
}]);

