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
			availableRoles = [],
			userRoles = [],
			shaderInitialized = false;

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
				assigned_roles: userRoles
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

		function addPin (pin, colours) {
			removePin();
			createPinShape("pinPlacement", pin, pinRadius, pinHeight, colours);
		 }

		function removePin () {
			var pinPlacement = document.getElementById("pinPlacement");
			if (pinPlacement !== null) {
			   pinPlacement.parentElement.removeChild(pinPlacement);
			}
		}

		function fixPin (pin, colours) {
			createPinShape(pin.id, pin, pinRadius, pinHeight, colours);
		}

		function changePinColour (id, colours) {
			// Find both the material for the ghosted pin and the opaque pin
			var numColours = 0;

            if ((typeof colours === "undefined") || (!colours.length))
            {
                colours = [1.0, 1.0, 1.0];
            }

			if (typeof colours[0] === "number")
			{
				numColours = 1;
			} else {
				numColours = colours.length;
			}

			var numColoursField   = $("#" + id + "_ncol")[0];
			var multiColoursField = $("#" + id + "_col")[0];

			numColoursField.setAttribute("value", numColours);
			multiColoursField.setAttribute("value", colours.join(" "));

            var ghostNumColoursField   = $("#" + id + "_ghost_ncol")[0];
			var ghostMultiColoursField = $("#" + id + "_ghost_col")[0];

			ghostNumColoursField.setAttribute("value", numColours);
			ghostMultiColoursField.setAttribute("value", colours.join(" "));
		}

		function createBasicPinShape(id, parentElement, depthMode, colours, numColours, trans, radius, height, scale, ghostPin) {
			var coneHeight = height - 2 * radius;
			var pinshape = document.createElement("Group");
			pinshape.setAttribute("onclick", "clickPin(event)");

			var pinshapeapp = document.createElement("Appearance");
			//pinshape.appendChild(pinshapeapp);

			var pinshapedepth = document.createElement("DepthMode");
			pinshapedepth.setAttribute("depthFunc", depthMode);
			pinshapedepth.setAttribute("enableDepthTest", ghostPin);
			pinshapeapp.appendChild(pinshapedepth);

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

			var coneMat = document.createElement("Material");
			coneMat.setAttribute("diffuseColor", "1.0 1.0 1.0");
			coneMat.setAttribute("transparency", 1.0 - trans);
			coneApp.appendChild(coneMat);

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

			var pinshader = document.createElement("ComposedShader");
			pinshapeapp.appendChild(pinshader);

			var pinheadradius = document.createElement("field");
			pinheadradius.setAttribute("type", "SFFloat");
			pinheadradius.setAttribute("name", "radius");
			pinheadradius.setAttribute("value", radius);
			pinshader.appendChild(pinheadradius);

			var pinheadncol = document.createElement("field");
			pinheadncol.setAttribute("id", id + (ghostPin ? "_ghost" : "") + "_ncol");
			pinheadncol.setAttribute("type", "SFFloat");
			pinheadncol.setAttribute("name", "numColours");
			pinheadncol.setAttribute("value", numColours);
			pinshader.appendChild(pinheadncol);

			var pinheadalpha = document.createElement("field");
			pinheadalpha.setAttribute("type", "SFFloat");
			pinheadalpha.setAttribute("name", "alpha");
			pinheadalpha.setAttribute("value", trans);
			pinshader.appendChild(pinheadalpha);

			var pinheadcolor = document.createElement("field");
			pinheadcolor.setAttribute("id", id + (ghostPin ? "_ghost" : "") + "_col");
			pinheadcolor.setAttribute("type", "MFFloat");
			pinheadcolor.setAttribute("name", "multicolours");
			pinheadcolor.setAttribute("value", colours);
			pinshader.appendChild(pinheadcolor);

			var pinvert = document.createElement("ShaderPart");
			pinvert.setAttribute("type","VERTEX");
			pinvert.setAttribute("USE", "multiVert");
			pinshader.appendChild(pinvert);

			var pinfrag = document.createElement("ShaderPart");
			pinfrag.setAttribute("type","FRAGMENT");
			pinfrag.setAttribute("USE", "multiFrag");
			pinshader.appendChild(pinfrag);

			ballApp.appendChild(pinshader);

			parentElement.appendChild(pinshape);
		}

		function createPinShape (id, pin, radius, height, colours)
		{
			var numColours = 0;

			if (typeof colours === "undefined") {
				numColours = 1;
				colours = [1.0, 0.0, 0.0];
			} else if (typeof colours[0] === "number")
			{
				numColours = 1;
			} else {
				numColours = colours.length;
			}

			var sceneBBox = ViewerService.defaultViewer.scene._x3domNode.getVolume();
			var sceneSize = sceneBBox.max.subtract(sceneBBox.min).length();
			var scale   = sceneSize / 20;

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

			// If we haven't yet initialized the shader then we
			// should do it before we set a pin
			if (!shaderInitialized)
			{
				initializeShader();
			}

			colours = colours.join(" ");
			createBasicPinShape(id, modelTransform, "ALWAYS", colours, numColours, 0.1, radius, height, scale, false);
			createBasicPinShape(id, modelTransform, "LESS", colours, numColours, 0.9, radius, height, scale, true);

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
						userRoles = data.data;
						deferred.resolve(userRoles);
					},
					function () {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var hexToRgb = function (hex) {
			// If nothing comes end, then send nothing out.
			if (typeof hex === "undefined")
			{
				return undefined;
			}

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

		var initializeShader = function () {
			var pinheadshader = document.createElement("ComposedShader");
			pinheadshader.setAttribute("ID", "pinHeadShader");

			var pinvert = document.createElement("ShaderPart");
			pinvert.setAttribute("type","VERTEX");
			pinvert.setAttribute("DEF", "multiVert");
			pinvert.textContent = "attribute vec3 position;" +
				"\nattribute vec3 normal;" +
				"\n" +
				"\nuniform mat4 modelViewMatrixInverse;" +
				"\nuniform mat4 modelViewProjectionMatrix;" +
				"\nuniform float radius;" +
				"\n" +
				"\nvarying float fragColourSelect;" +
				"\nvarying vec3 fragNormal;" +
				"\nvarying vec3 fragEyeVector;" +
				"\nvarying vec3 fragPosition;" +
				"\nvoid main()" +
				"\n{" +
				"\n\tfragEyeVector = vec3(0.2, 0.2, 0.2);" +
				"\n\tfragNormal = normal;" +
				"\n\tfragColourSelect = 1.0 - ((position.y / radius) + 1.0) / 2.0;" +
				"\n\t" +
				"\n\tfragPosition = position;" +
				"\n\tgl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
				"\n}";
			pinheadshader.appendChild(pinvert);

			var pinfrag = document.createElement("ShaderPart");
			pinfrag.setAttribute("type", "FRAGMENT");
			pinfrag.setAttribute("DEF", "multiFrag");
			var fragSource = "#ifdef GL_FRAGMENT_PRECISION_HIGH" +
				"\n\tprecision highp float;" +
				"\n#else" +
				"\n\tprecision mediump float;" +
				"\n#endif" +
				"\n";

				fragSource += x3dom.shader.light(1);
				fragSource += x3dom.shader.gammaCorrectionDecl({});
				fragSource += "\nuniform float numColours;" +
				"\nuniform float ambientIntensity;" +
				"\nvarying float fragColourSelect;" +
				"\nvarying vec3 fragNormal;" +
                "\nvarying vec3 fragEyeVector;" +
				"\nvarying vec3 fragPosition;" +
				"\nuniform float alpha;" +
				"\nuniform vec3 multicolours[20];" +
				"\n" +
				"\nvoid main()" +
				"\n{" +
				"\n\tint colourSelected = int(floor(fragColourSelect * numColours));" +
				"\n\tvec3 eye = -fragPosition.xyz;" +
				"\n\tvec3 normal = normalize(fragNormal);" +
				"\n\tvec3 ads = lighting(light0_Type, light0_Location, light0_Direction, light0_Color, light0_Attenuation, light0_Radius, light0_Intensity, light0_AmbientIntensity, light0_BeamWidth, light0_CutOffAngle, normalize(fragNormal), eye, 0.0, ambientIntensity);" +
				"\n\tvec3 ambient = light0_Color * ads.r;" +
				"\n\tvec3 diffuse = light0_Color * ads.g;" +
				"\n\tambient = max(ambient, 0.0);" +
				"\n\tdiffuse = max(diffuse, 0.0);" +
				"\n\tvec3 pinColor = vec3(0.0,0.0,0.0);" +
				"\n\tfor(int colidx = 0; colidx < 20; colidx++) {" +
				"\n\t\tif(colidx == colourSelected) {" +
				"\n\t\t\tpinColor = multicolours[colidx] * max(ambient + diffuse, 0.0);" +
				"\n\t\t\tpinColor = clamp(pinColor, 0.0, 1.0);" +
				"\n\t\t\tpinColor = gammaEncode(pinColor);" +
				"\n\t\t\tgl_FragColor = vec4(pinColor, alpha);" +
				"\n\t\t}" +
				"\n\t}" +
				"\n}";

			pinfrag.textContent = fragSource;
			pinheadshader.appendChild(pinfrag);

			shaderInitialized = true;

			$("#model__root")[0].appendChild(pinheadshader);
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
            changePinColour: changePinColour,
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
