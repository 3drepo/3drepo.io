/**
 *  Copyright (C) 2016 3D Repo Ltd
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

(function () {
	"use strict";

	angular.module('3drepo')
	.factory('BidData', ['$http', '$q', 'serverConfig', 'StateManager', function($http, $q, serverConfig, StateManager){
		var o = {
			project:		null,
			name:			"",
			owner:			"",
			description:	"",
			settings:		null
		};

		o.loading = false;
		o.loadingPromise = $q.defer();

		o.refresh = function() {
			var self = this;
			var account = StateManager.state.account;
			var project = StateManager.state.project;

			if(!self.loading)
			{
				if (project != self.project)
				{
					self.visibility = 'private';

					self.loading  = true;

					$http.get(serverConfig.apiUrl(account + '/' + project + '.json')).success(function(json, status) {
						self.name				= project;
						self.owner				= json.owner;
						self.description		= json.desc;
						self.type				= json.type;

						self.loading = false;
						self.settings = json.properties;
						self.loadingPromise.resolve();
					});
				} else {
					self.loadingPromise.resolve();
				}
			}

			return self.loadingPromise.promise;
		};

		return o;
	}]);
}());
