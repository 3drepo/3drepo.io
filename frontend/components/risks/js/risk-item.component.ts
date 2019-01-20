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
import { AnalyticService } from '../../home/js/analytic.service';
import { APIService } from '../../home/js/api.service';
import { AuthService } from '../../home/js/auth.service';
import { DialogService } from '../../home/js/dialog.service';
import { MeasureService } from '../../measure/js/measure.service';
import { ChatEvents } from '../../chat/js/chat.events';
import { ChatService } from '../../chat/js/chat.service';
import { RisksService } from './risks.service';
import { StateManagerService } from '../../home/js/state-manager.service';
import { TreeService } from '../../tree/js/tree.service';
import { ViewerService } from '../../viewer/js/viewer.service';
import { dispatch } from '../../../helpers/migration';
import { DialogActions } from '../../../modules/dialog';

class RiskItemController implements ng.IController {

	public static $inject: string[] = [
		'$location',
		'$q',
		'$mdDialog',
		'$element',
		'$state',
		'$timeout',
		'$scope',

		'RisksService',
		'APIService',
		'ChatService',
		'AuthService',
		'AnalyticService',
		'StateManager',
		'MeasureService',
		'ViewerService',
		'TreeService',
		'DialogService'
	];

	private failedToLoad: boolean;
	private savedScreenshot: any;
	private commentViewpoint: any;
	private aboutToBeDestroyed: boolean;
	private savedDescription;
	private reasonCommentText: string;
	private reasonTitleText: string;
	private disabledReason: string;
	private riskProgressInfo: string;
	private textInputHasFocusFlag: boolean;
	private submitDisabled: boolean;
	private pinDisabled: boolean;
	private editingDescription: boolean;
	private clearPin: boolean;
	private categories: any[];
	private likelihoods: any[];
	private consequences: any[];
	private levels: any[];
	private statuses: any[];
	private actions: any;
	private chatEventsStarted = false;
	private popStateHandler;
	private refreshHandler;
	private data;
	private savedData;
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
	private screenshot;
	private revision;
	private riskItemComponent;
	private commentThumbnail;
	private contentHeight;
	private risksChatEvents: ChatEvents;

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
		private chatService: ChatService,
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

		this.savedScreenshot = null;
		this.aboutToBeDestroyed = false;

		this.reasonCommentText = 'Comment requires text';
		this.reasonTitleText = 'Risk requires name';
		this.disabledReason = '';

		this.riskProgressInfo = 'Loading Risk...';
		this.textInputHasFocusFlag = false;
		this.submitDisabled = true;
		this.pinDisabled = true;

		this.editingDescription = false;
		this.clearPin = false;

		this.categories = [
			{value: 'health_material_effect', label: 'Health - Material effect'},
			{value: 'health_mechanical_effect', label: 'Health - Mechanical effect'},
			{value: 'safety_fall', label: 'Safety Issue - Fall'},
			{value: 'safety_trapped', label: 'Safety Issue - Trapped'},
			{value: 'safety_event', label: 'Safety Issue - Event'},
			{value: 'safety_handling', label: 'Safety Issue - Handling'},
			{value: 'safety_struck', label: 'Safety Issue - Struck'},
			{value: 'safety_public', label: 'Safety Issue - Public'},
			{value: 'environmental', label: 'Environmental Issue'},
			{value: 'commercial', label: 'Commercial Issue'},
			{value: 'social', label: 'Social Issue'},
			{value: 'other', label: 'Other Issue'},
			{value: 'unknown', label: 'UNKNOWN'},
			{value: '', label: 'UNSET'}
		];
		this.likelihoods = [
			{value: 0, label: 'Very Low'},
			{value: 1, label: 'Low'},
			{value: 2, label: 'Moderate'},
			{value: 3, label: 'High'},
			{value: 4, label: 'Very High'}
		];
		this.consequences = [
			{value: 0, label: 'Very Low'},
			{value: 1, label: 'Low'},
			{value: 2, label: 'Moderate'},
			{value: 3, label: 'High'},
			{value: 4, label: 'Very High'}
		];
		this.levels = [
			{value: 0, label: 'Very Low'},
			{value: 1, label: 'Low'},
			{value: 2, label: 'Moderate'},
			{value: 3, label: 'High'},
			{value: 4, label: 'Very High'}
		];
		this.statuses = [
			{value: '', label: 'Unmitigated'},
			{value: 'proposed', label: 'Proposed'},
			{value: 'agreed_partial', label: 'Agreed (Partial)'},
			{value: 'agreed_fully', label: 'Agreed (Fully)'},
			{value: 'rejected', label: 'Rejected'}
		];

		this.actions = {
			screenshot: {
				id: 'screenshot',
				icon: 'camera_alt',
				label: 'Screenshot',
				disabled: () => {
					return !this.data && this.submitDisabled;
				},
				visible: () => {
					return !this.data;
				},
				selected: false
			},
			pin: {
				id: 'pin',
				icon: 'place',
				label: 'Pin',
				disabled: () => {
					return this.submitDisabled || this.pinHidden;
				},
				visible: () => {
					return !this.data;
				},
				selected: false
			}
		};

		this.chatEventsStarted = false;

		this.setContentHeight();
		history.pushState(null, null, document.URL);

		this.popStateHandler = (event) => {
			this.stateManager.popStateHandler(event, this.account, this.model);
		};

		this.refreshHandler = (event) => {
			return this.stateManager.refreshHandler(event);
		};

		// listen for user clicking the back button
		window.addEventListener('popstate', this.popStateHandler);
		window.addEventListener('beforeunload', this.refreshHandler);
		this.watchers();
	}

	/**
	 * Save a comment if one was being typed before closegh
	 * Cancel editing comment
	 */
	public $onDestroy() {

		window.removeEventListener('popstate', this.popStateHandler);
		window.removeEventListener('beforeunload', this.refreshHandler);

		this.risksService.removeUnsavedPin();

		this.aboutToBeDestroyed = true;
		if (this.comment) {
			this.risksService.updateRisks(this.riskData); // So that risks list is notified
		}
		// Get out of pin drop mode

		this.risksService.setPinDropMode(false);
		this.measureService.setDisabled(false);
		this.clearPin = true;

		// unsubscribe on destroy
		this.risksChatEvents.unsubscribeFromUpdated(this.onRiskUpdated);

		this.$state.go('app.viewer',
			{
				account: this.account,
				model: this.model,
				revision: this.revision,
				riskId: null,
				noSet: true
			},
			{ notify: false }
		);

	}

	public watchers() {

		this.$scope.$watchGroup([
			'vm.riskData.safetibase_id',
			'vm.riskData.associated_activity',
			'vm.riskData.assigned_roles[0]',
			'vm.riskData.category',
			'vm.riskData.likelihood',
			'vm.riskData.consequence',
			'vm.riskData.level_of_risk',
			'vm.riskData.mitigation_status'
		], () => {
			if (this.riskData && this.canSubmitUpdateRisk()) {
				this.updateRisk();
			}
		});

		// This keeps the colours updated etc
		this.$scope.$watch('vm.riskData.level_of_risk', (levelOfRisk) => {
			this.risksService.setLevelOfRisk(levelOfRisk);
			this.risksService.showRiskPins();
		}, true);

		this.$scope.$watch('vm.modelSettings', () => {
			if (this.modelSettings) {
				this.topic_types = this.modelSettings.properties && this.modelSettings.properties.topicTypes || [];
			}
		});

		this.$scope.$watch('vm.availableJobs', () => {
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
				this.modelJobs.push('Unassigned');
			}
		});

		this.$scope.$watch('vm.data', () => {

			// Data
			if (this.data && this.statuses && this.statuses.length) {
				this.failedToLoad = false;
				this.riskData = null;

				this.risksService.getRisk(this.data.account, this.data.model, this.data._id)
					.then((fetchedRisk) => {
						this.setEditRiskData(fetchedRisk);
						this.startChatEvents();
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

	public setLevelOfRisk() {
		if (this.riskData.likelihood && this.riskData.consequence) {
			this.riskData.level_of_risk = this.risksService.calculateLevelOfRisk(
				this.riskData.likelihood,
				this.riskData.consequence);
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

		this.risksService.populateRisk(this.riskData);
		this.setContentHeight();

		this.updateSavedRisk(this.riskData);
	}

	public nameChange() {
		this.submitDisabled = !this.riskData.name;
		if (!this.submitDisabled) {
			this.disabledReason = this.reasonTitleText;
		}
	}

	public canUpdateRisk() {
		return this.risksService.canUpdateRisk(
			this.riskData,
			this.userJob,
			this.modelSettings.permissions
		);
	}

	public canSubmitUpdateRisk() {
		return this.isRiskDataChanged() && (!this.data ||
			this.risksService.canSubmitUpdateRisk(
			this.savedData,
			this.userJob,
			this.modelSettings.permissions
		));
	}

	public handleUpdateError(error) {
		this.saving = false;
		const content = 'Property update failed.' +
		'Contact support@3drepo.org if problem persists.';
		const escapable = true;
		console.error(error);
		this.dialogService.text('Error Updating risk', content, escapable);
	}

	/**
	 * Submit - new risk or comment or update risk
	 */
	public submit() {

		this.saving = true;

		if (this.data) {
			this.updateRisk();
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
		if (viewpoint && (event.type === 'click')) {

			// We clone the riskData so that we don't
			// overwrite the original issue data itself
			const newViewpointData = angular.copy(this.riskData);
			newViewpointData.viewpoint = viewpoint;
			this.risksService.showRisk(newViewpointData, this.revision);

		}
	}

	/**
	 * Show screenshot
	 * @param event
	 * @param viewpoint
	 */
	public showScreenshot(event, viewpoint) {
		if (viewpoint.screenshot) {

			// We have a saved screenshot we use that
			this.showScreenshotDialog({
				sourceImage: this.apiService.getAPIUrl(viewpoint.screenshot),
				disabled: true
			});
		} else if (this.riskData.descriptionThumbnail) {

			// We haven't saved yet we can use the thumbnail
			this.showScreenshotDialog({
				sourceImage: this.riskData.descriptionThumbnail,
				disabled: true
			});
		}
	}

	/**
	 * Show screen shot dialog
	 */
	public showScreenshotDialog(options) {
		dispatch(DialogActions.showScreenshotDialog({
			...options,
			onSave: this.screenshotSave
		}));
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
		case 'pin':

			if (selected) {
				this.risksService.setPinDropMode(true);
				this.measureService.deactivateMeasure();
				this.measureService.setDisabled(true);
			} else {
				this.risksService.setPinDropMode(false);
				this.measureService.setDisabled(false);
			}
			break;

		case 'screenshot':

			// There is no concept of selected in screenshot as there will be a popup once you click the button
			this.actions[action].selected = false;

			delete this.screenshot; // Remove any clicked on screenshot
			this.showScreenshotDialog({
				sourceImage: this.viewerService.getScreenshot()
			});
			break;

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
				return this.handleObjects(viewpoint, objectInfo);
			})
			.catch((error) => {
				// We have a top level catch which will
				// show the user a popup if something goes wrong at any point

				this.saving = false;
				const content = 'Something went wrong saving the risk. ' +
				'If this continues please message support@3drepo.org';
				const escapable = true;

				this.dialogService.text('Error saving risk', content, escapable);
				console.error('Something went wrong saving the risk: ', error);
			});

	}

	// /**
	//  * Update risk
	//  */
	// public updateRisk() {
	// 	if (this.data && this.riskData.account && this.riskData.model) {

	// 		// If it's unassigned we can update so that there are no assigned roles
	// 		if (this.riskData.assigned_roles.indexOf('Unassigned') !== -1) {
	// 			this.riskData.assigned_roles = [];
	// 		}

	// 		const updatedRiskData = {
	// 			safetibase_id: this.riskData.safetibase_id,
	// 			associated_activity: this.riskData.associated_activity,
	// 			desc: this.riskData.desc,
	// 			assigned_roles: this.riskData.assigned_roles,
	// 			category: this.riskData.category,
	// 			likelihood: parseInt(this.riskData.likelihood, 10),
	// 			consequence: parseInt(this.riskData.consequence, 10),
	// 			level_of_risk: parseInt(this.riskData.level_of_risk, 10),
	// 			mitigation_status: this.riskData.mitigation_status,
	// 			mitigation_desc: this.riskData.mitigation_desc
	// 		};

	// 		this.risksService.updateRisk(this.riskData, updatedRiskData)
	// 			.then((response) => {
	// 				if (response) {
	// 					const updatedRisk = response.data;
	// 					this.risksService.populateRisk(updatedRisk);
	// 					this.updateSavedRisk(updatedRisk);

	// 					// Update the actual data model
	// 					this.risksService.updateRisks(this.riskData);

	// 					this.saving = false;
	// 				}

	// 			})
	// 			.catch(this.handleUpdateError.bind(this));

	// 		this.analyticService.sendEvent({
	// 			eventCategory: 'Risk',
	// 			eventAction: 'edit'
	// 		});
	// 	}

	// 	// This is called so icon and assignment colour changes for new risks.
	// 	this.risksService.populateRisk(this.riskData);
	// }

	// public handleObjects(viewpoint, objectInfo) {

	// 	// TODO - clean up repeated code below
	// 	if (this.savedScreenshot !== null) {

	// 		if (objectInfo.highlightedNodes.length > 0 || objectInfo.hiddenNodes.length > 0) {
	// 			// Create a group of selected objects
	// 			return this.createGroup(viewpoint, this.savedScreenshot, objectInfo);
	// 		} else {
	// 			return this.doSaveRisk(viewpoint, this.savedScreenshot);
	// 		}

	// 	} else {
	// 		// Get a screen shot if not already created
	// 		return this.viewerService.getScreenshot().then((screenshot) => {
	// 				if (objectInfo.highlightedNodes.length > 0 || objectInfo.hiddenNodes.length > 0) {
	// 					return this.createGroup(viewpoint, screenshot, objectInfo);
	// 				} else {
	// 					return this.doSaveRisk(viewpoint, screenshot);
	// 				}
	// 			});

	// 	}

	// }

	// /**
	//  * @returns groupData	Object with list of nodes for group creation.
	//  */
	// public createGroupData(nodes) {
	// 	const groupData = {
	// 		name: this.riskData.name,
	// 		color: [255, 0, 0],
	// 		objects: nodes
	// 	};

	// 	return nodes.length === 0 ? null : groupData;
	// }

	// public createGroup(viewpoint, screenshot, objectInfo) {

	// 	// Create a group of selected objects
	// 	const highlightedGroupData = this.createGroupData(objectInfo.highlightedNodes);

	// 	// Create a group of hidden objects
	// 	const hiddenGroupData = this.createGroupData(objectInfo.hiddenNodes);

	// 	const promises = [];

	// 	if (highlightedGroupData) {
	// 		const highlightPromise = this.apiService.post(`${this.account}/${this.model}/groups`, highlightedGroupData)
	// 			.then((highlightedGroupResponse) => {
	// 				viewpoint.highlighted_group_id = highlightedGroupResponse.data._id;
	// 			});
	// 		promises.push(highlightPromise);
	// 	}

	// 	if (hiddenGroupData) {
	// 		const hiddenPromise = this.apiService.post(`${this.account}/${this.model}/groups`, hiddenGroupData)
	// 			.then((hiddenGroupResponse) => {
	// 				viewpoint.hidden_group_id = hiddenGroupResponse.data._id;
	// 			});
	// 		promises.push(hiddenPromise);
	// 	}

	// 	return Promise.all(promises).then(() => {
	// 		this.doSaveRisk(viewpoint, screenshot);
	// 	});

	// }

	// /**
	//  * Send new risk data to server
	//  * @param viewpoint
	//  * @param screenshot
	//  */
	// public doSaveRisk(viewpoint, screenshot) {

	// 	// Remove base64 header text from screenshot and add to viewpoint
	// 	screenshot = screenshot.substring(screenshot.indexOf(',') + 1);
	// 	viewpoint.screenshot = screenshot;

	// 	// Save risk
	// 	const risk = {
	// 		account: this.account,
	// 		model: this.model,
	// 		rev_id: this.revision,
	// 		objectId: null,
	// 		creator_role: this.userJob._id,
	// 		name: this.riskData.name,
	// 		safetibase_id: this.riskData.safetibase_id,
	// 		associated_activity: this.riskData.associated_activity,
	// 		desc: this.riskData.desc,
	// 		viewpoint,
	// 		assigned_roles: this.riskData.assigned_roles,
	// 		category: this.riskData.category,
	// 		likelihood: parseInt(this.riskData.likelihood, 10),
	// 		consequence: parseInt(this.riskData.consequence, 10),
	// 		level_of_risk: parseInt(this.riskData.level_of_risk, 10),
	// 		mitigation_status: this.riskData.mitigation_status,
	// 		mitigation_desc: this.riskData.mitigation_desc,
	// 		pickedPos: null,
	// 		pickedNorm: null,
	// 		scale: 1.0
	// 	};

	// 	// Pin data
	// 	const pinData = this.viewerService.getPinData();
	// 	if (pinData !== null) {
	// 		risk.pickedPos = pinData.pickedPos;
	// 		risk.pickedNorm = pinData.pickedNorm;
	// 	}

	// 	return this.risksService.saveRisk(risk)
	// 		.then((response) => {
	// 			this.data = response.data; // So that new changes are registered as updates
	// 			this.updateSavedRisk(this.data);
	// 			const responseRisk = response.data;

	// 			// Hide the description input if no description
	// 			this.pinHidden = true;

	// 			// Notify parent of new risk
	// 			this.risksService.populateRisk(responseRisk);
	// 			this.riskData = responseRisk;
	// 			this.risksService.addRisk(this.riskData);
	// 			this.risksService.setSelectedRisk(this.riskData, true, this.revision);

	// 			// Hide some actions
	// 			this.risksService.setPinDropMode(false);

	// 			this.submitDisabled = true;
	// 			this.setContentHeight();

	// 			this.startChatEvents();
	// 			this.saving = false;

	// 			const riskState = {
	// 				account: this.account,
	// 				model: this.model,
	// 				revision: this.revision,
	// 				riskId: this.data._id,
	// 				noSet: true
	// 			};

	// 			this.disabledReason = this.reasonCommentText;

	// 			this.$state.go(
	// 				'app.viewer',
	// 				riskState,
	// 				{notify: false}
	// 			);

	// 			this.analyticService.sendEvent({
	// 				eventCategory: 'Risk',
	// 				eventAction: 'create'
	// 			});

	// 		});

	// }

	public errorSavingScreenshot(error) {
		const content = 'Something went wrong saving the screenshot. ' +
		'If this continues please message support@3drepo.io.';
		const escapable = true;

		this.dialogService.text('Error Saving Screenshot', content, escapable);
		console.error('Something went wrong saving the screenshot: ', error);
	}

	/**
	 * A screen shot has been saved
	 * @param data
	 */
	public screenshotSave = (screenshot) => {
		const viewpointPromise = this.$q.defer();

		this.savedScreenshot = screenshot;

		if (typeof this.data === 'object') {

			// Comment
			this.commentThumbnail = screenshot;

			// Get the viewpoint and add the screen shot to it
			// Remove base64 header text from screen shot
			this.viewerService.getCurrentViewpoint(
				{promise: viewpointPromise, account: this.riskData.account, model: this.riskData.model}
			);

		} else {
			// Description
			this.riskData.descriptionThumbnail = screenshot;

			this.viewerService.getCurrentViewpoint(
				{promise: viewpointPromise, account: this.account, model: this.model}
			);
		}

		viewpointPromise.promise
			.then((viewpoint) => {
				this.commentViewpoint = viewpoint;
				this.commentViewpoint.screenshot = screenshot.substring(screenshot.indexOf(',') + 1);
			}).catch((error) => {
				this.errorSavingScreenshot(error);
			});

		this.setContentHeight();
	}

	// /**
	//  * Set the content height
	//  */
	// public setContentHeight() {

	// 	const newRiskHeight = 410;
	// 	const descriptionTextHeight = 80;
	// 	const additionalInfoHeight = 160;
	// 	const thumbnailHeight = 180;
	// 	const riskMinHeight = 370;

	// 	let height = riskMinHeight;

	// 	if (this.data) {

	// 		// Description text
	// 		if (this.riskData && this.riskData.hasOwnProperty('desc')) {
	// 			height += descriptionTextHeight;
	// 		}
	// 		// Description thumbnail
	// 		height += thumbnailHeight;
	// 		// New comment thumbnail
	// 		if (this.commentThumbnail) {
	// 			height += thumbnailHeight;
	// 		}

	// 	} else {
	// 		height = newRiskHeight;
	// 		// Description thumbnail
	// 		if (this.riskData && this.riskData.descriptionThumbnail) {
	// 			height += thumbnailHeight;
	// 		}
	// 	}

	// 	height += additionalInfoHeight;

	// 	if (height) {
	// 		this.contentHeight({height});
	// 	} else {
	// 		console.error('Height was trying to be set to falsy value');
	// 	}

	// }

	// public onRiskUpdated(risk) {
	// 	if (risk._id !== this.data._id) {
	// 		return;
	// 	}

	// 	this.risksService.populateRisk(risk);
	// 	this.riskData = risk;

	// 	this.$scope.$apply();

	// }

	public startChatEvents() {

		if (this.data && !this.chatEventsStarted) {
			this.chatEventsStarted = true;

			this.risksChatEvents = this.chatService.getChannel(this.data.account, this.data.model).risks;

			// Watch for risk change
			this.risksChatEvents.subscribeToUpdated(this.onRiskUpdated, this);
		}
	}

	// private isRiskDataChanged() {
	// 	let changed = !this.savedData;
	// 	if (this.riskData) {
	// 		const keys = Object.keys(this.riskData);
	// 		let keyIdx = 0;

	// 		while (!changed && keyIdx < keys.length) {
	// 			if ('[object Array]' === Object.prototype.toString.call(this.riskData[keys[keyIdx]])) {
	// 				changed = 0 !== this.riskData[keys[keyIdx]].length &&
	// 					JSON.stringify(this.riskData[keys[keyIdx]]) !== JSON.stringify(this.savedData[keys[keyIdx]]);
	// 			} else if ('[object String]' === Object.prototype.toString.call(this.riskData[keys[keyIdx]]) ||
	// 				'[object Number]' === Object.prototype.toString.call(this.riskData[keys[keyIdx]])) {
	// 				changed = this.riskData[keys[keyIdx]] !== this.savedData[keys[keyIdx]];
	// 			}
	// 			keyIdx++;
	// 		}
	// 	}

	// 	return changed && this.riskData && this.riskData.name;
	// }

	// private updateSavedRisk(risk) {
	// 	if (risk) {
	// 		this.savedData = Object.assign({}, risk);
	// 		this.savedData.assigned_roles = Object.assign([], risk.assigned_roles);
	// 	}
	// }

}

export const RiskItemComponent: ng.IComponentOptions = {
	bindings: {
		account: '<',
		model: '<',
		revision: '<',
		data: '=',
		exit: '&',
		event: '<',
		contentHeight: '&',
		selectedObjects: '<',
		modelSettings: '<',
		setInitialSelectedObjects: '&',
		userJob: '<',
		availableJobs: '<'
	},
	controller: RiskItemController,
	controllerAs: 'vm',
	templateUrl: 'templates/risk-item.html'
};

export const RiskItemComponentModule = angular
	.module('3drepo')
	.component('risk', RiskItemComponent);
