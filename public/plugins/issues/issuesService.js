/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
	"use strict";

	angular.module("3drepo")
		.factory("NewIssuesService", NewIssuesService);

	NewIssuesService.$inject = ["$http", "$q", "StateManager", "serverConfig", "ViewerService", "Auth"];

	function NewIssuesService($http, $q, StateManager, serverConfig, ViewerService, Auth) {
		var state = StateManager.state,
			url = "",
			data = {},
			config = {},
			i, j = 0,
			numIssues = 0,
			numComments = 0,
			pinRadius = 0.25,
			pinHeight = 1.0,
			availableRoles = [];

		// TODO: Internationalise and make globally accessible
		var getPrettyTime = function(time) {
			var date = new Date(time),
				currentDate = new Date(),
				prettyTime,
				postFix,
				hours,
				monthToText = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

			if ((date.getFullYear() === currentDate.getFullYear()) &&
				(date.getMonth() === currentDate.getMonth()) &&
				(date.getDate() === currentDate.getDate())) {
				hours = date.getHours();
				if (hours > 11) {
					postFix = " PM";
					if (hours > 12) {
						hours -= 12;
					}
				} else {
					postFix = " AM";
					if (hours === 0) {
						hours = 12;
					}
				}
				prettyTime = hours + ":" + date.getMinutes() + postFix;
			} else if (date.getFullYear() === currentDate.getFullYear()) {
				prettyTime = date.getDate() + " " + monthToText[date.getMonth()];
			} else {
				prettyTime = monthToText[date.getMonth()] + " '" + (currentDate.getFullYear()).toString().slice(-2);
			}

			return prettyTime;
		};

		var getIssues = function () {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(state.account + '/' + state.project + '/issues.json');

			$http.get(url)
				.then(
					function(data) {
						deferred.resolve(data.data);
						for (i = 0, numIssues = data.data.length; i < numIssues; i += 1) {
							data.data[i].timeStamp = getPrettyTime(data.data[i].created);

							if (data.data[i].hasOwnProperty("comments")) {
								for (j = 0, numComments = data.data[i].comments.length; j < numComments; j += 1) {
									if (data.data[i].comments[j].hasOwnProperty("created")) {
										data.data[i].comments[j].timeStamp = getPrettyTime(data.data[i].comments[j].created);
									}
								}
							}
						}
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var saveIssue = function (issue) {
			var dataToSend,
				deferred = $q.defer();

			url = serverConfig.apiUrl(issue.account + "/" + issue.project + "/issues/" + issue.objectId);

			data = {
				name: issue.name,
				viewpoint: ViewerService.defaultViewer.getCurrentViewpointInfo(),
				scale: 1.0,
				creator_role: issue.creator_role,
				assigned_roles: []
			};
			config = {
				withCredentials: true
			};

			if (issue.pickedPos !== null) {
				data.position = issue.pickedPos.toGL();
				data.norm = issue.pickedNorm.toGL();
			}

			dataToSend = {data: JSON.stringify(data)};

			$http.post(url, dataToSend, config)
				.then(function successCallback(response) {
					console.log(response);
					response.data.issue._id		= response.data.issue_id;
					response.data.issue.account = issue.account;
					response.data.issue.project = issue.project;
					response.data.issue.timeStamp = getPrettyTime(response.data.issue.created);
					response.data.issue.creator_role = issue.creator_role;

					removePin();
					deferred.resolve(response.data.issue);
				});

			return deferred.promise;
		};

		function doPost(issue, data) {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(issue.account + "/" + issue.project + "/issues/" + issue.parent);
			config = {
				withCredentials: true
			};
			data._id = issue._id;
			$http.post(url, {data: JSON.stringify(data)}, config)
				.then(function (response) {
					deferred.resolve(response.data);
				});
			return deferred.promise;
		}

		var toggleCloseIssue = function (issue) {
			var closed = true;
			if (issue.hasOwnProperty("closed")) {
				closed = !issue.closed;
			}
			return doPost(issue, {closed: closed, number: issue.number});
		};

		var assignIssue = function (issue) {
			return doPost(issue, {assigned_roles: issue.assigned_roles, number: issue.number});
		};

		var saveComment = function (issue, comment) {
			return doPost(issue, {comment: comment, number: issue.number});
		};

		var editComment = function (issue, comment, commentIndex) {
			return doPost(issue, {comment: comment, number: issue.number, edit: true, commentIndex: commentIndex});
		};

		var deleteComment = function (issue, index) {
			return doPost(issue, {comment: "", number: issue.number, delete: true, commentCreated: issue.comments[index].created});
		};

		var setComment = function (issue, commentIndex) {
			return doPost(issue, {comment: "", number: issue.number, set: true, commentIndex: commentIndex});
		};

		function addPin (pin, colour) {
			removePin();
			createPinShape("pinPlacement", pin, pinRadius, pinHeight, colour);
		 }

		function removePin () {
			var pinPlacement = document.getElementById("pinPlacement");
			if (pinPlacement !== null) {
			   pinPlacement.parentElement.removeChild(pinPlacement);
			}
		}

		function fixPin (pin, colour) {
			createPinShape(pin.id, pin, pinRadius, pinHeight, colour);
		}

		function createBasicPinShape(parentElement, depthMode, colour, trans, radius, height, scale, ghostPin) {
			var coneHeight = height - 2 * radius;
			var pinshape = document.createElement("Group");
			pinshape.setAttribute("onclick", "clickPin(event)");

			var pinshapeapp = document.createElement("Appearance");
			pinshape.appendChild(pinshapeapp);

			var pinshapedepth = document.createElement("DepthMode");
			pinshapedepth.setAttribute("depthFunc", depthMode);
			pinshapedepth.setAttribute("enableDepthTest", ghostPin);
			pinshapeapp.appendChild(pinshapedepth);

			/*
			if(ghostPin)
			{
				var pinshader = document.createElement("ComposedShader");
				pinshader.setAttribute("USE", "InvertNormals");
				pinshapeapp.appendChild(pinshader);

				var pinvert = document.createElement("ShaderPart");
				pinvert.setAttribute("type","VERTEX");
				pinvert.setAttribute("USE", "ghostVert");
				pinshader.appendChild(pinvert);

				var pinfrag = document.createElement("ShaderPart");
				pinfrag.setAttribute("type","FRAGMENT");
				pinfrag.setAttribute("USE", "ghostFrag");
				pinshader.appendChild(pinfrag);

				pinshapeapp.appendChild(pinshader);
			}
			*/

			var pinshapemat = document.createElement("Material");
			if (typeof colour === "undefined") {
				pinshapemat.setAttribute("diffuseColor", "1.0 0.0 0.0");
			}
			else {
				pinshapemat.setAttribute("diffuseColor", colour[0] + " " + colour[1] + " " + colour[2]);
			}
			pinshapemat.setAttribute("transparency", 1.0 - trans);

			pinshapeapp.appendChild(pinshapemat);
			var pinshapescale = document.createElement("Transform");
			pinshapescale.setAttribute("scale", scale + " " + scale + " " + scale);
			pinshape.appendChild(pinshapescale);

			var pinshapeconetrans = document.createElement("Transform");
			pinshapeconetrans.setAttribute("translation", "0.0 " + (0.5 * coneHeight) + " 0.0");
			pinshapescale.appendChild(pinshapeconetrans);

			var pinshapeconerot = document.createElement("Transform");

			pinshapeconerot.setAttribute("rotation", "1.0 0.0 0.0 3.1416");
			pinshapeconetrans.appendChild(pinshapeconerot);

			var pinshapeconeshape = document.createElement("Shape");
			pinshapeconerot.appendChild(pinshapeconeshape);

			var pinshapecone = document.createElement("Cone");
			pinshapecone.setAttribute("bottomRadius", (radius * 0.5).toString());
			pinshapecone.setAttribute("height", coneHeight.toString());

			var coneApp = pinshapeapp.cloneNode(true);

			pinshapeconeshape.appendChild(pinshapecone);
			pinshapeconeshape.appendChild(coneApp);

			var pinshapeballtrans = document.createElement("Transform");
			pinshapeballtrans.setAttribute("translation", "0.0 " + (1.4 * coneHeight) + " 0.0");
			pinshapescale.appendChild(pinshapeballtrans);

			var pinshapeballshape = document.createElement("Shape");
			pinshapeballtrans.appendChild(pinshapeballshape);

			var pinshapeball = document.createElement("Sphere");
			pinshapeball.setAttribute("radius", radius);

			var ballApp = pinshapeapp.cloneNode(true);

			pinshapeballshape.appendChild(pinshapeball);
			pinshapeballshape.appendChild(ballApp);

			parentElement.appendChild(pinshape);
		}

		function createPinShape (id, pin, radius, height, scale, colour)
		{
			var sceneBBox = ViewerService.defaultViewer.scene._x3domNode.getVolume();
			var sceneSize = sceneBBox.max.subtract(sceneBBox.min).length();
			var scale	  = sceneSize / 20;

			if (ViewerService.defaultViewer.pinSize)
			{
				scale = ViewerService.defaultViewer.pinSize;
			}

			var parent = document.createElement("MatrixTransform");
			parent.setAttribute("id", id);

			var inlines = $("inline");
			var trans = null;

			for (var i = 0; i < inlines.length; i++)
			{
				if (inlines[i].getAttribute("nameSpaceName") === (pin.account + "__" + pin.project))
				{
					trans = inlines[i]._x3domNode.getCurrentTransform();
					break;
				}
			}

			if (trans !== null) {
				parent.setAttribute("matrix", trans.toGL());
			}

			var norm = new x3dom.fields.SFVec3f(pin.norm[0], pin.norm[1], pin.norm[2]);

			// Transform the normal into the coordinate frame of the parent
			var axisAngle = ViewerService.defaultViewer.rotAxisAngle([0,1,0], norm.toGL());

			var modelTransform = document.createElement("Transform");
			modelTransform.setAttribute("rotation", axisAngle.toString());

			var position = new x3dom.fields.SFVec3f(pin.position[0], pin.position[1], pin.position[2]);

			// Transform the pin into the coordinate frame of the parent
			modelTransform.setAttribute("translation", position.toString());

			parent.appendChild(modelTransform);

			createBasicPinShape(modelTransform, "ALWAYS", colour, 0.1, radius, height, scale, false);
			createBasicPinShape(modelTransform, "LESS", colour, 0.9, radius, height, scale, true);

			/*
			var pinshader = document.createElement("ComposedShader");
			pinshader.setAttribute("DEF", "InvertNormals");

			var pinvert = document.createElement("ShaderPart");
			pinvert.setAttribute("type","VERTEX");
			pinvert.setAttribute("DEF", "ghostVert");
			pinvert.textContent = "attribute vec3 position;" +
				"\nattribute vec3 normal;" +
				"\nattribute vec3 tangent;" +
				"\nattribute vec3 binormal;" +
				"\nattribute vec4 color;" +
				"\nuniform mat4 modelViewMatrix;" +
				"\nuniform mat4 modelViewMatrixInverse;" +
				"\nuniform mat4 modelViewProjectionMatrix;" +
				"\nvarying vec3 fragNormal;" +
				"\nvarying vec3 fragEyeVector;" +
				"\nvarying vec3 fragTangent;" +
				"\nvarying vec3 fragBinormal;" +
				"\nvarying vec4 fragColor;" +
				"\n" +
				"\nvoid main()" +
				"\n{" +
				"\n\tvec4 eye = vec4(modelViewMatrixInverse * vec4(0.,0.,0.,1.));" +
				"\n\tfragEyeVector = position - eye.xyz;" +
				"\n\tfragNormal = normal;" +
				"\n\tfragTangent = tangent;" +
				"\n\tfragBinormal = binormal;" +
				"\n\tfragColor = color;" +
				"\n\tgl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
				"\n}";

			pinshader.appendChild(pinvert);

			var pinfrag = document.createElement("ShaderPart");
			pinfrag.setAttribute("type", "FRAGMENT");
			pinfrag.setAttribute("DEF", "ghostFrag");
			pinfrag.textContent = "#ifdef GL_ES" +
				"\n\tprecision highp float;" +
				"\n#endif" +
				"\nvarying vec3 fragNormal;" +
				"\nvarying vec3 fragEyeVector;" +
				"\nvarying vec3 fragTangent;" +
				"\nvarying vec3 fragBinormal;" +
				"\nvarying vec4 fragColor;" +
				"\nvoid main()" +
				"\n{" +
				"\n\tvec3 eye = normalize(fragEyeVector);" +
				"\n\tvec3 normal = normalize(fragNormal);" +
				"\n\tvec3 tangent = normalize(fragTangent);" +
				"\n\tvec3 binormal = normalize(fragBinormal);" +
				"\n\t" +
				//"\n\tvec3 cubecoord = reflect(eye, normal);" +
				//"\n\tfloat p = max(0.1, dot(normal, eye));" +
				//"\n\ttexCol.rgb *= p;" +
				//"\n\ttexCol.rgb += max(0.0, pow(p, 128.0)) * vec3(0.8);" +
				//"\n\ttexCol.rgb = clamp(texCol.rgb, 0.0, 1.0);" +
				"\n\tif (dot(eye, normal) < 0) {" +
				"\n\t\tdiscard;" +
				"\n\t}" +
				"\n\tgl_FragColor = fragColor;" +
				"\n};";

				pinshader.appendChild(pinfrag);

				$("#model__root")[0].appendChild(pinshader);
			*/

			$("#model__root")[0].appendChild(parent);
		}

		var getRoles = function () {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(state.account + '/' + state.project + '/roles.json');

			$http.get(url)
				.then(
					function(data) {
						availableRoles = data.data;
						deferred.resolve(availableRoles);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var getUserRolesForProject = function () {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(state.account + "/" + state.project + "/" + Auth.username + "/userRolesForProject.json");

			$http.get(url)
				.then(
					function(data) {
						deferred.resolve(data.data);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var hexToRgb = function (hex) {
			var hexColours = [];

			if (hex.charAt(0) === "#") {
				hex = hex.substr(1);
			}

			if (hex.length === 6) {
				hexColours.push(hex.substr(0, 2));
				hexColours.push(hex.substr(2, 2));
				hexColours.push(hex.substr(4, 2));
			}
			else if (hex.length === 3) {
				hexColours.push(hex.substr(0, 1) + hex.substr(0, 1));
				hexColours.push(hex.substr(1, 1) + hex.substr(1, 1));
				hexColours.push(hex.substr(2, 1) + hex.substr(2, 1));
			}
			else {
				hexColours = ["00", "00", "00"];
			}

			return [(parseInt(hexColours[0], 16) / 255.0), (parseInt(hexColours[1], 16) / 255.0), (parseInt(hexColours[2], 16) / 255.0)];
		};

		var getRoleColor = function (role) {
			var i = 0,
				length = 0,
				roleColor;

			if (availableRoles.length > 0) {
				for (i = 0, length = availableRoles.length; i < length; i += 1) {
					if (availableRoles[i].role === role) {
						roleColor = availableRoles[i].color;
						break;
					}
				}
			}
			return roleColor;
		};

		return {
			getPrettyTime: getPrettyTime,
			getIssues: getIssues,
			saveIssue: saveIssue,
			toggleCloseIssue: toggleCloseIssue,
			assignIssue: assignIssue,
			saveComment: saveComment,
			editComment: editComment,
			deleteComment: deleteComment,
			setComment: setComment,
			addPin: addPin,
			fixPin: fixPin,
			removePin: removePin,
			state: state,
			getRoles: getRoles,
			getUserRolesForProject: getUserRolesForProject,
			hexToRgb: hexToRgb,
			getRoleColor: getRoleColor
		};
	}
}());
