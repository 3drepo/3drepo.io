/**
 *  Copyright (C) 2018 3D Repo Ltd
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

declare const Pin;

export class RisksService {

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
		"ClipService",
		"ViewerService",
		"PanelService",
		"DialogService"
	];

	public state: any;
	private groupsCache: any;

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
		private ClipService,
		private ViewerService,
		private PanelService,
		private DialogService
	) {
		this.reset();
	}

	public reset() {
		this.groupsCache = {};
		this.state = {
			heights : {
				infoHeight : 135,
				risksListItemHeight : 141
			},
			selectedRisk: null,
			allRisks: [],
			risksToShow: [],
			risksCardOptions: {
				showSubModelRisks: false,
				showPins: true,
				sortOldestFirst : false
			},
			availableJobs : [],
			modelUserJob: null
		};
		this.removeUnsavedPin();
	}

	public getRisksAndJobs(account: string, model: string, revision: string) {
		return Promise.all([
			this.getUserJobForModel(account, model),
			this.getRisksData(account, model, revision),
			this.getTeamspaceJobs(account, model)
		]);
	}

	public getRisksData(account: string, model: string, revision: string) {
		return this.getRisks(account, model, revision)
			.then((risks) => {
				if (risks) {
					risks.forEach(this.populateRisk.bind(this));
					this.state.allRisks = risks;
				} else {
					throw new Error("Error");
				}

			});

	}

	public getTeamspaceJobs(account: string, model: string): Promise<any[]> {
		const url = account + "/jobs";

		return this.APIService.get(url)
			.then((response) => {
				this.state.availableJobs = response.data;
				return this.state.availableJobs;
			});

	}

	public getUserJobForModel(account: string, model: string): Promise<any> {
		const url = account + "/myJob";

		return this.APIService.get(url)
			.then((response) => {
				this.state.modelUserJob = response.data;
				return this.state.modelUserJob;
			});
	}

	public createBlankRisk(creatorRole) {
		return {
			creator_role: creatorRole,
			associated_activity: "",
			category: "",
			likelihood: 0,
			consequence: 0,
			level_of_risk: 0,
			mitigation_status: "",
			assigned_roles: [],
			topic_type: "for_information",
			viewpoint: {}
		};
	}

	// Helper for searching strings
	public stringSearch(superString, subString) {
		if (!superString) {
			return false;
		}

		return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
	}

	public setupRisksToShow(model: string, filterText: string) {
		this.state.risksToShow = [];

		if (this.state.allRisks.length > 0) {

			// Sort
			this.state.risksToShow = this.state.allRisks.slice();
			if (this.state.risksCardOptions.sortOldestFirst) {
				this.state.risksToShow.sort((a, b) => {
					return a.created - b.created;
				});
			} else {
				this.state.risksToShow.sort((a, b) => {
					return b.created - a.created;
				});
			}

			// TODO: There is certainly a better way of doing this, but I don't want to
			// dig into it right before release

			// Filter text
			const notEmpty = angular.isDefined(filterText) && filterText !== "";
			if (notEmpty) {
				this.state.risksToShow = this.filteredRisks(filterText);
			}

			// Sub models
			this.state.risksToShow = this.state.risksToShow.filter((risk) => {
				return this.state.risksCardOptions.showSubModelRisks ? true : (risk.model === model);
			});

		}

	}

	public filteredRisks(filterText: string) {
		return (this.$filter("filter")(
			this.state.risksToShow,
			(risk) => {
				return this.handleRiskFilter(risk, filterText);
			}

		));
	}

	public handleRiskFilter(risk: any, filterText: string) {
		// Required custom filter due to the fact that Angular
		// does not allow compound OR filters

		// Exit the function as soon as we found a match.

		// Search the title, type and owner
		if ( this.stringSearch(risk.title, filterText) ||
			this.stringSearch(risk.owner, filterText) ||
			this.stringSearch(risk.topic_type, filterText)) {
			return true;
		}

		// Search the list of assigned risks
		if (risk.hasOwnProperty("assigned_roles")) {
			for (let roleIdx = 0; roleIdx < risk.assigned_roles.length; ++roleIdx) {
				if (this.stringSearch(risk.assigned_roles[roleIdx], filterText)) {
					return true;
				}
			}
		}

		// Search the comments
		if (risk.hasOwnProperty("comments")) {
			for (let commentIdx = 0; commentIdx < risk.comments.length; ++commentIdx) {
				if (!risk.comments[commentIdx].action &&  // skip any action comments (i.e system messages)
					this.stringSearch(risk.comments[commentIdx].comment, filterText) ||
					this.stringSearch(risk.comments[commentIdx].owner, filterText)) {
					return true;
				}
			}
		}

		return false;

	}

	public resetSelectedRisk() {
		this.state.selectedRisk = undefined;
	}

	public isSelectedRisk(risk) {
		if (!this.state.selectedRisk || !this.state.selectedRisk._id) {
			return false;
		} else {
			return risk._id === this.state.selectedRisk._id;
		}
	}

	public calculateLevelOfRisk(likelihood: string, consequence: string): number {
		let levelOfRisk = 0;

		if (likelihood && consequence) {
			const likelihoodConsequenceScore: number = parseInt(likelihood) + parseInt(consequence);

			if (6 < likelihoodConsequenceScore) {
				levelOfRisk = 4;
			} else if (5 < likelihoodConsequenceScore) {
				levelOfRisk = 3;
			} else if (2 < likelihoodConsequenceScore) {
				levelOfRisk = 2;
			} else if (1 < likelihoodConsequenceScore) {
				levelOfRisk = 1;
			} else {
				levelOfRisk = 0;
			}
		}

		return levelOfRisk;
	}

	public showRiskPins() {

		// TODO: This is still inefficent and unclean
		this.state.allRisks.forEach((risk) => {
			const show = this.state.risksToShow.find((shownRisk) => {
				return risk._id === shownRisk._id;
			});

			// Check that there is a position for the pin
			const pinPosition = risk.position && risk.position.length;

			if (this.state.risksCardOptions.showPins && show !== undefined && pinPosition) {

				const levelOfRisk = (risk.level_of_risk !== undefined) ? risk.level_of_risk : 4;
				const levelOfRiskColors = {
					4: {
						pinColor: Pin.pinColours.maroon,
						selectedColor: Pin.pinColours.red
					},
					3: {
						pinColor: Pin.pinColours.darkOrange,
						selectedColor: Pin.pinColours.orange
					},
					2: {
						pinColor: Pin.pinColours.lemonChiffon,
						selectedColor: Pin.pinColours.lightYellow
					},
					1: {
						pinColor: Pin.pinColours.limeGreen,
						selectedColor: Pin.pinColours.lightGreen
					},
					0: {
						pinColor: Pin.pinColours.green,
						selectedColor: Pin.pinColours.medSeaGreen
					}
				}

				const isSelectedPin = this.state.selectedRisk &&
									risk._id === this.state.selectedRisk._id;

				const pinColor = (isSelectedPin) ?
					levelOfRiskColors[levelOfRisk].selectedColor :
					levelOfRiskColors[levelOfRisk].pinColor;

				this.ViewerService.addPin({
					id: risk._id,
					type: "risk",
					account: risk.account,
					model: risk.model,
					pickedPos: risk.position,
					pickedNorm: risk.norm,
					colours: pinColor,
					viewpoint: risk.viewpoint
				});

			} else {
				// Remove pin
				this.ViewerService.removePin({ id: risk._id });
			}
		});

	}

	public setSelectedRisk(risk, isCorrectState, revision) {

		if (this.state.selectedRisk) {
			const different = (this.state.selectedRisk._id !== risk._id);
			if (different) {
				this.deselectPin(this.state.selectedRisk);
			}
		}

		this.state.selectedRisk = risk;

		// If we're saving then we already have pin and
		// highlights in place
		if (!isCorrectState) {
			this.showRiskPins();
			this.showRisk(risk, revision);
		}

	}

	public addRisk(risk) {
		this.populateRisk(risk);
		this.state.allRisks.unshift(risk);
	}

	public updateRisks(risk) {

		this.populateRisk(risk);

		this.state.allRisks.forEach((oldRisk, i) => {
			const matches = oldRisk._id === risk._id;
			if (matches) {

				if (risk.status === "closed") {

					this.state.allRisks[i].justClosed = true;

					this.$timeout(() => {

						this.state.allRisks[i] = risk;

					}, 4000);

				} else {
					this.state.allRisks[i] = risk;
				}

			}
		});
	}

	public populateRisk(risk) {

		if (risk) {
			risk.statusIcon = this.getStatusIcon(risk);

			if (risk.thumbnail) {
				risk.thumbnailPath = this.getThumbnailPath(risk.thumbnail);
			}

			if (risk.due_date) {
				risk.due_date = new Date(risk.due_date);
			}
			if (risk.assigned_roles[0]) {
				risk.roleColor = this.getJobColor(risk.assigned_roles[0]);
			}

			if (!risk.descriptionThumbnail) {
				if (risk.viewpoint && risk.viewpoint.screenshotSmall && risk.viewpoint.screenshotSmall !== "undefined") {
					risk.descriptionThumbnail = this.APIService.getAPIUrl(risk.viewpoint.screenshotSmall);
				}
			}
		}
	}

	public userJobMatchesCreator(userJob, riskData) {
		return (userJob._id &&
			riskData.creator_role &&
			userJob._id === riskData.creator_role);
	}

	public isViewer(permissions) {
		return permissions && !this.AuthService.hasPermission(
			this.ClientConfigService.permissions.PERM_COMMENT_ISSUE,
			permissions
		);
	}

	public isAssignedJob(riskData, userJob, permissions) {
		return riskData && userJob &&
			(userJob._id &&
				riskData.assigned_roles[0] &&
				userJob._id === riskData.assigned_roles[0]) &&
				!this.isViewer(permissions);
	}

	public isAdmin(permissions) {
		return permissions && this.AuthService.hasPermission(
			this.ClientConfigService.permissions.PERM_MANAGE_MODEL_PERMISSION,
			permissions
		);
	}

	public isJobOwner(riskData, userJob, permissions) {
		return riskData && userJob &&
			(riskData.owner === this.AuthService.getUsername() ||
			this.userJobMatchesCreator(userJob, riskData)) &&
			!this.isViewer(permissions);
	}

	public canChangePriority(riskData, userJob, permissions) {
		return (this.isAdmin(permissions) || this.isJobOwner(riskData, userJob, permissions)) &&
			this.canComment(riskData, userJob, permissions);
	}

	public canChangeStatusToClosed(riskData, userJob, permissions) {
		return this.isAdmin(permissions) || this.isJobOwner(riskData, userJob, permissions);
	}

	public canUpdateRisk(riskData, userJob, permissions) {
		return this.canChangeStatusToClosed(riskData, userJob, permissions) ||
			this.isAssignedJob(riskData, userJob, permissions);
	}

	public canSubmitUpdateRisk(riskData, userJob, permissions) {
		return this.canUpdateRisk(riskData, userJob, permissions);
	}
	public canChangeType(riskData, userJob, permissions) {
		return (this.isAdmin(permissions) || this.isJobOwner(riskData, userJob, permissions)) &&
			this.canComment(riskData, userJob, permissions);
	}

	public canChangeDescription(riskData, userJob, permissions) {
		return (this.isAdmin(permissions) || this.isJobOwner(riskData, userJob, permissions)) &&
			this.canComment(riskData, userJob, permissions);
	}

	public canChangeDueDate(riskData, userJob, permissions) {
		return (this.isAdmin(permissions) || this.isJobOwner(riskData, userJob, permissions)) &&
			this.canComment(riskData, userJob, permissions);
	}

	public canChangeAssigned(riskData, userJob, permissions) {
		return (this.isAdmin(permissions) ||
			this.isJobOwner(riskData, userJob, permissions) ||
			this.isAssignedJob(riskData, userJob, permissions)) &&
			this.canComment(riskData, userJob, permissions);
	}

	public isOpen(riskData) {
		if (riskData) {
			return riskData.status !== "closed";
		}
		return false;
	}

	/**
	 * user can comment if they are a commenter/collaborator,
	 * or if they have the same job as the risk owner (but not a viewer)
	 * or if they are the risk owner (but not a viewer),
	 * and the risk is not closed
	 */
	public canComment(riskData, userJob, permissions) {

		const isNotClosed = riskData &&
			riskData.status &&
			this.isOpen(riskData);

		const ableToComment = this.isAdmin(permissions) ||
			this.isJobOwner(riskData, userJob, permissions) ||
			this.AuthService.hasPermission(
				this.ClientConfigService.permissions.PERM_COMMENT_ISSUE,
				permissions
			);

		return ableToComment && isNotClosed;

	}

	public deselectPin(risk) {
		// Risk with position means pin
		if (risk.position && risk.position.length > 0 && risk._id) {
			this.ViewerService.changePinColours({
				id: risk._id,
				colours: Pin.pinColours.blue
			});
		}
	}

	public showRisk(risk, revision) {

		this.TreeService.showProgress = true;

		this.showRiskPins();

		// Remove highlight from any multi objects
		this.ViewerService.highlightObjects([]);
		this.TreeService.clearCurrentlySelected();

		// Reset object visibility
		if (risk.viewpoint && risk.viewpoint.hasOwnProperty("hideIfc")) {
			this.TreeService.setHideIfc(risk.viewpoint.hideIfc);
		}

		this.TreeService.showAllTreeNodes(false);

		// Show multi objects
		if ((risk.viewpoint && (risk.viewpoint.hasOwnProperty("highlighted_group_id") ||
						risk.viewpoint.hasOwnProperty("hidden_group_id") ||
						risk.viewpoint.hasOwnProperty("shown_group_id") ||
						risk.viewpoint.hasOwnProperty("group_id"))) ||
				risk.hasOwnProperty("group_id")) {

			this.showMultiIds(risk, revision).then(() => {
				this.TreeService.showProgress = false;
				this.handleShowRisk(risk);
			});

		} else {
			this.TreeService.showProgress = false;
			this.handleShowRisk(risk);
		}

	}

	public handleCameraView(risk) {
		// Set the camera position
		const riskData = {
			position : risk.viewpoint.position,
			view_dir : risk.viewpoint.view_dir,
			look_at : risk.viewpoint.look_at,
			up: risk.viewpoint.up,
			account: risk.account,
			model: risk.model
		};

		this.ViewerService.setCamera(riskData);

	}

	public handleShowRisk(risk) {

		if (risk && risk.viewpoint ) {

			if (risk.viewpoint.position && risk.viewpoint.position.length > 0) {
				this.handleCameraView(risk);
			}

			const riskData = {
				clippingPlanes: risk.viewpoint.clippingPlanes,
				fromClipPanel: false,
				account: risk.account,
				model: risk.model
			};

			this.ClipService.updateClippingPlane(riskData);

		} else {
			// This risk does not have a viewpoint, go to default viewpoint
			this.ViewerService.goToExtent();
		}

		this.TreeService.onReady().then(() => {
			this.TreeService.updateModelVisibility(this.TreeService.allNodes[0]);
		});

	}

	public showMultiIds(risk, revision) {

		const promises = [];

		if (risk.viewpoint && (risk.viewpoint.hasOwnProperty("highlighted_group_id") ||
					risk.viewpoint.hasOwnProperty("hidden_group_id") ||
					risk.viewpoint.hasOwnProperty("shown_group_id"))) {

			if (risk.viewpoint.hidden_group_id) {

				const hiddenGroupId = risk.viewpoint.hidden_group_id;
				let hiddenGroupUrl;
				if (revision) {
					hiddenGroupUrl = `${risk.account}/${risk.model}/groups/revision/${revision}/${hiddenGroupId}`;
				} else {
					hiddenGroupUrl = `${risk.account}/${risk.model}/groups/revision/master/head/${hiddenGroupId}`;
				}

				let hiddenPromise;

				if (this.groupsCache[hiddenGroupUrl]) {
					hiddenPromise = this.handleHidden(this.groupsCache[hiddenGroupUrl]);
				} else {

					hiddenPromise = this.APIService.get(hiddenGroupUrl)
						.then((response) => {
							this.groupsCache[hiddenGroupUrl] = response.data.objects;
							return this.handleHidden(response.data.objects);
						})
						.catch((error) => {
							console.error("There was a problem getting visibility: ", error);
						});

				}

				promises.push(hiddenPromise);

			}

			if (risk.viewpoint.shown_group_id) {

				const shownGroupId = risk.viewpoint.shown_group_id;
				let shownGroupUrl;
				if (revision) {
					shownGroupUrl = risk.account + "/" + risk.model + "/groups/revision/" + revision + "/" + shownGroupId;
				} else {
					shownGroupUrl = risk.account + "/" + risk.model + "/groups/revision/master/head/" + shownGroupId;
				}

				let shownPromise;

				if (this.groupsCache[shownGroupUrl]) {
					shownPromise = this.handleShown(this.groupsCache[shownGroupUrl]);
				} else {

					shownPromise = this.APIService.get(shownGroupUrl)
						.then( (response) => {
							this.groupsCache[shownGroupUrl] = response.data.objects;
							return this.handleShown(response.data.objects);
						})
						.catch((error) => {
							console.error("There was a problem getting visibility: ", error);
						});
				}

				promises.push(shownPromise);
			}

			if (risk.viewpoint.highlighted_group_id) {

				const highlightedGroupId = risk.viewpoint.highlighted_group_id;
				let highlightedGroupUrl;
				if (revision) {
					highlightedGroupUrl = `${risk.account}/${risk.model}/groups/revision/${revision}/${highlightedGroupId}`;
				} else {
					highlightedGroupUrl = `${risk.account}/${risk.model}/groups/revision/master/head/${highlightedGroupId}`;
				}

				let highlightPromise;

				if (this.groupsCache[highlightedGroupUrl]) {
					highlightPromise = this.handleHighlights(this.groupsCache[highlightedGroupUrl]);
				} else {

					highlightPromise = this.APIService.get(highlightedGroupUrl)
						.then((response) => {
							this.groupsCache[highlightedGroupUrl] = response.data.objects;
							return this.handleHighlights(response.data.objects);
						})
						.catch((error) => {
							console.error("There was a problem getting the highlights: ", error);
						});

				}

				promises.push(highlightPromise);
			}

		} else {

			const hasGroup = (risk.viewpoint && risk.viewpoint.hasOwnProperty("group_id"));
			const groupId = hasGroup ? risk.viewpoint.group_id : risk.group_id;
			let groupUrl;
			if (revision) {
				groupUrl = risk.account + "/" + risk.model + "/groups/revision/" + revision + "/" + groupId;
			} else {
				groupUrl = risk.account + "/" + risk.model + "/groups/revision/master/head/" + groupId;
			}

			let handleTreePromise;

			if (this.groupsCache[groupUrl]) {
				handleTreePromise = this.handleTree(this.groupsCache[groupUrl]);
			} else {

				handleTreePromise = this.APIService.get(groupUrl)
					.then((response) => {
						if (response.data.hiddenObjects && response.data.hiddenObjects && !risk.viewpoint.hasOwnProperty("group_id")) {
							response.data.hiddenObjects = null;
						}
						this.groupsCache[groupId] = response;
						return this.handleTree(response);
					})
					.catch((error) => {
						console.error("There was a problem getting the highlights: ", error);
					});

			}

			promises.push(handleTreePromise);

		}

		return Promise.all(promises);

	}

	public handleHighlights(objects) {
		this.TreeService.selectedIndex = undefined; // To force a watcher reset (if its the same object)
		this.$timeout(() => {
		this.TreeService.highlightsBySharedId(objects)
			.then(() => {
				angular.element((window as any)).triggerHandler("resize");
			});
		});
	}

	public handleHidden(objects) {
		this.TreeService.hideNodesBySharedIds(objects);
	}

	public handleShown(objects) {
		this.TreeService.isolateNodesBySharedIds(objects);
	}

	public handleTree(response) {

		if (response.data.hiddenObjects) {
			this.handleHidden(response.data.hiddenObjects);
		}

		if (response.data.shownObjects) {
			this.handleShown(response.data.shownObjects);
		}

		if (response.data.objects && response.data.objects.length > 0) {
			this.handleHighlights(response.data.objects);
		}

	}

	public getThumbnailPath(thumbnailUrl) {
		return this.APIService.getAPIUrl(thumbnailUrl);
	}

	public getRisk(account, model, riskId) {

		const riskUrl = account + "/" + model + "/risks/" + riskId + ".json";

		return this.APIService.get(riskUrl)
			.then((res) => {
				res.data = this.cleanRisk(res.data);
				return res.data;
			});

	}

	public getRisks(account, model, revision) {

		let endpoint;
		if (revision) {
			endpoint = account + "/" + model + "/revision/" + revision + "/risks.json";
		} else {
			endpoint = account + "/" + model + "/risks.json";
		}

		return this.APIService.get(endpoint)
			.then((response) => {
				const risksData = response.data;
				for (let i = 0; i < response.data.length; i ++) {
					this.populateRisk(risksData[i]);
				}
				return response.data;
			});
	}

	public saveRisk(risk) {

		// TODO save risk
		let saveUrl;
		const base = risk.account + "/" + risk.model;
		if (risk.rev_id) {
			saveUrl = base + "/revision/" + risk.rev_id + "/risks.json";
		} else {
			saveUrl = base + "/risks.json";
		}

		const config = {withCredentials: true};

		if (risk.pickedPos !== null) {
			risk.position = risk.pickedPos;
			risk.norm = risk.pickedNorm;
		}

		return this.APIService.post(saveUrl, risk, config);

	}

	/**
	 * Update risk
	 * @param risk
	 * @param riskData
	 * @returns {*}
	 */
	public updateRisk(risk, riskData) {
		return this.doPut(risk, riskData);
	}

	/**
	 * Handle PUT requests
	 * @param risk
	 * @param putData
	 * @returns {*}
	 */
	public doPut(risk, putData) {

		let endpoint = risk.account + "/" + risk.model;

		// TODO put risk
		if (risk.rev_id) {
			endpoint += "/revision/" + risk.rev_id + "/risks/" +  risk._id + ".json";
		} else {
			endpoint += "/risks/" + risk._id + ".json";
		}

		const putConfig = {withCredentials: true};

		return this.APIService.put(endpoint, putData, putConfig);

	}

	public getJobColor(id) {
		let roleColor = "#ffffff";
		let found = false;
		if (id && this.state.availableJobs) {
			for (let i = 0; i <  this.state.availableJobs.length; i ++) {
				const job =  this.state.availableJobs[i];
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
	public getStatusIcon(risk) {

		const statusIcon: any = {};

		console.debug(Pin.pinColours.green);
		switch (risk.level_of_risk) {
			case 0:
				statusIcon.colour = "#dc143c";
				break;
			case 1:
				statusIcon.colour = "#32cd32";
				break;
			case 2:
				statusIcon.colour = "#fffacd";
				break;
			case 3:
				statusIcon.colour = "#ff8c00";
				break;
			case 4:
				statusIcon.colour = "#800000";
				break;
		}

		switch (risk.mitigation_status) {
			case "proposed":
				statusIcon.icon = "panorama_fish_eye";
				break;
			case "approved":
				statusIcon.icon = "lens";
				break;
			case "accepted":
				statusIcon.icon = "adjust";
				break;
			case "":
				statusIcon.icon = "check_circle";
				statusIcon.colour = "#0C2F54";
				break;
		}

		return statusIcon;
	}

	/**
	 * Convert an action comment to readable text
	 * @param comment
	 * @returns {string}
	 */
	public convertActionCommentToText(comment, topicTypes) {
		let text = "";

		if (comment) {
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
				if (topicTypes) {

					const from = topicTypes.find((topicType) => {
						return topicType.value === comment.action.from;
					});

					const to = topicTypes.find((topicType) => {
						return topicType.value === comment.action.to;
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

			case "due_date":

				comment.action.propertyText = "Due Date";
				if (comment.action.to) {
					comment.action.to = (new Date(parseInt(comment.action.to, 10))).toLocaleDateString();
				}
				if (comment.action.from) {
					comment.action.from = (new Date(parseInt(comment.action.from, 10))).toLocaleDateString();
				} else {
					text = comment.action.propertyText + " set to " +
						comment.action.to + " by " +
						comment.owner;
				}
				break;

			case "bcf_import":

				comment.action.propertyText = "BCF Import";
				text = comment.action.propertyText + " by " + comment.owner;
				break;

			}
		}

		if (0 === text.length) {
			if (!comment.action.from) {
				comment.action.from = "(empty)";
			}

			if (!comment.action.to) {
				comment.action.to = "(empty)";
			}

			text = comment.action.propertyText + " updated from " +
				comment.action.from + " to " +
				comment.action.to + " by " +
				comment.owner;
		}

		comment.action.text = text;

		return text;
	}

	/**
	 * generate title, screenshot path and comment for an risk
	 * @param risk
	 * @returns risk
	 */
	public cleanRisk(risk: any) {

		if (risk.hasOwnProperty("comments")) {
			for (let j = 0, numComments = risk.comments.length; j < numComments; j++) {
				// Action comment text
				if (risk.comments[j].action) {
					risk.comments[j].comment = this.convertActionCommentToText(risk.comments[j], undefined);
				}
				// screen shot path
				if (risk.comments[j].viewpoint && risk.comments[j].viewpoint.screenshot) {
					risk.comments[j].viewpoint.screenshotPath = this.APIService.getAPIUrl(risk.comments[j].viewpoint.screenshot);
				}
			}
		}

		return risk;
	}

	/**
	 * Convert an action value to readable text
	 * @param value
	 */
	public convertActionValueToText(value: string) {
		const actions = {
			"none": "None",
			"low": "Low",
			"medium": "Medium",
			"high": "High",
			"open": "Open",
			"in progress": "In progress",
			"for approval": "For approval",
			"closed": "Closed"
		};

		let actionText = value;

		value = value.toLowerCase();

		if (actions.hasOwnProperty(value)) {
			actionText = actions[value];
		}

		return actionText;
	}

	public removeUnsavedPin() {
		this.ViewerService.removePin({id: this.ViewerService.newPinId });
		this.ViewerService.setPin({data: null});
	}

	/**
	 * Returns true if model loaded.
	 */
	public modelLoaded() {
		return this.ViewerService.currentModel.model;
	}

}

export const RisksServiceModule = angular
	.module("3drepo")
	.service("RisksService", RisksService);
