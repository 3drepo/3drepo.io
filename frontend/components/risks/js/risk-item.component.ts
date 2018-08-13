/**
 *	Copyright (C) 2016 3D Repo Ltd
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

class RiskItemController implements ng.IController {

	public static $inject: string[] = [
		"$location",
		"$q",
		"$mdDialog",
		"$element",
		"$state",
		"$timeout",
		"$scope",

		"RisksService",
		"APIService",
		"NotificationService",
		"AuthService",
		"ClientConfigService",
		"AnalyticService",
		"StateManager",
		"MeasureService",
		"ViewerService",
		"TreeService",
		"DialogService"
	];

	private failedToLoad: boolean;
	private savedScreenShot: any;
	private editingCommentIndex: any;
	private commentViewpoint: any;
	private aboutToBeDestroyed: boolean;
	private savedDescription;
	private savedComment;
	private reasonCommentText: string;
	private reasonTitleText: string;
	private disabledReason: string;
	private riskProgressInfo: string;
	private textInputHasFocusFlag: boolean;
	private submitDisabled: boolean;
	private pinDisabled: boolean;
	private showAdditional: boolean;
	private editingDescription: boolean;
	private clearPin: boolean;
	private priorities: any[];
	private statuses: any;
	private actions: any;
	private notificationStarted = false;
	private popStateHandler;
	private refreshHandler;
	private data;
	private pinHidden;
	private account;
	private model;
	private comment;
	private riskData;
	private modelSettings;
	/* tslint:disable */
	private topic_types;
	/* tslint:enable */
	private modelJobs;
	private availableJobs;
	private userJob;
	private saving;
	private screenShot;
	private revision;
	private riskItemComponent;
	private commentThumbnail;
	private contentHeight;

	constructor(
		private $location,
		private $q,
		private $mdDialog,
		private $element,
		private $state,
		private $timeout,
		private $scope,

		private RisksService,
		private APIService,
		private NotificationService,
		private AuthService,
		private ClientConfigService,
		private AnalyticService,
		private StateManager,
		private MeasureService,
		private ViewerService,
		private TreeService,
		private DialogService
	) {}

	public $onInit() {

		this.failedToLoad = false;

		this.savedScreenShot = null;
		this.editingCommentIndex = null;
		this.aboutToBeDestroyed = false;

		this.reasonCommentText = "Comment requires text";
		this.reasonTitleText = "Risk requires name";
		this.disabledReason = "";

		this.riskProgressInfo = "Loading Risk...";
		this.textInputHasFocusFlag = false;
		this.submitDisabled = true;
		this.pinDisabled = true;

		this.showAdditional = true;
		this.editingDescription = false;
		this.clearPin = false;

		this.priorities = [
			{value: "none", label: "None"},
			{value: "low", label: "Low"},
			{value: "medium", label: "Medium"},
			{value: "high", label: "High"}
		];
		this.statuses = [
			{value: "open", label: "Open"},
			{value: "in progress", label: "In progress"},
			{value: "for approval", label: "For approval"},
			{value: "closed", label: "Closed"}
		];

		this.actions = {
			screen_shot: {
				id: "screenshot",
				icon: "camera_alt",
				label: "Screen shot",
				disabled: () => {
					if (!this.data) {
						return this.submitDisabled;
					} else {
						return !this.canComment();
					}
				},
				visible: () => {
					return true;
				},
				selected: false
			},
			pin: {
				id: "pin",
				icon: "place",
				label: "Pin",
				disabled: () => {
					return this.submitDisabled || this.pinHidden;
				},
				visible: () => {
					return !this.data;
				},
				selected: false
			}
		};

		this.notificationStarted = false;

		this.setContentHeight();
		history.pushState(null, null, document.URL);

		this.popStateHandler = (event) => {
			this.StateManager.popStateHandler(event, this.account, this.model);
		};

		this.refreshHandler = (event) => {
			return this.StateManager.refreshHandler(event);
		};

		// listen for user clicking the back button
		window.addEventListener("popstate", this.popStateHandler);
		window.addEventListener("beforeunload", this.refreshHandler);
		this.watchers();
	}

	/**
	 * Save a comment if one was being typed before closegh
	 * Cancel editing comment
	 */
	public $onDestroy() {

		window.removeEventListener("popstate", this.popStateHandler);
		window.removeEventListener("beforeunload", this.refreshHandler);

		this.ViewerService.removeUnsavedPin();

		this.aboutToBeDestroyed = true;
		if (this.comment) {
			this.RisksService.updateRisks(this.riskData); // So that risks list is notified
			this.saveComment();
		}
		if (this.editingCommentIndex !== null) {
			this.riskData.comments[this.editingCommentIndex].editing = false;
		}
		// Get out of pin drop mode

		this.ViewerService.pin.pinDropMode = false;
		this.MeasureService.setDisabled(false);
		this.clearPin = true;

		// unsubscribe on destroy
		if (this.data) {
			this.NotificationService.unsubscribe.newComment(this.data.account, this.data.model, this.data._id);
			this.NotificationService.unsubscribe.commentChanged(this.data.account, this.data.model, this.data._id);
			this.NotificationService.unsubscribe.commentDeleted(this.data.account, this.data.model, this.data._id);
			this.NotificationService.unsubscribe.issueChanged(this.data.account, this.data.model, this.data._id);
		}

	}

	public watchers() {

		// This keeps the colours updated etc
		this.$scope.$watch("vm.riskData", () => {
			// if (this.riskData) {
			// 	RisksService.populateIssue(this.riskData);
			// }
		}, true);

		this.$scope.$watch("vm.modelSettings", () => {
			if (this.modelSettings) {
				this.topic_types = this.modelSettings.properties && this.modelSettings.properties.topicTypes || [];
				this.canComment();
				this.convertCommentTopicType();
			}
		});

		this.$scope.$watch("vm.availableJobs", () => {
			// Role
			if (this.availableJobs) {
				this.modelJobs = this.availableJobs.map((availableJob) => {
					/*
					// Get the actual role and return the last part of it
					return availableRole.role.substring(availableRole.role.lastIndexOf(".") + 1);
					*/
					return availableJob._id;
				});

				// Always have an unassign option for users
				this.modelJobs.push("Unassigned");
			}
		});

		this.$scope.$watch("vm.data", () => {

			// Data
			if (this.data && this.statuses && this.statuses.length) {
				this.failedToLoad = false;
				this.riskData = null;

				this.RisksService.getRisk(this.data.account, this.data.model, this.data._id)
					.then((fetchedRisk) => {
						this.setEditRiskData(fetchedRisk;
						this.startNotification();
						this.failedToLoad = false;
						// Update the risk data on risk service so search would work better
						this.RisksService.updateRisks(this.riskData);
						this.RisksService.showRisk(this.riskData, this.revision);
					})
					.catch((error) => {
						this.failedToLoad = true;
						console.error(error);
					});

			} else {
				const creatorRole = this.userJob._id;
				this.riskData = this.RisksService.createBlankRisk(creatorRole);
				this.RisksService.populateRisk(this.riskData);
				this.setContentHeight();

			}

		});

	}

	public handleBCFPriority(BCFPriority: string) {

		const exists = this.priorities.find((priority) => {
			return BCFPriority === priority.value;
		});

		if (!exists) {
			const newPriority = {
				value: BCFPriority,
				label: BCFPriority
			};
			this.priorities.push(newPriority);
			this.$timeout(() => {});

		}

	}

	public handleBCFStatus(BCFStatus: string) {

		const exists = this.statuses.find((status) => {
			return BCFStatus === status.value;
		});

		if (!exists) {
			const newStatus = {
				value: BCFStatus,
				label: BCFStatus
			};
			this.statuses.push(newStatus);
			this.$timeout(() => {});

		}

	}

	public handleBCFAssign(BCFAssign: [string]) {
		BCFAssign.forEach((unknownJob) => {
			if (this.modelJobs.indexOf(unknownJob) === -1) {
				this.modelJobs.push(unknownJob);
				this.$timeout(() => {});
			}
		});

	}

	public handleBCFType(BCFType: string) {

		const exists = this.topic_types.find((type) => {
			return BCFType === type.value;
		});

		if (!exists) {
			const newType = {
				value: BCFType,
				label: BCFType
			};
			this.topic_types.push(newType);
			this.$timeout(() => {});

		}

	}

	public convertCommentTopicType() {
		if (this.riskData && this.riskData.comments) {
			this.riskData.comments.forEach((comment) => {
				if (comment.action && comment.action.property === "topic_type") {
					this.RisksService.convertActionCommentToText(comment, this.topic_types);
				}
			});
		}
	}

	public setEditRiskData(newRiskData) {

		this.riskData = newRiskData;

		this.riskData.comments = this.riskData.comments || [];

		if (!this.riskData.name) {
			this.disabledReason = this.reasonTitleText;
		}

		this.riskData.thumbnailPath = this.APIService.getAPIUrl(this.riskData.thumbnail);
		this.riskData.comments.forEach((comment) => {
			if (comment.owner !== this.AuthService.getUsername()) {
				comment.sealed = true;
			}
		});

		// Old risks
		this.riskData.priority = (!this.riskData.priority) ? "none" : this.riskData.priority;
		this.riskData.status = (!this.riskData.status) ? "open" : this.riskData.status;
		this.riskData.topic_type = (!this.riskData.topic_type) ? "for_information" : this.riskData.topic_type;
		this.riskData.assigned_roles = (!this.riskData.assigned_roles) ? [] : this.riskData.assigned_roles;

		this.handleBCFPriority(this.riskData.priority);
		this.handleBCFStatus(this.riskData.status);
		this.handleBCFAssign(this.riskData.assigned_roles);
		this.handleBCFType(this.riskData.topic_type);

		this.canComment();
		this.convertCommentTopicType();

		this.RisksService.populateRisk(this.riskData);
		this.setContentHeight();

	}

	public canChangeDescription() {
		return this.RisksService.canChangeDescription(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	public nameChange() {
		this.submitDisabled = !this.riskData.name;
		if (!this.submitDisabled) {
			this.disabledReason = this.reasonTitleText;
		}
	}

	/**
	 * Disable the save button when commenting on an risk if there is no comment
	 */
	public commentChange() {
		this.submitDisabled = (this.data && !this.comment);
		if (!this.submitDisabled) {
			this.disabledReason = this.reasonCommentText;
		}
	}

	public canChangePriority() {
		return this.RisksService.canChangePriority(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	public disableStatusOption(status) {
		return (status.value === "closed" || status.value === "open") &&
			!this.RisksService.canChangeStatusToClosed(
				this.riskData,
				this.userJob,
				this.modelSettings.permissions
			);
	}

	public canChangeStatus() {
		return this.RisksService.canChangeStatus(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	public canChangeType() {
		return this.RisksService.canChangeType(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	public canChangeDueDate() {
		return this.RisksService.canChangeDueDate(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	public canChangeAssigned() {
		return this.RisksService.canChangeAssigned(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	public canComment() {
		return this.RisksService.canComment(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	/**
	 * Handle status change
	 */
	public statusChange() {
		if (this.data && this.riskData.account && this.riskData.model) {

			// If it's unassigned we can update so that there are no assigned roles
			if (this.riskData.assigned_roles.indexOf("Unassigned") !== -1) {
				this.riskData.assigned_roles = [];
			}

			const statusChangeData = {
				priority: this.riskData.priority,
				status: this.riskData.status,
				topic_type: this.riskData.topic_type,
				due_date: Date.parse(this.riskData.due_date),
				assigned_roles: this.riskData.assigned_roles
			};

			this.RisksService.updateRisk(this.riskData, statusChangeData)
				.then((response) => {
					if (response) {
						const respData = response.data.issue;
						this.RisksService.populateRisk(respData);
						this.riskData = respData;

						// Add info for new comment
						this.riskData.comments.forEach((comment) => {
							if (comment && comment.viewpoint && comment.viewpoint.screenshot) {
								comment.viewpoint.screenshotPath = this.APIService.getAPIUrl(comment.viewpoint.screenshot);
							}
							if (comment && comment.action && comment.action.property) {
								this.RisksService.convertActionCommentToText(comment, this.topic_types);
							}
							if (comment && comment.created) {
								comment.timeStamp = this.RisksService.getPrettyTime(comment.created);
							}
						});

						// Update last but one comment in case it was "sealed"
						if (this.riskData.comments.length > 1) {
							this.riskData.comments[this.riskData.comments.length - 2].sealed = true;
						}

						// Update the actual data model
						this.RisksService.updateRisks(this.riskData);

						this.commentAreaScrollToBottom();
					}

				})
				.catch(this.handleUpdateError.bind(this));

			this.canComment();

			this.AnalyticService.sendEvent({
				eventCategory: "Risk",
				eventAction: "edit"
			});
		}

		// This is called so icon and assignment colour changes for new risks.
		this.RisksService.populateRisk(this.riskData);
	}

	public handleUpdateError(error) {
		const content = "Property update failed." +
		"Contact support@3drepo.org if problem persists.";
		const escapable = true;
		console.error(error);
		this.DialogService.text("Error Updating risk", content, escapable);
	}

	public getCommentPlaceholderText() {
		if (this.canComment()) {
			return "Write your comment here";
		} else {
			return "You are not able to comment";
		}
	}

	/**
	 * Submit - new risk or comment or update risk
	 */
	public submit() {

		this.saving = true;

		if (this.data) {
			this.saveComment();
		} else {
			this.saveRisk();
		}

	}

	/**
	 * Show viewpoint
	 * @param event
	 * @param viewpoint Can be undefined for action comments
	 */
	public showViewpoint(event, viewpoint) {
		// README: vm should also highlight selected objects within vm issue, but
		// will require a lot of rewriting for vm to work at present!
		if (viewpoint && (event.type === "click")) {

			// We clone the riskData so that we don't
			// overwrite the original issue data itself
			const newViewpointData = angular.copy(this.riskData);
			newViewpointData.viewpoint = viewpoint;
			this.RisksService.showRisk(newViewpointData, this.revision);

		}
	}

	/**
	 * Show screen shot
	 * @param event
	 * @param viewpoint
	 */
	public showScreenShot(event, viewpoint) {
		if (viewpoint.screenshot) {

			// We have a saved screenshot we use that
			this.screenShot = this.APIService.getAPIUrl(viewpoint.screenshot);
			this.showScreenshotDialog(event);
		} else if (this.riskData.descriptionThumbnail) {

			// We haven't saved yet we can use the thumbnail
			this.screenShot = this.riskData.descriptionThumbnail;
			this.showScreenshotDialog(event);
		}
	}

	/**
	 * Show screen shot dialog
	 * @param event
	 */
	public showScreenshotDialog(event) {
		const parentScope = this;
		this.$mdDialog.show({
			controller() {
				this.riskItemComponent = parentScope;
			},
			controllerAs: "vm",
			templateUrl: "templates/issue-screen-shot-dialog.html",
			targetEvent: event
		});
	}

	/**
	 * Do an action
	 * @param event
	 * @param action
	 */
	public doAction(event, action) {
		// Handle previous action
		this.actions[action].selected = !this.actions[action].selected;
		const selected = this.actions[action].selected;

		switch (action) {
		case "pin":

			if (selected) {
				this.ViewerService.pin.pinDropMode = true;
				this.MeasureService.deactivateMeasure();
				this.MeasureService.setDisabled(true);
			} else {
				this.ViewerService.pin.pinDropMode = false;
				this.MeasureService.setDisabled(false);
			}
			break;

		case "screen_shot":

			// There is no concept of selected in screenshot as there will be a popup once you click the button
			this.actions[action].selected = false;

			delete this.screenShot; // Remove any clicked on screen shot
			this.showScreenshotDialog(event);
			break;

		}

	}

	/**
	 * Toggle showing of extra inputs
	 */
	public toggleShowAdditional() {

		if (!this.textInputHasFocusFlag) {
			// don't toggle if the user is trying to type
			this.showAdditional = !this.showAdditional;
			this.setContentHeight();
		}

	}

	/**
	 * Edit or save description
	 * @param event
	 */
	public toggleEditDescription(event) {
		event.stopPropagation();
		if (this.editingDescription) {
			this.editingDescription = false;

			if (this.riskData.desc !== this.savedDescription) {
				const data = {
					desc: this.riskData.desc
				};
				this.RisksService.updateRisk(this.riskData, data)
					.then((riskData) => {

						if (riskData) {
							this.RisksService.updateRisks(this.riskData);
							this.savedDescription = this.riskData.desc;
						} else {
							this.handleUpdateError(riskData);
						}

					})
					.catch(this.handleUpdateError.bind(this));
			}

		} else {
			this.editingDescription = true;
			this.savedDescription = this.riskData.desc;
		}
	}

	/**
	 * Register if text input has focus or not
	 * @param focus
	 */
	public textInputHasFocus(focus) {
		this.textInputHasFocusFlag = focus;
	}

	/**
	 * This prevents show/hide of additional info when clicking in the input
	 * @param event
	 */
	public titleInputClick(event) {
		event.stopPropagation();
	}

	/**
	 * Save risk
	 */
	public saveRisk() {

		const viewpointPromise = this.$q.defer();
		const screenShotPromise = this.$q.defer();
		const objectsPromise = this.$q.defer();

		if (this.commentViewpoint) {
			viewpointPromise.resolve(this.commentViewpoint);
		} else {
			// Get the viewpoint
			this.ViewerService.getCurrentViewpoint(
				{promise: viewpointPromise, account: this.account, model: this.model}
			);
		}

		// Get selected objects
		this.ViewerService.getObjectsStatus({
			promise: objectsPromise
		});

		return Promise.all([viewpointPromise.promise, objectsPromise.promise])
			.then((results) => {
				const [viewpoint, objectInfo] = results;
				viewpoint.hideIfc = this.TreeService.getHideIfc();
				return this.handleObjects(viewpoint, objectInfo, screenShotPromise);
			})
			.catch((error) => {
				// We have a top level catch which will
				// show the user a popup if something goes wrong at any point

				this.saving = false;
				const content = "Something went wrong saving the risk. " +
				"If this continues please message support@3drepo.org";
				const escapable = true;

				this.DialogService.text("Error saving risk", content, escapable);
				console.error("Something went wrong saving the risk: ", error);
			});

	}

	public handleObjects(viewpoint, objectInfo, screenShotPromise) {

		// TODO - clean up repeated code below
		if (this.savedScreenShot !== null) {

			if (objectInfo.highlightedNodes.length > 0 || objectInfo.hiddenNodes.length > 0) {
				// Create a group of selected objects
				return this.createGroup(viewpoint, this.savedScreenShot, objectInfo);
			} else {
				return this.doSaveRisk(viewpoint, this.savedScreenShot);
			}

		} else {
			// Get a screen shot if not already created
			this.ViewerService.getScreenshot(screenShotPromise);

			return screenShotPromise.promise
				.then((screenShot) => {
					if (objectInfo.highlightedNodes.length > 0 || objectInfo.hiddenNodes.length > 0) {
						return this.createGroup(viewpoint, screenShot, objectInfo);
					} else {
						return this.doSaveRisk(viewpoint, screenShot);
					}
				});

		}

	}

	/**
	 * @returns groupData	Object with list of nodes for group creation.
	 */
	public createGroupData(nodes) {
		const groupData = {
			name: this.riskData.name,
			color: [255, 0, 0],
			objects: nodes
		};

		return nodes.length === 0 ? null : groupData;
	}

	public createGroup(viewpoint, screenShot, objectInfo) {

		// Create a group of selected objects
		const highlightedGroupData = this.createGroupData(objectInfo.highlightedNodes);

		// Create a group of hidden objects
		const hiddenGroupData = this.createGroupData(objectInfo.hiddenNodes);

		const promises = [];

		if (highlightedGroupData) {
			const highlightPromise = this.APIService.post(`${this.account}/${this.model}/groups`, highlightedGroupData)
				.then((highlightedGroupResponse) => {
					viewpoint.highlighted_group_id = highlightedGroupResponse.data._id;
				});
			promises.push(highlightPromise);
		}

		if (hiddenGroupData) {
			const hiddenPromise = this.APIService.post(`${this.account}/${this.model}/groups`, hiddenGroupData)
				.then((hiddenGroupResponse) => {
					viewpoint.hidden_group_id = hiddenGroupResponse.data._id;
				});
			promises.push(hiddenPromise);
		}

		return Promise.all(promises).then(() => {
			this.doSaveRisk(viewpoint, screenShot);
		});

	}

	/**
	 * Send new risk data to server
	 * @param viewpoint
	 * @param screenShot
	 */
	public doSaveRisk(viewpoint, screenShot) {

		// Remove base64 header text from screenShot and add to viewpoint
		screenShot = screenShot.substring(screenShot.indexOf(",") + 1);
		viewpoint.screenshot = screenShot;

		// Save risk
		const risk = {
			account: this.account,
			model: this.model,
			objectId: null,
			name: this.riskData.name,
			viewpoint,
			creator_role: this.userJob._id,
			pickedPos: null,
			pickedNorm: null,
			scale: 1.0,
			assigned_roles: this.riskData.assigned_roles,
			priority: this.riskData.priority,
			status: this.riskData.status,
			topic_type: this.riskData.topic_type,
			due_date: Date.parse(this.riskData.due_date),
			desc: this.riskData.desc,
			rev_id: this.revision
		};

		// Pin data
		const pinData = this.ViewerService.getPinData();
		if (pinData !== null) {
			risk.pickedPos = pinData.pickedPos;
			risk.pickedNorm = pinData.pickedNorm;
		}

		return this.RisksService.saveRisk(risk)
			.then((response) => {
				this.data = response.data; // So that new changes are registered as updates
				const responseIssue = response.data;

				// Hide the description input if no description
				this.pinHidden = true;

				// Notify parent of new risk
				this.RisksService.populateRisk(responseIssue);
				this.riskData = responseIssue;
				this.RisksService.addRisk(this.riskData);
				this.RisksService.setSelectedRisk(this.riskData, true, this.revision);

				// Hide some actions
				this.ViewerService.pin.pinDropMode = false;

				this.submitDisabled = true;
				this.setContentHeight();

				this.startNotification();
				this.saving = false;

				const riskState = {
					account: this.account,
					model: this.model,
					revision: this.revision,
					risk: this.data._id,
					noSet: true
				};

				this.disabledReason = this.reasonCommentText;

				this.$state.go(
					"home.account.model.issue",
					riskState,
					{notify: false}
				);

				this.AnalyticService.sendEvent({
					eventCategory: "Risk",
					eventAction: "create"
				});

			});

	}

	public errorSavingScreemshot(error) {
		const content = "Something went wrong saving the screenshot. " +
		"If this continues please message support@3drepo.io.";
		const escapable = true;

		this.DialogService.text("Error Saving Screenshot", content, escapable);
		console.error("Something went wrong saving the screenshot: ", error);
	}

	/**
	 * A screen shot has been saved
	 * @param data
	 */
	public screenShotSave(data) {
		const viewpointPromise = this.$q.defer();

		this.savedScreenShot = data.screenShot;

		if (typeof this.data === "object") {

			// Comment
			this.commentThumbnail = data.screenShot;

			// Get the viewpoint and add the screen shot to it
			// Remove base64 header text from screen shot
			this.ViewerService.getCurrentViewpoint(
				{promise: viewpointPromise, account: this.riskData.account, model: this.riskData.model}
			);

		} else {
			// Description
			this.riskData.descriptionThumbnail = data.screenShot;

			this.ViewerService.getCurrentViewpoint(
				{promise: viewpointPromise, account: this.account, model: this.model}
			);
		}

		viewpointPromise.promise
			.then((viewpoint) => {
				this.commentViewpoint = viewpoint;
				this.commentViewpoint.screenshot = data.screenShot.substring(data.screenShot.indexOf(",") + 1);
			}).catch((error) => {
				this.errorSavingScreemshot(error);
			});

		this.setContentHeight();
	}

	/**
	 * Set the content height
	 */
	public setContentHeight() {

		const newRiskHeight = 305;
		const descriptionTextHeight = 80;
		const commentTextHeight = 80;
		const commentImageHeight = 170;
		const additionalInfoHeight = 160;
		const thumbnailHeight = 180;
		const riskMinHeight = 370;

		let height = riskMinHeight;

		if (this.data) {

			// Description text
			if (this.canChangeDescription() || (this.riskData && this.riskData.hasOwnProperty("desc")) ) {
				height += descriptionTextHeight;
			}
			// Description thumbnail
			height += thumbnailHeight;
			// New comment thumbnail
			if (this.commentThumbnail) {
				height += thumbnailHeight;
			}
			// Comments
			if (this.riskData && this.riskData.comments) {
				for (let i = 0; i < this.riskData.comments.length; i++) {
					height += commentTextHeight;
					if (this.riskData.comments[i].viewpoint && this.riskData.comments[i].viewpoint.hasOwnProperty("screenshot")) {
						height += commentImageHeight;
					}
				}
			}

		} else {
			height = newRiskHeight;
			// Description thumbnail
			if (this.riskData && this.riskData.descriptionThumbnail) {
				height += thumbnailHeight;
			}
		}

		// Additional info
		if (this.showAdditional) {
			height += additionalInfoHeight;
		}

		if (height) {
			this.contentHeight({height});
		} else {
			console.error("Height was trying to be set to falsy value");
		}

	}

	public commentAreaScrollToBottom() {

		this.$timeout(() => {
			const commentArea = document.getElementById("descriptionAndComments");
			if (commentArea) {
				commentArea.scrollTop = commentArea.scrollHeight;
			}
		});
	}

	public handleRiskChange(risk) {

		this.RisksService.populateRisk(risk);
		this.riskData = risk;

		this.$scope.$apply();

	}

	public startNotification() {

		if (this.data && !this.notificationStarted) {

			this.notificationStarted = true;

			/*
			* Watch for risk change
			*/

			this.NotificationService.subscribe.issueChanged(
				this.data.account,
				this.data.model,
				this.data._id,
				this.handleRiskChange.bind(this)
			);

			/*
			* Watch for new comments
			*/
			this.NotificationService.subscribe.newComment(
				this.data.account,
				this.data.model,
				this.data._id,
				(comment) => {
					if (comment.action) {
						this.RisksService.convertActionCommentToText(comment, this.topic_types);
					}

					this.afterNewComment(comment, true);

					// necessary to apply scope.apply and reapply scroll down again here because vm function is not triggered from UI
					this.$scope.$apply();
					this.commentAreaScrollToBottom();
				}
			);

			/*
			* Watch for comment changed
			*/
			this.NotificationService.subscribe.commentChanged(
				this.data.account,
				this.data.model,
				this.data._id,
				(newComment) => {
					const comment = this.riskData.comments.find((oldComment) => {
						return oldComment.guid === newComment.guid;
					});

					comment.comment = newComment.comment;

					this.$scope.$apply();
					this.commentAreaScrollToBottom();
				}
			);

			/*
			* Watch for comment deleted
			*/
			this.NotificationService.subscribe.commentDeleted(
				this.data.account,
				this.data.model,
				this.data._id,
				(newComment) => {

					let deleteIndex;
					this.riskData.comments.forEach((comment, i) => {
						if (comment.guid === newComment.guid) {
							deleteIndex = i;
						}
					});

					this.riskData.comments[deleteIndex].comment = "This comment has been deleted.";

					this.$scope.$apply();
					this.commentAreaScrollToBottom();

					this.$timeout(() => {
						this.riskData.comments.splice(deleteIndex, 1);
					}, 4000);
				}
			);

		}
	}

}

export const RiskItemComponent: ng.IComponentOptions = {
	bindings: {
		account: "<",
		model: "<",
		revision: "<",
		data: "=",
		exit: "&",
		event: "<",
		contentHeight: "&",
		selectedObjects: "<",
		modelSettings: "<",
		setInitialSelectedObjects: "&",
		userJob: "<",
		availableJobs: "<"
	},
	controller: RiskItemController,
	controllerAs: "vm",
	templateUrl: "templates/risk-item.html"
};

export const RiskItemComponentModule = angular
	.module("3drepo")
	.component("riskItem", RiskItemComponent);
