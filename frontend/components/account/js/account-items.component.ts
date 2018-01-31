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

class AccountItemsController implements ng.IController {

	public static $inject: string[] = [
		"$mdDialog",
		"$scope",
		"$location",
		"$element",
		"$timeout",

		"StateManager",
		"AccountUploadService",
		"RevisionsService",
		"ClientConfigService",
		"AnalyticService",
		"NotificationService",
		"AuthService",
		"AccountService",
		"ViewerService",
		"APIService",
		"DialogService",
	];

	private account;
	private accounts;

	private originalFederationData;
	private showProgress;
	private modelTypes;
	private units;
	private modelRegExp;
	private defaults;
	private newModelButtonDisabled;
	private existingModelFileUploader;
	private modelToUpload;
	private newModelFileUploader;
	private newModelFileToUpload;
	private addButtons;
	private addButtonType;
	private federationsSaving;
	private dialogCloseTo;
	private dialogCloseToId;
	private viewableCache;
	private projectData;
	private showModelTypeOtherInput;
	private files;
	private showNewModelErrorMessage;
	private newModelErrorMessage;
	private federationData;
	private showRemoveWarning;
	private newModelData;
	private isSaving;
	private federationErrorMessage;
	private isCurrentTeamspace;
	private federationSaveDisabled;
	private showInfo;
	private errorMessage;
	private isDefaultFederation;
	private modelToDelete;

	private projectToDeleteFrom;
	private deleteError;
	private deleteTitle;
	private deleteWarning;
	private deleteName;
	private targetAccountToDeleteModel;
	private uploading;
	private tag;
	private desc;
	private modelsExist;
	private onShowPage;
	private showAccountItemsWait;

	constructor(
		private $mdDialog,
		private $scope,
		private $location,
		private $element,
		private $timeout,

		private StateManager,
		private AccountUploadService,
		private RevisionsService,
		private ClientConfigService,
		private AnalyticService,
		private NotificationService,
		private AuthService,
		private AccountService,
		private ViewerService,
		private APIService,
		private DialogService,
	) {}

	/*
	* Init
	*/
	public $onInit() {

		this.ViewerService.reset();

		this.showProgress = true;
		this.modelTypes = ["Architectural", "Structural", "Mechanical", "GIS", "Other"];
		this.units = this.ClientConfigService.units;
		this.modelRegExp = this.ClientConfigService.modelNameRegExp;
		this.defaults = {};
		this.newModelButtonDisabled = true;

		this.StateManager.hasBeenBackToTeamspace = true;

		// SETUP FILE UPLOADERS

		// TODO: Stop accessing query selectors in controllers (I did not write this)
		this.existingModelFileUploader = this.$element[0].querySelector("#existingModelFileUploader");
		this.existingModelFileUploader.addEventListener("change", (event) => {
			this.modelToUpload = event.target.files[0];
			this.$scope.$apply();
		}, false);

		this.newModelFileUploader = this.$element[0].querySelector("#newModelFileUploader");
		this.newModelFileUploader.addEventListener("change", (event) =>  {
			this.newModelFileToUpload = event.target.files[0];
			this.$scope.$apply();
		}, false);

		/**
		 * Escape from the add model/federation/project menu
		 */
		angular.element(document).bind("keydown keypress", (event) => {
			if (event.which === 27 && this.addButtons) { // 27 = esc key
				this.addButtons = false;
				this.addButtonType = "add";
				this.$scope.$apply();
				event.preventDefault();
			}
		});

		this.federationsSaving = {};

		this.dialogCloseTo = "accountFederationsOptionsMenu_" + this.account;
		this.dialogCloseToId = "#" + this.dialogCloseTo;

		this.addButtons = false;
		this.addButtonType = "add";

		this.viewableCache = {
			teamspace : {},
			projects : {},
		};

		this.projectData = {
			visible : (project) => {
				if (
					project.permissions.indexOf("edit_project") !== -1 ||
					project.permissions.indexOf("delete_project") !== -1
				) {
					return true;
				}
				return false;
			},
			deleteName : "",
			deleteTeamspace : "",
			deleteWarning : "",
			teamspaceName : "",
			newProjectName : "",
			oldProjectName : "",
			errorMessage : "",
			projectOptions : {
				edit: {
					label: "Edit",
					icon: "edit",
					visible: (project) => {
						if (project.permissions.indexOf("edit_project") !== -1) {
							return true;
						}
						return false;
					},
				},
				delete: {
					label: "Delete",
					icon: "delete",
					visible: (project) => {
						if (project.permissions.indexOf("delete_project") !== -1) {
							return true;
						}
						return false;
					},
				},
			},
		};

		this.watchers();

	}

	public watchers() {

		this.$scope.$watch("vm.federationData.name", (newValue) => {

			if (newValue) {
				this.checkFederationSaveDisabled();
			}

		}, true);

		this.$scope.$watch("vm.newModelData", (newValue) => {

			if (newValue) {

				const noOtherType = newValue.type === "Other" && !newValue.otherType;

				if (!newValue.unit || !newValue.name || noOtherType) {
					this.newModelButtonDisabled = true;
				} else {
					this.newModelButtonDisabled = false;
				}

				// Show other
				if (newValue.type) {
					this.showModelTypeOtherInput = (newValue.type.toString() === "Other");
				}

			}

		}, true);

		/*
		* Watch new model data
		*/
		this.$scope.$watch("vm.newModelData", () => {

			if (this.newModelFileToUpload) {

				this.showNewModelErrorMessage = false;
				this.newModelErrorMessage = "";

				const names = this.newModelFileToUpload.name.split(".");
				const find = names[names.length - 1].toLowerCase();
				const match = this.ClientConfigService.acceptedFormat.indexOf(find) === -1;

				if (names.length === 1) {
					this.showNewModelErrorMessage = true;
					this.newModelErrorMessage = "Filename must have extension";
					this.newModelFileToUpload = null;
				} else if (match) {
					this.showNewModelErrorMessage = true;
					this.newModelErrorMessage = "File format not supported";
					this.newModelFileToUpload = null;
				}
			}

			if (this.teamspaceAndProjectSelected() && !this.newModelData.name) {
				this.showNewModelErrorMessage = true;
				this.newModelErrorMessage = "Model name isn't between 1-120 characters, or has invalid characters";
			} else {
				this.showNewModelErrorMessage = false;
				this.newModelErrorMessage = "";
			}

		}, true);

		/*
		* Added data to accounts and models for UI
		*/
		this.$scope.$watch("vm.accounts", () => {
			if (angular.isDefined(this.accounts)) {
				// Accounts
				for (let i = 0; i < this.accounts.length; i++) {
					this.accounts[i].name = this.accounts[i].account;
					this.accounts[i].canAddModel = this.accounts[i].permissions.indexOf("teamspace_admin");
				}
			}
		});

	}

	// GENERIC S

	/**
	 * Close the dialog
	 */
	public closeDialog() {
		this.DialogService.closeDialog();
	}

	// HIDE / SHOW STATE

	public showDefaults(project, type) {

		// If it doesn't exist it must be the first time it's loaded
		// so set it to false
		if (this.defaults[project] === undefined) {
			this.defaults[project] = {};
		}

		// Same again for the type
		if (this.defaults[project][type] === undefined) {
			this.defaults[project][type] = false;
		}

		return this.defaults[project][type];

	}

	public resetViewableCache() {
		this.viewableCache = {
			teamspace : {},
			projects : {},
		};
	}

	public hasViewableProject(teamspace) {

		if (this.viewableCache.teamspace[teamspace.name]) {
			return this.viewableCache.teamspace[teamspace.name];
		}

		const viewable = teamspace.projects.filter((project) => {
			return this.hasViewableModel(project);
		}).length > 0 || teamspace.permissions.length > 0;

		this.viewableCache.teamspace[teamspace.name] = viewable;
		return viewable;

	}

	public hasViewableModel(project) {

		if (this.viewableCache.projects[project._id]) {
			return this.viewableCache.projects[project._id];
		}

		const viewable = project.models.filter((model) => {
			return model.permissions.length > 0;
		}).length > 0 || project.permissions.length > 0;

		this.viewableCache.projects[project._id] = viewable;
		return viewable;

	}

	/**
	 * Check a function has permission
	 *
	 */
	public hasProjectWithPermission(teamspace, permission) {
		return teamspace.projects.filter((project) => {
			return project.permissions.indexOf(permission) !== -1;
		}).length > 0;
	}

	/**
	 * Get the show/hide state of a data object
	 *
	 * @param node The object to set the state on (true or false)
	 * @param prop The property to set (i.e. 'state')
	 * @param account The account name
	 * @returns The state of the property (to show or hide)
	 */
	public getState(node: any, prop: string, account: string): boolean {

		// If it hasn't been defined before
		// set it to false, unless its the owners account
		if (node[prop] === undefined) {

			const isCurrentTeamspace = account !== undefined
				&& this.account && account === this.account;

			if (isCurrentTeamspace && prop !== "modelsState" && prop !== "fedsState") {
				node[prop] = true;
			} else {
				node[prop] = false;
			}
		}
		return node[prop];
	}

	/**
	 * Check if a data object should be shown or hidden
	 *
	 * @param items The object to set the state on (true or false)
	 * @param type The type of the data object (project, projects, model, federation etc)
	 * @returns The state of the property (to show or hide)
	 */
	public shouldShow(items: any, type: string, account: any) {

		switch (type) {
			// Special cases for models and federations
		case "models":
			return this.getState(items, "modelsState", account);
		case "federations":
			return this.getState(items, "fedsState", account);

			// All other cases
		default:
			return this.getState(items, "state", account);
		}
	}

	/**
	 * Invert the state of a teamspace (to show or hide)
	 * @param teamspace The teamspace to set true or false
	 */
	public toggleTeamspace(teamspace) {
		teamspace.state = !teamspace.state;
	}

	/**
	 * Invert the state of a part of the default/unassigned tree
	 * @param project the project to toggle
	 * @param type the item to toggle
	 * @return if a part of the default tree should show or hide
	 */
	public toggleDefault(project: string, type: string): boolean {
		this.defaults[project][type] = !this.defaults[project][type];
		return this.defaults[project][type];
	}

	/**
	 * Invert the state of projects (to show or hide)
	 * @param {Array} project The object to set the state on (true or false)
	 */
	public toggleProjects(projects) {
		projects.state = !projects.state;
	}

	/**
	 * Invert the state of a project and sub projects (to show or hide)
	 * @param {Array} project The object to set the state on (true or false)
	 */
	public toggleProject(project) {
		project.state = !project.state;
		project.models.forEach((model) => {
			model.modelState = !!project.state;
			model.fedState = !!project.state;
		});
	}

	/**
	 * Invert the models node
	 * @param model the model to invert the models for
	 */
	public toggleModels(model: any) {
		model.modelsState = !model.modelsState;
	}

	/**
	 * Invert the federations node
	 * @param project the project to invert the federations for
	 */
	public toggleFederations(project: any) {
		project.fedsState = !project.fedsState;
	}

	/**
	 * Checks that a set of models has federations within it
	 * @param models the models to check
	 */
	public hasFederations(models: any) {
		return this.AccountService.hasFederations(models);
	}

	/**
	 * Get the federation in a list of models
	 * @param models the models to check
	 */
	public getFederations(models: any) {
		return this.AccountService.getFederations(models);
	}

	/**
	 * Get models from within a list of models (excluding federations)
	 * @param models the models to check
	 */
	public getIndividualModels(models: any) {
		return this.AccountService.getIndividualModels(models);
	}

	/**
	 * Get projects from a teamspace
	 * @param teamspace the teamspace to check for projects
	 */
	public getProjects(teamspace: any) {
		const projects = this.AccountService.getProjectsByTeamspaceName(this.accounts, teamspace);
		return projects;
	}

	/**
	 * Toggle the state of the add model/federation/project button
	 */
	public addButtonsToggle() {
		this.addButtons = !this.addButtons;
		this.addButtonType = (this.addButtonType === "add") ? "clear" : "add";
	}

	/**
	 * Check if the user can save a federation or not
	 */
	public checkFederationSaveDisabled() {
		const empty = this.federationData.subModels === undefined ||
					this.federationData.subModels.length === 0;

		if (empty) {
			this.federationErrorMessage = "Federation can't be empty";
			this.federationSaveDisabled = true;
		} else if (this.isDuplicateName()) {
			this.federationErrorMessage = "Federation name taken";
			this.federationSaveDisabled = true;
		} else {
			this.federationErrorMessage = "";
			this.federationSaveDisabled = false;
		}

	}

	/**
	 * Check if federation has a duplicate name
	 */
	public isDuplicateName(): boolean {

		// If we're editing then the name will always be the same
		// which is fine
		if (this.federationData._isEdit) {
			return false;
		}

		const teamspaceName = this.federationData.teamspace;
		const projectName = this.federationData.project;
		const fedName = this.federationData.name;
		const duplicate = this.AccountService.isDuplicateFederation(
			this.accounts,
			teamspaceName,
			projectName,
			fedName,
		);

		if (duplicate) {
			this.federationErrorMessage = "Federation already with this name!";
		} else {
			this.federationErrorMessage = "";
		}
		return duplicate;
	}

	/**
	 * Save a federationt to a project
	 * @param teamspaceName The name of the teamspace to save to
	 * @param projectName The name of the project to save to
	 */
	public saveFederation(teamspaceName: string, projectName: string) {
		let promise;
		const project = this.AccountService.getProject(this.accounts, teamspaceName, projectName);
		const isEdit = this.federationData._isEdit;

		const currentFederation = this.federationData.name;

		this.federationsSaving[currentFederation] = true;
		this.federationData.modelName = this.federationData.name;

		if (isEdit) {
			delete this.federationData._isEdit;
			promise = this.APIService.put(teamspaceName + "/" + this.federationData.model, this.federationData);
		} else {
			promise = this.APIService.post(teamspaceName + "/model", this.federationData);
		}

		promise
			.then((response) => {

				if (response.status !== 200 && response.status !== 201) {

					this.federationErrorMessage = response.data.message;

					this.$mdDialog.show(
						this.$mdDialog.alert()
							.clickOutsideToClose(true)
							.title("Federation Save Error")
							.textContent(this.errorMessage)
							.ariaLabel("Federation Save Error")
							.ok("OK"),
					);

				} else {

					this.federationErrorMessage = "";
					this.showInfo = false;
					this.federationData.teamspace = teamspaceName;
					this.federationData.project = projectName;
					this.federationData.federate = true;
					this.federationData.permissions = response.data.permissions || this.federationData.permissions;
					this.federationData.model = response.data.model;
					if (response.data.timestamp) {
						this.federationData.timestamp = response.data.timestamp;
					}

					// TODO: This should exist - backend problem : ISSUE_371
					if (!isEdit) {
						project.models.push(this.federationData);
					}
					this.resetViewableCache();

					this.addButtons = false;
					this.addButtonType = "add";

					this.AnalyticService.sendEvent({
						eventCategory: "Model",
						eventAction: (this.federationData._isEdit) ? "edit" : "create",
						eventLabel: "federation",
					});
				}

				this.federationsSaving[currentFederation] = false;

			})
			.catch((error) => {
				console.log(this);
				const title = "Error Saving Federation";
				const action = "saving the federation";
				this.errorDialog(title, action, error);
				this.cancelFederationChanges();
				this.federationsSaving[currentFederation] = false;
			});

		// Close the dialog
		this.isSaving = false;
		this.DialogService.closeDialog();

		this.$timeout(() => {
			this.$scope.$apply();
		});
	}

	/**
	 * Get all default federations
	 * @param isDefault Is the federation a default federation
	 */
	public getPotentialFederationModels(isDefault: boolean) {
		let models;

		// isDefault is a string for some reason?
		if (typeof(isDefault) === "string") {
			isDefault = (isDefault === "true");
		}

		if (!isDefault) {

			models = this.AccountService.getIndividualModelsByProjectName(
				this.accounts,
				this.federationData.teamspace,
				this.federationData.project,
			);
		} else {
			models = this.AccountService.getIndividualTeamspaceModels(
				this.accounts,
				this.federationData.teamspace,
			);
		}

		const noneFederated = this.AccountService.getNoneFederatedModels(
			this.federationData,
			models,
		);
		return noneFederated;

	}

	/**
	 * Remove a model from a federation
	 *
	 * @param modelId
	 */
	public removeFromFederation(modelId) {
		this.AccountService.removeFromFederation(this.federationData, modelId);
		this.checkFederationSaveDisabled();
	}

	/**
	 * Add a model to a federation
	 */
	public addToFederation(modelIndex, teamspaceName, models) {

		this.showRemoveWarning = false;

		this.federationData.subModels.push({
			database: teamspaceName,
			modelIndex,
			model: models[modelIndex].model,
			name: models[modelIndex].name,
		});

		models[modelIndex].federate = true;

		this.checkFederationSaveDisabled();

	}

	// FEDERATIONS

	/**
	 * Open the federation dialog
	 * @param event
	 */
	public setupNewFederation(event: any) {

		this.isDefaultFederation = false;
		this.originalFederationData = null;

		this.federationData = {
			desc: "",
			type: "",
			subModels: [],
			unit: "mm",
		};

		this.federationErrorMessage = "";
		this.DialogService.showDialog(
			"federation-dialog.html",
			this.$scope,
			event,
			true,
			null,
			false,
			this.dialogCloseToId,
		);

	}

	public cancelFederationChanges() {
		if (this.originalFederationData) {
			Object.keys(this.federationData).forEach((key) => {
				if (this.federationData[key] !== this.originalFederationData[key]) {
					this.federationData[key] = this.originalFederationData[key];
				}
			});
		}
	}

	public closeFederationDialog() {
		this.cancelFederationChanges();
		this.isSaving = false;
		this.DialogService.closeDialog();
	}

	// MODELS

	/**
	 * Set up deleting of model
	 *
	 * @param {Object} event
	 * @param {Object} model
	 */
	public setupDeleteModel(event, model, account, project) {
		this.modelToDelete = model;
		this.projectToDeleteFrom = project;
		this.deleteError = null;
		this.deleteTitle = "Delete model";
		this.deleteWarning = "Your data will be lost permanently and will not be recoverable";
		this.deleteName = this.modelToDelete.name;
		this.targetAccountToDeleteModel = account;
		this.DialogService.showDialog("delete-dialog.html", this.$scope, event, true);
	}

	/**
	 * Delete model
	 */
	public deleteModel() {

		let account;
		const url = this.targetAccountToDeleteModel + "/" + this.modelToDelete.model;
		this.APIService.delete(url, {})
			.then((response) => {

				if (response.status === 200) {

					// Remove model from list
					for (let i = 0; i < this.accounts.length; i += 1) {
						account = this.accounts[i];
						if (account.name === response.data.account) {
							if (this.projectToDeleteFrom && this.projectToDeleteFrom.name) {

								const projectToDeleteFrom = this.projectToDeleteFrom.name;
								this.AccountService.removeModelByProjectName(
									this.accounts,
									account.name,
									projectToDeleteFrom,
									response.data.model,
								);
								this.AccountService.removeFromFederationByProjectName(
									this.accounts,
									account.name,
									projectToDeleteFrom,
									response.data.model,
								);
								break;

							} else {
								// If default
								for (let j = 0; j < this.accounts[i].models.length; j++) {
									if (account.models[j].name === response.data.model) {
										account.models.splice(j, 1);
										break;
									}
								}
							}
						}
					}

					this.closeDialog();
					this.addButtons = false;
					this.addButtonType = "add";
					this.AnalyticService.sendEvent({
						eventCategory: "Model",
						eventAction: "delete",
					});
				} else {
					this.deleteError = "Error deleting model";
					if (response.data.message) {
						this.deleteError = "Error: " + response.data.message;
						console.error("Deleting model error: ", response);
					}
				}
			})
			.catch((response) => {
				this.deleteError = "Error deleting model";
				if (response.data.message) {
					this.deleteError = "Error: " + response.data.message;
					console.error("Deleting model error: ", response);
				}
			});
	}

	public showAllModelDialogInputs(): boolean {
		return this.teamspaceAndProjectSelected() &&
			this.newModelData.name &&
			this.newModelData.name.length;
	}

	public teamspaceAndProjectSelected(): boolean {
		return this.newModelData &&
			this.newModelData.project &&
			this.newModelData.teamspace;
	}

	/**
	* Bring up dialog to add a new model
	*/
	public newModel(event, accountForModel) {
		this.tag = null;
		this.desc = null;
		this.showNewModelErrorMessage = false;
		this.newModelFileToUpload = null;
		this.newModelData = {
			name: "",
			account: accountForModel,
			type: this.modelTypes[0],
		};
		this.newModelFileToUpload = null;
		this.DialogService.showDialog("model-dialog.html", this.$scope, event, true);
	}

	/**
	* Save a new model
	*/
	public saveNewModel(event) {
		const enterKey = 13;
		let doSave = false;

		if (angular.isDefined(event)) {
			if (event.which === enterKey) {
				doSave = true;
			}
		} else {
			doSave = true;
		}

		if (doSave) {

			if (this.RevisionsService.isTagFormatInValid(this.tag)) {
				this.showNewModelErrorMessage = true;
				this.newModelErrorMessage = "Invalid revision name";
				return;
			}

			if (!this.newModelData.name) {
				this.showNewModelErrorMessage = true;
				this.newModelErrorMessage = "Invalid model name";
				return;
			}

			this.uploading = true;
			this.closeDialog();

			this.AccountUploadService.newModel(this.newModelData)
				.then((response) => {

					if (response.data.status === 400) {
						this.showNewModelErrorMessage = true;
						this.newModelErrorMessage = response.data.message;
					} else {
						this.modelsExist = true;
						// Add model to list
						const model = {
							model: response.data.model,
							name: response.data.name,
							project : this.newModelData.project,
							permissions: response.data.permissions,
							canUpload: true,
							timestamp: null,
						};

						this.updateAccountModels(
							response.data.account,
							model,
							this.newModelData.project,
						);
						this.addButtons = false;
						this.addButtonType = "add";

						this.AnalyticService.sendEvent({
							eventCategory: "model",
							eventAction: "create",
						});
					}
					this.uploading = false;
				})
				.catch((error) => {
					this.showNewModelErrorMessage = true;
					this.newModelErrorMessage = error.data.message;
					this.uploading = false;

					const title = "Error Uploading Model";
					const action = "uploading your model";
					this.errorDialog(title, action, error);
				});
		}
	}

	public errorDialog(title, action, error) {
		console.log(error);
		const message = (error && error.data && error.data.message) ? error.data.message : "Unknown Error";
		const content = "Something went wrong " +  action + ": <br><br>" +
			"<strong> " + message + "</strong>" +
			"<br><br> If this is unexpected please message support@3drepo.io.";
		const escapable = true;
		this.DialogService.html(title, content, escapable);
	}

	/**
	* Upload a file
	* @param model
	*/
	public uploadFile(model) {
		this.existingModelFileUploader.value = "";
		this.existingModelFileUploader.existingModelToUpload = model;
		this.existingModelFileUploader.click();
	}

	/**
	* Upload a file
	*/
	public uploadFileForNewModel() {
		this.newModelFileUploader.value = "";
		this.newModelFileUploader.click();
	}

	/**
	* Show waiting before going to AccountItems page
	*/
	public setupAccountItems() {
		// $timeout required otherwise Submit does not work
		this.$timeout(() => {
			this.showAccountItemsWait = true;
		});
	}

	/**
	* Show a given page from a calling page
	* @param page the page to show
	* @param callingPage the page that it is being called from
	*/
	public showPage(page, callingPage) {
		this.onShowPage({page, callingPage});
	}

	/**
	* Add a model to an existing or create newly created account
	* @param account
	* @param model
	*/
	public updateAccountModels(account, model, projectName) {

		let	accountToUpdate;
		let found = false;

		for (let i = 0; i < this.accounts.length; i++) {
			if (this.accounts[i].name === account) {
				accountToUpdate = this.accounts[i];
				// Check if the project exists and it if so
				accountToUpdate.projects.forEach((project) => {
					if (project.name === projectName ) {
						this.resetViewableCache();
						project.models.push(model);
						found = true;
					}
				});
				// If not just put it in default/unassigned models
				if (!found) {
					accountToUpdate.models.push(model);
				}
				break;
			}
		}
		if (angular.isUndefined(accountToUpdate)) {

			accountToUpdate = {
				name: account,
				models: [model],
			};
			accountToUpdate.canUpload = (account === this.account);
			this.accounts.push(accountToUpdate);
		}

		// Save model to model
		if (this.newModelFileToUpload !== null) {

			this.AccountUploadService.uploadFileToModel({
				account,
				model,
				file: this.newModelFileToUpload,
				tag: this.tag,
				desc: this.desc,
				newModel: true,
			})
				.then(() => {

					this.AnalyticService.sendEvent({
						eventCategory: "Model",
						eventAction: "upload",
					});

				})
				.catch((errorMsg) => {

					setTimeout(() => {
						this.DialogService.text("Model Upload Failed", errorMsg, false);
					}, 500);

				});

		}
	}

	/**
	* Perform an option for a project
	*
	* @param option The operation to perform
	* @param project The project object
	* @param teamspace The teamsapce object
	*/
	public doProjectOption(option: string, project: any, teamspace: any) {
		switch (option) {
		case "delete":
			const warn = "This will remove the project from your teamspace, " +
						"deleting all the models inside of it!";
			this.projectData.deleteName = project.name;
			this.projectData.deleteTeamspace = teamspace.name;
			this.projectData.deleteWarning = warn;
			this.projectData.errorMessage = "";
			this.DialogService.showDialog("delete-project-dialog.html", this.$scope, null, true);
			break;

		case "edit":
			this.editProject(project, teamspace);
			break;
		}
	}

	/**
	* Open dialog for a new project
	*/
	public newProject() {
		this.projectData.teamspaceName = "";
		this.projectData.newProjectName = "";
		this.projectData.oldProjectName = "";
		this.projectData.errorMessage = "";
		this.DialogService.showDialog("project-dialog.html", this.$scope, null, true);
	}

	/**
	* Open dialog to edit a project
	* @param project The project object
	* @param teamspace The teamsapce object
	*/
	public editProject(project, teamspace) {
		this.projectData.oldProjectName = project.name;
		this.projectData.teamspaceName = teamspace.name;
		this.projectData.newProjectName = project.name;
		this.projectData.errorMessage = "";
		this.DialogService.showDialog("project-dialog.html", this.$scope, null, true);
	}

	/**
	* Save a new project to a teamspace
	* @param teamspaceName The teamspace name to save to
	* @param projectName The project name to save to
	*/
	public saveNewProject(teamspaceName: string, projectName: string) {
		const url = teamspaceName + "/projects/";
		const promise = this.APIService.post(url, {name: projectName});
		this.handleProjectPromise(promise, teamspaceName, false);
	}

	/**
	* Update a new project in a teamspac
	* @param teamspaceName The project name to update
	* @param oldProjectName The project name to update
	* @param newProjectName The project name to change to
	*/
	public updateProject(teamspaceName: string, oldProjectName: string, newProjectName: string) {
		const url = teamspaceName + "/projects/" + oldProjectName;
		const promise = this.APIService.put(url, {name: newProjectName});
		this.handleProjectPromise(promise, teamspaceName, {
			edit  : true,
			newProjectName,
			oldProjectName,
		});
	}

	/**
	* Delete a project in a teamspace
	* @param teamspaceName The teamspace delete to save from
	* @param projectName The project name to delete
	*/
	public deleteProject(teamspaceName: string, projectName: string) {
		const url = teamspaceName + "/projects/" + projectName;
		const promise = this.APIService.delete(url, {});
		this.handleProjectPromise(promise, teamspaceName, {
			projectName,
			delete: true,
		});
	}

	/**
	* Handle the promise project
	* @param promise The promise to handle
	* @param teamspaceName The project name to delete
	* @param update Object that holds flags to signal whether to update or delete
	*/
	public handleProjectPromise(promise: Promise<any>, teamspaceName: string, update: any) {

		promise
			.then((response) => {

				if (response.status !== 200 && response.status !== 201) {
					this.projectData.errorMessage = response.data.message;
				} else {

					const project = response.data;

					// TODO: This is a hack, why does the API not return the correct permissions?
					const permissions = [
						"create_federation", "create_model",
						"admin_project", "delete_project",
						"edit_project",
					];
					project.permissions = project.permissions.concat(permissions);

					if (update.edit) {
						this.AccountService.renameProjectInTeamspace(
							this.accounts,
							teamspaceName,
							update.newProjectName,
							update.oldProjectName,
						);
					} else if (update.delete) {
						this.AccountService.removeProjectInTeamspace(
							this.accounts,
							teamspaceName,
							update.projectName,
						);
					} else {
						this.AccountService.addProjectToTeamspace(
							this.accounts,
							teamspaceName,
							project,
						);
					}

					this.projectData.errorMessage = "";
					this.resetViewableCache();
					this.federationErrorMessage = "";
					// delete this.newProjectTeamspace;
					// delete this.newProjectName;
					this.addButtons = false;
					this.addButtonType = "add";
					this.closeDialog();
				}

			})
			.catch((error) => {
				this.projectData.errorMessage = error.message;
			});

	}

}

export const AccountItemsComponent: ng.IComponentOptions = {
	bindings: {
		account: "=",
		accounts: "=",
		onShowPage: "&",
		quota: "=",
		subscriptions: "=",
		isLiteMode: "<",
	},
	controller: AccountItemsController,
	controllerAs: "vm",
	templateUrl: "templates/account-items.html",
};

export const AccountItemsComponentModule = angular
	.module("3drepo")
	.component("accountItems", AccountItemsComponent);
