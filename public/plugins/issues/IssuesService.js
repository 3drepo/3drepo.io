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

	self.draggedPin     = null;

	self.pinCoverage      = 15.0;
	self.pinRadius        = 0.25;
	self.pinHeight        = 1.0;

	self.currentOpenIssue = null;
	self.expanded         = {};

	var mapDeferred       = $q.defer();
	var mapResolved       = false;
	self.mapPromise       = mapDeferred.promise;

	/**
	 * Switch the collapsed status of an issue in the sidebar.
	 * @param {string} issueId = ID for the issue to switch (null to close everything)
	 */
	self.switchCollapse = function(issueId)
	{
		// Have we just clicked on the currently open issue
		// if so switch it to the other setting
		if (self.currentOpenIssue == issueId)
		{
			self.expanded[self.currentOpenIssue] = !self.expanded[self.currentOpenIssue];
		} else {
			// If there is a currently open issue then close it
			if (self.currentOpenIssue)
				self.expanded[self.currentOpenIssue] = false;

			// If there is an issue ID passed in then
			// make sure that it is opened. This is to deal
			// with a null parameter where everything should be closed.
			if (issueId)
			{
				self.currentOpenIssue = issueId;
				self.expanded[self.currentOpenIssue] = true;
			}
		}
	}

	/*
	 * When a pin is clicked that make sure the issue sidebar
	 * also reflects the updated state
	 * @listens pinClick
	 * @param {event} event - Originating event
	 * @param {object} clickInfo - Contains object and information about the source of the click
	 */
	$(document).on("pinClick", function (event, clickInfo) {
		// If there has been a pin selected then switch
		// that issue
		var issueId = clickInfo.object ? clickInfo.object["id"] : null;

		self.switchCollapse(issueId);

		if (clickInfo.fromViewer)
			$rootScope.$apply();
	});

	/*
	 * When a new_issue notification is received from chat server
	 * add the issue to the sidebar
	 * @todo: Should do some basic checking on the socket information here.
	 * @listens chat:new_issue
	 * @param {Object} data - Data received from the chat server
	 */
	self.io.on("new_issue", function(data) {
		// Create placeholder for issue
		if (!self.issues[data.project])
				self.issues[data.project] = {};

		// If issue doesn't exist already add the data
		// and tell the rootscope to apply
		if (!self.issues[data.project][data._id])
		{
			self.issues[data.project][data._id] = data;
			$rootScope.$apply();
		}
	});

	/**
	 * When a post_comment is received from chat server
	 * update the issue contents in the sidebar
	 * @listens chat:post_comment
	 * @param {Object} data - Data received from the chat server
	 */
	
	self.io.on("post_comment", function(data) {
		// Create placeholder for issue
		if (!self.issueContents[data._id])
			self.issueContents[data._id] = [];

		// Add received data to contents
		self.issueContents[data._id].push(data);
		$rootScope.$apply();
	});	

	/**
	 * Prepare and object by filling in placeholders and
	 * calculating deadline string.
	 * @param {Object} issue - Issue object to be prepared
	 */
	self.prepareIssue = function(issue)
	{
		if (!("comments" in issue))
			issue["comments"] = [];

		/*
		if (issue["complete"])
			issue["deadlineString"] = "Complete";
		else
			issue["deadlineString"] = ((new Date(issue["deadline"])).toDateString());
		*/

		return issue;
	}

	/**
	 * Create a new issue
	 * @param {string} account       - The account in which the project lies
	 * @param {string} project       - The project in which the issue lies
	 * @param {string} name          - The issue description/name/title
	 * @param {string} id            - The ID of the parent object
	 * @param {SFVec3f} [pickedPos]  - The pin position of the issue
	 * @param {SFVec3f} [pickedNorm] - The norm of the surface to which the pin is attached
	 */
	self.newIssue = function(account, project, name, id, pickedPos, pickedNorm)
	{
		var deferred = $q.defer();
		var newIssueObject = {};

		var currentVP = ViewerService.defaultViewer.getCurrentViewpointInfo();

		newIssueObject["name"]      = name
		newIssueObject["viewpoint"] = currentVP;
		newIssueObject["scale"] = 1.0;

		if (pickedPos)
		{
			newIssueObject["position"] = pickedPos.toGL();
			newIssueObject["norm"]     = pickedNorm.toGL();

			var vp = new x3dom.fields.SFVec3f(0.0,0.0,0.0);
			vp.setValueByStr(currentVP.position.join(' '));

			var pp = new x3dom.fields.SFVec3f();
			pp.setValueByStr(newIssueObject["position"].join(' '))

			var pn = new x3dom.fields.SFVec3f();
			pn.setValueByStr(newIssueObject["norm"].join(' '));

			pp = pp.add(pn.multiply(self.pinHeight));

			var dist = pp.subtract(vp).length();
			var pixelViewRatio = currentVP["unityHeight"] / ViewerService.defaultViewer.getViewArea()._height;
			var pinPixelSize = 2.0 * self.pinRadius / (pixelViewRatio * dist);
			var scale = self.pinCoverage / pinPixelSize;

			newIssueObject["scale"] = scale;
		}

		// Get the shared ID of the current object to attach the comment to
		var issuePostURL = serverConfig.apiUrl(account + "/" + project + "/issues/" + id);

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
				newIssueObject["parent"]   = data["parent"];
				newIssueObject["number"]   = data["number"];

				newIssueObject = self.prepareIssue(newIssueObject);

				// If there are no issues currently in this project
				// then create placeholder.
				if (!self.issues[project])
					self.issues[project] = {};

				self.issues[project][newIssueObject["_id"]] = newIssueObject; // Add issue to project list
				self.io.emit("new_issue", newIssueObject); // Tell the chat server.

				// If there is a position associated with the issue
				// then create the pin.
				if (pickedPos)
				{
					var pinObj = {
						id:       newIssueObject["_id"],
						position: newIssueObject["position"],
						norm:     newIssueObject["norm"],
						parent:   newIssueObject["parent"],
						scale:    newIssueObject["scale"]
					};

					self.draggedPin = null;
					self.pinPositions.push(pinObj);
					self.addPin(pinObj);
				}

				$rootScope.$apply();
				deferred.resolve();
			}
		});

		return deferred.promise;
	}

	self.drawPin = function(position, norm, parentTrans)
	{
		if (!self.draggedPin)
		{
			var pinObj = {
				parent: parentTrans.getAttribute("DEF"),
				position: position.toGL(),
				norm: norm.toGL()
			};

			self.draggedPin = self.addPin(pinObj);
		}

		var pinNamespace = parentTrans.parentNode._x3domNode._nameSpace.name;
		//var parentSize = parentTrans.parentNode._x3domNode._graph.volume.max.subtract(parentTrans.parentNode._x3domNode._graph.volume.min).length();
		var pinSize = parentSize / 10.0;

		if (!self.pinNamespaces[pinNamespace])
			self.prepareX3DScene(pinNamespace, 0.25, 0.1, 1.0);

		self.draggedPin.setAttribute("scale", pinSize + " " + pinSize + " " + pinSize);
		self.draggedPin.setAttribute("translation", position.toGL().join(","));

		var axisAngle = ViewerService.defaultViewer.rotAxisAngle([0,1,0], norm.toGL());
		self.draggedPin.setAttribute("rotation", axisAngle.toGL().join(","));
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
		var account  = StateManager.state.account;
		var project  = StateManager.state.project;
		var branch   = StateManager.state.branch;
		var revision = StateManager.state.revision;

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

					if (!self.issues[issue["project"]]) {
						self.issues[issue["project"]] = {};
					}

					self.issues[issue["project"]][issue["_id"]] = issue;

					if (!issue["complete"] && issue["position"])
					{
						var pinObj = {
							id:       issue["_id"],
							position: issue["position"],
							norm:     issue["norm"],
							scale:    issue["scale"],
							parent:   issue["parent"]
						};

						self.pinPositions.push(pinObj);
					}
				}

				if (revision == 'head' || (branch && !revision)) {
					var baseUrl = serverConfig.apiUrl(account + '/' + project + '/revision/' + branch + '/head/map.json');
				} else {
					var baseUrl = serverConfig.apiUrl(account + '/' + project + '/revision/' + revision + '/map.json');
				}

				ViewerService.ready.then(function () {
					for(var i = 0; i < self.pinPositions.length; i++)
					{
						self.addPin(self.pinPositions[i]);
					}
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
		/*
		var parentTrans = $("[DEF=" + pin["parent"] + "]")[0].parentNode;
		var pinNamespace = parentTrans._x3domNode._nameSpace.name;
		var parentSize = parentTrans._x3domNode._graph.volume.max.subtract(parentTrans._x3domNode._graph.volume.min).length();
		var pinSize = parentSize / 10.0;
		*/

		var sceneBBox = ViewerService.defaultViewer.scene._x3domNode.getVolume();
		var sceneSize = sceneBBox.max.subtract(sceneBBox.min).length();
		var pinSize   = sceneSize / 20;

		//if (!self.pinNamespaces[pinNamespace])
		//	self.prepareX3DScene(pinNamespace, 0.25, 0.1, 1.0);

		var pinPlacement = document.createElement("Transform");

		//pinPlacement.setAttribute("scale", pinSize + " " + pinSize + " " + pinSize);

		var position = new x3dom.fields.SFVec3f(pin["position"][0], pin["position"][1], pin["position"][2]);

		// Transform the pin into the coordinate frame of the parent
		//position = parentTrans._x3domNode.getCurrentTransform().multMatrixVec(position);
		pinPlacement.setAttribute("translation", position.toString());

		var norm = new x3dom.fields.SFVec3f(pin["norm"][0], pin["norm"][1], pin["norm"][2]);

		// Transform the normal into the coordinate frame of the parent
		//norm = parentTrans._x3domNode.getCurrentTransform().inverse().transpose().multMatrixVec(norm);
		var axisAngle = ViewerService.defaultViewer.rotAxisAngle([0,1,0], norm.toGL());

		pinPlacement.setAttribute("rotation", axisAngle.toString());

		/*
		var pinshapeinstan = document.createElement("Group");
		pinshapeinstan.setAttribute("USE", "pinshape");
		pinshapeinstan.setAttribute("render", true);
		pinPlacement.appendChild(pinshapeinstan);
		*/

		//var zdist = Math.abs(ViewerService.defaultViewer.getCurrentViewpoint()._x3domNode._vf.position.z - pin["position"][2]);

		self.createPinShape(pinPlacement, pin["id"], self.pinRadius, self.pinHeight, pinSize);
		$("#model__root")[0].appendChild(pinPlacement);

		return pinPlacement;
	}

	self.createPinShape = function(parent, id, radius, height, scale)
	{
		var coneHeight = height - radius;
		var pinshape = document.createElement("Group");
		pinshape.setAttribute("id", id);

		pinshape.setAttribute('onclick', 'clickPin(event)');

		var pinshapeapp = document.createElement("Appearance");
		pinshape.appendChild(pinshapeapp);

		var pinshapedepth = document.createElement("DepthMode");
		pinshapedepth.setAttribute("depthFunc", "ALWAYS");
		pinshapedepth.setAttribute("enableDepthTest", false);
		pinshapeapp.appendChild(pinshapedepth);

		var pinshapemat = document.createElement("Material");
		pinshapemat.setAttribute("diffuseColor", "1.0 0.0 0.0");
		pinshapeapp.appendChild(pinshapemat);

		var pinshapescale = document.createElement("Transform");
		pinshapescale.setAttribute("scale", scale + " " + scale + " " + scale);
		pinshape.appendChild(pinshapescale);

		var pinshapeconetrans = document.createElement("Transform");
		//pinshapeconetrans.setAttribute("translation", "0.0 " + (0.5 * height) + " 0.0");
		pinshapeconetrans.setAttribute("translation", "0.0 " + (0.5 * coneHeight) + " 0.0");
		pinshapescale.appendChild(pinshapeconetrans);

		var pinshapeconerot = document.createElement("Transform");

		pinshapeconerot.setAttribute("rotation", "1.0 0.0 0.0 3.1416");
		pinshapeconetrans.appendChild(pinshapeconerot);

		var pinshapeconeshape = document.createElement("Shape");
		pinshapeconerot.appendChild(pinshapeconeshape);

		var pinshapecone = document.createElement("Cone");
		pinshapecone.setAttribute("bottomRadius", radius * 0.5);
		pinshapecone.setAttribute("height", coneHeight);

		var coneApp = pinshapeapp.cloneNode(true);

		pinshapeconeshape.appendChild(pinshapecone);
		pinshapeconeshape.appendChild(coneApp);

		var pinshapeballtrans = document.createElement("Transform");
		pinshapeballtrans.setAttribute("translation", "0.0 " + coneHeight + " 0.0");
		pinshapescale.appendChild(pinshapeballtrans);

		var pinshapeballshape = document.createElement("Shape");
		pinshapeballtrans.appendChild(pinshapeballshape);

		var pinshapeball = document.createElement("Sphere");
		pinshapeball.setAttribute("radius", radius);

		var ballApp = pinshapeapp.cloneNode(true);

		pinshapeballshape.appendChild(pinshapeball);
		pinshapeballshape.appendChild(ballApp);

		parent.appendChild(pinshape);
	}

	self.prepareX3DScene = function(namespace, radius, scale, height)
	{
		var namespaceNode = $("[namespacename=" + namespace + "]")[0];

		self.pinNamespaces[namespace] = namespaceNode;
		self.createPinShape(namespaceNode.childNodes[0], radius, scale, height);
	}


}]);

