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
import { isEmpty } from 'lodash';
import { AuthService } from '../../home/js/auth.service';
import { DialogService } from '../../home/js/dialog.service';
import { EventService } from '../../home/js/event.service';
import { IssuesService } from './issues.service';
import { ChatService } from '../../chat/js/chat.service';
import { RevisionsService } from '../../revisions/js/revisions.service';
import { ViewerService } from '../../viewer/js/viewer.service';

class IssuesController implements ng.IController {

	public static $inject: string[] = [
		'$scope',
		'$timeout',
		'$state',

		'IssuesService',
		'EventService',
		'AuthService',
		'ChatService',
		'RevisionsService',
		'ClientConfigService',
		'DialogService',
		'ViewerService'
	];

	private model: string;
	private account: string;
	private revision: string;
	private saveIssueDisabled: boolean;
	private allIssues: any[];
	private issuesToShow: any[];
	private showProgress: boolean;
	private progressInfo: string;
	private availableJobs: any;
	private modelUserJob: any;
	private selectedIssue: any;
	private autoSaveComment: boolean;
	private savingIssue: boolean;
	private revisionsStatus: any;
	private onContentHeightRequest: any;
	private issuesPromise: any;
	private jobsPromise: any;
	private issuesReady: any;
	private toShow: string;
	private showAddButton: boolean;
	private showAddAlert: boolean;
	private addAlertText: string;
	private subModels: any;
	private title: string;
	private revisions: any;
	private importingBCF: boolean;
	private onShowItem: any;
	private hideItem: boolean;
	private modelSettings: any;
	private canAddIssue: boolean;
	private filterChips: Array<{name: string, type: string}> = [];
	private selectedMenuOption: any;

	constructor(
		private $scope: any,
		private $timeout: any,
		private $state: any,

		private issuesService: IssuesService,
		private eventService: EventService,
		private authService: AuthService,
		private chatService: ChatService,
		private revisionsService: RevisionsService,
		private clientConfigService: any,
		private dialogService: DialogService,
		private viewerService: ViewerService
	) {}

	public $onInit() {
		this.issuesService.removeUnsavedPin();

		this.saveIssueDisabled = true;
		this.allIssues = [];
		this.issuesToShow = [];
		this.showProgress = true;
		this.progressInfo = 'Loading issues';
		this.availableJobs = null;
		this.selectedIssue = null;
		this.autoSaveComment = false;
		this.onContentHeightRequest({height: 70}); // To show the loading progress
		this.savingIssue = false;
		this.revisionsStatus = this.revisionsService.status;

		// Get the user roles for the model
		this.issuesReady = this.issuesService.getIssuesAndJobs(this.account, this.model, this.revision)
			.then(() => {
				this.$timeout(() => {
					if (this.$state.params.issueId) {
						this.issuesService.state.displayIssue = this.$state.params.issueId;
					}
					this.toShow = 'showIssues';
					this.showAddButton = true;
					this.showProgress = false;
				}, 1000);
			})
			.catch((error) => {
				const content = 'We had an issue getting all the issues and jobs for this model. ' +
					'If this continues please message support@3drepo.io.';
				const escapable = true;
				this.dialogService.text('Error Getting Model Issues and Jobs', content, escapable);
				console.error(error);
			});

		this.watchers();

	}

	public $onDestroy() {

		this.issuesService.reset();

		let channel = this.chatService.getChannel(this.account, this.model);

		channel.issues.unsubscribeFromCreated(this.onIssueCreated);
		channel.issues.unsubscribeFromUpdated(this.issuesService.updateIssues);

		// Do the same for all subModels
		([] || this.subModels).forEach((subModel) => {
				channel = this.chatService.getChannel(subModel.database, subModel.model);
				channel.issues.unsubscribeFromCreated(this.onIssueCreated);
				channel.issues.unsubscribeFromUpdated(this.issuesService.updateIssues);
		});
	}

	public watchers() {

		// New issue must have type and non-empty title
		this.$scope.$watch('vm.title', () => {
			this.saveIssueDisabled = (angular.isUndefined(this.title) || (this.title.toString() === ''));
		});

		this.$scope.$watch('vm.modelSettings', () => {
			if (!isEmpty(this.modelSettings)) {

				this.issuesReady.then(() => {
					this.canAddIssue = this.authService.hasPermission(
						this.clientConfigService.permissions.PERM_CREATE_ISSUE,
						this.modelSettings.permissions
					);
				});

				this.subModels = this.modelSettings.subModels || [];
				this.watchChatEvents();

				this.issuesService.addToAllTypes((this.modelSettings.properties && this.modelSettings.properties.topicTypes || []));
			}
		});

		this.$scope.$watch(() => {
			return this.revisionsService.status.data;
		}, () => {
			if (this.revisionsService.status.data) {
				this.revisions = this.revisionsService.status.data[this.account + ':' + this.model];
			}
		}, true);

		this.$scope.$watch(() => {
			return this.issuesService.state;
		}, (state) => {

			if (state) {
				angular.extend(this, state); // IMPORTANT: This little thing sets the state inside the issues service to
				// this component. Including issuesToShow, allIssues, etc.
			}

		}, true);

		/**
		 * Set up event watching
		 */
		this.$scope.$watch(this.eventService.currentEvent, (event) => {

			switch (event.type) {
				case this.eventService.EVENT.VIEWER.CLICK_PIN:
					for (let i = 0; i < this.issuesService.state.allIssues.length; i++) {
						const iterIssue = this.issuesService.state.allIssues;
						if (iterIssue[i]._id === event.value.id) {
							this.editIssue(iterIssue[i]);
							break;
						}
					}
					break;
				case this.eventService.EVENT.VIEWER.PICK_POINT:
					this.issuesService.handlePickPointEvent(event, this.account, this.model);
					break;
			}

		});

		/*
		 * Go back to issues list
		 */
		this.$scope.$watch('vm.hideItem', (newValue) => {
			if (angular.isDefined(newValue) && newValue) {
				this.toShow = 'showIssues';
				this.showAddButton = true;
				let issueListItemId;

				if (this.issuesService.state.selectedIssue && this.issuesService.state.selectedIssue._id) {
					issueListItemId = 'issue' + this.issuesService.state.selectedIssue._id;
				}

				this.issuesService.state.displayIssue = null;
				this.selectedMenuOption = null;
				if (!newValue) {

					const element = document.getElementById(issueListItemId);
					if (element && element.scrollIntoView) {
						element.scrollIntoView();
					}
				} else {
					this.issuesService.resetSelectedIssue();
					this.$state.go('app.viewer', {
						modelId: this.model,
						revision: this.revision
					});
				}
			}
		});

	}

	/**
	 * Returns true if model loaded.
	 */
	public modelLoaded() {
		return !!this.viewerService.currentModel.model;
	}

	/**
	 * Close the add alert
	 */
	public closeAddAlert() {
		this.showAddAlert = false;
		this.addAlertText = '';
	}

	/**
	 * Set the content height
	 */
	public setContentHeight(height) {
		this.onContentHeightRequest({height});
	}

	public watchChatEvents() {
		// Watch for new issues

		let channel = this.chatService.getChannel(this.account, this.model);

		channel.issues.subscribeToCreated(this.onIssueCreated, this);
		channel.issues.subscribeToUpdated(this.issuesService.updateIssues, this.issuesService);

		// Do the same for all subModels
		(this.subModels || []).forEach((subModel) => {
				channel =  this.chatService.getChannel(subModel.database, subModel.model);
				channel.issues.subscribeToCreated(this.onIssueCreated, this);
				channel.issues.subscribeToUpdated(this.issuesService.updateIssues, this.issuesService);
		});
	}

	public onIssueCreated(issues) {

		issues.forEach((issue) => {
			this.shouldShowIssue(issue);
		});

	}

	public shouldShowIssue(issue) {

		if (!issue) {
			console.error('Issue is undefined/null: ', issue);
			return;
		}

		const isSubmodelIssue = (this.model !== issue.model);
		let issueShouldAdd = false;

		if (this.revisions && this.revisions.length) {

			let currentRevision;

			// this.revision will be null if on head revision
			// as it is not set via the URL state
			if (!this.revision) {
				currentRevision = this.revisions[0]; // Set it to the top revision
			} else {
				currentRevision = this.revisions.find((rev) => {
					return rev._id === this.revision || rev.tag === this.revision;
				});
			}

			// If Federation
			issueShouldAdd = isSubmodelIssue || this.checkIssueShouldAdd(issue, currentRevision, this.revisions);
			if (issueShouldAdd) {
				this.issuesService.addIssue(issue);
			}
		}

	}

	public checkIssueShouldAdd(issue, currentRevision, revisions) {
		// Searches for the full revision object in the revisions of the model
		const issueRevision = revisions.find((rev) => {
			return rev._id === issue.rev_id;
		});

		if (!issueRevision || !currentRevision) {
			console.error('Issue revision or current revision are not set: ', issueRevision, currentRevision);
			return true;
		}

		// Checks that the revision of the issue is the same as the model's current revision or that is a previous revision.
		const issueInDate = new Date(issueRevision.timestamp) <= new Date(currentRevision.timestamp);
		return issueRevision && issueInDate;
	}

	/**
	* import bcf
	* @param file
	*/
	public importBcf(file) {

		this.$timeout(() => {
			this.importingBCF = true;
		});

		this.issuesService.importBcf(this.account, this.model, this.revision, file)
			.then(() => {
				return this.issuesService.getIssues(this.account, this.model, this.revision);
			})
			.then((data) => {

				this.importingBCF = false;
				this.issuesService.state.allIssues = (data === '') ? [] : data;
				this.$timeout();

			})
			.catch((error) => {

				this.importingBCF = false;
				const content = 'We tried to get import BCF but it failed. ' +
					'If this continues please message support@3drepo.io.';
				const escapable = true;
				this.dialogService.text('Error Getting User Job', content, escapable);
				console.error(error);
				this.$timeout();

			});

	}

	/**
	 * Set up editing issue
	 * @param issue
	 */
	public editIssue(issue) {

		if (this.issuesService.state.selectedIssue) {
			this.issuesService.deselectPin(this.issuesService.state.selectedIssue);
		}

		if (issue) {
			this.viewerService.highlightObjects([]);

			this.$state.go('app.viewer',
				{
					account: this.account,
					model: this.model,
					revision: this.revision,
					issueId: issue._id,
					noSet: true
				},
				{notify: false}
			);

			this.issuesService.setSelectedIssue(issue, true, this.revision);

		} else {
			this.issuesService.resetSelectedIssue();
		}

		this.toShow = 'showIssue';
		this.showAddButton = false;
		this.onShowItem();

	}

	/**
	 * Exit issue editing
	 * @param issue
	 */
	public editIssueExit(issue) {
		document.getElementById('issue' + issue._id).scrollIntoView();
		this.hideItem = true;
	}

}

export const IssuesComponent: ng.IComponentOptions = {
	bindings: {
		account: '=',
		model: '=',
		branch:  '=',
		revision: '=',
		filterChips: '=',
		modelSettings: '=',
		show: '=',
		showAdd: '=',
		selectedMenuOption: '=',
		onContentHeightRequest: '&',
		onShowItem : '&',
		hideItem: '=',
		selectedObjects: '=',
		setInitialSelectedObjects: '&'
	},
	controller: IssuesController,
	controllerAs: 'vm',
	templateUrl: 'templates/issues.html'
};

export const IssuesComponentModule = angular
	.module('3drepo')
	.component('issues', IssuesComponent);
