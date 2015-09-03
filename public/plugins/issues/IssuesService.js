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
	var self            = this;

	self.issues         = [];
	self.loadingPromise = null;
	self.loading        = false;
	self.loadedObject   = -1;

	this.getPinPositions = function(object, refresh)
	{

	}

	this.getIssueStubs = function(object, refresh)
	{
		if (!object)
		{
			var account = StateManager.state.account;
			var project = StateManager.state.project;
		} else {
			debugger;
		}

		if (object)
			var sid = object.getAttribute("DEF");
		else
			var sid = null;

		if (sid)
			var baseUrl = serverConfig.apiUrl(account + '/' + project + '/issues/' + sid + '.json');
		else
			var baseUrl = serverConfig.apiUrl(account + '/' + project + '/issues.json');

		if (!self.loading && (!(self.loadedObject == sid) || refresh))
		{
			var deferred = $q.defer();

			self.loadingPromise = deferred.promise;
			self.loading        = true;
			self.loadedObject   = sid;

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

				self.loading = false;
				deferred.resolve();
			}, function(message) {
				self.loading      = false;
				self.loadedObject = null;  // Loading of object failed
				deferred.resolve();
			});
		} else {
			if (sid != self.loadedObject)
			{
				self.loadingPromise.then(function (res) {
					self.getObjectIssues(object);
				});
			}
		}

	}
}]);

