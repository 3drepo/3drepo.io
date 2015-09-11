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
.service('IssuesService', ['StateManager', 'Auth', 'serverConfig', '$http', '$q', '$rootScope', 'ViewerService', function(StateManager, Auth, serverConfig, $http, $q, $rootScope, ViewerService){
	var self            = this;

	self.issues         = {};
	self.issueContents  = {};
	self.loadingPromise = null;
	self.loading        = false;
	self.pinPositions   = [];
	self.pinNamespaces  = {};
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

	self.newIssue = function(account, project, name, pickedPos, pickedNorm, sid, deadline)
	{
		var deferred = $q.defer();
		var newIssueObject = {};

		newIssueObject["name"]     = name
		newIssueObject["deadline"] = deadline;

		if (pickedPos)
		{
			newIssueObject["position"] = pickedPos.toGL();
			newIssueObject["norm"]     = pickedNorm.toGL();
		}

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

				if (pickedPos)
				{
					var pinObj = {
						id:       newIssueObject["_id"],
						position: newIssueObject["position"],
						norm:     newIssueObject["norm"],
						parent:   newIssueObject["parent"]
					};

					self.pinPositions.push(pinObj);
					self.addPin(pinObj);
				}

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
							id:       issue["_id"],
							position: issue["position"],
							norm:     issue["norm"],
							parent:   issue["parent"]
						};

						self.pinPositions.push(pinObj);
					}
				}

				ViewerService.ready.then(function () {
					for(var i = 0; i < self.pinPositions.length; i++)
						self.addPin(self.pinPositions[i]);
				});

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

	self.addPin = function(pin)
	{
		var parentTrans = $("[DEF=" + pin["parent"] + "]")[0].parentNode;
		var pinNamespace = parentTrans._x3domNode._nameSpace.name;

		if (!self.pinNamespaces[pinNamespace])
			self.prepareX3DScene(pinNamespace, 0.25, 0.1, 1.0);

		self.pinPlacement = document.createElement("Transform");
		self.pinPlacement.setAttribute("translation", pin["position"].join(","));

		var axisAngle = ViewerService.defaultViewer.rotAxisAngle([0,1,0], pin["norm"]);
		self.pinPlacement.setAttribute("rotation", axisAngle.toGL().join(","));

		self.pinshapeinstan = document.createElement("Group");
		self.pinshapeinstan.setAttribute("USE", "pinshape");
		self.pinshapeinstan.setAttribute("render", true);
		self.pinPlacement.appendChild(self.pinshapeinstan);

		parentTrans.appendChild(self.pinPlacement);
	}

	self.prepareX3DScene = function(namespace, radius, scale, height)
	{
		var coneHeight = height + radius;
		var namespaceNode = $("[namespacename=" + namespace + "]")[0];

		self.pinNamespaces[namespace] = namespaceNode;

		self.pinshape = document.createElement("Group");
		self.pinshape.setAttribute("DEF", "pinshape");
		//self.pinshape.setAttribute("render", false);

		self.pinshapeapp = document.createElement("Appearance");
		self.pinshape.appendChild(self.pinshapeapp);

		self.pinshapemat = document.createElement("Material");
		self.pinshapemat.setAttribute("diffuseColor", "1.0 0.0 0.0");
		self.pinshapeapp.appendChild(self.pinshapemat);

		self.pinshapescale = document.createElement("Transform");
		self.pinshapescale.setAttribute("scale", scale + " " + scale + " " + scale);
		self.pinshape.appendChild(self.pinshapescale);

		self.pinshapeconetrans = document.createElement("Transform");
		self.pinshapeconetrans.setAttribute("translation", "0.0 " + (0.5 * height) + " 0.0");
		self.pinshapescale.appendChild(self.pinshapeconetrans);

		self.pinshapeconerot = document.createElement("Transform");
		self.pinshapeconerot.setAttribute("rotation", "1.0 0.0 0.0 3.1416");
		self.pinshapeconetrans.appendChild(self.pinshapeconerot);

		self.pinshapeconeshape = document.createElement("Shape");
		self.pinshapeconerot.appendChild(self.pinshapeconeshape);

		self.pinshapecone = document.createElement("Cone");
		self.pinshapecone.setAttribute("bottomRadius", radius);
		self.pinshapecone.setAttribute("height", coneHeight);

		var coneApp = self.pinshapeapp.cloneNode(true);

		self.pinshapeconeshape.appendChild(self.pinshapecone);
		self.pinshapeconeshape.appendChild(coneApp);

		self.pinshapeballtrans = document.createElement("Transform");
		self.pinshapeballtrans.setAttribute("translation", "0.0 " + coneHeight + " 0.0");
		self.pinshapescale.appendChild(self.pinshapeballtrans);

		self.pinshapeballshape = document.createElement("Shape");
		self.pinshapeballtrans.appendChild(self.pinshapeballshape);

		self.pinshapeball = document.createElement("Sphere");
		self.pinshapeball.setAttribute("radius", radius * 2.0);

		var ballApp = self.pinshapeapp.cloneNode(true);

		self.pinshapeballshape.appendChild(self.pinshapeball);
		self.pinshapeballshape.appendChild(ballApp);

		namespaceNode.childNodes[0].appendChild(self.pinshape);
	}
}]);

