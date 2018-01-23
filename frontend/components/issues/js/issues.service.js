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
		.service("IssuesService", IssuesService);

	IssuesService.$inject = [
		"$q", "$sanitize", "ClientConfigService", "EventService", 
		"APIService", "TreeService", "AuthService", "MultiSelectService",
		"ViewerService", "$timeout", "$filter"
	];

	function IssuesService(
		$q, $sanitize, ClientConfigService, EventService, 
		APIService, TreeService, AuthService, MultiSelectService,
		ViewerService, $timeout, $filter
	) {

		var url = "",
			config = {},
			numIssues = 0,
			availableJobs = [],
			updatedIssue = null;

		var initPromise = $q.defer();

		var service = {
			init : init,
			numIssues: numIssues,
			updatedIssue: updatedIssue,
			deselectPin: deselectPin,
			showIssue: showIssue,
			showMultiIds : showMultiIds,
			handleTree: handleTree,
			getPrettyTime: getPrettyTime,
			generateTitle: generateTitle,
			getThumbnailPath: getThumbnailPath,
			getIssue: getIssue,
			getIssues: getIssues,
			saveIssue: saveIssue,
			updateIssue: updateIssue,
			doPut : doPut,
			toggleCloseIssue: toggleCloseIssue,
			assignIssue: assignIssue,
			saveComment: saveComment,
			editComment: editComment,
			deleteComment: deleteComment,
			sealComment: sealComment,
			getJobs: getJobs,
			getUserJobForModel: getUserJobForModel,
			hexToRgb: hexToRgb,
			getJobColor: getJobColor,
			getStatusIcon: getStatusIcon,
			importBcf: importBcf,
			convertActionCommentToText: convertActionCommentToText,
			cleanIssue: cleanIssue,
			convertActionValueToText: convertActionValueToText,
			
			canChangePriority: canChangePriority,
			canChangeStatus: canChangeStatus,
			canChangeType: canChangeType,
			canChangeAssigned: canChangeAssigned,
			canComment: canComment,
			canChangeStatusToClosed: canChangeStatusToClosed,
			isOpen: isOpen,

			setSelectedIssue: setSelectedIssue,
			populateIssue: populateIssue,
			populateNewIssues: populateNewIssues,
			updateIssues: updateIssues,
			addIssue: addIssue,
			setupIssuesToShow: setupIssuesToShow,
			getDisplayIssue: getDisplayIssue,
			resetSelectedIssue: resetSelectedIssue,
			createBlankIssue: createBlankIssue,
			isSelectedIssue: isSelectedIssue,
			showIssuePins: showIssuePins,
			resetIssues: resetIssues
			
		};

		resetIssues();

		return service;

		/////////////

		function resetIssues() {

			service.state = {
				heights : {
					infoHeight : 135,
					issuesListItemHeight : 141
				},
				selectedIssue: null,
				allIssues: [],
				issuesToShow: [],
				displayIssue: null,
				issueDisplay: {
					showSubModelIssues: false,
					showClosed: false,
					sortOldestFirst : false,
					excludeRoles: []
				}
			};
		}

		function createBlankIssue(creatorRole) {
			return {
				creator_role: creatorRole,
				priority: "none",
				status: "open",
				assigned_roles: [],
				topic_type: "for_information",
				viewpoint: {}
			};
		}

		function getDisplayIssue() {
			if (service.state.displayIssue && service.state.allIssues.length > 0){

				var issueToDisplay = service.state.allIssues.find(function(issue){
					return issue._id === service.state.displayIssue;
				});
				
				return issueToDisplay;
					
			}
			return false;
		}

		// Helper function for searching strings
		function stringSearch(superString, subString) {
			if(!superString){
				return false;
			}

			return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
		}

		function setupIssuesToShow(model, filterText) {
			service.state.issuesToShow = [];

			if (service.state.allIssues.length > 0) {

				// Sort
				service.state.issuesToShow = service.state.allIssues.slice();
				if (service.state.issueDisplay.sortOldestFirst) {
					service.state.issuesToShow.sort(function(a, b){
						return a.created - b.created;
					});
				} else {
					service.state.issuesToShow.sort(function(a, b){
						return b.created - a.created;
					});
				}
				
				// TODO: There is certainly a better way of doing this, but I don't want to
				// dig into it right before release

				// Filter text
				var someText = angular.isDefined(filterText) && filterText !== "";
				if (someText) {

					// TODO: do we need $filter?

					service.state.issuesToShow = ($filter("filter")(service.state.issuesToShow, function(issue) {
						// Required custom filter due to the fact that Angular
						// does not allow compound OR filters
						var i;

						// Search the title
						var show = stringSearch(issue.title, filterText);
						show = show || stringSearch(issue.timeStamp, filterText);
						show = show || stringSearch(issue.owner, filterText);

						// Search the list of assigned issues
						if (!show && issue.hasOwnProperty("assigned_roles")) {
							i = 0;
							while(!show && (i < issue.assigned_roles.length)) {
								show = show || stringSearch(issue.assigned_roles[i], filterText);
								i += 1;
							}
						}

						// Search the comments
						if (!show && issue.hasOwnProperty("comments")) {
							i = 0;

							while(!show && (i < issue.comments.length)) {
								show = show || stringSearch(issue.comments[i].comment, filterText);
								show = show || stringSearch(issue.comments[i].owner, filterText);
								i += 1;
							}
						}

						return show;
					}));
				} 

				// Closed
				for (var i = (service.state.issuesToShow.length - 1); i >= 0; i -= 1) {

					if (!service.state.issueDisplay.showClosed && (service.state.issuesToShow[i].status === "closed")) {
						service.state.issuesToShow.splice(i, 1);
					}
				}

				// Sub models
				service.state.issuesToShow = service.state.issuesToShow.filter(function (issue) {
					return service.state.issueDisplay.showSubModelIssues ? true : (issue.model === model);
				});

				//Roles Filter
				service.state.issuesToShow = service.state.issuesToShow.filter(function(issue){
					return service.state.issueDisplay.excludeRoles.indexOf(issue.creator_role) === -1;
				});
			
			}

		}

		function resetSelectedIssue() {
			service.state.selectedIssue = undefined;
			//showIssuePins();
		}

		function isSelectedIssue(issue) {
			if (!service.state.selectedIssue || !service.state.selectedIssue._id) {
				return false;
			} else {
				return issue._id === service.state.selectedIssue._id;
			}
		}

		function showIssuePins() {

			// TODO: This is still inefficent and unclean
			service.state.allIssues.forEach(function(issue) {
				var show = service.state.issuesToShow.find(function(shownIssue){
					return issue._id === shownIssue._id;
				});

				// Check that there is a position for the pin
				var pinPosition = issue.position && issue.position.length;

				if (show !== undefined && pinPosition) {

					var pinColor = Pin.pinColours.blue;
					var isSelectedPin = service.state.selectedIssue && 
										issue._id === service.state.selectedIssue._id;

					if (isSelectedPin) {
						pinColor = Pin.pinColours.yellow;
					}

					ViewerService.addPin({
						id: issue._id,
						account: issue.account,
						model: issue.model,
						pickedPos: issue.position,
						pickedNorm: issue.norm,
						colours: pinColor,
						viewpoint: issue.viewpoint
					});

				} else {
					// Remove pin
					ViewerService.removePin({ id: issue._id });
				}
			});

		}

		function setSelectedIssue(issue, isCorrectState) {

			if (service.state.selectedIssue) {
				var different = (service.state.selectedIssue._id !== issue._id);
				if (different) {
					deselectPin(service.state.selectedIssue);
				}
			}
			
			service.state.selectedIssue = issue;

			// If we're saving then we already have pin and
			// highlights in place
			if (!isCorrectState) {
				showIssuePins();
				showIssue(issue);
			}

		}

		function populateNewIssues(newIssues) {
			newIssues.forEach(populateIssue);
			service.state.allIssues = newIssues;
		}

		function addIssue(issue) {
			populateIssue(issue);
			service.state.allIssues.unshift(issue);
		}

		function updateIssues(issue) {

			populateIssue(issue);

			service.state.allIssues.forEach(function(oldIssue, i){
				var matchs = oldIssue._id === issue._id;
				if(matchs){

					if(issue.status === "closed"){
						
						service.state.allIssues[i].justClosed = true;

						$timeout(function(){

							service.state.allIssues[i] = issue;

						}, 4000);

					} else {
						service.state.allIssues[i] = issue;
					}

				}
			});
		}

		function init() {
			return initPromise.promise;
		}

		function populateIssue(issue) {
			
			if (issue) {
				issue.title = generateTitle(issue);
			}
			
			if (issue.created) {
				issue.timeStamp = getPrettyTime(issue.created);
			}
			
			if (issue.thumbnail) {
				issue.thumbnailPath = getThumbnailPath(issue.thumbnail);
			}

			if (issue) {
				issue.statusIcon = getStatusIcon(issue);
			}
			
			if (issue.assigned_roles[0]) {
				issue.issueRoleColor = getJobColor(issue.assigned_roles[0]);
			}
			
			if (!issue.descriptionThumbnail) {
				if (issue.viewpoint && issue.viewpoint.screenshotSmall && issue.viewpoint.screenshotSmall !== "undefined") {
					issue.descriptionThumbnail = APIService.getAPIUrl(issue.viewpoint.screenshotSmall);
				}
			}

		}

		function userJobMatchesCreator(userJob, issueData) {

			return (userJob._id && 
				issueData.creator_role && 
				userJob._id === issueData.creator_role);
		}

		function isViewer(permissions) {
			//console.log("isViewer", permissions);
			return !AuthService.hasPermission(
				ClientConfigService.permissions.PERM_COMMENT_ISSUE, 
				permissions
			);
		}

		function isAssignedJob(userJob, issueData, permissions) {
			//console.log("isAssignedJob", permissions);
			return (userJob._id && 
					issueData.assigned_roles[0] && 
					userJob._id === issueData.assigned_roles[0]) &&
					!isViewer(permissions);
		}

		function isAdmin(permissions) {
			return AuthService.hasPermission(
				ClientConfigService.permissions.PERM_MANAGE_MODEL_PERMISSION, 
				permissions
			);
		}

		function canChangePriority(issueData, userJob, permissions) {

			var notViewer = !isViewer(permissions);
			var matches = userJobMatchesCreator(userJob, issueData);

			return isAdmin(permissions) || (matches && notViewer);
		}

		function canChangeStatusToClosed(issueData, userJob, permissions) {
			
			var jobOwner = (userJobMatchesCreator(userJob, issueData) &&
							!isViewer(permissions));

			return isAdmin(permissions) || jobOwner;
					
		}

		function canChangeStatus(issueData, userJob, permissions) {

			var assigned = isAssignedJob(userJob, issueData, permissions);
			var jobMatches = (
				userJobMatchesCreator(userJob, issueData) &&
				!isViewer(permissions)
			);
			return isAdmin(permissions) || jobMatches || assigned;
					
		}

		function canChangeType(issueData, userJob, permissions) {
			
			return canComment(issueData, userJob, permissions);

		}

		function canChangeAssigned(issueData, userJob, permissions) {
			
			return canComment(issueData, userJob, permissions);

		}

		function isOpen(issueData) {
			if (issueData) {
				return issueData.status !== "closed";
			}
			return false;
		}

		function canComment(issueData, userJob, permissions) {
			
			var isNotClosed = issueData && 
				issueData.status && 
				isOpen(issueData);

			var ableToComment = AuthService.hasPermission(
				ClientConfigService.permissions.PERM_COMMENT_ISSUE, 
				permissions
			);

			return ableToComment && isNotClosed;

		}


		// function setCanUpdateIssue(issueData, userJob, permissions) {
			
		// 	// If they are the owner
		// 	var isOwner = (AuthService.getUsername() === issueData.owner);

		// 	// Check that the jobs match
		// 	var jobsMatch = (userJob._id && 
		// 					issueData.creator_role && 
		// 					userJob._id === issueData.creator_role &&
		// 					// And also that they can also at least comment ('edit' so to speak)
		// 					AuthService.hasPermission(
		// 						ClientConfigService.permissions.PERM_COMMENT_ISSUE, 
		// 						permissions
		// 					))l
			
		// 	console.log("jobs - jobsMatch - ", userJob._id, issueData.creator_role, userJob._id === issueData.creator_role);
		// 	console.log("jobs - jobsMatch - ", jobsMatch)

		// 	var jobsMatchAssigned = (userJob._id && 
		// 						issueData.assigned_roles[0] && 
		// 						userJob._id === issueData.assigned_roles[0] && 
		// 						AuthService.hasPermission(
		// 							ClientConfigService.permissions.PERM_COMMENT_ISSUE, 
		// 							permissions
		// 						));

		// 	// Or alternatively they just have full permissions
		// 	var hasPermission = AuthService.hasPermission(
		// 		ClientConfigService.permissions.PERM_MANAGE_MODEL_PERMISSION, 
		// 		permissions
		// 	);

		// 	console.log("jobs - permissions: ", permissions)
		// 	console.log("jobs - isOwner", isOwner)
		// 	console.log("jobs - jobsMatch", jobsMatch)
		// 	console.log("jobs - hasPermission", hasPermission)

		// 	return isOwner || jobsMatch || hasPermission || jobsMatchAssigned;

		// }

		function deselectPin(issue) {
			// Issue with position means pin
			if (issue.position.length > 0 && issue._id) {
				ViewerService.changePinColours({
					id: issue._id,
					colours: Pin.pinColours.blue
				});
			}
		}

		function showIssue(issue) {		

			TreeService.showProgress = true;

			showIssuePins();

			// Remove highlight from any multi objects
			ViewerService.highlightObjects([]);
			var hideIfcState = TreeService.getHideIfc();
			TreeService.setHideIfc(false);
			TreeService.showAllTreeNodes();
			TreeService.setHideIfc(hideIfcState);

			// clear selection
			//EventService.send(EventService.EVENT.RESET_SELECTED_OBJS, []);

			// Show multi objects
			if ((issue.viewpoint && (issue.viewpoint.hasOwnProperty("highlighted_group_id") || issue.viewpoint.hasOwnProperty("hidden_group_id") || issue.viewpoint.hasOwnProperty("group_id"))) || issue.hasOwnProperty("group_id")) {

				showMultiIds(issue).then(() => {
					TreeService.showProgress = false;
					handleShowIssue(issue);
				});
				
		
			} else {
				TreeService.showProgress = false;
				handleShowIssue(issue);
			}

			

		}

		function handleShowIssue(issue) {
			var issueData;
			if(issue.viewpoint.position.length > 0) {
				// Set the camera position
				issueData = {
					position : issue.viewpoint.position,
					view_dir : issue.viewpoint.view_dir,
					look_at : issue.viewpoint.look_at,
					up: issue.viewpoint.up,
					account: issue.account,
					model: issue.model
				};
				
				$timeout().then(function(){
					ViewerService.setCamera(issueData);
				});

				// TODO: Use ViewerService
				// Set the clipping planes
				issueData = {
					clippingPlanes: issue.viewpoint.clippingPlanes,
					fromClipPanel: false,
					account: issue.account,
					model: issue.model
				};

				EventService.send(EventService.EVENT.VIEWER.UPDATE_CLIPPING_PLANES, issueData);

			} else {
				//This issue does not have a viewpoint, go to default viewpoint
				ViewerService.goToExtent();
			}
		}

		function showMultiIds(issue) {

			var promises = [];

			if (issue.viewpoint && (issue.viewpoint.hasOwnProperty("highlighted_group_id") || issue.viewpoint.hasOwnProperty("hidden_group_id"))) {
				if (issue.viewpoint.highlighted_group_id) {
					var highlightedGroupId = issue.viewpoint.highlighted_group_id;
					var highlightedGroupUrl = issue.account + "/" + issue.model + "/groups/" + highlightedGroupId;

					var highlightPromise = APIService.get(highlightedGroupUrl)
						.then(function (response) {
							return handleHighlights(response.data.objects);
						})
						.catch(function(error){
							console.error("There was a problem getting the highlights: ", error);
						});

					promises.push(highlightPromise);

				}
				
				if (issue.viewpoint.hidden_group_id) {
					var hiddenGroupId = issue.viewpoint.hidden_group_id;
					var hiddenGroupUrl = issue.account + "/" + issue.model + "/groups/" + hiddenGroupId;

					var hiddenPromise = APIService.get(hiddenGroupUrl)
						.then(function (response) {
							return handleHidden(response.data.objects);
						})
						.catch(function(error){
							console.error("There was a problem getting visibility: ", error);
						});

					promises.push(hiddenPromise);
					
				}
			} else {
				var groupId = (issue.viewpoint && issue.viewpoint.hasOwnProperty("group_id")) ? issue.viewpoint.group_id : issue.group_id;
				var groupUrl = issue.account + "/" + issue.model + "/groups/" + groupId;

				var handleTreePromise = APIService.get(groupUrl)
					.then(function (response) {
						if (response.data.hiddenObjects && response.data.hiddenObjects && !issue.viewpoint.hasOwnProperty("group_id")) {
							response.data.hiddenObjects = null;
						}
						return handleTree(response);
					})
					.catch(function(error){
						console.error("There was a problem getting the highlights: ", error);
					});

				promises.push(handleTreePromise);

			}

			return Promise.all(promises);
		}

		function handleHighlights(objects) {
			var ids = [];
			
			TreeService.getMap()
				.then(function(treeMap){

					// show currently hidden nodes
					TreeService.clearCurrentlySelected();

					for (var i = 0; i < objects.length; i++) {
						var obj = objects[i];
						var account = obj.account;
						var model = obj.model;
						var key = account + "@" + model;
						if(!ids[key]){
							ids[key] = [];
						}	

						var objUid = treeMap.sharedIdToUid[obj.shared_id];
						
						if (objUid) {
							ids[key].push(objUid);
							if (i < objects.length - 1) {
								TreeService.selectNode(TreeService.getNodeById(objUid), true);
							} else {
								// Only call expandToSelection for last selected node to improve performance
								console.log("expandToSelection start - from issues service");
								let start = performance.now();
								TreeService.initNodesToShow([TreeService.allNodes[0]])
								TreeService.expandToSelection(TreeService.getPath(objUid), 0, undefined, true);
								let stop = performance.now();
								console.log("expandToSelection end - from issues service");
								console.log("expandToSelection TOTAL TIME - from issues service: ", stop - start, "ms");
								
								
							}
						}
					}
			
				})
				.catch(function(error) {
					console.error(error);
				});
		}

		function handleHidden(objects) {

			TreeService.getMap()
				.then(function(treeMap){

					// show currently hidden nodes
					var hideIfcState = TreeService.getHideIfc();
					TreeService.setHideIfc(false);

					if (objects) {
						objects.forEach(function(obj){
							var account = obj.account;
							var model = obj.model;
							var key = account + "@" + model;

							var nodeId = treeMap.sharedIdToUid[obj.shared_id];
							TreeService.setTreeNodeVisibility(TreeService.getNodeById(nodeId), "invisible", false);

						});
					}
					
					TreeService.setHideIfc(hideIfcState);

				})
				.catch(function(error) {
					console.error(error);
				});
		}

		function handleTree(response) {

			if (response.data.objects && response.data.objects.length > 0) {
				handleHighlights(response.data.objects);
			}

			if (response.data.hiddenObjects) {
				handleHidden(response.data.hiddenObjects);
			} 

		}

		// TODO: Internationalise and make globally accessible
		function getPrettyTime(time) {
			var date = new Date(time),
				currentDate = new Date(),
				prettyTime,
				postFix,
				hours;
			
			var	monthToText = [
				"Jan", "Feb", "Mar", "Apr", 
				"May", "Jun", "Jul", "Aug", 
				"Sep", "Oct", "Nov", "Dec"
			];

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
		}

		function generateTitle(issue) {
			if (issue.modelCode){
				return issue.modelCode + "." + issue.number + " " + issue.name;
			} else if (issue.typePrefix) {
				return issue.typePrefix + "." + issue.number + " " + issue.name;
			} else {
				return issue.number + " " + issue.name;
			}
		}

		function getThumbnailPath(thumbnailUrl) {
			return APIService.getAPIUrl(thumbnailUrl);
		}

		function getIssue(account, model, issueId){

			var deferred = $q.defer();
			var issueUrl = account + "/" + model + "/issues/" + issueId + ".json";
		
			APIService.get(issueUrl).then(function(res){

				res.data = cleanIssue(res.data);

				deferred.resolve(res.data);

			}).catch(function(err){
				deferred.reject(err);
			});

			return deferred.promise;

		}

		function getIssues(account, model, revision) {

			// TODO: This is a bit hacky. We are 
			// basically saying when getIssues is called
			// we know the issues component is loaded...
			initPromise.resolve();

			var deferred = $q.defer();
			var endpoint;
			if(revision){
				endpoint = account + "/" + model + "/revision/" + revision + "/issues.json";
			} else {
				endpoint = account + "/" + model + "/issues.json";
			}

			APIService.get(endpoint).then(
				function(response) {
					var issuesData = response.data;
					for (var i = 0; i < response.data.length; i ++) {
						populateIssue(issuesData[i]);
					}
					deferred.resolve(response.data);
				},
				function() {
					deferred.resolve([]);
				}
			);

			

			return deferred.promise;
		}

		function saveIssue(issue) {
			var deferred = $q.defer(),
				saveUrl;

			var base = issue.account + "/" + issue.model;
			if (issue.rev_id){
				saveUrl = base + "/revision/" + issue.rev_id + "/issues.json";
			} else {
				saveUrl = base + "/issues.json";
			}

			config = {withCredentials: true};

			if (issue.pickedPos !== null) {
				issue.position = issue.pickedPos;
				issue.norm = issue.pickedNorm;
			}

			APIService.post(saveUrl, issue, config)
				.then(function successCallback(response) {
					deferred.resolve(response);
				});

			return deferred.promise;
		}

		/**
		 * Update issue
		 * @param issue
		 * @param issueData
		 * @returns {*}
		 */
		function updateIssue(issue, issueData) {
			return doPut(issue, issueData);
		}

		/**
		 * Handle PUT requests
		 * @param issue
		 * @param putData
		 * @returns {*}
		 */
		function doPut(issue, putData) {

			var endpoint = issue.account + "/" + issue.model;

			if(issue.rev_id){
				endpoint += "/revision/" + issue.rev_id + "/issues/" +  issue._id + ".json";
			} else {
				endpoint += "/issues/" + issue._id + ".json";
			}
				
			var putConfig = {withCredentials: true};

			return APIService.put(endpoint, putData, putConfig);
		
		}

		function toggleCloseIssue(issue) {
			var closed = true;
			if (issue.hasOwnProperty("closed")) {
				closed = !issue.closed;
			}
			return doPut(issue, {
				closed: closed,
				number: issue.number
			});
		}

		function assignIssue(issue) {
			return doPut(
				issue,
				{
					assigned_roles: issue.assigned_roles,
					number: 0 //issue.number
				}
			);
		}

		function saveComment(issue, comment, viewpoint) {
			return doPut(issue, {
				comment: comment,
				viewpoint: viewpoint
			});
		}

		function editComment(issue, comment, commentIndex) {
			return doPut(issue, {
				comment: comment,
				number: issue.number,
				edit: true,
				commentIndex: commentIndex
			});
		}

		function deleteComment(issue, index) {
			return doPut(issue, {
				comment: "",
				number: issue.number,
				delete: true,
				commentIndex: index
				// commentCreated: issue.comments[index].created
			});
		}

		function sealComment(issue, commentIndex) {
			return doPut(issue, {
				comment: "",
				number: issue.number,
				sealed: true,
				commentIndex: commentIndex
			});
		}

		function getJobs(account, model){

			var deferred = $q.defer();
			url = account + "/" + model + "/jobs.json";

			APIService.get(url).then(
				function(jobsData) {
					availableJobs = jobsData.data;
					deferred.resolve(availableJobs);
				},
				function() {
					deferred.resolve([]);
				}
			);

			return deferred.promise;
		}

		function getUserJobForModel(account, model){
			var deferred = $q.defer();
			url = account + "/" +model + "/userJobForModel.json";

			APIService.get(url).then(
				function(userJob) {
					deferred.resolve(userJob.data);
				},
				function() {
					deferred.resolve();
				}
			);

			return deferred.promise;
		}


		function hexToRgb(hex) {
			// If nothing comes end, then send nothing out.
			if (!hex) {
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

			return [
				(parseInt(hexColours[0], 16) / 255.0), 
				(parseInt(hexColours[1], 16) / 255.0), 
				(parseInt(hexColours[2], 16) / 255.0)
			];
		}

		function getJobColor(id) {

			var roleColor = "#ffffff";
			var found = false;

			if (id) {
				for (var i = 0; i < availableJobs.length; i ++) {
					var job = availableJobs[i];
					if (job._id === id && job.color) {
						roleColor = job.color;
						found = true;
						break;
					}
				}	
			}
			
			if (!found) {
				console.debug("Job color not found for", id);
			}

			return roleColor;
		}

		/**
		 * Set the status icon style and colour
		 */
		function getStatusIcon(issue) {

			var statusIcon = {};

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

			switch (issue.status) {
			case "open":
				statusIcon.icon = "panorama_fish_eye";
				break;
			case "in progress":
				statusIcon.icon = "lens";
				break;
			case "for approval":
				statusIcon.icon = "adjust";
				break;
			case "closed":
				statusIcon.icon = "check_circle";
				statusIcon.colour = "#0C2F54";
				break;
			}

			return statusIcon;
		}

		/**
		* Import bcf
		*/
		function importBcf(account, model, revision, file){

			var deferred = $q.defer();

			var bcfUrl = account + "/" + model + "/issues.bcfzip";
			if(revision){
				bcfUrl = account + "/" + model + "/revision/" + revision + "/issues.bcfzip";
			}

			var formData = new FormData();
			formData.append("file", file);

			APIService.post(bcfUrl, formData, {"Content-Type": undefined}).then(function(res){
				
				if(res.status === 200){
					deferred.resolve();
				} else {
					deferred.reject(res.data);
				}

			});

			return deferred.promise;
		}

		/**
		 * Convert an action comment to readable text
		 * @param comment
		 * @returns {string}
		 */
		function convertActionCommentToText(comment, topic_types) {
			var text = "";

			switch (comment.action.property) {
			case "priority":

				comment.action.propertyText = "Priority";
				comment.action.from = convertActionValueToText(comment.action.from);
				comment.action.to = convertActionValueToText(comment.action.to);
				break;

			case "status":

				comment.action.propertyText = "Status";
				comment.action.from = convertActionValueToText(comment.action.from);
				comment.action.to= convertActionValueToText(comment.action.to);

				break;

			case "assigned_roles":

				comment.action.propertyText = "Assigned";
				comment.action.from = comment.action.from.toString();
				comment.action.to= comment.action.to.toString();	
							
				break;

			case "topic_type":

				comment.action.propertyText = "Type";
				if(topic_types){

					var from = topic_types.find(function(topic_type){
						return topic_type.value === comment.action.from;
					});

					var to = topic_types.find(function(topic_type){
						return topic_type.value === comment.action.to;
					});

					if(from && from.label){
						comment.action.from = from.label;
					}

					if(to && to.label){
						comment.action.to = to.label;
					}

				}

				break;

			case "desc":

				comment.action.propertyText = "Description";

				break;
			}

			return text;
		}

		/**
		 * generate title, screenshot path and comment for an issue
		 * @param issue
		 * @returns issue
		 */
		function cleanIssue(issue){

			issue.timeStamp = getPrettyTime(issue.created);
			issue.title = generateTitle(issue);

			if (issue.hasOwnProperty("comments")) {
				for (var j = 0, numComments = issue.comments.length; j < numComments; j += 1) {
					if (issue.comments[j].hasOwnProperty("created")) {
						issue.comments[j].timeStamp = getPrettyTime(issue.comments[j].created);
					}
					// Action comment text
					if (issue.comments[j].action) {
						issue.comments[j].comment = convertActionCommentToText(issue.comments[j]);
					}
					//screen shot path
					if (issue.comments[j].viewpoint && issue.comments[j].viewpoint.screenshot) {
						issue.comments[j].viewpoint.screenshotPath = APIService.getAPIUrl(issue.comments[j].viewpoint.screenshot);
					}
				}
			}

			return issue;
		}

		/**
		 * Convert an action value to readable text
		 * @param value
		 */
		function convertActionValueToText (value) {
			var text = "";

			switch (value) {
			case "none":
				text = "None";
				break;
			case "low":
				text = "Low";
				break;
			case "medium":
				text = "Medium";
				break;
			case "high":
				text = "High";
				break;
			case "open":
				text = "Open";
				break;
			case "in progress":
				text = "In progress";
				break;
			case "for approval":
				text = "For approval";
				break;
			case "closed":
				text = "Closed";
				break;
			}

			return text;
		}

	}
}());
