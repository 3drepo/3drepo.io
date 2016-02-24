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
			shaderInitialized = false,
			highlightedPin = null;

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

				prettyTime = hours + ":" + ("0" + date.getMinutes()).slice(-2) + postFix;
			} else if (date.getFullYear() === currentDate.getFullYear()) {
				prettyTime = date.getDate() + " " + monthToText[date.getMonth()];
			} else {
				prettyTime = monthToText[date.getMonth()] + " '" + (date.getFullYear()).toString().slice(-2);
			}

			return prettyTime;
		};

		var generateTitle = function(issue)
		{
			if (issue.typePrefix) {
				return issue.typePrefix + "." + issue.number + " " + issue.name;
			} else {
				return issue.number + " " + issue.name;
			}
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

							data.data[i].title = generateTitle(data.data[i]);
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

					response.data.issue.title = generateTitle(response.data.issue);
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
                colours = [0.5, 0.5, 0.5];
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

		/*******************************************************************************
		 * Highlight pin in the scene by ID
		 *
		 * @param {string} id - Unique ID of pin to highlight (null deselects all)
		 ******************************************************************************/
		function highlightPin(id) {
			if (highlightedPin)
			{
				$("#" + highlightedPin + "_ishighlighted")[0].setAttribute("value", "false");
				$("#" + highlightedPin + "_ghost_ishighlighted")[0].setAttribute("value", "false");
				$("#" + highlightedPin + "_cone_ishighlighted")[0].setAttribute("value", "false");
				$("#" + highlightedPin + "_cone_ghost_ishighlighted")[0].setAttribute("value", "false");

				$("#" + highlightedPin + "_depth")[0].setAttribute("depthFunc", "LESS");
				$("#" + highlightedPin + "_cone_depth")[0].setAttribute("depthFunc", "LESS");
			}

			if (id)
			{
				$("#" + id + "_ishighlighted")[0].setAttribute("value", "true");
				$("#" + id + "_ghost_ishighlighted")[0].setAttribute("value", "true");
				$("#" + id + "_cone_ishighlighted")[0].setAttribute("value", "true");
				$("#" + id + "_cone_ghost_ishighlighted")[0].setAttribute("value", "true");

				$("#" + id + "_depth")[0].setAttribute("depthFunc", "ALWAYS");
				$("#" + id + "_cone_depth")[0].setAttribute("depthFunc", "ALWAYS");
			}

			highlightedPin = id;
		}

		function createBasicPinShape(id, parentElement, depthMode, colours, numColours, trans, radius, height, scale, ghostPin) {
			var ORANGE_HIGHLIGHT = "1.0000 0.7 0.0";

			var coneHeight = height - 2 * radius;
			var pinshape = document.createElement("Group");
			pinshape.setAttribute("onclick", "clickPin(event)");

			var pinshapeapp = document.createElement("Appearance");
			//pinshape.appendChild(pinshapeapp);

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

			var coneshader = document.createElement("ComposedShader");
			coneApp.appendChild(coneshader);

			var coneMat = document.createElement("Material");
			coneMat.setAttribute("diffuseColor", "1.0 1.0 1.0");
			coneMat.setAttribute("transparency", trans);
			coneApp.appendChild(coneMat);

			var conehighlight = document.createElement("field");
			conehighlight.setAttribute("type", "SFVec3f");
			conehighlight.setAttribute("name", "highlightColor");
			conehighlight.setAttribute("value", ORANGE_HIGHLIGHT);
			coneshader.appendChild(conehighlight);

			var coneishighlighted = document.createElement("field");
			coneishighlighted.setAttribute("id", id + "_cone" + (ghostPin ? "_ghost" : "") + "_ishighlighted");
			coneishighlighted.setAttribute("type", "SFBool");
			coneishighlighted.setAttribute("name", "highlightPin");
			coneishighlighted.setAttribute("value", "false");
			coneshader.appendChild(coneishighlighted);

			var coneuseclipplane = document.createElement("field");
			coneuseclipplane.setAttribute("type", "SFBool");
			coneuseclipplane.setAttribute("name", "useClipPlane");
			coneuseclipplane.setAttribute("value", ghostPin);
			coneshader.appendChild(coneuseclipplane);

			var conevert = document.createElement("ShaderPart");
			conevert.setAttribute("type","VERTEX");
			conevert.setAttribute("USE", "noShadeVert");
			coneshader.appendChild(conevert);

			var conefrag = document.createElement("ShaderPart");
			conefrag.setAttribute("type","FRAGMENT");
			conefrag.setAttribute("USE", "noShadeFrag");
			coneshader.appendChild(conefrag);

			var conedepth = document.createElement("DepthMode");

			if (!ghostPin)
			{
				conedepth.setAttribute("id", id + "_cone_depth");
			}

			conedepth.setAttribute("depthFunc", depthMode);
			conedepth.setAttribute("enableDepthTest", !ghostPin);
			coneApp.appendChild(conedepth);

			pinshapeconeshape.appendChild(coneApp);
			pinshapeconeshape.appendChild(pinshapecone);

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

			var pinheadMat = document.createElement("Material");
			pinheadMat.setAttribute("diffuseColor", "1.0 1.0 1.0");
			pinheadMat.setAttribute("transparency", trans);
			ballApp.appendChild(pinheadMat);

			var pinshader = document.createElement("ComposedShader");
			ballApp.appendChild(pinshader);

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

			var pinheadcolor = document.createElement("field");
			pinheadcolor.setAttribute("id", id + (ghostPin ? "_ghost" : "") + "_col");
			pinheadcolor.setAttribute("type", "MFFloat");
			pinheadcolor.setAttribute("name", "multicolours");
			pinheadcolor.setAttribute("value", colours);
			pinshader.appendChild(pinheadcolor);

			var pinheadhighlight = document.createElement("field");
			pinheadhighlight.setAttribute("type", "SFVec3f");
			pinheadhighlight.setAttribute("name", "highlightColor");
			pinheadhighlight.setAttribute("value", ORANGE_HIGHLIGHT);
			pinshader.appendChild(pinheadhighlight);

			var pinheadishighlighted = document.createElement("field");
			pinheadishighlighted.setAttribute("id", id + (ghostPin ? "_ghost" : "") + "_ishighlighted");
			pinheadishighlighted.setAttribute("type", "SFBool");
			pinheadishighlighted.setAttribute("name", "highlightPin");
			pinheadishighlighted.setAttribute("value", "false");
			pinshader.appendChild(pinheadishighlighted);

			var pinuseclipplane = document.createElement("field");
			pinuseclipplane.setAttribute("type", "SFBool");
			pinuseclipplane.setAttribute("name", "useClipPlane");
			pinuseclipplane.setAttribute("value", !ghostPin);
			pinshader.appendChild(pinuseclipplane);

			var pinvert = document.createElement("ShaderPart");
			pinvert.setAttribute("type","VERTEX");
			pinvert.setAttribute("USE", "multiVert");
			pinshader.appendChild(pinvert);

			var pinfrag = document.createElement("ShaderPart");
			pinfrag.setAttribute("type","FRAGMENT");
			pinfrag.setAttribute("USE", "multiFrag");
			pinshader.appendChild(pinfrag);

			var pinheaddepth = document.createElement("DepthMode");

			if (!ghostPin)
			{
				pinheaddepth.setAttribute("id", id + "_depth");
			}

			pinheaddepth.setAttribute("depthFunc", depthMode);
			pinheaddepth.setAttribute("enableDepthTest", !ghostPin);
			ballApp.appendChild(pinheaddepth);

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
			createBasicPinShape(id, modelTransform, "ALWAYS", colours, numColours, 0.1, radius, height, scale, true);
			createBasicPinShape(id, modelTransform, "LESS", colours, numColours, 0.9, radius, height, scale, false);

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
				"\nuniform mat4 modelViewMatrix;" +
				"\nuniform mat4 modelViewMatrixInverse;" +
				"\nuniform mat4 modelViewProjectionMatrix;" +
				"\nuniform float radius;" +
				"\n" +
				"\nvarying float fragColourSelect;" +
				"\nvarying vec3 fragNormal;" +
				"\nvarying vec3 fragEyeVector;" +
				"\nvarying vec4 fragPosition;" +
				"\nvarying vec3 pinPosition;" +
				"\nvoid main()" +
				"\n{" +
				"\n\tfragEyeVector = vec3(0.2, 0.2, 0.2);" +
				"\n\tfragNormal = normal;" +
				"\n\tfragColourSelect = 1.0 - ((position.y / radius) + 1.0) / 2.0;" +
				"\n\t" +
				"\n\tpinPosition = position;" +
				"\n\tfragPosition = (modelViewMatrix * vec4(position, 1.0));" +
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

				fragSource += "\nuniform float numColours;" +
				"\nuniform float ambientIntensity;" +
				"\nuniform float transparency;" +
				"\nvarying float fragColourSelect;" +
				"\nvarying vec3 fragNormal;" +
                "\nvarying vec3 fragEyeVector;" +
				"\nvarying vec4 fragPosition;" +
				"\nvarying vec3 pinPosition;" +
				"\nuniform vec3 multicolours[20];" +
				"\nuniform mat4 viewMatrixInverse;" +
				"\nuniform bool highlightPin;" +
				"\nuniform vec3 highlightColor;" +
				"\nuniform bool useClipPlane;" +
				"\n";

				fragSource += x3dom.shader.light(1);
				fragSource += x3dom.shader.clipPlanes(1);

				fragSource += "\nvoid main()" +
				"\n{" +
				"\n\tint colourSelected = int(floor(fragColourSelect * numColours));" +
				"\n\tvec3 eye = -pinPosition.xyz;" +
				"\n\tvec3 normal = normalize(fragNormal);" +
				"\n\tvec3 ads = lighting(light0_Type, light0_Location, light0_Direction, light0_Color, light0_Attenuation, light0_Radius, light0_Intensity, light0_AmbientIntensity, light0_BeamWidth, light0_CutOffAngle, normalize(fragNormal), eye, 0.0, ambientIntensity);" +
				"\n\tvec3 ambient = light0_Color * ads.r;" +
				"\n\tvec3 diffuse = light0_Color * ads.g;" +
				"\n\tambient = max(ambient, 0.0);" +
				"\n\tdiffuse = max(diffuse, 0.0);" +
				"\n\tvec3 pinColor = vec3(0.0,0.0,0.0);" +
				"\n\tif(useClipPlane) {" +
				"\n\t\tcalculateClipPlanes();" +
				"\n\t}" +
				"\n\tfor(int colidx = 0; colidx < 20; colidx++) {" +
				"\n\t\tif(colidx == colourSelected) {" +
				"\n\t\t\tpinColor = multicolours[colidx];" + // * max(ambient + diffuse, 0.0);" +
				"\n\t\t\tpinColor = clamp(pinColor, 0.0, 1.0);" +
				"\n\t\t\tif (highlightPin) {" +
				"\n\t\t\t\tpinColor = highlightColor;" +
				"\n\t\t\t}" +
				//"\n\t\t\tpinColor = gammaEncode(pinColor);" +
				"\n\t\t\tgl_FragColor = vec4(pinColor, transparency);" +
				"\n\t\t}" +
				"\n\t}" +
				"\n}\n\n";

			//fragSource += x3dom.shader.gammaCorrectionDecl({});

			pinfrag.textContent = fragSource;
			pinheadshader.appendChild(pinfrag);

			var coneshader = document.createElement("ComposedShader");
			coneshader.setAttribute("id", "coneShader");

			var conevert = document.createElement("ShaderPart");
			conevert.setAttribute("type", "VERTEX");
			conevert.setAttribute("DEF", "noShadeVert");

			var conevertSource = "attribute vec3 position;" +
				"\nattribute vec3 normal;" +
				"\n" +
				"\nuniform mat4 modelViewMatrixInverse;" +
				"\nuniform mat4 modelViewProjectionMatrix;" +
				"\nuniform mat4 modelViewMatrix;" +
				"\n" +
				"\nvarying vec4 fragPosition;" +
				"\nvoid main()" +
				"\n{" +
				"\n\tfragPosition = (modelViewMatrix * vec4(position, 1.0));" +
				"\n\tgl_Position = modelViewProjectionMatrix * vec4(position, 1.0);" +
				"\n}";

			conevert.textContent = conevertSource;
			coneshader.appendChild(conevert);

			var conefrag = document.createElement("ShaderPart");
			conefrag.setAttribute("type", "FRAGMENT");
			conefrag.setAttribute("DEF", "noShadeFrag");

			var coneFragSource = "#ifdef GL_FRAGMENT_PRECISION_HIGH" +
				"\n\tprecision highp float;" +
				"\n#else" +
				"\n\tprecision mediump float;" +
				"\n#endif" +
				"\n" +
				"\nuniform vec3 diffuseColor;" +
				"\nuniform float transparency;" +
				"\nuniform bool highlightPin;" +
				"\nuniform vec3 highlightColor;" +
				"\nuniform mat4 viewMatrixInverse;" +
				"\nuniform bool useClipPlane;" +
				"\nvarying vec4 fragPosition;" +
				"\n";

				coneFragSource += x3dom.shader.clipPlanes(1);

				coneFragSource += "\nvoid main()" +
				"\n{" +
				"\n\tvec3 diffuseColor = clamp(diffuseColor, 0.0, 1.0);" +
				"\n\tif(useClipPlane) {" +
				"\n\t\tcalculateClipPlanes();" +
				"\n\t}" +
				"\n\tif (highlightPin) {" +
				"\n\t\tdiffuseColor = highlightColor;" +
				"\n\t}" +
				"\n\tgl_FragColor = vec4(diffuseColor, transparency);" +
				"\n}";

			conefrag.textContent = coneFragSource;

			coneshader.appendChild(conefrag);
			shaderInitialized = true;

			$("#model__root")[0].appendChild(pinheadshader);
			$("#model__root")[0].appendChild(coneshader);
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
			highlightPin: highlightPin,
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
