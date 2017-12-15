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

class AccountFederationsController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$location",
		"$timeout",

		"APIService",
		"ClientConfigService",
		"AuthService",
		"AnalyticService",
		"AccountService",
		"DialogService",
	];

	private onShowPage;

	private accounts;
	private account;
	private originalFederationData;
	private federationData;

	private isSaving;
	private modelRegExp;
	private units;
	private dialogCloseTo;
	private dialogCloseToId;
	private userAccount;
	private currentAccount;
	private projectToDeleteFrom;
	private checkFederationSaveDisabled;
	private modelToDelete;
	private addButtons;
	private addButtonType;
	private deleteError;
	private deleteTitle;
	private deleteWarning;
	private deleteName;

	constructor(
		private $scope: ng.IScope,
		private $location: ng.ILocationService,
		private $timeout: ng.ITimeoutService,

		private APIService,
		private ClientConfigService,
		private AuthService,
		private AnalyticService,
		private AccountService,
		private DialogService,
	) {}

	public $onInit() {
		this.isSaving = false;
		this.modelRegExp = this.ClientConfigService.modelNameRegExp;
		this.units = this.ClientConfigService.units;
		this.dialogCloseTo = "accountFederationsOptionsMenu_" + this.account.account;
		this.dialogCloseToId = "#" + this.dialogCloseTo;
		this.watchers();
	}

	public watchers() {

		/*
		* Watch accounts input
		*/
		this.$scope.$watch("vm.accounts", () => {

			if (!this.accounts) {
				return;
			}

			this.updateFederationOptions();

		});
	}

	public updateFederationOptions() {

		this.accounts.forEach((account) => {
			account.projects.forEach((project) => {
				project.models.forEach((model) => {
					if (model.federate) {
						const options =  this.getFederationOptions(model, account.account);
						model.federationOptions = options;
					}
				});
			});
		});

	}

	public getProjects(teamspace: any) {
		const projects = this.AccountService.getProjectsByTeamspaceName(this.accounts, teamspace);
		return projects;
	}

	public closeDialog() {
		this.DialogService.closeDialog();
	}

	public closeFederationDialog() {

		if (this.originalFederationData) {
			Object.keys(this.federationData).forEach((key) => {
				if (this.federationData[key] !== this.originalFederationData[key]) {
					this.federationData[key] = this.originalFederationData[key];
				}
			});
		}

		this.isSaving = false;
		this.DialogService.closeDialog();
	}

	public showMenu(model: any, account: any) {
		const perms = this.ClientConfigService.permissions;
		const isUserAccount = account.account === this.account.account;

		return this.AuthService.hasPermission(perms.PERM_EDIT_FEDERATION, model.permissions) ||
				this.AuthService.hasPermission(perms.PERM_CHANGE_MODEL_SETTINGS, model.permissions) ||
				this.AuthService.hasPermission(perms.PERM_DELETE_MODEL, model.permissions) ||
				isUserAccount;
	}

	/**
	 * Get a list of options for the federation menu
	 */
	public getFederationOptions(model: any, account: any) {

		return {
			edit: {
				label: "Edit",
				icon: "edit",
				hidden: !this.AuthService.hasPermission(
					this.ClientConfigService.permissions.PERM_EDIT_FEDERATION,
					model.permissions,
				),
			},
			delete: {
				label: "Delete",
				icon: "delete",
				color: "#F44336",
				hidden: !this.AuthService.hasPermission(
					this.ClientConfigService.permissions.PERM_DELETE_MODEL,
					model.permissions,
				),
			},
			permissions: {
				label: "Permissions",
				icon: "group",
				hidden: !this.account === this.userAccount,
			},
			modelsetting: {
				label: "Settings",
				icon: "settings",
				hidden: !this.AuthService.hasPermission(
					this.ClientConfigService.permissions.PERM_CHANGE_MODEL_SETTINGS,
					model.permissions,
				),
			},
		};

	}

	/**
	 * Reset federation data back to empty object
	 */
	public resetFederationData() {
		this.federationData = {};
	}

	/**
	 * Remove a model from a federation
	 */
	public removeFromFederation(modelName: string) {
		this.AccountService.removeFromFederation(this.federationData, modelName);
		this.checkFederationSaveDisabled();
	}

	/**
	 * Open the federation in the viewer if it has sub models otherwise open edit dialog
	 */
	public viewFederation(event: any, account: any, project: any, model: any) {

		if (!model.hasOwnProperty("subModels") || model.subModels.length === 0) {
			this.setupEditFederation(event, account, project, model);
		} else {

			this.$location.path(`/${account.name}/${model.model}`).search({});

			this.AnalyticService.sendEvent({
				eventCategory: "Model",
				eventAction: "view",
				eventLabel: "federation",
			});

		}

	}

	/**
	 * Handle federation option selection
	 */
	public doFederationOption(event: any, option: any, account: any, project: any, federation: any) {

		switch (option) {
		case "edit":
			this.setupEditFederation(event, account, project, federation);
			break;

		case "permissions":
			this.goToPermissions(event, account, project, federation);
			break;

		case "delete":
			this.setupDelete(event, account, project, federation);
			break;

		case "modelsetting":
			this.setupSetting(event, account, project, federation);
		}
	}

	/**
	 * Delete federation
	 */
	public deleteModel() {

		const deleteUrl = this.currentAccount.name + "/" + this.modelToDelete.model;
		this.APIService.delete(deleteUrl, {})
			.then((response) => {

				if (response.status === 200) {
					const account = this.currentAccount;
					if (this.projectToDeleteFrom && this.projectToDeleteFrom.name) {
						this.AccountService.removeModelByProjectName(
							this.accounts,
							account.name,
							this.projectToDeleteFrom.name,
							response.data.model,
						);
					}

					this.addButtons = false;
					this.addButtonType = "add";
					this.isSaving = false;
					this.DialogService.closeDialog();

					this.AnalyticService.sendEvent({
						eventCategory: "Model",
						eventAction: "delete",
						eventLabel: "federation",
					});

				} else {
					this.deleteError = "Error deleting federation";
					if (response.data.message) {
						this.deleteError = response.data.message;
					}
				}

			})
			.catch((response) => {
				this.deleteError = "Error deleting federation";
				if (response.data.message) {
					this.deleteError = response.data.message;
				}
			});

	}

	/**
	 * Edit a federation
	 */
	public setupEditFederation(event: any, teamspace: any, project: any, model: any) {
		this.federationData = model;
		this.federationData.teamspace = teamspace.name;

		// Default projects wont have a name
		if (project && project.name) {
			this.federationData.project = project.name;
		} else {
			this.federationData.project = "default";
		}
		this.federationData._isEdit = true;

		this.originalFederationData = angular.copy(this.federationData);
		this.DialogService.showDialog("federation-dialog.html", this.$scope, event, true);
	}

	/**
	 * Use the query parameters in the URL to populate the model setting page
	 */
	public setupSetting(event: any, teamspace: any, project: any, federation: any) {
		this.$location.search("modelName", federation.name);
		this.$location.search("modelId", federation.model);
		this.$location.search("targetProj", project.name);
		this.$location.search("targetAcct", teamspace.account);
		this.$location.search("page", "modelsetting");

		this.onShowPage({page: "modelsetting", callingPage: "teamspaces"});
	}

	/**
	 * Set up deleting of federation
	 */
	public setupDelete(event: any, account: any, project: any, model: any) {
		this.deleteError = null;
		this.deleteTitle = "Delete Federation";
		this.deleteWarning = "This federation will be lost permanently and will not be recoverable";
		this.modelToDelete = model;
		this.deleteName = model.name;
		this.projectToDeleteFrom = project;
		this.currentAccount = account;
		this.DialogService.showDialog("delete-dialog.html", this.$scope, event, true, null, false, this.dialogCloseToId);
	}

	/**
	 * Set up permissions of federation
	 */
	public goToPermissions(event: any, account: any, project: any, model: any) {

		// Account is an object here
		this.$location.search("account", account.account);
		this.$location.search("project", project.name);
		this.$location.search("model", model.model);

		this.$location.search("page", "assign");
		this.onShowPage({page: "assign", callingPage: "teamspaces"});
	}

}

export const AccountFederationsComponent: ng.IComponentOptions = {
	bindings: {
		account: "=",
		accounts: "=",
		federations: "=",
		federation: "=",
		project: "=",
		federationData: "=",
		originalFederationData: "=",
		federationIndex: "=",
		onShowPage: "&",
		quota: "=",
		subscriptions: "=",
		isDefaultFederation: "@",
		getPotentialFederationModels: "=",
		federationsSaving: "=",
		saveFederation: "=",
		addToFederation: "=",
		isDuplicateName: "=",
		checkFederationSaveDisabled: "=",
		federationSaveDisabled: "=",
		isSaving: "=",
		federationErrorMessage: "=",
	},
	controller: AccountFederationsController,
	controllerAs: "vm",
	templateUrl: "templates/account-federations.html",
};

export const AccountFederationsComponentModule = angular
	.module("3drepo")
	.component("accountFederations", AccountFederationsComponent);
