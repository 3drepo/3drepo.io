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
		.factory("IssuesService", IssuesService);

	IssuesService.$inject = ["$http", "$q", "serverConfig", "EventService"];

	function IssuesService($http, $q,  serverConfig, EventService) {
		var self = this,
			url = "",
			data = {},
			config = {},
			i, j = 0,
			numIssues = 0,
			numComments = 0,
			availableRoles = [],
			userRoles = [],
			obj = {},
			newPinId = "newPinId";

		// TODO: Internationalise and make globally accessible
		obj.getPrettyTime = function(time) {
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

		obj.generateTitle = function(issue) {
			if (issue.typePrefix) {
				return issue.typePrefix + "." + issue.number + " " + issue.name;
			} else {
				return issue.number + " " + issue.name;
			}
		};

		obj.getIssues = function(account, project, revision) {
			var self = this,
				deferred = $q.defer();

			if(revision){
				url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" + project + "/revision/" + revision + "/issues.json");
			} else {
				url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" + project + "/issues.json");
			}
			

			$http.get(url)
				.then(
					function(data) {
						console.log(data);
						deferred.resolve(data.data);
						for (i = 0, numIssues = data.data.length; i < numIssues; i += 1) {
							data.data[i].timeStamp = self.getPrettyTime(data.data[i].created);

							if (data.data[i].hasOwnProperty("comments")) {
								for (j = 0, numComments = data.data[i].comments.length; j < numComments; j += 1) {
									if (data.data[i].comments[j].hasOwnProperty("created")) {
										data.data[i].comments[j].timeStamp = self.getPrettyTime(data.data[i].comments[j].created);
									}
								}
							}

							//data.data[i].title = self.obj.generateTitle(data.data[i]);
						}
					},
					function() {
						deferred.resolve([]);
					}
				);

			return deferred.promise;
		};

		obj.saveIssue = function (issue) {
			var deferred = $q.defer(),
				url;

			if (issue.rev_id){
				url = serverConfig.apiUrl(serverConfig.POST_API, issue.account + "/" + issue.project + "/revision/" + issue.rev_id + "/issues.json");
			} else {
				url = serverConfig.apiUrl(serverConfig.POST_API, issue.account + "/" + issue.project + "/issues.json");
			}

			config = {withCredentials: true};

			if (issue.pickedPos !== null) {
				issue.position = issue.pickedPos.toGL();
				issue.norm = issue.pickedNorm.toGL();
			}

			$http.post(url, issue, config)
				.then(function successCallback(response) {
					console.log(response);
					/*
					response.data.issue._id = response.data.issue_id;
					response.data.issue.account = issue.account;
					response.data.issue.project = issue.project;
					response.data.issue.timeStamp = self.getPrettyTime(response.data.issue.created);
					response.data.issue.creator_role = issue.creator_role;
					response.data.issue.scribble = issue.scribble;

					response.data.issue.title = generateTitle(response.data.issue);
					self.removePin();
					*/
					deferred.resolve(response.data.issue);
				});

			return deferred.promise;
		};

		/**
		 * Handle PUT requests
		 * @param issue
		 * @param data
		 * @returns {*}
		 */
		function doPut(issue, data) {
			var deferred = $q.defer();
			var url;

			if(issue.rev_id){
				url = serverConfig.apiUrl(serverConfig.POST_API, issue.account + "/" + issue.project + "/revision/" + issue.rev_id + "/issues/" +  issue._id + ".json");
			} else {
				url = serverConfig.apiUrl(serverConfig.POST_API, issue.account + "/" + issue.project + "/issues/" + issue._id + ".json");
			}
				
			var config = {
				withCredentials: true
			};
			$http.put(url, {data: JSON.stringify(data)}, config)
				.then(function (response) {
					deferred.resolve(response.data);
				});
			return deferred.promise;
		}

		obj.toggleCloseIssue = function(issue) {
			var closed = true;
			if (issue.hasOwnProperty("closed")) {
				closed = !issue.closed;
			}
			return doPut(issue, {
				closed: closed,
				number: issue.number
			});
		};

		obj.assignIssue = function(issue) {
			return doPut(
				issue,
				{
					assigned_roles: issue.assigned_roles,
					number: issue.number
				}
			);
		};

		obj.saveComment = function(issue, comment) {
			return doPut(issue, {
				comment: comment,
				number: issue.number
			});
		};

		obj.editComment = function(issue, comment, commentIndex) {
			return doPut(issue, {
				comment: comment,
				number: issue.number,
				edit: true,
				commentIndex: commentIndex
			});
		};

		obj.deleteComment = function(issue, index) {
			return doPut(issue, {
				comment: "",
				number: issue.number,
				delete: true,
				commentIndex: index
				// commentCreated: issue.comments[index].created
			});
		};

		obj.setComment = function(issue, commentIndex) {
			return doPut(issue, {
				comment: "",
				number: issue.number,
				sealed: true,
				commentIndex: commentIndex
			});
		};

		obj.addPin = function (pin, colours, viewpoint) {
			EventService.send(EventService.EVENT.VIEWER.ADD_PIN, {
				id: pin.id,
				account: pin.account,
				project: pin.project,
				position: pin.position,
				norm: pin.norm,
				colours: colours,
				viewpoint: viewpoint
			});
		};

		obj.removePin = function (id) {
			EventService.send(EventService.EVENT.VIEWER.REMOVE_PIN, {
				id: id
			});
		};

		obj.fixPin = function (pin, colours) {
			var self = this;
			self.removePin();

			EventService.send(EventService.EVENT.VIEWER.ADD_PIN, {
				id: newPinId,
				position: pin.position,
				norm: pin.norm,
				colours: colours
			});
		};

		obj.getRoles = function(account, project) {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(serverConfig.GET_API, account + '/' + project + '/roles.json');

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

		obj.getUserRolesForProject = function(account, project, username) {
			var deferred = $q.defer();
			url = serverConfig.apiUrl(serverConfig.GET_API, account + "/" +project + "/" + username + "/userRolesForProject.json");

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

		obj.hexToRgb = function(hex) {
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

		obj.getRoleColor = function(role) {
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

		/**
		 * Set the status icon style and colour
		 */
		obj.getStatusIcon = function (issue) {
			var statusIcon = {};

			if (issue.status === "closed") {
				statusIcon.icon = "check_circle";
				statusIcon.colour = "#004594";
			}
			else {
				statusIcon.icon = (issue.status === "open") ? "panorama_fish_eye" : "lens";
				switch (issue.priority) {
					case "none":
						statusIcon.colour = "#7777777";
						break;
					case "low":
						statusIcon.colour = "#4CAF50";
						break;
					case "medium":
						statusIcon.colour = "#FF9800";
						break;
					case "high":
						statusIcon.colour = "#F44336";
						break;
				}
			}

			return statusIcon;
		};


		Object.defineProperty(
			obj,
			"newPinId",
			{
				get: function () {return newPinId;}
			}
		);

		return obj;
	}
}());
