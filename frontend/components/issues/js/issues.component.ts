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
	];

	private onShowItem;
	private saveIssueDisabled;
	private allIssues;
	private issuesToShow;
	private showProgress;
	private progressInfo;
	private availableJobs;
	private modelUserJob;
	private selectedIssue;
	private autoSaveComment;
	private savingIssue;
	private revisionsStatus;
	private onContentHeightRequest;
	private account;
	private revision;
	private model;
	private revisions;
	private getIssues;
	private getJobs;
	private toShow;
	private showAddButton;
	private issuesReady;
	private subModels;
	private modelSettings;
	private canAddIssue;
	private title;
	private showAddAlert;
	private addAlertText;
	private hideItem;
	private importingBCF;

	constructor(
		private $scope,
		private $timeout,
		private $state,
		private $q,

		private IssuesService,
		private EventService,
		private AuthService,
		private APIService,
		private NotificationService,
		private RevisionsService,
		private ClientConfigService,
		private AnalyticService,
		private DialogService,
		private ViewerService,
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

		/*
		* Get the user roles for the model
		*/
		this.IssuesService.getUserJobForModel(this.account, this.model)
			.then((data) => {
				this.modelUserJob = data;
			})
			.catch((error) => {
				const content = "We tried to get the user job for this model but it failed. " +
				"If this continues please message support@3drepo.io.";
				const escapable = true;
				this.DialogService.text("Error Getting User Job", content, escapable);
				console.error(error);
			});

		/*
		* Get all the Issues
		*/

		this.getIssues = this.IssuesService.getIssues(this.account, this.model, this.revision)
			.then((data) => {

				if (data) {

					this.IssuesService.populateNewIssues(data);

					setTimeout(() => {
						requestAnimationFrame(() => {
							this.toShow = "showIssues";
							this.showAddButton = true;
							this.showProgress = false;
						});
					}, 1000);

				} else {
					throw new Error("Error");
				}

			})
			.catch((error) => {
				const content = "We tried to get the issues for this model but it failed. " +
				"If this continues please message support@3drepo.io.";
				const escapable = true;
				this.DialogService.text("Error Getting Issues", content, escapable);
				console.error(error);
			});

		/*
		* Get all the available roles for the model
		*/
		this.getJobs = this.IssuesService.getJobs(this.account, this.model)
			.then((data) => {

				this.availableJobs = data;

				const menu = [];
				data.forEach((role) => {
					menu.push({
						value: "filterRole",
						role: role._id,
						label: role._id,
						keepCheckSpace: true,
						toggle: true,
						selected: true,
						firstSelected: false,
						secondSelected: false,
					});
				});

				this.EventService.send(this.EventService.EVENT.PANEL_CONTENT_ADD_MENU_ITEMS, {
					type: "issues",
					menu,
				});

			})
			.catch((error) => {
				const content = "We tried to get the jobs for this model but it failed. " +
				"If this continues please message support@3drepo.io.";
				const escapable = true;
				this.DialogService.text("Error Getting Jobs", content, escapable);
				console.error(error);
			});

		this.issuesReady = this.$q.all([this.getIssues, this.getJobs])
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
		this.removeUnsavedPin();
		this.NotificationService.unsubscribe.newIssues(this.account, this.model);
		this.NotificationService.unsubscribe.issueChanged(this.account, this.model);

		if (this.subModels) {
			this.subModels.forEach( (subModel) => {
				this.NotificationService.unsubscribe.newIssues(subModel.database, subModel.model);
				this.NotificationService.unsubscribe.issueChanged(subModel.database, subModel.model);
			});
		}

	}

	public watchers() {

		/*
		* New issue must have type and non-empty title
		*/
		this.$scope.$watch("vm.title", () => {
			this.saveIssueDisabled = (!this.title);
		});

		this.$scope.$watch("vm.modelSettings", () => {
			if (this.modelSettings) {

				this.issuesReady.then(() => {
					const hasPerm = this.AuthService.hasPermission(
						this.ClientConfigService.permissions.PERM_CREATE_ISSUE,
						this.modelSettings.permissions,
					);

					if (hasPerm) {
						this.canAddIssue = true;
					}
				});

				this.subModels = this.modelSettings.subModels || [];
				this.watchNotification();

			}

		});

		this.$scope.$watch(() => {
			return this.RevisionsService.status;
		}, () => {
			if (this.RevisionsService.status.data) {
				this.revisions = this.RevisionsService.status.data;
			}
		}, true);

		this.$scope.$watch(() => {
			return this.IssuesService.state.allIssues;
		}, () => {
			this.allIssues = this.IssuesService.state.allIssues;
		}, true);

		this.$scope.$watch(() => {
			return this.IssuesService.state.issuesToShow;
		}, () => {
			this.issuesToShow = this.IssuesService.state.issuesToShow;
		}, true);

		this.$scope.$watch(() => {
			return this.IssuesService.state.selectedIssue;
		}, () => {
			this.selectedIssue = this.IssuesService.state.selectedIssue;
		}, true);

		/**
		 * Set up event watching
		 */
		this.$scope.$watch(this.EventService.currentEvent, (event) => {

			if (event.type === this.EventService.EVENT.VIEWER.CLICK_PIN) {

				for (let i = 0; i < this.IssuesService.state.allIssues.length; i += 1) {
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

			if (newValue) {
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
						noSet: true,
					},
					{notify: false},
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

		/*
			* Watch for new issues
			*/
		this.NotificationService.subscribe.newIssues(this.account, this.model, this.newIssueListener);

		/*
		* Watch for status changes for all issues
		*/
		this.NotificationService.subscribe.issueChanged(this.account, this.model, this.handleIssueChanged);

		// Do the same for all subModels
		if (this.subModels) {
			this.subModels.forEach((subModel) => {
				const submodel = true;
				this.NotificationService.subscribe.newIssues(
					subModel.database,
					subModel.model,
					(issues) => {
						this.newIssueListener(issues, submodel);
					},
				);
				this.NotificationService.subscribe.issueChanged(
					subModel.database,
					subModel.model,
					this.handleIssueChanged.bind(this),
				);
			});
		}

	}

	public newIssueListener(issues, submodel) {

		issues.forEach((issue) => {

			let issueShouldShow = false;

			if (this.revisions && this.revisions.length) {

				const issueRevision = this.revisions.find((rev) => {
					return rev._id === issue.rev_id;
				});

				let currentRevision;

				if (!this.revision) {
					currentRevision = this.revisions[0];
				} else {
					currentRevision = this.revisions.find((rev) => {
						return rev._id === this.revision || rev.tag === this.revision;
					});
				}

				const issueInDate = new Date(issueRevision.timestamp) <= new Date(currentRevision.timestamp);
				issueShouldShow = issueRevision && issueInDate;
			} else {
				issueShouldShow = true;
			}

			if (issueShouldShow) {

				this.IssuesService.addIssue(issue);

			}

		});

	}

	public handleIssueChanged(issue) {
		this.IssuesService.updateIssues(issue);
	}

	/**
	* import bcf
	* @param file
	*/
	public importBcf(file) {

		this.$scope.$apply();

		this.importingBCF = true;

		this.IssuesService.importBcf(this.account, this.model, this.revision, file)
			.then(() => {
				return this.IssuesService.getIssues(this.account, this.model, this.revision);
			})
			.then((data) => {

				this.importingBCF = false;
				this.allIssues = (data === "") ? [] : data;

			})
			.catch((error) => {

				this.importingBCF = false;
				const content = "We tried to get import BCF but it failed. " +
					"If this continues please message support@3drepo.io.";
				const escapable = true;
				this.DialogService.text("Error Getting User Job", content, escapable);
				console.error(error);

			});

	}

	/**
	 * Set up editing issue
	 * @param issue
	 */
	public editIssue(issue) {

		requestAnimationFrame(() => {

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
						noSet: true,
					},
					{notify: false},
				);

				this.IssuesService.setSelectedIssue(issue);

			} else {
				this.IssuesService.resetSelectedIssue();
			}

			this.toShow = "showIssue";
			this.showAddButton = false;
			this.onShowItem();

		});

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
		keysDown: "=",
		selectedObjects: "=",
		setInitialSelectedObjects: "&",
	},
	controller: IssuesController,
	controllerAs: "vm",
	templateUrl: "templates/issues.html",
};

export const IssuesComponentModule = angular
	.module("3drepo")
	.component("issues", IssuesComponent);
