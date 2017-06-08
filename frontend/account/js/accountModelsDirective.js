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
		.directive("accountModels", accountModels);

	function accountModels() {
		return {
			restrict: 'EA',
			templateUrl: 'accountModels.html',
			scope: {
				account: "=",	
				accounts: "=",
				onShowPage: "&",
				quota: "=",
				subscriptions: "="
			},
			controller: AccountModelsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountModelsCtrl.$inject = ["$scope", "$location", "$element", "$timeout", "AccountService", "UtilsService", "RevisionsService", "serverConfig", "AnalyticService", "NotificationService",  "Auth", "AccountDataService"];

	function AccountModelsCtrl($scope, $location, $element, $timeout, AccountService, UtilsService, RevisionsService, serverConfig, AnalyticService, NotificationService, Auth, AccountDataService) {
		var vm = this,
			existingModelToUpload,
			existingModelFileUploader,
			newModelFileUploader;

		/*
		 * Init
		 */
		vm.info = "Retrieving models...";
		vm.showProgress = true;
		vm.modelTypes = ["Architectural", "Structural", "Mechanical", "GIS", "Other"];
		vm.units = serverConfig.units;
		vm.modelRegExp = serverConfig.modelNameRegExp;
		// Setup file uploaders
		existingModelFileUploader = $element[0].querySelector("#existingModelFileUploader");
		existingModelFileUploader.addEventListener(
			"change",
			function () {
				vm.modelToUpload = this.files[0];
				//vm.uploadedFile = {model: existingModelToUpload, file: this.files[0]};
				$scope.$apply();
			},
			false
		);
		newModelFileUploader = $element[0].querySelector("#newModelFileUploader");
		newModelFileUploader.addEventListener(
			"change",
			function () {
				vm.newModelFileToUpload = this.files[0];

				$scope.$apply();
			},
			false
		);

		// GENERIC FUNCTIONS

		/**
		 * Close the dialog
		 */
		vm.closeDialog = function() {
			UtilsService.closeDialog();
		};

		
		// HIDE / SHOW STATE

		vm.showDefault = {
			project : false,
			models : false,
			feds : false
		} 

		var getState = function(node, prop) {
			if (node[prop] === undefined) node[prop] = false;
			return node[prop];
		}

		vm.shouldShow = function(items, type) {
			switch (type) {
				// Special cases for models and federations
				case "models":
					return getState(items, "modelsState");
				case "federations":
					return getState(items, "fedsState")

				// All other cases
				default:
					return getState(items, "state")
			}
		}

		vm.toggleTeamspace = function(teamspace) {
			teamspace.state = !teamspace.state;
		}

		vm.toggleDefault = function(type) {
			vm.showDefault[type] = !vm.showDefault[type];
			return vm.showDefault[type];
		}

		vm.toggleProjects = function(projects) {
			projects.state = !projects.state;
		}

		vm.toggleProject = function(project) {
			project.state = !project.state;
			project.models.forEach(function(model) {
				model.modelState = !!project.state;
				model.fedState = !!project.state;
			});
		}

		vm.toggleModels = function(project) {
			project.modelsState = !project.modelsState;
		}

		vm.toggleFederations = function(project) {
			project.fedsState = !project.fedsState;
		}


		// Checks

		vm.hasFederations = function(models) { 
			return AccountDataService.hasFederations(models) 
		};

		vm.getFederations = function(models) { 
			return AccountDataService.getIndividualModels(models); 
		}

		vm.getIndividualModels = function(models) { 
			return AccountDataService.getIndividualModels(models); 
		}

		vm.getProjects = function(teamspace) { 
			return AccountDataService.getProjectsByTeamspaceName(vm.accounts, teamspace); 
		}

		// ADD PROJECTS/FEDERATIONS/MODELS

		vm.addButtons = false;
		vm.addButtonType = "add";

		vm.addButtonsToggle = function() {
			vm.addButtons = !vm.addButtons;
			vm.addButtonType = (vm.addButtonType === "add") ? "clear" : "add";	
		}

		// FEDERATIONS

		vm.getPotentialFederationModels = function() {
			var models = AccountDataService.getIndividualModels(vm.accounts, vm.federationData.teamspace, vm.federationData.project);
			return AccountDataService.getNoneFederatedModels(vm.federationData, models)
		}


		vm.removeFromFederation = function (modelName) {
			AccountDataService.removeFromFederation(vm.federationData, modelName);
		};

		/**
		 * Add a model to a federation
		 *
		 * @param modelIndex
		 */
		vm.addToFederation = function (modelIndex, teamspaceName, models) {

			vm.showRemoveWarning = false;

			vm.federationData.subModels.push({
				teamspace: teamspaceName,
				modelIndex: modelIndex,
				model: models[modelIndex].model
			});

			models[modelIndex].federate = true;

		};

		// FEDERATIONS

		vm.dialogCloseTo = "accountFederationsOptionsMenu_" + vm.account;
		var dialogCloseToId = "#" + vm.dialogCloseTo;
		vm.fedTeamspaceAndProjectSelected = false;
		
		$scope.$watch("vm.federationData.teamspace", function (newValue) {
			if (newValue && vm.federationData.project) {
				vm.fedTeamspaceAndProjectSelected = true;
			} else {
				vm.fedTeamspaceAndProjectSelected = false;
			}
		});

		$scope.$watch("vm.federationData.project", function (newValue) {
			if (newValue && vm.federationData.teamspace) {
				vm.fedTeamspaceAndProjectSelected = true;
			} else {
				vm.fedTeamspaceAndProjectSelected = false;
			}
		});

		/*
		 * Watch for change in edited federation
		 */
		$scope.$watch("vm.federationData", function (oldVal, newVal) {

		}, true);

		/**
		 * Open the federation dialog
		 *
		 * @param event
		 */
		vm.setupNewFederation = function (event, accounts) {

			vm.federationOriginalData = null;
			vm.federationData = {
				desc: "",
				type: "",
				subModels: []
			};
			vm.errorMessage = '';
			UtilsService.showDialog("federationDialog.html", $scope, event, true, null, false, dialogCloseToId);
		};


		// MODELS

		/*
		 * Watch the new model type
		 */
		$scope.$watch("vm.newModelData.type", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.showModelTypeOtherInput = (newValue.toString() === "Other");
			}
		});

		/*
		 * Watch new model data
		 */
		$scope.$watch('{a : vm.newModelData, b: vm.newModelFileToUpload.name}', function (data){

			var newValue = vm.newModelData;

			if (angular.isDefined(newValue)) {
				vm.newModelButtonDisabled =
					(angular.isUndefined(newValue.name) || (angular.isDefined(newValue.name) && (newValue.name === "")));
				
				if (!vm.newModelButtonDisabled && (newValue.type === "Other")) {
					vm.newModelButtonDisabled =
						(angular.isUndefined(newValue.otherType) || (angular.isDefined(newValue.otherType) && (newValue.otherType === "")));
				}

				if(!newValue.unit){
					vm.newModelButtonDisabled = true;
				}
			}


			if(vm.newModelFileToUpload){
				var names = vm.newModelFileToUpload.name.split('.');

				vm.showNewModelErrorMessage = false;
				vm.newModelErrorMessage = '';
				if(names.length === 1){
					vm.showNewModelErrorMessage = true;
					vm.newModelErrorMessage = 'Filename must have extension';
					vm.newModelFileToUpload = null;
				} else if(serverConfig.acceptedFormat.indexOf(names[names.length - 1].toLowerCase()) === -1) {
					vm.showNewModelErrorMessage = true;
					vm.newModelErrorMessage = 'File format not supported';
					vm.newModelFileToUpload = null
				}
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
			UtilsService.showDialog("deleteDialog.html", $scope, event, true);
		};

		/**
		 * Delete model
		 */
		vm.deleteModel = function () {

			var i, iLength, j, jLength,
				promise;
			promise = UtilsService.doDelete({}, vm.targetAccountToDeleteModel + "/" + vm.modelToDelete.name);
			promise.then(function (response) {
				if (response.status === 200) {

					// Remove model from list
					for (i = 0, iLength = vm.accounts.length; i < iLength; i += 1) {
				
						if (vm.accounts[i].name === response.data.account) {
							if (vm.projectToDeleteFrom) {
								// If we have a project
								vm.accounts[i].projects.forEach(function(project) {
									if (project === vm.projectToDeleteFrom) {
										project.models.forEach(function(model, i) {
											project.models.splice(i, 1);
										})
									}
								});

							} else {
								// If default
								for (j = 0, jLength = vm.accounts[i].models.length; j < jLength; j += 1) {
									if (vm.accounts[i].models[j].name === response.data.model) {
										vm.accounts[i].models.splice(j, 1);
										break;
									}
								}
							}
						
						}
					}
					$scope.$applyN
					vm.closeDialog();

					AnalyticService.sendEvent({
						eventCategory: 'Model',
						eventAction: 'delete'
					});
				}
				else {
					vm.deleteError = "Error deleting model";
					if (response.status === 404) vm.deleteError += " : File not found"
					if (response.status === 500) vm.deleteError += " : There was a problem on the server"
				}
			});
		};


		vm.teamspaceAndProjectSelected = false;

		$scope.$watch("vm.newModelData.teamspace", function (newValue) {
			if (newValue && vm.newModelData.project) {
				vm.teamspaceAndProjectSelected = true;
			} else {
				vm.teamspaceAndProjectSelected = false;
			}
		});

		$scope.$watch("vm.newModelData.project", function (newValue) {
			if (newValue && vm.newModelData.teamspace) {
				vm.teamspaceAndProjectSelected = true;
			} else {
				vm.teamspaceAndProjectSelected = false;
			}
		});

		/**
		 * Bring up dialog to add a new model
		 */
		vm.newModel = function (event, accountForModel) {
			vm.tag = null;
			vm.desc = null;
			vm.showNewModelErrorMessage = false;
			vm.newModelFileToUpload = null;
			vm.newModelData = {
				account: accountForModel,
				type: vm.modelTypes[0]
			};
			vm.newModelFileToUpload = null;
			UtilsService.showDialog("modelDialog.html", $scope, event, true);
		};

		/**
		 * Save a new model
		 */
		vm.saveNewModel = function (event) {
			var model,
				promise,
				enterKey = 13,
				doSave = false;

			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					doSave = true;
				}
			}
			else {
				doSave = true;
			}

			if (doSave) {


				if(RevisionsService.isTagFormatInValid(vm.tag)){
					vm.showNewModelErrorMessage = true;
					vm.newModelErrorMessage = 'Invalid revision name';
					return;
				}
				
				if(!vm.newModelData.name){
					vm.showNewModelErrorMessage = true;
					vm.newModelErrorMessage = 'Invalid model name';
					return;
				}

				promise = AccountService.newModel(vm.newModelData);
				promise.then(function (response) {
					if (response.data.status === 400) {
						vm.showNewModelErrorMessage = true;
						vm.newModelErrorMessage = response.data.message;
					}
					else {
						vm.modelsExist = true;
						// Add model to list
						model = {
							model: response.data.model,
							project : vm.newModelData.project,
							permissions: response.data.permissions,
							canUpload: true,
							timestamp: null
						};

						updateAccountModels(response.data.account, model, vm.newModelData.project);
						vm.closeDialog();

						AnalyticService.sendEvent({
							eventCategory: 'model',
							eventAction: 'create'
						});
					}
				});
			}
		};

		/**
		 * Upload a file
		 *
		 * @param {Object} model
		 */
		vm.uploadFile = function (model) {
			existingModelFileUploader.value = "";
			existingModelToUpload = model;
			existingModelFileUploader.click();
		};

		/**
		 * Upload a file
		 */
		vm.uploadFileForNewModel = function () {
			newModelFileUploader.value = "";
			newModelFileUploader.click();
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
		 * Remove a collaborator
		 *
		 * @param collaborator
		 */
		vm.removeCollaborator = function (collaborator) {
			delete vm.collaborators[collaborator];
		};

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
							project.models.push(model)
							found = true;
						} 
					})
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
				accountToUpdate.canUpload = (account === vm.account);
				vm.accounts.push(accountToUpdate);
			}

			// Save model to model
			if (vm.newModelFileToUpload !== null) {
				$timeout(function () {
					vm.uploadedFile = {account: account, model: model, file: vm.newModelFileToUpload, tag: vm.tag, desc: vm.desc, newModel: true};
				});
			}
		}

		// PROJECT SPECIFIC CODE

		vm.projectData = {
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
				},
				delete: {
					label: "Delete", 
					icon: "delete", 
				},
			}
		} 

		vm.doProjectOption = function(option, project, teamspace) {
			switch (option) {
				case "delete":
					vm.projectData.deleteName = project.name;
					vm.projectData.deleteTeamspace = teamspace.name;
					vm.projectData.deleteWarning = "This will remove the project from your teamspace!";
					UtilsService.showDialog("deleteProjectDialog.html", $scope, event, true);	
					break;

				case "edit":
					vm.editProject(project, teamspace);
					break;
			}
		}

		vm.newProject = function() {
			vm.projectData.teamspaceName = "";
			vm.projectData.newProjectName = "";
			vm.projectData.oldProjectName = "";
			vm.projectData.errorMessage = '';
			UtilsService.showDialog("projectDialog.html", $scope, event, true);
		}

		vm.editProject = function(project, teamspace) {
			vm.projectData.oldProjectName = project.name;
			vm.projectData.teamspaceName = teamspace.name;
			vm.projectData.newProjectName = project.name;
			vm.projectData.errorMessage = '';
			UtilsService.showDialog("projectDialog.html", $scope, event, true);
		}

		vm.saveNewProject = function(teamspaceName, projectName) {
			var promise = UtilsService.doPost({"name": projectName}, teamspaceName + "/projects/");
			vm.handleProjectPromise(promise, teamspaceName, false);
		}

		vm.updateProject = function(teamspaceName, oldProjectName, newProjectName) {
			var promise = UtilsService.doPut({"name": newProjectName}, teamspaceName + "/projects/" + oldProjectName);
			vm.handleProjectPromise(promise, teamspaceName, {
				edit  : true,
				newProjectName: newProjectName, 
				oldProjectName : oldProjectName
			});
		}

		vm.deleteProject = function(teamspaceName, projectName) {
			var promise = UtilsService.doDelete({}, teamspaceName + "/projects/" + projectName);
			vm.handleProjectPromise(promise, teamspaceName, {
				projectName : projectName,
				delete: true
			});
		}

		vm.handleProjectPromise = function(promise, teamspaceName, update) {
			promise.then(function (response) {
				
				if(response.status !== 200 && response.status !== 201){
					vm.projectData.errorMessage = response.data.message;
				} else {

					var project = response.data;
					
					if (update.edit) {
						AccountDataService.renameProjectInTeamspace(
							vm.accounts, 
							teamspaceName, 
							update.newProjectName, 
							update.oldProjectName
						);
					} else if (update.delete) {
						AccountDataService.removeProjectInTeamspace(
							vm.accounts, 
							teamspaceName, 
							update.projectName, 
						);
					} else {
						AccountDataService.addProjectToTeamspace(
							vm.accounts, 
							teamspaceName, 
							project
						);
					}

					vm.errorMessage = '';
					delete vm.newProjectTeamspace;
					delete vm.newProjectName;
					vm.closeDialog();
				}

			});

		}


		// ACCOUNTS

		vm.addEscape = function(event){
			$element.bind('keydown keypress', function (event) {
				if(event.which === 27) { // 27 = esc key
					vm.addButtons = false;
					$scope.$apply();
					event.preventDefault();
				}
			});
		}

		/*
		 * Added data to accounts and models for UI
		 */
		$scope.$watch("vm.accounts", function () {
			var i, length;

			if (angular.isDefined(vm.accounts)) {

				//vm.showProgress = false;
				//vm.modelsExist = (vm.accounts.length > 0);
				//vm.info = vm.modelsExist ? "" : "There are currently no models";
				
				// Accounts
				for (i = 0, length = vm.accounts.length; i < length; i+= 1) {
					vm.accounts[i].name = vm.accounts[i].account;
					vm.accounts[i].canAddModel = vm.accounts[i].isAdmin;
				}
			}
		});


	}
}());
