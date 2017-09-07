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

(function () {
	"use strict";

	angular.module("3drepo")
		.component("accountItems", {
			restrict: "EA",
			templateUrl: "templates/account-items.html",
			bindings: {
				account: "=",	
				accounts: "=",
				onShowPage: "&",
				quota: "=",
				subscriptions: "="
			},
			controller: AccountItemsCtrl,
			controllerAs: "vm"
			
		});

	AccountItemsCtrl.$inject = [
		"StateManager", "$mdDialog", "$scope", "$location", "$element", 
		"$timeout", "AccountUploadService", "UtilsService", "RevisionsService", "ClientConfigService", 
		"AnalyticService", "NotificationService",  "AuthService", "AccountService"
	];

	function AccountItemsCtrl(
		StateManager, $mdDialog, $scope, $location, $element,
		$timeout, AccountUploadService, UtilsService, RevisionsService, ClientConfigService, 
		AnalyticService, NotificationService, AuthService, AccountService
	) {
		
		var vm = this;

		/*
		 * Init
		 */
		vm.$onInit = function() {
			vm.info = "Retrieving models...";
			vm.showProgress = true;
			vm.modelTypes = ["Architectural", "Structural", "Mechanical", "GIS", "Other"];
			vm.units = ClientConfigService.units;
			vm.modelRegExp = ClientConfigService.modelNameRegExp;
			vm.defaults = {}; 
			vm.newModelButtonDisabled = true;

			StateManager.hasBeenBackToTeamspace = true;

			// SETUP FILE UPLOADERS
			
			// TODO: Stop accessing query selectors in controllers (I did not write this)
			vm.existingModelFileUploader = $element[0].querySelector("#existingModelFileUploader");
			vm.existingModelFileUploader.addEventListener("change", function () {
				vm.modelToUpload = this.files[0];
				$scope.$apply();
			}, false);

			vm.newModelFileUploader = $element[0].querySelector("#newModelFileUploader");
			vm.newModelFileUploader.addEventListener("change", function () {
				vm.newModelFileToUpload = this.files[0];
				$scope.$apply();
			}, false);
			
			/**
			 * Escape from the add model/federation/project menu
			 */
			
			angular.element(document).bind("keydown keypress", function (event) {
				if(event.which === 27 && vm.addButtons) { // 27 = esc key
					vm.addButtons = false;
					vm.addButtonType = "add";
					$scope.$apply();
					event.preventDefault();
				}
			});

			vm.federationsSaving = {};

			vm.dialogCloseTo = "accountFederationsOptionsMenu_" + vm.account;
			vm.dialogCloseToId = "#" + vm.dialogCloseTo;

			vm.addButtons = false;
			vm.addButtonType = "add";
		
		};
		
		// GENERIC FUNCTIONS

		/**
		 * Close the dialog
		 */
		vm.closeDialog = function() {
			UtilsService.closeDialog();
		};

		
		// HIDE / SHOW STATE

		vm.showDefaults = function(project, type) {

			// If it doesn't exist it must be the first time it's loaded
			// so set it to false
			if (vm.defaults[project] === undefined) {
				vm.defaults[project] = {};
			} 

			// Same again for the type
			if (vm.defaults[project][type] === undefined) {
				vm.defaults[project][type] = false;
			} 

			return vm.defaults[project][type];
			
		};

		vm.resetViewableCache = function() {
			vm.viewableCache = {
				teamspace : {},
				projects : {}
			};
		};

		vm.viewableCache = {
			teamspace : {},
			projects : {}
		};

		vm.hasViewableProject = function(teamspace) {

			if (vm.viewableCache.teamspace[teamspace.name]) {
				return vm.viewableCache.teamspace[teamspace.name];
			} 

			var viewable = teamspace.projects.filter(
				vm.hasViewableModel
			).length > 0 || teamspace.permissions.length > 0;

			vm.viewableCache.teamspace[teamspace.name] = viewable;
			return viewable;

		};

		vm.hasViewableModel = function(project) {

			if (vm.viewableCache.projects[project._id]) {
				return vm.viewableCache.projects[project._id];
			} 

			var viewable = project.models.filter(function(model){
				return model.permissions.length > 0;
			}).length > 0 || project.permissions.length > 0;

			vm.viewableCache.projects[project._id] = viewable;
			return viewable;

		};

		vm.hasProjectWithPermission = function(teamspace, permission) {
			return teamspace.projects.filter(function(project){
				return project.permissions.indexOf(permission) !== -1;
			}).length > 0;
		};

		/**
		 * Get the show/hide state of a data object
		 *
		 * @param {Object} node The object to set the state on (true or false)
		 * @param {String} prop The property to set (i.e. 'state')
		 * @returns {Boolean} The state of the property (to show or hide)
		 */
		var getState = function(node, prop, account) {

			// If it hasn't been defined before 
			// set it to false, unless its the owners account
			if (node[prop] === undefined) {

				var isCurrentTeamspace = account !== undefined 
					&& vm.account && account === vm.account;

				if (isCurrentTeamspace) {
					node[prop] = true;
				} else {
					node[prop] = false;
				}
			}
			return node[prop];
		};

		/**
		 * Check if a data object should be shown or hidden
		 *
		 * @param {Array} items The object to set the state on (true or false)
		 * @param {String} type The type of the data object (project, projects, model, federation etc)
		 * @returns {Boolean} The state of the property (to show or hide)
		 */
		vm.shouldShow = function(items, type, account) {

			switch (type) {
				// Special cases for models and federations
			case "models":
				return getState(items, "modelsState", account);
			case "federations":
				return getState(items, "fedsState", account);

				// All other cases
			default:
				return getState(items, "state", account);
			}
		};

		/**
		 * Invert the state of a teamspace (to show or hide)
		 * @param {Array} items The object to set the state on (true or false)
		 */
		vm.toggleTeamspace = function(teamspace) {
			teamspace.state = !teamspace.state;
		};

		/**
		 * Invert the state of a part of the default/unassigned tree 
		 * @param {String} type 
		 * @return {Boolean} if a part of the default tree should show or hide
		 */
		vm.toggleDefault = function(project, type) {
			vm.defaults[project][type] = !vm.defaults[project][type];
			return vm.defaults[project][type];
		};

		/**
		 * Invert the state of projects (to show or hide)
		 * @param {Array} project The object to set the state on (true or false)
		 */
		vm.toggleProjects = function(projects) {
			projects.state = !projects.state;
		};

		/**
		 * Invert the state of a project and sub projects (to show or hide)
		 * @param {Array} project The object to set the state on (true or false)
		 */
		vm.toggleProject = function(project) {
			project.state = !project.state;
			project.models.forEach(function(model) {
				model.modelState = !!project.state;
				model.fedState = !!project.state;
			});
		};

		/**
		 * Invert the models node
		 * @param {Object} project the project to invert the models for 
		 */
		vm.toggleModels = function(model) {
			model.modelsState = !model.modelsState;
		};

		/**
		 * Invert the federations node
		 * @param {Object} project the project to invert the federations for 
		 */
		vm.toggleFederations = function(project) {
			project.fedsState = !project.fedsState;
		};


		// Checks

		vm.hasFederations = function(models) { 
			return AccountService.hasFederations(models); 
		};

		vm.getFederations = function(models) { 
			return AccountService.getFederations(models); 
		};

		vm.getIndividualModels = function(models) {
			return AccountService.getIndividualModels(models); 
		};

		vm.getProjects = function(teamspace) { 
			return AccountService.getProjectsByTeamspaceName(vm.accounts, teamspace); 
		};

		// ADD PROJECTS/FEDERATIONS/MODELS
		vm.addButtonsToggle = function() {
			vm.addButtons = !vm.addButtons;
			vm.addButtonType = (vm.addButtonType === "add") ? "clear" : "add";	
		};

		// FEDERATIONS

		vm.isDuplicateName = function() {
			var teamspaceName = vm.federationData.teamspace;
			var projectName = vm.federationData.project;
			var fedName = vm.federationData.name;
			var duplicate = AccountService.isDuplicateFederation(vm.accounts, teamspaceName, projectName, fedName);
			if (duplicate) {
				vm.errorMessage = "Federation already with this name!";
			} else {
				vm.errorMessage = "";
			}
			return duplicate;
		};

		/**
		 * Save a federationt to a project
		 * @param {String} teamspaceName The name of the teamspace to save to
		 * @param {String} projectName The name of the project to save to
		 */
		vm.saveFederation = function (teamspaceName, projectName) {
			var promise;
			var project = AccountService.getProject(vm.accounts, teamspaceName, projectName);
			var isEdit = vm.federationData._isEdit;

			var currentFederation = vm.federationData.name;

			vm.federationsSaving[currentFederation] = true;
			
			if (isEdit) {
				delete vm.federationData._isEdit;
				promise = UtilsService.doPut(vm.federationData, teamspaceName + "/" + vm.federationData.model);
			} else {
				promise = UtilsService.doPost(vm.federationData, teamspaceName + "/" + vm.federationData.name);
			}
			
			promise
				.then(function (response) {
					
					if(response.status !== 200 && response.status !== 201){

						vm.errorMessage = response.data.message;

						$mdDialog.show(
							$mdDialog.alert()
								.clickOutsideToClose(true)
								.title("Federation Save Error")
								.textContent(vm.errorMessage)
								.ariaLabel("Federation Save Error")
								.ok("OK")
						);

					} else {

						vm.errorMessage = "";
						vm.showInfo = false;
						vm.federationData.teamspace = teamspaceName;
						vm.federationData.project = projectName;
						vm.federationData.federate = true;
						vm.federationData.permissions = response.data.permissions || vm.federationData.permissions;
						vm.federationData.model = response.data.model;
						if (response.data.timestamp) {
							vm.federationData.timestamp = response.data.timestamp;
						}

					
						// TODO: This should exist - backend problem : ISSUE_371
						if (!isEdit) {
							project.models.push(vm.federationData);
						}
						vm.resetViewableCache();
						
						vm.addButtons = false;
						vm.addButtonType = "add";

						AnalyticService.sendEvent({
							eventCategory: "Model",
							eventAction: (vm.federationData._isEdit) ? "edit" : "create",
							eventLabel: "federation"
						});
					}

					vm.federationsSaving[currentFederation] = false;

				})
				.catch(function(){
					vm.errorMessage = "Something went wrong on our servers saving the federation!"; 
					vm.federationsSaving[currentFederation] = false;
				});

			// Close the dialog
			vm.closeDialog();

			$timeout(function () {
				$scope.$apply();
			});
		};


		/**
		 * Get all default federations
		 *
		 * @param {Boolean} isDefault Is the federation a default federation
		 */
		vm.getPotentialFederationModels = function(isDefault) {
			var models;

			// isDefault is a string for some reason?
			if (typeof(isDefault) === "string") {
				isDefault = (isDefault === "true");
			}
			
			if (!isDefault) {

				models = AccountService.getIndividualModelsByProjectName(
					vm.accounts, 
					vm.federationData.teamspace, 
					vm.federationData.project
				);
			} else {
				models = AccountService.getIndividualTeamspaceModels(
					vm.accounts, 
					vm.federationData.teamspace
				);
			}
			
			var noneFederated = AccountService.getNoneFederatedModels(
				vm.federationData, 
				models
			);
			return noneFederated;
		};


		/**
		 * Remove a model from a federation
		 *
		 * @param modelName
		 */
		vm.removeFromFederation = function (modelId) {
			AccountService.removeFromFederation(vm.federationData, modelId);
		};


		/**
		 * Add a model to a federation
		 *
		 * @param modelIndex
		 */
		vm.addToFederation = function (modelIndex, teamspaceName, models) {

			vm.showRemoveWarning = false;

			vm.federationData.subModels.push({
				database: teamspaceName,
				modelIndex: modelIndex,
				model: models[modelIndex].model,
				name: models[modelIndex].name
			});

			models[modelIndex].federate = true;

		};

		// FEDERATIONS

		// Optimistic update


		/*
		 * Watch for change in edited federation
		 */
		// $scope.$watch("vm.federationData", function (oldVal, newVal) {
				
		// }, true);

		/**
		 * Open the federation dialog
		 *
		 * @param event
		 */
		vm.setupNewFederation = function (event) {

			vm.isDefaultFederation = false; 
			vm.federationOriginalData = null;
			vm.federationData = {
				desc: "",
				type: "",
				subModels: []
			};
			vm.errorMessage = "";
			UtilsService.showDialog("federation-dialog.html", $scope, event, true, null, false, vm.dialogCloseToId);
		};


		// MODELS

		$scope.$watch("vm.newModelData", function(newValue) {

			if (newValue) {

				var noOtherType = newValue.type === "Other" && !newValue.otherType;

				if (!newValue.unit || !newValue.name || noOtherType) {
					vm.newModelButtonDisabled = true;
				} else {
					vm.newModelButtonDisabled = false;
				}

				// Show other
				if (newValue.type) {
					vm.showModelTypeOtherInput = (newValue.type.toString() === "Other");
				}

			}

		}, true);

		/*
		 * Watch new model data
		 */
		$scope.$watch("vm.newModelData", function () {

			if(vm.newModelFileToUpload) {

				vm.showNewModelErrorMessage = false;
				vm.newModelErrorMessage = "";

				var names = vm.newModelFileToUpload.name.split(".");
				var find = names[names.length - 1].toLowerCase();
				var match = ClientConfigService.acceptedFormat.indexOf(find) === -1;

				if(names.length === 1){
					vm.showNewModelErrorMessage = true;
					vm.newModelErrorMessage = "Filename must have extension";
					vm.newModelFileToUpload = null;
				} else if(match) {
					vm.showNewModelErrorMessage = true;
					vm.newModelErrorMessage = "File format not supported";
					vm.newModelFileToUpload = null;
				}
			}

			if (vm.teamspaceAndProjectSelected() && !vm.newModelData.name) {
				vm.showNewModelErrorMessage = true;
				vm.newModelErrorMessage = "Model name isn't between 3-20 characters, or has invalid characters";
			} else {
				vm.showNewModelErrorMessage = false;
				vm.newModelErrorMessage = "";
			}



		}, true);

		/**
		 * Set up deleting of model
		 *
		 * @param {Object} event
		 * @param {Object} model
		 */
		vm.setupDeleteModel = function (event, model, account, project) {
			vm.modelToDelete = model;
			vm.projectToDeleteFrom = project;
			vm.deleteError = null;
			vm.deleteTitle = "Delete model";
			vm.deleteWarning = "Your data will be lost permanently and will not be recoverable";
			vm.deleteName = vm.modelToDelete.name;
			vm.targetAccountToDeleteModel = account;
			UtilsService.showDialog("delete-dialog.html", $scope, event, true);
		};

		/**
		 * Delete model
		 */
		vm.deleteModel = function () {

			var account;
			var url = vm.targetAccountToDeleteModel + "/" + encodeURIComponent(vm.modelToDelete.model);
			var promise = UtilsService.doDelete({}, url);

			promise.then(function (response) {

				if (response.status === 200) {
				
					// Remove model from list
					for (var i = 0; i < vm.accounts.length; i += 1) {
						account = vm.accounts[i];
						if (account.name === response.data.account) {
							if (vm.projectToDeleteFrom && vm.projectToDeleteFrom.name) {

								var projectToDeleteFrom = vm.projectToDeleteFrom.name;
								AccountService.removeModelByProjectName(
									vm.accounts, 
									account.name, 
									projectToDeleteFrom, 
									response.data.model
								);
								AccountService.removeFromFederationByProjectName(
									vm.accounts, 
									account.name, 
									projectToDeleteFrom, 
									response.data.model
								);
								break;

							} else {
								// If default
								for (var j = 0; j < vm.accounts[i].models.length; j += 1) { 
									if (account.models[j].name === response.data.model) {
										account.models.splice(j, 1);
										break;
									}
								}
							}
						}
					}

					vm.closeDialog();
					vm.addButtons = false;
					vm.addButtonType = "add";
					AnalyticService.sendEvent({
						eventCategory: "Model",
						eventAction: "delete"
					});
				} else {
					vm.deleteError = "Error deleting model";
					if (response.data.message) {
						vm.deleteError = "Error: " + response.data.message;
						console.error("Deleting model error: ", response);
					} 
				}
			});
		};

		vm.teamspaceAndProjectSelected = function() {
			return vm.newModelData && 
				vm.newModelData.project && 
				vm.newModelData.teamspace;
		};

		/**
		 * Bring up dialog to add a new model
		 */
		vm.newModel = function (event, accountForModel) {
			vm.tag = null;
			vm.desc = null;
			vm.showNewModelErrorMessage = false;
			vm.newModelFileToUpload = null;
			vm.newModelData = {
				name: "",
				account: accountForModel,
				type: vm.modelTypes[0]
			};
			vm.newModelFileToUpload = null;
			UtilsService.showDialog("model-dialog.html", $scope, event, true);
		};


		/**
		 * Save a new model
		 */
		vm.saveNewModel = function (event) {
			var enterKey = 13,
				doSave = false;

			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					doSave = true;
				}
			} else {
				doSave = true;
			}

			if (doSave) {
				
				if(RevisionsService.isTagFormatInValid(vm.tag)){
					vm.showNewModelErrorMessage = true;
					vm.newModelErrorMessage = "Invalid revision name";
					return;
				}
				
				if(!vm.newModelData.name){
					vm.showNewModelErrorMessage = true;
					vm.newModelErrorMessage = "Invalid model name";
					return;
				}

				vm.uploading = true;

				AccountUploadService.newModel(vm.newModelData)
					.then(function (response) {

						if (response.data.status === 400) {
							vm.showNewModelErrorMessage = true;
							vm.newModelErrorMessage = response.data.message;
						} else {
							vm.modelsExist = true;
							// Add model to list
							var model = {
								model: response.data.model,
								name: response.data.name,
								project : vm.newModelData.project,
								permissions: response.data.permissions,
								canUpload: true,
								timestamp: null
							};

							updateAccountModels(
								response.data.account,
								model, 
								vm.newModelData.project
							);
							vm.addButtons = false;
							vm.addButtonType = "add";
							vm.closeDialog();
							
							AnalyticService.sendEvent({
								eventCategory: "model",
								eventAction: "create"
							});
						}
						vm.uploading = false;
					})
					.catch(function(error){
						vm.showNewModelErrorMessage = true;
						vm.newModelErrorMessage = error.data.message;
						vm.uploading = false;
					});
			}
		};


		/**
		 * Upload a file
		 *
		 * @param {Object} model
		 */
		vm.uploadFile = function (model) {
			vm.existingModelFileUploader.value = "";
			vm.existingModelFileUploader.existingModelToUpload = model;
			vm.existingModelFileUploader.click();
		};


		/**
		 * Upload a file
		 */
		vm.uploadFileForNewModel = function () {
			vm.newModelFileUploader.value = "";
			vm.newModelFileUploader.click();
		};


		/**
		 * Show waiting before going to payment page
		 * $timeout required otherwise Submit does not work
		 */
		vm.setupPayment = function () {
			$timeout(function () {
				vm.showPaymentWait = true;
			});
		};


		/**
		 * Show a given page from a calling page
		 */
		vm.showPage = function (page, callingPage) {
			vm.onShowPage({page: page, callingPage: callingPage});
		};


		/**
		 * Add a model to an existing or create newly created account
		 *
		 * @param account
		 * @param model
		 */
		function updateAccountModels (account, model, projectName) {

			var i, length,
				accountToUpdate;
			
			var found = false;
			for (i = 0, length = vm.accounts.length; i < length; i += 1) {
				if (vm.accounts[i].name === account) {
					accountToUpdate = vm.accounts[i];
					// Check if the project exists and it if so
					accountToUpdate.projects.forEach(function(project){
						if (project.name === projectName ) {
			
							vm.resetViewableCache();
							
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
					models: [model]
				};
				accountToUpdate.canUpload = (account === vm.account);
				vm.accounts.push(accountToUpdate);
			}

			// Save model to model
			if (vm.newModelFileToUpload !== null) {

				AccountUploadService.uploadFileToModel({
					account: account, 
					model: model, 
					file: vm.newModelFileToUpload, 
					tag: vm.tag, 
					desc: vm.desc, 
					newModel: true
				}).then(function(){
					AnalyticService.sendEvent({
						eventCategory: "Model",
						eventAction: "upload"
					});
				});

			}
		}


		// PROJECT SPECIFIC CODE

		vm.projectData = {
			visible : function(project) {
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
					visible: function(project){
						if (project.permissions.indexOf("edit_project") !== -1) {
							return true;
						}
						return false;	
					}
				},
				delete: {
					label: "Delete", 
					icon: "delete",
					visible: function(project){
						if (project.permissions.indexOf("delete_project") !== -1) {
							return true;
						} 
						return false;
					}
				}
			}
		}; 


		/**
		 * Perform an option for a project
		 *
		 * @param {String} option The operation to perform
		 * @param {Object} project The project object
		 * @param {Object} teamspace The teamsapce object
		 */
		vm.doProjectOption = function(option, project, teamspace) {
			switch (option) {
			case "delete":
				var warn = "This will remove the project from your teamspace, " +
							"deleting all the models inside of it!";
				vm.projectData.deleteName = project.name;
				vm.projectData.deleteTeamspace = teamspace.name;
				vm.projectData.deleteWarning = warn;
				vm.projectData.errorMessage = "";
				UtilsService.showDialog("delete-project-dialog.html", $scope, null, true);	
				break;

			case "edit":
				vm.editProject(project, teamspace);
				break;
			}
		};


		/**
		 * Open dialog for a new project
		 */
		vm.newProject = function() {
			vm.projectData.teamspaceName = "";
			vm.projectData.newProjectName = "";
			vm.projectData.oldProjectName = "";
			vm.projectData.errorMessage = "";
			UtilsService.showDialog("project-dialog.html", $scope, null, true);
		};


		/**
		 * Open dialog to edit a project
		 * @param {Object} project The project object
		 * @param {Object} teamspace The teamsapce object
		 */
		vm.editProject = function(project, teamspace) {
			vm.projectData.oldProjectName = project.name;
			vm.projectData.teamspaceName = teamspace.name;
			vm.projectData.newProjectName = project.name;
			vm.projectData.errorMessage = "";
			UtilsService.showDialog("project-dialog.html", $scope, null, true);
		};


		/**
		 * Save a new project to a teamspace
		 * @param {String} teamspaceName The teamspace name to save to
		 * @param {String} projectName The project name to save to
		 */
		vm.saveNewProject = function(teamspaceName, projectName) {
			var url = teamspaceName + "/projects/";
			var promise = UtilsService.doPost({"name": projectName}, url);
			vm.handleProjectPromise(promise, teamspaceName, false);
		};


		/**
		 * Update a new project in a teamspac
		 * @param {String} teamspaceName The project name to update
		 * @param {String} oldProjectName The project name to update
		 * @param {String} newProjectName The project name to change to
		 */
		vm.updateProject = function(teamspaceName, oldProjectName, newProjectName) {
			var url = teamspaceName + "/projects/" + encodeURIComponent(oldProjectName);
			var promise = UtilsService.doPut({"name": newProjectName}, url);
			vm.handleProjectPromise(promise, teamspaceName, {
				edit  : true,
				newProjectName: newProjectName, 
				oldProjectName : oldProjectName
			});
		};


		/**
		 * Delete a project in a teamspace
		 * @param {String} teamspaceName The teamspace delete to save from
		 * @param {String} projectName The project name to delete 
		 */
		vm.deleteProject = function(teamspaceName, projectName) {
			var url = teamspaceName + "/projects/" + encodeURIComponent(projectName);
			var promise = UtilsService.doDelete({},url);
			vm.handleProjectPromise(promise, teamspaceName, {
				projectName : projectName,
				delete: true
			});
		};

		
		/**
		 * Handle the promise project 
		 * @param {Promise} promise The promise to handle
		 * @param {String} teamspaceName The project name to delete 
		 * @param {Object} update Object that holds flags to signal whether to update or delete
		 */
		vm.handleProjectPromise = function(promise, teamspaceName, update) {
			promise
				.then(function (response) {
					
					if(response.status !== 200 && response.status !== 201){
						vm.projectData.errorMessage = response.data.message;
					} else {

						var project = response.data;

						//TODO: This is a hack, why does the API not return the correct permissions?
						if (project.permissions.indexOf("edit_project") === -1)  {
							project.permissions.push("edit_project");
						}

						if (project.permissions.indexOf("delete_project") === -1) {
							project.permissions.push("delete_project");
						}
						
						if (update.edit) {
							AccountService.renameProjectInTeamspace(
								vm.accounts, 
								teamspaceName, 
								update.newProjectName, 
								update.oldProjectName
							);
						} else if (update.delete) {
							AccountService.removeProjectInTeamspace(
								vm.accounts, 
								teamspaceName, 
								update.projectName
							);
						} else {
							AccountService.addProjectToTeamspace(
								vm.accounts, 
								teamspaceName, 
								project
							);
						}

						vm.projectData.errorMessage = "";
						vm.resetViewableCache();
						vm.errorMessage = "";
						delete vm.newProjectTeamspace;
						delete vm.newProjectName;
						vm.addButtons = false;
						vm.addButtonType = "add";
						vm.closeDialog();
					}

				})
				.catch(function(error){
					vm.projectData.errorMessage = error.message;
				});

		};


		// ACCOUNTS

		/*
		 * Added data to accounts and models for UI
		 */
		$scope.$watch("vm.accounts", function () {
			if (angular.isDefined(vm.accounts)) {
				// Accounts
				for (var i = 0; i < vm.accounts.length; i++) {
					vm.accounts[i].name = vm.accounts[i].account;
					vm.accounts[i].canAddModel = vm.accounts[i].permissions.indexOf("teamspace_admin");
				}
			}
		});


	}
}());
