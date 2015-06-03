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
.service('IssuesService', ['StateManager', 'serverConfig', '$http', '$q', function(StateManager, serverConfig, $http, $q){
	var self = this;
	self.rootElement = null;
	self.issues = [];

	this.getObjectMetaData = function(object)
	{
		/*
		// TODO: Will break when the account is not same, as part
		// of a federation.
		var account = StateManager.state.account;

		var objectIDParts = object["id"].split("__");
		var project = objectIDParts[0];
		var uid = objectIDParts[1];

		var baseUrl = serverConfig.apiUrl(account + '/' + project + '/meta/' + uid + '.json');

		var deferred = $q.defer();

		self.metadocs = {};

		$http.get(baseUrl)
		.then(function(json) {
			var meta = json.data.meta;

			for(var i = 0; i < meta.length; i++)
			{
				var subtype = meta[i]["subtype"] ? meta[i]["subtype"] : "metadata";

				if (!self.metadocs[subtype])
					self.metadocs[subtype] = [];

				self.metadocs[subtype].push(meta[i]);
			}

			deferred.resolve();
		}, function(message) {
			deferred.resolve();
		});
		*/

		//Return dummy data

		self.issues = [
		{
			"number" : 1,
			"name" : "Sort out the pillar",
			"owner" : "jozef",
			"comments" : [
				{ "author" : "tim" , "text" : "Can I move to column to a pillar ?" },
				{ "author" : "jozef", "text" : "No, not yet." }
			]
		},
		{
			"number" : 2,
			"name" : "Tidy up that mess!!!",
			"owner" : "tim",
			"comments" : [
				{ "author" : "tim" , "text" : "What's that mess on the carpet ?" },
				{ "author" : "jozef", "text" : "I don't knoe" },
				{ "author" : "tim", "text" : "Sort it out" },
				{ "author" : "richard", "text" : "I concur"}
			]
		}
		];
	}
}]);

