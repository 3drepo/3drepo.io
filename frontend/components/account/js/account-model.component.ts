/**
 *
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

class AccountModelController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$location",
		"$timeout",
		"$interval",
		"$filter",

		"DialogService",
		"APIService",
		"ClientConfigService",
		"RevisionsService",
		"NotificationService",
		"AuthService",
		"AnalyticService",
		"AccountService",
		"AccountUploadService",
	];

	private infoTimeout;
	private isUserAccount;
	private modelToUpload;
	private account;
	private userAccount;
	private onUploadFile;

	private dialogCloseTo;
	private dialogCloseToId;
	private model;
	private modelOptions;
	private uploadButtonDisabled;
	private revisionsLoading;
	private modelToUploadFileWatch;
	private tag;
	private desc;
	private uploading;
	private uploadErrorMessage;
	private fileUploadInfo;
	private onShowPage;
	private addButtons;
	private addButtonType;
	private onSetupDeleteModel;
	private revisions;
	private project;

	constructor(
		private $scope: any,
		private $location: any,
		private $timeout: any,
		private $interval: any,
		private $filter: any,

		private DialogService: any,
		private APIService: any,
		private ClientConfigService: any,
		private RevisionsService: any,
		private NotificationService: any,
		private AuthService: any,
		private AnalyticService: any,
		private AccountService: any,
		private AccountUploadService: any,
	) {}

	public $onInit() {

		this.infoTimeout = 10000;
		this.isUserAccount = (this.account === this.userAccount);
		this.modelToUpload = null;

		this.dialogCloseTo = "accountModelsOptionsMenu_" + this.account + "_" + this.model.model;
		this.dialogCloseToId = "#" + this.dialogCloseTo;

		if (this.model.timestamp !== null) {
			this.model.timestampPretty = this.$filter("prettyDate")(this.model.timestamp, {showSeconds: true});
		}

		this.model.canUpload = true;
		const perms = this.ClientConfigService.permissions;

		// Options
		this.modelOptions = {
			upload: {
				label: "Upload file",
				icon: "cloud_upload",
				hidden: !this.AuthService.hasPermission(perms.PERM_UPLOAD_FILES, this.model.permissions),
			},
			permissions: {
				label: "Permissions",
				icon: "group",
				hidden: !this.AuthService.hasPermission("manage_model_permission", this.model.permissions),
			},
			revision: {
				label: "Revisions",
				icon: "settings_backup_restore",
				hidden: false,
			},
			modelsetting: {
				label: "Settings",
				icon: "settings",
				hidden: !this.AuthService.hasPermission(perms.PERM_CHANGE_MODEL_SETTINGS, this.model.permissions)
			},
		};

		if (this.model.timestamp && !this.model.federate) {
			this.modelOptions.download = {
				label: "Download",
				icon: "cloud_download",
				hidden: !this.AuthService.hasPermission(perms.PERM_DOWNLOAD_MODEL, this.model.permissions)
			};
		}
		this.uploadButtonDisabled = true;
		this.modelOptions.delete = {
			label: "Delete",
			icon: "delete",
			hidden: !this.AuthService.hasPermission(perms.PERM_DELETE_MODEL, this.model.permissions), 
			color: "#F44336",
		};

		this.watchModelStatus();

		this.revisionsLoading = true;
		this.watchers();
	}

	public $onDestroy() {
		// this.uploadedFileWatch(); // Disable events watch
		this.modelToUploadFileWatch = undefined;

		// Unsubscribe for notifications
		this.NotificationService.unsubscribe.modelStatusChanged(this.account, this.model.model);
	}

	public watchers() {
		this.modelToUploadFileWatch = this.$scope.$watch("vm.modelToUpload", () => {
			// Check that the file to be uploaded is valid!
			if (this.modelToUpload) {

				const names = this.modelToUpload.name.split(".");

				this.uploadErrorMessage = null;
				const extension = names[names.length - 1].toLowerCase();
				const valid = this.ClientConfigService.acceptedFormat.indexOf(extension) === -1;

				if (names.length === 1) {
					this.uploadErrorMessage = "Filename must have extension";
					this.modelToUpload = null;
					this.uploadButtonDisabled = true;
				} else if (valid) {
					this.uploadErrorMessage = "File format not supported";
					this.modelToUpload = null;
					this.uploadButtonDisabled = true;
				} else {
					this.uploadButtonDisabled = false;
				}

			}
		});
	}

	/**
	 * Go to the model viewer
	 */
	public goToModel(event) {

		if (!this.model.uploading) {
			if (this.model.timestamp === null) {
				// No timestamp indicates no model previously uploaded
				const permission = this.ClientConfigService.permissions.PERM_UPLOAD_FILES;
				if (this.AuthService.hasPermission(permission, this.model.permissions)) {
					this.tag = null;
					this.desc = null;
					this.modelToUpload = null;
					this.DialogService.showDialog(
						"upload-model-dialog.html",
						this.$scope,
						event,
						true,
						null,
						false,
						this.dialogCloseToId,
					);
				} else {
					console.warn("Incorrect permissions");
				}
			} else {
				this.$location.path("/" + this.account + "/" + this.model.model, "_self").search("page", null);
				this.AnalyticService.sendEvent({
					eventCategory: "Model",
					eventAction: "view",
				});
			}
		}
	}

	/**
	 * Handle model option selection
	 * @param event
	 * @param option
	 */
	public doModelOption(event, option) {
		switch (option) {
		case "modelsetting":
			this.$location.search("modelName", this.model.name);
			this.$location.search("modelId", this.model.model);
			this.$location.search("targetProj", this.project.name);
			this.$location.search("targetAcct", this.account);
			this.$location.search("page", "modelsetting");

			this.onShowPage({page: "modelsetting", callingPage: "permissionsspaces"});
			break;

		case "upload":
			this.uploadErrorMessage = null;
			this.modelToUpload = null;
			this.tag = null;
			this.desc = null;
			this.uploadButtonDisabled = true;
			this.DialogService.showDialog(
				"upload-model-dialog.html",
				this.$scope,
				event,
				true,
				null,
				false,
				this.dialogCloseToId,
			);

			break;

		case "download":
			const url = `${this.account}/${this.model.model}/download/latest`;
			window.open(
				this.ClientConfigService.apiUrl(this.ClientConfigService.GET_API, url),
				"_blank",
			);

			this.AnalyticService.sendEvent({
				eventCategory: "Model",
				eventAction: "download",
			});

			break;

		case "permissions":
			this.goToPermissions(event, this.account, this.project, this.model);
			break;

		case "delete":
			this.onSetupDeleteModel({
				event,
				model: this.model,
				account: this.account,
				project: this.project,
			});
			break;

		case "revision":
			this.revisionsLoading = true;
			this.revisions = null;
			this.RevisionsService.listAll(this.account, this.model.model).then((revisions) => {
				this.revisions = revisions;
				this.revisionsLoading = false;
			});
			this.DialogService.showDialog("revisions-dialog.html", this.$scope, event, true, null, false, this.dialogCloseToId);
			break;
		}
	}

	/**
	 * Go to the billing page to add more licenses
	 */
	public setupAddLicenses() {
		this.onShowPage({page: "billing", callingPage: "permissionsspaces"});
		this.DialogService.closeDialog();
	}

	/**
	 * Close the dialog
	 */
	public closeDialog() {
		this.DialogService.closeDialog();
	}

	/**
	 * When users click select file
	 */
	public selectFile() {
		this.onUploadFile({model: this.model, account: this.account});
	}

	/**
	 * When users click upload after selecting
	 */
	public uploadFile() {

		if (!this.model) {
			console.error("No file defined: ", this.model);
		}

		this.uploading = true;

		this.uploadErrorMessage = null;

		const uploadFileData = {
			model: this.model,
			account: this.account,
			file: this.modelToUpload,
			tag: this.tag,
			desc: this.desc,
		};

		this.AccountUploadService.uploadRevisionToModel(uploadFileData)
			.then(() => {
				this.addButtons = false;
				this.addButtonType = "add";
				this.uploading = false;
				this.closeDialog();
			})
			.catch((errorMessage) => {
				this.uploading = false;
				this.uploadErrorMessage = errorMessage;
			});

	}

	/**
	* Go to the specified revision
	*/
	public goToRevision(revId) {
		this.$location.path(`/${this.account}/${this.model.model}/${revId}`, "_self");
		this.AnalyticService.sendEvent({
			eventCategory: "Model",
			eventAction: "view",
		});
	}

	/**
	 * Watch file upload status
	 */
	public watchModelStatus() {

		// If we're refreshing the page, handle the data recieved
		this.handleModelStatus(this.model, false);

		// Else if there's dynamic updates to the model listen for them
		this.NotificationService.subscribe.modelStatusChanged(
			this.account,
			this.model.model,
			this.handleModelStatus.bind(this),
		);

	}

	/**
	 * Determines if the model is currently processing on the server
	 */
	public isProcessing() {
		return this.model.status === "uploading" || this.model.status === "uploaded" ||
				this.model.status === "processing" || this.model.status === "queued";
	}

	/**
	 * Process the status of the model and set the view
	 */
	public handleModelStatus(modelData, freshModel) {

		if (modelData.status) {
			this.model.status = modelData.status;
		}

		if ((modelData.status === "ok") || (modelData.status === "failed")) {

			// Check if the model has been successfully uploaded or
			// that the errors are acceptable
			const error = modelData.errorReason;
			const valid = modelData.status === "ok" ||
				(error && error.value === this.APIService.getResponseCode("FILE_IMPORT_MISSING_TEXTURES")) ||
				(error && error.value === this.APIService.getResponseCode("FILE_IMPORT_MISSING_NODES"));

			// We don't want to show the import successful message
			// for models that were there before, so we use the isFreshModel flag
			const isFreshModel = freshModel === undefined;
			if (valid && isFreshModel) {
				this.model.timestamp = new Date();
				this.model.timestampPretty = this.$filter("prettyDate")(this.model.timestamp, {showSeconds: true});
				this.fileUploadInfo = "Model imported successfully";
				// clear revisions cache
				this.revisions = null;
				this.revisionsLoading = true;

			}

			// status=ok can have an error message too
			const errorReason = modelData.hasOwnProperty("errorReason") &&
								modelData.errorReason.message;
			const errorStatus = modelData.status === "failed";

			if (errorReason) {
				this.fileUploadInfo = modelData.errorReason.message;
			} else if (errorStatus) {
				this.fileUploadInfo = "Failed to import model";
			}

			// $timeout(function () {
			// 	this.fileUploadInfo = "";
			// }, this.infoTimeout);

		} else if (modelData.status === "queued") {

			this.fileUploadInfo = "Queued...";

		} else if (modelData.status === "uploading") {

			this.fileUploadInfo = "Uploading...";

		} else if (modelData.status === "processing" || modelData.status === "uploaded"){

			this.fileUploadInfo = "Processing...";

		}

	}

	/**
	 * Set up permissions of modelt
	 */
	public goToPermissions(event, account, project, model) {

		this.$location.search("account", account);
		this.$location.search("project", project.name);
		this.$location.search("model", model.model);
		this.$location.search("page", "assign");
		this.onShowPage({page: "assign", callingPage: "teamspaces"});

	}

}

export const AccountModelComponent: ng.IComponentOptions = {
	bindings: {
		account: "=",
		model: "=",
		isMobileDevice: "<",
		project: "=",
		userAccount: "=",
		onUploadFile: "&",
		uploadedFile: "=",
		modelToUpload: "=",
		onShowPage: "&",
		onSetupDeleteModel: "&",
		quota: "=",
		isAccountAdmin: "=",
		subscriptions: "=",
	},
	controller: AccountModelController,
	controllerAs: "vm",
	templateUrl: "templates/account-model.html",
};

export const AccountModelComponentModule = angular
	.module("3drepo")
	.component("accountModel", AccountModelComponent);
