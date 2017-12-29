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

declare const Pin: any;

export class IssuesService {

	public static $inject: string[] = [
		"$q",
		"$sanitize",
		"$timeout",
		"$filter",
		"ClientConfigService",
		"EventService",
		"APIService",
		"TreeService",
		"AuthService",
		"MultiSelectService",
		"ViewerService",
	];

	private url;
	private config;
	private numIssues;
	private availableJobs;
	private updatedIssue;
	private initPromise;
	private state;

	constructor(
		private $q,
		private $sanitize,
		private $timeout,
		private $filter,

		private ClientConfigService,
		private EventService,
		private APIService,
		private TreeService,
		private AuthService,
		private MultiSelectService,
		private ViewerService,

	) {
		this.url = "",
		this.config = {},
		this.numIssues = 0,
		this.availableJobs = [],
		this.updatedIssue = null;

		this.initPromise = $q.defer();

		this.state = {
			heights : {
				infoHeight : 135,
				issuesListItemHeight : 141,
			},
			selectedIssue: null,
			allIssues: [],
			issuesToShow: [],
			displayIssue: null,
			issueDisplay: {
				showSubModelIssues: false,
				showClosed: false,
				sortOldestFirst : false,
				excludeRoles: [],
			},
		};
	}

	public createBlankIssue(creatorRole) {
		return {
			creator_role: creatorRole,
			priority: "none",
			status: "open",
			assigned_roles: [],
			topic_type: "for_information",
			viewpoint: {},
		};
	}

	public getDisplayIssue() {
		if (this.state.displayIssue && this.state.allIssues.length > 0) {

			const issueToDisplay = this.state.allIssues.find((issue) => {
				return issue._id === this. state.displayIssue;
			});

			return issueToDisplay;

		}
		return false;
	}

	// Helper public for searching strings
	public stringSearch(superString, subString) {
		if (!superString) {
			return false;
		}

		return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
	}

	public setupIssuesToShow(model, filterText) {
		this.state.issuesToShow = [];

		if (this.state.allIssues.length > 0) {

			// Sort
			this.state.issuesToShow = this.state.allIssues.slice();
			if (this.state.issueDisplay.sortOldestFirst) {
				this.state.issuesToShow.sort((a, b) => {
					return a.created - b.created;
				});
			} else {
				this.state.issuesToShow.sort((a, b) => {
					return b.created - a.created;
				});
			}

			// TODO: There is certainly a better way of doing this, but I don't want to
			// dig into it right before release

			// Filter text
			const someText = !!filterText;
			if (someText) {

				// TODO: do we need $filter?

				this.state.issuesToShow = (this.$filter("filter")(this.state.issuesToShow, (issue) => {
					// Required custom filter due to the fact that Angular
					// does not allow compound OR filters
					let i;

					// Search the title
					let show = this.stringSearch(issue.title, filterText);
					show = show || this.stringSearch(issue.timeStamp, filterText);
					show = show || this.stringSearch(issue.owner, filterText);

					// Search the list of assigned issues
					if (!show && issue.hasOwnProperty("assigned_roles")) {
						i = 0;
						while (!show && (i < issue.assigned_roles.length)) {
							show = show || this.stringSearch(issue.assigned_roles[i], filterText);
							i += 1;
						}
					}

					// Search the comments
					if (!show && issue.hasOwnProperty("comments")) {
						i = 0;

						while (!show && (i < issue.comments.length)) {
							show = show || this.stringSearch(issue.comments[i].comment, filterText);
							show = show || this.stringSearch(issue.comments[i].owner, filterText);
							i += 1;
						}
					}

					return show;
				}));
			}

			// Closed
			for (let i = (this.state.issuesToShow.length - 1); i >= 0; i -= 1) {

				if (!this.state.issueDisplay.showClosed && (this.state.issuesToShow[i].status === "closed")) {
					this.state.issuesToShow.splice(i, 1);
				}
			}

			// Sub models
			this.state.issuesToShow = this.state.issuesToShow.filter((issue) => {
				return this.state.issueDisplay.showSubModelIssues ? true : (issue.model === model);
			});

			// Roles Filter
			this.state.issuesToShow = this.state.issuesToShow.filter((issue) => {
				return this.state.issueDisplay.excludeRoles.indexOf(issue.creator_role) === -1;
			});

		}

	}

	public resetSelectedIssue() {
		this.state.selectedIssue = undefined;
	}

	public isSelectedIssue(issue) {
		// console.log(state.selectedIssue);
		if (!this.state.selectedIssue || !this.state.selectedIssue._id) {
			return false;
		} else {
			return issue._id === this.state.selectedIssue._id;
		}
	}

	public showIssuePins() {

		// TODO: This is still inefficent and unclean
		this.state.allIssues.forEach((issue) => {
			const show = this.state.issuesToShow.find((shownIssue) => {
				return issue._id === shownIssue._id;
			});

			// Check that there is a position for the pin
			const pinPosition = issue.position && issue.position.length;

			if (show !== undefined && pinPosition) {

				let pinColor = Pin.pinColours.blue;
				const isSelectedPin = this.state.selectedIssue &&
										issue._id === this.state.selectedIssue._id;

				if (isSelectedPin) {
					pinColor = Pin.pinColours.yellow;
				}

				this.ViewerService.addPin({
					id: issue._id,
					account: issue.account,
					model: issue.model,
					pickedPos: issue.position,
					pickedNorm: issue.norm,
					colours: pinColor,
					viewpoint: issue.viewpoint,
				});

			} else {
				// Remove pin
				this.ViewerService.removePin({ id: issue._id });
			}
		});

	}

	public setSelectedIssue(issue, isCorrectState) {

		if (this.state.selectedIssue) {
			const different = (this.state.selectedIssue._id !== issue._id);
			if (different) {
				this.deselectPin(this.state.selectedIssue);
			}
		}

		this.state.selectedIssue = issue;

		// If we're saving then we already have pin and
		// highlights in place
		if (!isCorrectState) {
			this.showIssuePins();
			this.showIssue(issue);
		}

	}

	public populateNewIssues(newIssues) {
		newIssues.forEach(this.populateIssue.bind(this));
		this.state.allIssues = newIssues;
	}

	public addIssue(issue) {
		this.populateIssue(issue);
		this.state.allIssues.unshift(issue);
	}

	public updateIssues(issue) {

		this.populateIssue(issue);

		this.state.allIssues.forEach((oldIssue, i) => {
			const matchs = oldIssue._id === issue._id;
			if (matchs) {

				if (issue.status === "closed") {

					this.state.allIssues[i].justClosed = true;

					this.$timeout(() => {

						this.state.allIssues[i] = issue;

					}, 4000);

				} else {
					this.state.allIssues[i] = issue;
				}

			}
		});
	}

	public init() {
		return this.initPromise.promise;
	}

	public populateIssue(issue) {

		if (issue) {
			issue.title = this.generateTitle(issue);
		}

		if (issue.created) {
			issue.timeStamp = this.getPrettyTime(issue.created);
		}

		if (issue.thumbnail) {
			issue.thumbnailPath = this.getThumbnailPath(issue.thumbnail);
		}

		if (issue) {
			issue.statusIcon = this.getStatusIcon(issue);
		}

		if (issue.assigned_roles[0]) {
			issue.issueRoleColor = this.getJobColor(issue.assigned_roles[0]);
		}

		if (!issue.descriptionThumbnail) {
			if (issue.viewpoint && issue.viewpoint.screenshotSmall && issue.viewpoint.screenshotSmall !== "undefined") {
				issue.descriptionThumbnail = this.APIService.getAPIUrl(issue.viewpoint.screenshotSmall);
			}
		}

	}

	public userJobMatchesCreator(userJob, issueData) {

		return (userJob._id &&
			issueData.creator_role &&
			userJob._id === issueData.creator_role);
	}

	public isIssues(permissions) {
		// console.log("isIssues", permissions);
		return !this.AuthService.hasPermission(
			this.ClientConfigService.permissions.PERM_COMMENT_ISSUE,
			permissions,
		);
	}

	public isAssignedJob(userJob, issueData, permissions) {
		// console.log("isAssignedJob", permissions);
		return (userJob._id &&
				issueData.assigned_roles[0] &&
				userJob._id === issueData.assigned_roles[0]) &&
				!this.isIssues(permissions);
	}

	public isAdmin(permissions) {
		return this.AuthService.hasPermission(
			this.ClientConfigService.permissions.PERM_MANAGE_MODEL_PERMISSION,
			permissions,
		);
	}

	public canChangePriority(issueData, userJob, permissions) {

		const notIssues = !this.isIssues(permissions);
		const matches = this.userJobMatchesCreator(userJob, issueData);

		return this.isAdmin(permissions) || (matches && notIssues);
	}

	public canChangeStatusToClosed(issueData, userJob, permissions) {

		const jobOwner = (this.userJobMatchesCreator(userJob, issueData) &&
						!this.isIssues(permissions));

		return this.isAdmin(permissions) || jobOwner;

	}

	public canChangeStatus(issueData, userJob, permissions) {

		const assigned = this.isAssignedJob(userJob, issueData, permissions);
		const jobMatches = (
			this.userJobMatchesCreator(userJob, issueData) &&
			!this.isIssues(permissions)
		);
		return this.isAdmin(permissions) || jobMatches || assigned;

	}

	public canChangeType(issueData, userJob, permissions) {
		return this.canComment(issueData, userJob, permissions);
	}

	public canChangeAssigned(issueData, userJob, permissions) {
		return this.canComment(issueData, userJob, permissions);
	}

	public isOpen(issueData) {
		if (issueData) {
			return issueData.status !== "closed";
		}
		return false;
	}

	public canComment(issueData, userJob, permissions) {

		const isNotClosed = issueData &&
			issueData.status &&
			this.isOpen(issueData);

		const ableToComment = this.AuthService.hasPermission(
			this.ClientConfigService.permissions.PERM_COMMENT_ISSUE,
			permissions,
		);

		return ableToComment && isNotClosed;

	}

	public deselectPin(issue) {
		// Issue with position means pin
		if (issue.position.length > 0 && issue._id) {
			this.ViewerService.changePinColours({
				id: issue._id,
				colours: Pin.pinColours.blue,
			});
		}
	}

	public showIssue(issue) {
		let issueData;

		this.showIssuePins();

		if (issue.viewpoint.position.length > 0) {
			// Set the camera position
			issueData = {
				position : issue.viewpoint.position,
				view_dir : issue.viewpoint.view_dir,
				look_at : issue.viewpoint.look_at,
				up: issue.viewpoint.up,
				account: issue.account,
				model: issue.model,
			};

			this.EventService.send(this.EventService.EVENT.VIEWER.SET_CAMERA, issueData);

			// Set the clipping planes
			issueData = {
				clippingPlanes: issue.viewpoint.clippingPlanes,
				fromClipPanel: false,
				account: issue.account,
				model: issue.model,
			};

			this.EventService.send(this.EventService.EVENT.VIEWER.UPDATE_CLIPPING_PLANES, issueData);

		} else {
			// This issue does not have a viewpoint, go to default viewpoint
			this.ViewerService.goToExtent();
		}

		// Remove highlight from any multi objects
		this.ViewerService.highlightObjects([]);

		// clear selection
		this.EventService.send(this.EventService.EVENT.RESET_SELECTED_OBJS, []);

		// Show multi objects
		if (
			(issue.viewpoint && issue.viewpoint.hasOwnProperty("group_id")) ||
			issue.hasOwnProperty("group_id")
		) {

			this.showMultiIds(issue);

		}
	}

	public showMultiIds(issue) {
		const hasGroupId = issue.viewpoint && issue.viewpoint.hasOwnProperty("group_id");
		const groupId = (hasGroupId) ? issue.viewpoint.group_id : issue.group_id;
		const groupUrl = issue.account + "/" + issue.model + "/groups/" + groupId;

		this.APIService.get(groupUrl)
			.then((response) => {
				this.handleTree(response);
			})
			.catch((error) => {
				console.error("There was a problem getting the highlights: ", error);
			});
	}

	public handleTree(response) {

		const ids = [];
		const objectIdsToHide = [];
		this.TreeService.getMap()
			.then((treeMap) => {
				const objectsPromise = this.$q.defer();

				this.ViewerService.getObjectsStatus({
					promise: objectsPromise,
				});

				// show currently hidden nodes
				objectsPromise.promise
					.then(() => {
						const hideIfcState = this.TreeService.getHideIfc();
						this.TreeService.setHideIfc(false);
						this.TreeService.showAllTreeNodes();

						if (response.data.hiddenObjects) {
							response.data.hiddenObjects.forEach((obj) => {
								const account = obj.account;
								const model = obj.model;
								const key = account + "@" + model;
								if (!objectIdsToHide[key]) {
									objectIdsToHide[key] = [];
								}

								objectIdsToHide[key].push(treeMap.sharedIdToUid[obj.shared_id]);

							});
						}

						for (const ns in objectIdsToHide) {

							if (objectIdsToHide.hasOwnProperty(ns)) {
								objectIdsToHide[ns].forEach((obj) => {
									this.TreeService.toggleTreeNodeVisibilityById(obj);
								});
							}

						}

						this.TreeService.setHideIfc(hideIfcState);
						this.TreeService.clearCurrentlySelected();

						for (let i = 0; i < response.data.objects.length; i++) {
							const obj = response.data.objects[i];
							const account = obj.account;
							const model = obj.model;
							const key = account + "@" + model;
							if (!ids[key]) {
								ids[key] = [];
							}

							const objUid = treeMap.sharedIdToUid[obj.shared_id];

							if (objUid) {
								ids[key].push(objUid);
								if (i < response.data.objects.length - 1) {
									this.TreeService.selectNode(this.TreeService.getNodeById(objUid), true);
								} else {
									// Only call expandToSelection for last selected node to improve performance
									this.TreeService.expandToSelection(this.TreeService.getPath(objUid), 0, undefined, true);
								}
							}
						}

					});

			})
			.catch((error) => {
				console.error(error);
			});

	}

	// TODO: Internationalise and make globally accessible
	public getPrettyTime(time) {
		const date = new Date(time);
		const currentDate = new Date();
		let prettyTime;
		let postFix;
		let hours;

		const	monthToText = [
			"Jan", "Feb", "Mar", "Apr",
			"May", "Jun", "Jul", "Aug",
			"Sep", "Oct", "Nov", "Dec",
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

	public generateTitle(issue) {
		if (issue.modelCode) {
			return issue.modelCode + "." + issue.number + " " + issue.name;
		} else if (issue.typePrefix) {
			return issue.typePrefix + "." + issue.number + " " + issue.name;
		} else {
			return issue.number + " " + issue.name;
		}
	}

	public getThumbnailPath(thumbnailUrl) {
		return this.APIService.getAPIUrl(thumbnailUrl);
	}

	public getIssue(account, model, issueId) {

		const deferred = this.$q.defer();
		const issueUrl = account + "/" + model + "/issues/" + issueId + ".json";

		this.APIService.get(issueUrl).then((res) => {

			res.data = this.cleanIssue(res.data);

			deferred.resolve(res.data);

		}).catch((err) => {
			deferred.reject(err);
		});

		return deferred.promise;

	}

	public getIssues(account, model, revision) {

		// TODO: This is a bit hacky. We are
		// basically saying when getIssues is called
		// we know the issues component is loaded...
		this.initPromise.resolve();

		const deferred = this.$q.defer();
		let endpoint;
		if (revision) {
			endpoint = account + "/" + model + "/revision/" + revision + "/issues.json";
		} else {
			endpoint = account + "/" + model + "/issues.json";
		}

		this.APIService.get(endpoint).then(
			(response) => {
				const issuesData = response.data;
				for (let i = 0; i < response.data.length; i ++) {
					this.populateIssue(issuesData[i]);
				}
				deferred.resolve(response.data);
			},
			() => {
				deferred.resolve([]);
			},
		);

		return deferred.promise;
	}

	public saveIssue(issue) {
		const deferred = this.$q.defer();
		let saveUrl;

		const base = issue.account + "/" + issue.model;
		if (issue.rev_id) {
			saveUrl = base + "/revision/" + issue.rev_id + "/issues.json";
		} else {
			saveUrl = base + "/issues.json";
		}

		const config = {withCredentials: true};

		if (issue.pickedPos !== null) {
			issue.position = issue.pickedPos;
			issue.norm = issue.pickedNorm;
		}

		this.APIService.post(saveUrl, issue, config)
			.then((response) => {
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
	public updateIssue(issue, issueData) {
		return this.doPut(issue, issueData);
	}

	/**
	 * Handle PUT requests
	 * @param issue
	 * @param putData
	 * @returns {*}
	 */
	public doPut(issue, putData) {

		let endpoint = issue.account + "/" + issue.model;

		if (issue.rev_id) {
			endpoint += "/revision/" + issue.rev_id + "/issues/" +  issue._id + ".json";
		} else {
			endpoint += "/issues/" + issue._id + ".json";
		}

		const putConfig = {withCredentials: true};

		return this.APIService.put(endpoint, putData, putConfig);

	}

	public toggleCloseIssue(issue) {
		let closed = true;
		if (issue.hasOwnProperty("closed")) {
			closed = !issue.closed;
		}
		return this.doPut(issue, {
			closed,
			number: issue.number,
		});
	}

	public assignIssue(issue) {
		return this.doPut(
			issue,
			{
				assigned_roles: issue.assigned_roles,
				number: 0, // issue.number
			},
		);
	}

	public saveComment(issue, comment, viewpoint) {
		return this.doPut(issue, {
			comment,
			viewpoint,
		});
	}

	public editComment(issue, comment, commentIndex) {
		return this.doPut(issue, {
			comment,
			number: issue.number,
			edit: true,
			commentIndex,
		});
	}

	public deleteComment(issue, index) {
		return this.doPut(issue, {
			comment: "",
			number: issue.number,
			delete: true,
			commentIndex: index,
			// commentCreated: issue.comments[index].created
		});
	}

	public sealComment(issue, commentIndex) {
		return this.doPut(issue, {
			comment: "",
			number: issue.number,
			sealed: true,
			commentIndex,
		});
	}

	public getJobs(account, model) {

		const deferred = this.$q.defer();
		const url = account + "/" + model + "/jobs.json";

		this.APIService.get(url).then(
			(jobsData) => {
				this.availableJobs = jobsData.data;
				deferred.resolve(this.availableJobs);
			},
			() => {
				deferred.resolve([]);
			},
		);

		return deferred.promise;
	}

	public getUserJobForModel(account, model) {
		const deferred = this.$q.defer();
		const url = account + "/" + model + "/userJobForModel.json";

		this.APIService.get(url).then(
			(userJob) => {
				deferred.resolve(userJob.data);
			},
			() => {
				deferred.resolve();
			},
		);

		return deferred.promise;
	}

	public hexToRgb(hex) {
		// If nothing comes end, then send nothing out.
		if (!hex) {
			return undefined;
		}

		let hexColours = [];

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
			(parseInt(hexColours[2], 16) / 255.0),
		];
	}

	public getJobColor(id) {

		let roleColor = "#ffffff";
		let found = false;

		if (id) {
			for (let i = 0; i < this.availableJobs.length; i ++) {
				const job = this.availableJobs[i];
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
	public getStatusIcon(issue) {

		const statusIcon: any = {};

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
	public importBcf(account, model, revision, file) {

		const deferred = this.$q.defer();

		let bfcUrl = account + "/" + model + "/issues.bcfzip";
		if (revision) {
			bfcUrl = account + "/" + model + "/revision/" + revision + "/issues.bcfzip";
		}

		const formData = new FormData();
		formData.append("file", file);

		this.APIService.post(bfcUrl, formData, {"Content-Type": undefined}).then((res) => {

			if (res.status === 200) {
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
	public convertActionCommentToText(comment, topic_types) {
		const text = "";

		switch (comment.action.property) {
		case "priority":

			comment.action.propertyText = "Priority";
			comment.action.from = this.convertActionValueToText(comment.action.from);
			comment.action.to = this.convertActionValueToText(comment.action.to);
			break;

		case "status":

			comment.action.propertyText = "Status";
			comment.action.from = this.convertActionValueToText(comment.action.from);
			comment.action.to = this.convertActionValueToText(comment.action.to);

			break;

		case "assigned_roles":

			comment.action.propertyText = "Assigned";
			comment.action.from = comment.action.from.toString();
			comment.action.to = comment.action.to.toString();

			break;

		case "topic_type":

			comment.action.propertyText = "Type";
			if (topic_types) {

				const from = topic_types.find((topic) => {
					return topic.value === comment.action.from;
				});

				const to = topic_types.find((topic) => {
					return topic.value === comment.action.to;
				});

				if (from && from.label) {
					comment.action.from = from.label;
				}

				if (to && to.label) {
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
	public cleanIssue(issue) {

		issue.timeStamp = this.getPrettyTime(issue.created);
		issue.title = this.generateTitle(issue);

		if (issue.hasOwnProperty("comments")) {
			for (let j = 0, numComments = issue.comments.length; j < numComments; j += 1) {
				if (issue.comments[j].hasOwnProperty("created")) {
					issue.comments[j].timeStamp = this.getPrettyTime(issue.comments[j].created);
				}
				// Action comment text
				if (issue.comments[j].action) {
					issue.comments[j].comment = this.convertActionCommentToText(issue.comments[j], undefined);
				}
				// screen shot path
				if (issue.comments[j].viewpoint && issue.comments[j].viewpoint.screenshot) {
					issue.comments[j].viewpoint.screenshotPath = this.APIService.getAPIUrl(issue.comments[j].viewpoint.screenshot);
				}
			}
		}

		return issue;
	}

	/**
	 * Convert an action value to readable text
	 * @param value
	 */
	public convertActionValueToText(value) {
		let text = "";

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

}

export const IssuesServiceModule = angular
	.module("3drepo")
	.service("IssuesService", IssuesService);
