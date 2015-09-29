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
.service('MetaService', ['StateManager', 'serverConfig', '$http', '$q', function(StateManager, serverConfig, $http, $q){
	var self			= this;

	self.rootElement		= null;
	self.metadocs			= {};
	self.loadingPromise		= null;
	self.loading			= false;
	self.currentLoadingID	= null;

	this.getObjectMetaData = function(object)
	{
		// TODO: Will break when the account is not same, as part
		// of a federation.
		var account = StateManager.state.account;

		var objectIDParts = object["id"].split("__");
		var project = objectIDParts[1];

		if (project == "model")
			project = StateManager.state.project;

		var uid = objectIDParts[2];
		var baseUrl = serverConfig.apiUrl(account + '/' + project + '/meta/' + uid + '.json');

		if (!self.loading)
		{
			self.loading = true;
			self.currentLoadingID = uid;
			var deferred = $q.defer();

			self.loadingPromise = deferred.promise;

			self.metadocs = {};

			$http.get(baseUrl)
			.then(function(json) {
				var meta = json.data.meta;

				for(var i = 0; i < meta.length; i++)
				{
					var subtype = meta[i]["mime"] ? meta[i]["mime"] : "metadata";

					if (!self.metadocs[subtype])
						self.metadocs[subtype] = [];

					var baseUrl = serverConfig.apiUrl(account + '/' + project + '/' + meta[i]["_id"] + '.pdf');

					meta[i].url = baseUrl;

					self.metadocs[subtype].push(meta[i]);
				}

				self.loading = false;
				self.currentLoadingID = null;
				deferred.resolve();
			}, function(message) {
				self.loading = false;
				self.currentLoadingID = null;
				deferred.resolve();
			});
		} else {
			if (uid != self.currentLoadingID)
			{
				self.loadingPromise.then(function (res) {
					self.getObjectMetaData(object);
				});
			}
		}
	}
}]);

