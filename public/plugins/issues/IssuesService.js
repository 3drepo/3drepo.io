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
.service('IssuesService', ['StateManager', 'Auth', 'serverConfig', '$http', '$q', '$rootScope', function(StateManager, Auth, serverConfig, $http, $q, $rootScope){
	var self            = this;

	self.issues         = {};
	self.issueContents  = {};
	self.loadingPromise = null;
	self.loading        = false;
	self.pinPosition    = [];
	self.io             = io(serverConfig.chatHost, {path :  serverConfig.chatPath});

	// TODO: Should do some basic checking on the socket information here.
	self.io.on("new_issue", function(data) {
		if (!self.issues[data.project])
				self.issues[data.project] = {};

		if (!self.issues[data.project][data._id])
		{
			self.issues[data.project][data._id] = data;
			$rootScope.$apply();
		}
	});

	self.io.on("post_comment", function(data) {
		if (!self.issueContents[data._id])
			self.issueContents[data._id] = [];

		self.issueContents[data._id].push(data);
		$rootScope.$apply();
	});

	self.prepareIssue = function(issue)
	{
		if (!("comments" in issue))
			issue["comments"] = [];

		if (issue["complete"])
			issue["deadlineString"] = "Complete";
		else
			issue["deadlineString"] = ((new Date(issue["deadline"])).toDateString());

		return issue;
	}

	self.newIssue = function(account, project, name, pickedPos, sid, deadline)
	{
		var deferred = $q.defer();
		var newIssueObject = {};

		newIssueObject["name"]     = name
		newIssueObject["deadline"] = deadline;

		if (pickedPos) newIssueObject["pickedPos"] = pickedPos.toGL();

		// Get the shared ID of the current object to attach the comment to
		var issuePostURL = serverConfig.apiUrl(account + "/" + project + "/issues/" + sid);

		$.ajax({
			type:	"POST",
			url:	issuePostURL,
			data: {"data" : JSON.stringify(newIssueObject)},
			dataType: "json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				// Construct issue object to place in the menu
				newIssueObject["_id"]      = data["issue_id"];
				newIssueObject["account"]  = account;
				newIssueObject["project"]  = project;
				newIssueObject["owner"]    = Auth.username;
				newIssueObject["parent"]   = sid;
				newIssueObject["number"]   = data["number"];

				newIssueObject = self.prepareIssue(newIssueObject);

				if (!self.issues[project])
					self.issues[project] = {};

				self.issues[project][newIssueObject["_id"]] = newIssueObject;
				self.io.emit("new_issue", newIssueObject);

				$rootScope.$apply();
				deferred.resolve();
			}
		});

		return deferred.promise;
	}

	self.postComment = function(account, project, id, sid, comment)
	{
		var deferred = $q.defer();
		var issuePostURL = serverConfig.apiUrl(account + "/" + project + "/issues/" + sid);

		var issueObject = {
			_id: id,
			comment: comment
		};

		$.ajax({
			type:	"POST",
			url:	issuePostURL,
			data: {"data" : JSON.stringify(issueObject)},
			dataType: "json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				issueObject["owner"]    = Auth.username;

				if (!self.issueContents[data.issue_id])
					self.issueContents[data.issue_id] = [];

				self.issueContents[data.issue_id].push(issueObject);

				issueObject["account"] = account;
				issueObject["project"] = project;

				self.io.emit("post_comment", issueObject);

				deferred.resolve();
			}
		});

		return deferred.promise;
	}

	self.getIssue = function(account, project, id)
	{
		if (!(id in self.issueContents))
		{
			var deferred = $q.defer();
			var baseUrl = serverConfig.apiUrl(account + '/' + project + '/issue/' + id + '.json');

			$http.get(baseUrl)
			.then(function(json) {
				self.issueContents[id] = json.data[0]["comments"];

				// Tell the chat server that we want
				// updates to this issue posted to us
				self.io.emit("open_issue", { project: project, account: account, issue_id: id });

				deferred.resolve();
			}, function(message) {
				deferred.resolve();
			});

			return deferred.promise;
		} else {
			return $q.when();
		}
	}

	self.getIssueStubs = function()
	{
		var account = StateManager.state.account;
		var project = StateManager.state.project;

		var baseUrl = serverConfig.apiUrl(account + '/' + project + '/issues.json');

		if (!self.loading)
		{
			var deferred = $q.defer();

			self.loadingPromise = deferred.promise;
			self.loading        = true;

			self.issues = {};

			$http.get(baseUrl)
			.then(function(json) {
				for(var i = 0; i < json.data.length; i++)
				{
					var issue = self.prepareIssue(json.data[i]);

					if (!self.issues[issue["project"]])
						self.issues[issue["project"]] = {};

					self.issues[issue["project"]][issue["_id"]] = issue;

					if (!issue["complete"] && issue["position"])
					{
						var pinObj = {
							id:       issue["id"],
							position: issue["position"]
						};

						self.pinPosition.push(pinObj);
					}
				}

				// Tell the chat server that we want updates to this project
				self.io.emit("watch_project", { account: account, project: project });
				self.loading      = false;
				deferred.resolve();
			}, function(message) {
				self.loading      = false;
				deferred.resolve();
			});
		}

		return self.loadingPromise;
	}
}]);

