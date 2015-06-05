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
	self.issues = [];

	this.getObjectIssues = function(object)
	{
		// TODO: Will break when the account is not same, as part
		// of a federation.
		var account = StateManager.state.account;
		var project = StateManager.state.project;

		if (object)
			var sid = object.getAttribute("DEF");
		else
			var sid = null;

		if (sid)
			var baseUrl = serverConfig.apiUrl(account + '/' + project + '/issues/' + sid + '.json');
		else
			var baseUrl = serverConfig.apiUrl(account + '/' + project + '/issues.json');

		var deferred = $q.defer();

		self.issues = {};

		$http.get(baseUrl)
		.then(function(json) {
			self.issues = [];

			for(var i = 0; i < json.data.length; i++)
			{
				var issue = json.data[i];

				if (!("comments" in issue))
					issue["comments"] = [];

				if (issue["complete"])
					issue["deadlineString"] = "Complete";
				else
					issue["deadlineString"] = ((new Date(issue["deadline"])).toDateString());

				self.issues.push(issue);
			}

			deferred.resolve();
		}, function(message) {
			deferred.resolve();
		});
	}
}]);

