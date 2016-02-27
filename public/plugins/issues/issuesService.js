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

(function() {
	"use strict";

	angular.module("3drepo")
		.factory("NewIssuesService", NewIssuesService);

	NewIssuesService.$inject = ["$http", "$q", "StateManager", "serverConfig", "EventService", "Auth"];

	function NewIssuesService($http, $q, StateManager, serverConfig, EventService, Auth) {
		var state = StateManager.state,
			url = "",
			data = {},
			config = {},
			i, j = 0,
			numIssues = 0,
			numComments = 0,
			availableRoles = [],
			userRoles = [];

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

		var generateTitle = function(issue) {
			if (issue.typePrefix) {
				return issue.typePrefix + "." + issue.number + " " + issue.name;
			} else {
				return issue.number + " " + issue.name;
			}
		};

		var getIssues = function() {
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
					function() {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var saveIssue = function(issue) {
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

			dataToSend = {
				data: JSON.stringify(data)
			};

			$http.post(url, dataToSend, config)
				.then(function successCallback(response) {
					response.data.issue._id = response.data.issue_id;
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
			$http.post(url, {
					data: JSON.stringify(data)
				}, config)
				.then(function(response) {
					deferred.resolve(response.data);
				});
			return deferred.promise;
		}

		var toggleCloseIssue = function(issue) {
			var closed = true;
			if (issue.hasOwnProperty("closed")) {
				closed = !issue.closed;
			}
			return doPost(issue, {
				closed: closed,
				number: issue.number
			});
		};

		var assignIssue = function(issue) {
			return doPost(issue, {
				assigned_roles: issue.assigned_roles,
				number: issue.number
			});
		};

		var saveComment = function(issue, comment) {
			return doPost(issue, {
				comment: comment,
				number: issue.number
			});
		};

		var editComment = function(issue, comment, commentIndex) {
			return doPost(issue, {
				comment: comment,
				number: issue.number,
				edit: true,
				commentIndex: commentIndex
			});
		};

		var deleteComment = function(issue, index) {
			return doPost(issue, {
				comment: "",
				number: issue.number,
				delete: true,
				commentCreated: issue.comments[index].created
			});
		};

		var setComment = function(issue, commentIndex) {
			return doPost(issue, {
				comment: "",
				number: issue.number,
				set: true,
				commentIndex: commentIndex
			});
		};

		function highlightPin(id) {
			EventService.send(EventService.EVENT.VIEWER.HIGHLIGHT_PIN, {
				id: id
			});
		}

		function addPin(pin, colours) {
			EventService.send(EventService.EVENT.VIEWER.ADD_PIN, {
				id: pin.id,
				account: pin.account,
				project: pin.project,
				position: pin.position,
				norm: pin.norm,
				colours: colours
			});

			//createPinShape("pinPlacement", pin, pinRadius, pinHeight, colours);
		}

		function removePin() {
			EventService.send(EventService.EVENT.VIEWER.REMOVE_PIN, {
				id: "pinPlacement"
			});

			/*			
			var pinPlacement = document.getElementById();
			if (pinPlacement !== null) {
			   pinPlacement.parentElement.removeChild(pinPlacement);
			}
			*/
		}

		function fixPin(pin, colours) {
			removePin();

			EventService.send(EventService.EVENT.VIEWER.ADD_PIN, {
				id: "pinPlacement",
				position: pin.position,
				norm: pin.norm,
				colours: colours
			});

			//createPinShape(pin.id, pin, pinRadius, pinHeight, colours);
		}

		var getRoles = function() {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(state.account + '/' + state.project + '/roles.json');

			$http.get(url)
				.then(
					function(data) {
						availableRoles = data.data;
						deferred.resolve(availableRoles);
					},
					function() {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var getUserRolesForProject = function() {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(state.account + "/" + state.project + "/" + Auth.username + "/userRolesForProject.json");

			$http.get(url)
				.then(
					function(data) {
						userRoles = data.data;
						deferred.resolve(userRoles);
					},
					function() {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		var hexToRgb = function(hex) {
			// If nothing comes end, then send nothing out.
			if (typeof hex === "undefined") {
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
			} else if (hex.length === 3) {
				hexColours.push(hex.substr(0, 1) + hex.substr(0, 1));
				hexColours.push(hex.substr(1, 1) + hex.substr(1, 1));
				hexColours.push(hex.substr(2, 1) + hex.substr(2, 1));
			} else {
				hexColours = ["00", "00", "00"];
			}

			return [(parseInt(hexColours[0], 16) / 255.0), (parseInt(hexColours[1], 16) / 255.0), (parseInt(hexColours[2], 16) / 255.0)];
		};

		var getRoleColor = function(role) {
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
			highlightPin: highlightPin,
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