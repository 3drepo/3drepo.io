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
.factory('CurrentDiffRevision', ['$http', '$q', 'serverConfig', 'StateManager', function($http, $q, serverConfig, StateManager){
	var o = {
		name:		"",
		shortName:	"",
		author:		"",
		date:		"",
		message:	"",
		branch:		""
	};

	o.refresh = function(account, project, branch, revision) {
		var self = this;
		var account		= StateManager.state.account;
		var project		= StateManager.state.project;
		var branch		= StateManager.state.branch;
		var revision	= StateManager.state.revision;

		var deferred = $q.defer();
		var baseUrl = "";

		if (revision == 'head')
			baseUrl = serverConfig.apiUrl(account + '/' + project + '/revision/' + branch + '/' + revision);
		else
			baseUrl = serverConfig.apiUrl(account + '/' + project + '/revision/' + revision);

		$http.get(baseUrl + '.json')
		.then(function(json) {
			self.revision	= json.data.revision;
			self.shortName	= json.data.revision.substr(0,20) + "...";
			self.author		= json.data.author;
			self.data		= json.data.date;
			self.message	= json.data.message;
			self.branch		= json.data.branch;

			deferred.resolve();
		}, function(message) {
			deferred.resolve();
		});

		return deferred.promise;
	};

	return o;
}]);

