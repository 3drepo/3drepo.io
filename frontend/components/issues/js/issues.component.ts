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
import { NotificationService } from "../../home/js/notifications/notification.service";

class IssuesController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$timeout",
		"$state",
		"$q",

		"IssuesService",
		"EventService",
		"AuthService",
		"APIService",
		"NotificationService",
		"RevisionsService",
		"ClientConfigService",
		"AnalyticService",
		"DialogService",
		"ViewerService",
		"PanelService"
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

	constructor(
		private $scope,
		private $timeout,
		private $state,
		private $q,

		private IssuesService,
		private EventService,
		private AuthService,
		private APIService,
		private notificationService: NotificationService,
		private RevisionsService,
		private ClientConfigService,
		private AnalyticService,
		private DialogService,
		private ViewerService,
		private PanelService
	) {}

	public $onInit() {

		this.ViewerService.setPin({data: null});

		this.saveIssueDisabled = true;
		this.allIssues = [];
		this.issuesToShow = [];
		this.showProgress = true;
		this.progressInfo = "Loading issues";
		this.availableJobs = null;
		this.selectedIssue = null;
		this.autoSaveComment = false;
		this.onContentHeightRequest({height: 70}); // To show the loading progress
		this.savingIssue = false;
		this.revisionsStatus = this.RevisionsService.status;

		// Get the user roles for the model
		this.issuesReady = this.IssuesService.getIssuesAndJobs(this.account, this.model, this.revision)
			.then(() => {
				this.$timeout(() => {
					this.toShow = "showIssues";
					this.showAddButton = true;
					this.showProgress = false;
				}, 1000);
			})
			.catch((error) => {
				const content = "We had an issue getting all the issues and jobs for this model. " +
					"If this continues please message support@3drepo.io.";
				const escapable = true;
				this.DialogService.text("Error Getting Model Issues and Jobs", content, escapable);
				console.error(error);
			});

		this.watchers();

	}

	public $onDestroy() {

		this.allIssues = [];
		this.issuesToShow = [];
		this.removeUnsavedPin();

		let channel = this.notificationService.getChannel(this.account, this.model);

		channel.issues.offCreated();
		channel.issues.offUpdated();

		// Do the same for all subModels
		([] || this.subModels).forEach((subModel) => {
				channel =  this.notificationService.getChannel(subModel.database, subModel.model);
				channel.issues.offCreated();
				channel.issues.offUpdated();
		});
	}

	public watchers() {

		// New issue must have type and non-empty title
		this.$scope.$watch("vm.title", () => {
			this.saveIssueDisabled = (angular.isUndefined(this.title) || (this.title.toString() === ""));
		});

		this.$scope.$watch("vm.modelSettings", () => {
			if (this.modelSettings) {

				this.issuesReady.then(() => {
					this.canAddIssue = this.AuthService.hasPermission(
						this.ClientConfigService.permissions.PERM_CREATE_ISSUE,
						this.modelSettings.permissions
					);
				});

				this.subModels = this.modelSettings.subModels || [];
				this.watchNotification();

			}
		});

		this.$scope.$watch(() => {
			return this.RevisionsService.status.data;
		}, () => {
			if (this.RevisionsService.status.data) {
				this.revisions = this.RevisionsService.status.data[this.account + ":" + this.model];
			}
		}, true);

		this.$scope.$watch(() => {
			return this.IssuesService.state;
		}, (state) => {

			if (state) {
				angular.extend(this, state);
			}

		}, true);

		/**
		 * Set up event watching
		 */
		this.$scope.$watch(this.EventService.currentEvent, (event) => {

			if (event.type === this.EventService.EVENT.VIEWER.CLICK_PIN) {

				for (let i = 0; i < this.IssuesService.state.allIssues.length; i++) {
					const iterIssue = this.IssuesService.state.allIssues;
					if (iterIssue[i]._id === event.value.id) {
						this.editIssue(iterIssue[i]);
						break;
					}
				}

			}

		});

		/*
		 * Go back to issues list
		 */
		this.$scope.$watch("vm.hideItem", (newValue) => {
			if (angular.isDefined(newValue) && newValue) {
				this.toShow = "showIssues";
				this.showAddButton = true;
				let issueListItemId;

				if (this.IssuesService.state.selectedIssue && this.IssuesService.state.selectedIssue._id) {
					issueListItemId = "issue" + this.IssuesService.state.selectedIssue._id;
				}

				this.IssuesService.state.displayIssue = null;

				this.$state.go("home.account.model",
					{
						account: this.account,
						model: this.model,
						revision: this.revision,
						noSet: true
					},
					{notify: false}
				).then(() => {
					const element = document.getElementById(issueListItemId);
					if (element && element.scrollIntoView) {
						element.scrollIntoView();
					}
				});

			}
		});

	}

	public removeUnsavedPin() {
		this.ViewerService.removePin({id: this.ViewerService.newPinId });
		this.ViewerService.setPin({data: null});
	}

	public modelLoaded() {
		return !!this.ViewerService.currentModel.model;
	}

	/**
	 * Close the add alert
	 */
	public closeAddAlert() {
		this.showAddAlert = false;
		this.addAlertText = "";
	}

	/**
	 * Set the content height
	 */
	public setContentHeight(height) {
		this.onContentHeightRequest({height});
	}

	public watchNotification() {
		// Watch for new issues

		let channel = this.notificationService.getChannel(this.account, this.model);
		const onIssueCreated = this.newIssueListener.bind(this);
		const onIssueUpdated = this.handleIssueChanged.bind(this);

		channel.issues.onCreated(onIssueCreated);
		channel.issues.onUpdated(onIssueUpdated);

		// Do the same for all subModels
		([] || this.subModels).forEach((subModel) => {
			if (subModel) {
				channel =  this.notificationService.getChannel(subModel.database, subModel.model);
				channel.issues.onCreated(onIssueCreated);
				channel.issues.onUpdated(onIssueUpdated);
			} else {
				console.error("Submodel was expected to be defined for issue subscription: ", subModel);
			}
		});
	}

	public newIssueListener(issues, submodel) {

		issues.forEach((issue) => {
			this.shouldShowIssue(issue, submodel);
		});

	}

	public handleIssueChanged(issue) {
		this.IssuesService.updateIssues(issue);
	}

	public shouldShowIssue(issue, submodel) {

		if (!issue) {
			console.error("Issue is undefined/null: ", issue);
			return;
		}

		const isSubmodelIssue = (submodel !== undefined);
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
			if (!isSubmodelIssue) {

				issueShouldAdd = this.checkIssueShouldAdd(issue, currentRevision, this.revisions);
				if (issueShouldAdd) {
					this.IssuesService.addIssue(issue);
				}

			} else {
				// If submodel
				if (submodel) {

					this.RevisionsService.listAll(submodel.database, submodel.model)
						.then((submodelRevisions) => {
							issueShouldAdd = this.checkIssueShouldAdd(issue, currentRevision, submodelRevisions);
							if (issueShouldAdd) {
								this.IssuesService.addIssue(issue);
							}
						})
						.catch((error) => {
							console.error("Something went wrong getting submodel revisions", error);
						});
				}

			}
		}

	}

	public checkIssueShouldAdd(issue, currentRevision, revisions) {

		const issueRevision = revisions.find((rev) => {
			return rev._id === issue.rev_id;
		});

		if (!issueRevision || !currentRevision) {
			console.error("Issue revision or current revision are not set: ", issueRevision, currentRevision);
			return true;
		}

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

		this.IssuesService.importBcf(this.account, this.model, this.revision, file)
			.then(() => {
				return this.IssuesService.getIssues(this.account, this.model, this.revision);
			})
			.then((data) => {

				this.importingBCF = false;
				this.IssuesService.state.allIssues = (data === "") ? [] : data;
				this.$timeout();

			})
			.catch((error) => {

				this.importingBCF = false;
				const content = "We tried to get import BCF but it failed. " +
					"If this continues please message support@3drepo.io.";
				const escapable = true;
				this.DialogService.text("Error Getting User Job", content, escapable);
				console.error(error);
				this.$timeout();

			});

	}

	/**
	 * Set up editing issue
	 * @param issue
	 */
	public editIssue(issue) {

		if (this.IssuesService.state.selectedIssue) {
			this.IssuesService.deselectPin(this.IssuesService.state.selectedIssue);
		}

		if (issue) {

			this.ViewerService.highlightObjects([]);
			this.$state.go("home.account.model.issue",
				{
					account: this.account,
					model: this.model,
					revision: this.revision,
					issue: issue._id,
					noSet: true
				},
				{notify: false}
			);

			this.IssuesService.setSelectedIssue(issue, true, this.revision);

		} else {
			this.IssuesService.resetSelectedIssue();
		}

		this.toShow = "showIssue";
		this.showAddButton = false;
		this.onShowItem();

	}

	/**
	 * Exit issue editing
	 * @param issue
	 */
	public editIssueExit(issue) {
		document.getElementById("issue" + issue._id).scrollIntoView();
		this.hideItem = true;
	}

}

export const IssuesComponent: ng.IComponentOptions = {
	bindings: {
		account: "=",
		model: "=",
		branch:  "=",
		revision: "=",
		filterText: "=",
		modelSettings: "=",
		show: "=",
		showAdd: "=",
		selectedMenuOption: "=",
		onContentHeightRequest: "&",
		onShowItem : "&",
		hideItem: "=",
		selectedObjects: "=",
		setInitialSelectedObjects: "&"
	},
	controller: IssuesController,
	controllerAs: "vm",
	templateUrl: "templates/issues.html"
};

export const IssuesComponentModule = angular
	.module("3drepo")
	.component("issues", IssuesComponent);
