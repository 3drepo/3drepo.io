/**
 *	Copyright (C) 2018 3D Repo Ltd
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
import { AnalyticService } from "../../home/js/analytic.service";
import { APIService } from "../../home/js/api.service";
import { AuthService } from "../../home/js/auth.service";
import { DialogService } from "../../home/js/dialog.service";
import { MeasureService } from "../../measure/js/measure.service";
import { NotificationEvents } from "../../notifications/js/notification.events";
import { NotificationRisksEvents } from "../../notifications/js/notification.risks.events";
import { NotificationService } from "../../notifications/js/notification.service";
import { RisksService } from "./risks.service";
import { StateManagerService } from "../../home/js/state-manager.service";
import { TreeService } from "../../tree/js/tree.service";
import { ViewerService } from "../../viewer/js/viewer.service";

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
	private activities: any[];
	private categories: any[];
	private likelihoods: any[];
	private consequences: any[];
	private levels: any[];
	private statuses: any[];
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
	private risksNotifications: NotificationRisksEvents;

	constructor(
		private $location,
		private $q,
		private $mdDialog,
		private $element,
		private $state,
		private $timeout,
		private $scope,

		private risksService: RisksService,
		private apiService: APIService,
		private notificationService: NotificationService,
		private authService: AuthService,
		private analyticService: AnalyticService,
		private stateManager: StateManagerService,
		private measureService: MeasureService,
		private viewerService: ViewerService,
		private treeService: TreeService,
		private dialogService: DialogService
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

		this.activities = [
			{value: "cleaning_and_maintenance", label: "Cleaning and maintenance"},
			{value: "replacement", label: "Replacement"},
			{value: "", label: "UNSET"}
		];
		this.categories = [
			{value: "health_material_effect", label: "Health - Material effect"},
			{value: "health_mechanical_effect", label: "Health - Mechanical effect"},
			{value: "safety_fall", label: "Safety Issue - Fall"},
			{value: "safety_trapped", label: "Safety Issue - Trapped"},
			{value: "safety_event", label: "Safety Issue - Event"},
			{value: "safety_handling", label: "Safety Issue - Handling"},
			{value: "safety_struck", label: "Safety Issue - Struck"},
			{value: "safety_public", label: "Safety Issue - Public"},
			{value: "environmental", label: "Environmental Issue"},
			{value: "commercial", label: "Commercial Issue"},
			{value: "social", label: "Social Issue"},
			{value: "other", label: "Other Issue"},
			{value: "unknown", label: "UNKNOWN"},
			{value: "", label: "UNSET"}
		];
		this.likelihoods = [
			{value: "very_low", label: "Very Low"},
			{value: "low", label: "Low"},
			{value: "moderate", label: "Moderate"},
			{value: "high", label: "High"},
			{value: "very_high", label: "Very High"},
			{value: "", label: "UNSET"}
		];
		this.consequences = [
			{value: "very_low", label: "Very Low"},
			{value: "low", label: "Low"},
			{value: "moderate", label: "Moderate"},
			{value: "high", label: "High"},
			{value: "very_high", label: "Very High"},
			{value: "", label: "UNSET"}
		];
		this.levels = [
			{value: "very_low", label: "Very Low"},
			{value: "low", label: "Low"},
			{value: "moderate", label: "Moderate"},
			{value: "high", label: "High"},
			{value: "very_high", label: "Very High"},
			{value: "", label: "UNSET"}
		];
		this.statuses = [
			{value: "proposed", label: "Proposed"},
			{value: "approved", label: "Approved"},
			{value: "accepted", label: "Accepted"},
			{value: "", label: "UNSET"}
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
			this.stateManager.popStateHandler(event, this.account, this.model);
		};

		this.refreshHandler = (event) => {
			return this.stateManager.refreshHandler(event);
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

		this.viewerService.removeUnsavedPin();

		this.aboutToBeDestroyed = true;
		if (this.comment) {
			this.risksService.updateRisks(this.riskData); // So that risks list is notified
		}
		if (this.editingCommentIndex !== null) {
			this.riskData.comments[this.editingCommentIndex].editing = false;
		}
		// Get out of pin drop mode

		this.viewerService.pin.pinDropMode = null;
		this.measureService.setDisabled(false);
		this.clearPin = true;

		// unsubscribe on destroy
		if (this.data) {
			this.risksNotifications.unsubscribeFromUpdated(this.onRiskUpdated);
		}

	}

	public watchers() {

		// This keeps the colours updated etc
		this.$scope.$watch("vm.riskData", () => {
			// if (this.riskData) {
			// 	risksService.populateRisk(this.riskData);
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

				this.risksService.getRisk(this.data.account, this.data.model, this.data._id)
					.then((fetchedRisk) => {
						this.setEditRiskData(fetchedRisk);
						this.startNotification();
						this.failedToLoad = false;
						// Update the risk data on risk service so search would work better
						this.risksService.updateRisks(this.riskData);
						this.risksService.showRisk(this.riskData, this.revision);
					})
					.catch((error) => {
						this.failedToLoad = true;
						console.error(error);
					});

			} else {
				const creatorRole = this.userJob._id;
				this.riskData = this.risksService.createBlankRisk(creatorRole);
				this.risksService.populateRisk(this.riskData);
				this.setContentHeight();

			}

		});

	}

	public convertCommentTopicType() {
		if (this.riskData && this.riskData.comments) {
			this.riskData.comments.forEach((comment) => {
				if (comment.action && comment.action.property === "topic_type") {
					this.risksService.convertActionCommentToText(comment, this.topic_types);
				}
			});
		}
	}

	public setEditRiskData(newRiskData) {

		this.riskData = newRiskData;

		if (!this.riskData.name) {
			this.disabledReason = this.reasonTitleText;
		}

		this.riskData.thumbnailPath = this.apiService.getAPIUrl(this.riskData.thumbnail);

		// Old risks
		this.riskData.assigned_roles = (!this.riskData.assigned_roles) ? [] : this.riskData.assigned_roles;

		this.canComment();
		this.convertCommentTopicType();

		this.risksService.populateRisk(this.riskData);
		this.setContentHeight();

	}

	public canChangeDescription() {
		return this.risksService.canChangeDescription(
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

	public canChangePriority() {
		return this.risksService.canChangePriority(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	public disableStatusOption(status) {
		return (status.value === "closed" || status.value === "open") &&
			!this.risksService.canChangeStatusToClosed(
				this.riskData,
				this.userJob,
				this.modelSettings.permissions
			);
	}

	public canChangeStatus() {
		return this.risksService.canChangeStatus(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	public canChangeType() {
		return this.risksService.canChangeType(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	public canChangeDueDate() {
		return this.risksService.canChangeDueDate(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	public canChangeAssigned() {
		return this.risksService.canChangeAssigned(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	public canComment() {
		return this.risksService.canComment(
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

			this.risksService.updateRisk(this.riskData, statusChangeData)
				.then((response) => {
					if (response) {
						const respData = response.data.risk;
						this.risksService.populateRisk(respData);
						this.riskData = respData;

						// Update the actual data model
						this.risksService.updateRisks(this.riskData);

						this.commentAreaScrollToBottom();
					}

				})
				.catch(this.handleUpdateError.bind(this));

			this.canComment();

			this.analyticService.sendEvent({
				eventCategory: "Risk",
				eventAction: "edit"
			});
		}

		// This is called so icon and assignment colour changes for new risks.
		this.risksService.populateRisk(this.riskData);
	}

	public handleUpdateError(error) {
		const content = "Property update failed." +
		"Contact support@3drepo.org if problem persists.";
		const escapable = true;
		console.error(error);
		this.dialogService.text("Error Updating risk", content, escapable);
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

		this.saveRisk();

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
			this.risksService.showRisk(newViewpointData, this.revision);

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
			this.screenShot = this.apiService.getAPIUrl(viewpoint.screenshot);
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
				this.viewerService.pin.pinDropMode = "risk";
				this.measureService.deactivateMeasure();
				this.measureService.setDisabled(true);
			} else {
				this.viewerService.pin.pinDropMode = null;
				this.measureService.setDisabled(false);
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
				this.risksService.updateRisk(this.riskData, data)
					.then((riskData) => {

						if (riskData) {
							this.risksService.updateRisks(this.riskData);
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

		// Get the viewpoint
		this.viewerService.getCurrentViewpoint(
			{promise: viewpointPromise, account: this.account, model: this.model}
		);

		// Get selected objects
		this.viewerService.getObjectsStatus({
			promise: objectsPromise
		});

		return Promise.all([viewpointPromise.promise, objectsPromise.promise])
			.then((results) => {
				const [viewpoint, objectInfo] = results;
				viewpoint.hideIfc = this.treeService.getHideIfc();
				return this.handleObjects(viewpoint, objectInfo, screenShotPromise);
			})
			.catch((error) => {
				// We have a top level catch which will
				// show the user a popup if something goes wrong at any point

				this.saving = false;
				const content = "Something went wrong saving the risk. " +
				"If this continues please message support@3drepo.org";
				const escapable = true;

				this.dialogService.text("Error saving risk", content, escapable);
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
			this.viewerService.getScreenshot(screenShotPromise);

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
			const highlightPromise = this.apiService.post(`${this.account}/${this.model}/groups`, highlightedGroupData)
				.then((highlightedGroupResponse) => {
					viewpoint.highlighted_group_id = highlightedGroupResponse.data._id;
				});
			promises.push(highlightPromise);
		}

		if (hiddenGroupData) {
			const hiddenPromise = this.apiService.post(`${this.account}/${this.model}/groups`, hiddenGroupData)
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
			rev_id: this.revision,
			objectId: null,
			creator_role: this.userJob._id,
			name: this.riskData.name,
			safetibase_id: this.riskData.safetibase_id,
			associated_activity: this.riskData.associated_activity,
			desc: this.riskData.desc,
			viewpoint,
			assigned_roles: this.riskData.assigned_roles,
			category: this.riskData.category,
			likelihood: this.riskData.likelihood,
			consequence: this.riskData.consequence,
			level_of_risk: this.riskData.level_of_risk,
			mitigation_status: this.riskData.mitigation_status,
			mitigation_desc: this.riskData.mitigation_desc,
			pickedPos: null,
			pickedNorm: null,
			scale: 1.0
		};

		// Pin data
		const pinData = this.viewerService.getPinData();
		if (pinData !== null) {
			risk.pickedPos = pinData.pickedPos;
			risk.pickedNorm = pinData.pickedNorm;
		}

		return this.risksService.saveRisk(risk)
			.then((response) => {
				this.data = response.data; // So that new changes are registered as updates
				const responseIssue = response.data;

				// Hide the description input if no description
				this.pinHidden = true;

				// Notify parent of new risk
				this.risksService.populateRisk(responseIssue);
				this.riskData = responseIssue;
				this.risksService.addRisk(this.riskData);
				this.risksService.setSelectedRisk(this.riskData, true, this.revision);

				// Hide some actions
				this.viewerService.pin.pinDropMode = null;

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

				// TOOD Change state to risk
				/*this.$state.go(
					"home.account.model.risk",
					riskState,
					{notify: false}
				);*/

				this.analyticService.sendEvent({
					eventCategory: "Risk",
					eventAction: "create"
				});

			});

	}

	public errorSavingScreemshot(error) {
		const content = "Something went wrong saving the screenshot. " +
		"If this continues please message support@3drepo.io.";
		const escapable = true;

		this.dialogService.text("Error Saving Screenshot", content, escapable);
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
			this.viewerService.getCurrentViewpoint(
				{promise: viewpointPromise, account: this.riskData.account, model: this.riskData.model}
			);

		} else {
			// Description
			this.riskData.descriptionThumbnail = data.screenShot;

			this.viewerService.getCurrentViewpoint(
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

	public onRiskUpdated(risk) {
		if (risk._id !== this.data._id) {
			return;
		}

		this.risksService.populateRisk(risk);
		this.riskData = risk;

		this.$scope.$apply();

	}

	public startNotification() {

		if (this.data && !this.notificationStarted) {
			this.notificationStarted = true;

			this.risksNotifications = this.notificationService.getChannel(this.data.account, this.data.model).risks;

			// Watch for risk change
			this.risksNotifications.subscribeToUpdated(this.onRiskUpdated, this);
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
