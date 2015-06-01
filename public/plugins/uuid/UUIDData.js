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
.factory('UUIDData', ['$http', '$q', 'serverConfig', 'StateManager', 'Branches', 'CurrentBranch', 'CurrentRevision', function($http, $q, serverConfig, StateManager, Branches, CurrentBranch, CurrentRevision){
	var o = {

	};

	o.refresh = function() {
		var self = this;
		var account = StateManager.state.account;
		var project = StateManager.state.project;
		var uuid    = StateManager.state.uuid;


		var branch		= StateManager.state.branch ? StateManager.state.branch : "master";
		var revision	= StateManager.state.revision ? StateManager.state.revision : "head";

		var url = null;

		if (revision == "head")
		{
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + branch + '/head/');
		} else {
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + revision + '/');
		}

		url += uuid + '.json';

		$http.get(url).success(function(json, status) {
			// Study the type of object

		});

		/*
		return $q.all([
			self.CurrentBranch.refresh(),
			self.CurrentRevision.refresh()
		]);
		*/

	}

	return o;
}]);

