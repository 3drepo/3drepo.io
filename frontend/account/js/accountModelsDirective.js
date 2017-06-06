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


		var getState = function(node, prop) {
			if (node[prop] === undefined) {
				node[prop] = false;
			}

			return node[prop];
		}

		vm.shouldShowProjects = function(projects) {
			return getState(projects, "state");
		};

		vm.shouldShowModelsAndFeds = function(project) {
			return getState(project, "state");
		};

		vm.shouldShowModels = function(project) {
			return getState(project, "modelsState")
		};

		vm.shouldShowFeds = function(project) {
			return getState(project, "fedsState")
		};

		vm.shouldShowTeamspace = function(index) {
			return vm.accounts[index].showTeamspace;
		}

		vm.toggleTeamspace = function(index) {
			vm.accounts[index].showTeamspace = !vm.accounts[index].showTeamspace
		}

		vm.showDefault = {
			project : false,
			models : false,
			feds : false
		} 

		vm.toggleDefault = function(type) {
			vm.showDefault[type] = !vm.showDefault[type];
			return vm.showDefault[type];
		}

		vm.toggleProjects = function(projects) {
			projects.state = !projects.state;
			projects.forEach(function(project) {
				project.showProject = projects.state;
			});
		}

		vm.toggleProject = function(project) {
			project.state = !project.state;
			project.models.forEach(function(model) {
				model.modelState = project.state;
				model.fedState = project.state;
			});
		}

		vm.toggleModels = function(project) {
			project.modelsState = !project.modelsState;
		}

		vm.toggleFederations = function(project) {
			project.fedsState = !project.fedsState;
		}

		vm.hasFederations = function(models) {
			return vm.getFederations(models).length > 0;
		};

		vm.getFederations = function(models) { 
			return models.filter(function(model) { return model.subModels });
		}

		vm.getInividualModels = function(models) {
			return models.filter(function(model) { return !model.subModels });
		}

		vm.getProjects = function(teamspace) {
			var projects = AccountDataService.getProjectsByTeamspaceName(vm.accounts, teamspace);
			return projects;
		}

		vm.addButtons = false;
		vm.addButtonType = "add";

		vm.addButtonsToggle = function() {
			vm.addButtons = !vm.addButtons;
			vm.addButtonType = (vm.addButtonType === "add") ? "clear" : "add";	
		}

		vm.getPotentialFederationModels = function() {
			var models = AccountDataService.getInividualModels(vm.accounts, vm.federationData.teamspace, vm.federationData.project);
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
				database: teamspaceName,
				modelIndex: modelIndex,
				model: models[modelIndex].model
			});

			models[modelIndex].federate = true;

		};


		// new models
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


		// New federations

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

		// vm.showRemoveWarning = true;


		/*
		 * Added data to accounts and models for UI
		 */
		$scope.$watch("vm.accounts", function () {
			var i, length;

			if (angular.isDefined(vm.accounts)) {

				vm.showProgress = false;
				vm.modelsExist = (vm.accounts.length > 0);
				vm.info = vm.modelsExist ? "" : "There are currently no models";
				
				// Accounts
				for (i = 0, length = vm.accounts.length; i < length; i+= 1) {
					vm.accounts[i].name = vm.accounts[i].account;

					if (vm.accounts[i].projects) {

						// vm.accounts[i].projects.forEach(function(project){
						// 	project.showProject = false;
						// })
					}
					
					// Always show user account
					// Don't show account if it doesn't have any models - 
					// possible when user is a team member of a federation but not a member of a model in that federation!

					// Only show add model menu for user account
					vm.accounts[i].canAddModel = vm.accounts[i].isAdmin;

					if(vm.accounts[i].isAdmin){
						//console.log("Is admin")
						// NotificationService.subscribe.newModel(vm.accounts[i].account, function(data){
						// 	vm.newModelFileToUpload = null;
						// 	vm.modelsExist = true;
						// 	// Add model to list
						// 	var model = {
						// 		model: data.model,
						// 		permissions: data.permissions,
						// 		canUpload: true,
						// 		timestamp: null
						// 	};
						// 	//console.log("vm.watch - updateAccountModels");
						// 	updateAccountModels(data.account, model);
						// 	$scope.$apply();

						// });
					}
				}
			}
		});

		/*
		 * Watch the new model type
		 */
		// $scope.$watch("vm.newModelData.type", function (newValue) {
		// 	if (angular.isDefined(newValue)) {
		// 		vm.showModelTypeOtherInput = (newValue.toString() === "Other");
		// 	}
		// });

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

		/*
		 * Watch new database name
		 */
		// $scope.$watch("vm.newDatabaseName", function (newValue) {
		// 	if (angular.isDefined(newValue)) {
		// 		vm.newDatabaseButtonDisabled =
		// 			(angular.isUndefined(newValue) || (angular.isDefined(newValue) && (newValue.toString() === "")));
		// 	}
		// }, true);

		/**
		 * Remove a model from a federation
		 *
		 * @param index
		 */



		/*
		 * Watch for change in edited federation
		 */
		$scope.$watch("vm.federationData", function (oldVal, newVal) {

			// if (vm.federationOriginalData === null) {
			// 	vm.newFederationButtonDisabled = (angular.isUndefined(vm.federationData.model)) ||
			// 									 (vm.federationData.model === "" || !vm.federationData.unit);
			// }
			// else {
			// 	vm.newFederationButtonDisabled = angular.equals(vm.federationData, vm.federationOriginalData);
			// }
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
		 * Close the dialog
		 */
		vm.closeDialog = function() {
			UtilsService.closeDialog();
		};


		/**
		 * Save a federation
		 */
		vm.saveFederation = function (teamspaceName, projectName) {
			var promise;
			var project = AccountDataService.getProject(vm.accounts, teamspaceName, projectName);
			var isEdit = vm.federationData._isEdit

			if (isEdit) {
				delete vm.federationData._isEdit;
				promise = UtilsService.doPut(vm.federationData, teamspaceName + "/" + vm.federationData.model);
			} else {
				promise = UtilsService.doPost(vm.federationData, teamspaceName + "/" + vm.federationData.model);
			}
			
			promise.then(function (response) {
				
				if(response.status !== 200 && response.status !== 201){
					vm.errorMessage = response.data.message;
				} else {
					vm.errorMessage = '';
					vm.showInfo = false;
					vm.federationData.teamspace = teamspaceName;
					vm.federationData.project = projectName;
					vm.federationData.federate = true;
					vm.federationData.timestamp = (new Date()).toString();
					vm.federationData.permissions = response.data.permissions || vm.federationData.permissions;
					//vm.federationData.federationOptions = getFederationOptions(vm.federationData, teamspaceName);

					// TODO: This should exist - backend problem : ISSUE_371
					if (!isEdit) {
						project.models.push(vm.federationData);
					}
		
					vm.closeDialog();

					AnalyticService.sendEvent({
						eventCategory: 'Model',
						eventAction: (vm.federationData._isEdit) ? 'edit' : 'create',
						eventLabel: 'federation'
					});
				}

			});

			$timeout(function () {
				$scope.$apply();
			});
		};

		/**
		 * Reset federation data back to empty object
		 */
		vm.resetFederationData = function() {
			vm.federationData = {};
		}


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

				console.log("Project: ", vm.newModelData.project);

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
					//console.log(response);
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
						//console.log("saveNewModel - updateAccountModels")
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
			console.log(model);
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
		 * Create a new database
		 */
		vm.newDatabase = function (event) {
			vm.newDatabaseName = "";
			vm.showPaymentWait = false;
			vm.newDatabaseToken = false;
			UtilsService.showDialog("databaseDialog.html", $scope, event, true);
		};

		/**
		 * Save a new database
		 */
		vm.saveNewDatabase = function () {
			var promise = AccountService.newDatabase(vm.account, vm.newDatabaseName);
			promise.then(function (response) {
				vm.newDatabaseToken = response.data.token;
				vm.paypalReturnUrl = $location.protocol() + "://" + $location.host() + "/" + vm.account;
			});
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
		 * Set up deleting of model
		 *
		 * @param {Object} event
		 * @param {Object} model
		 */
		vm.setupDeleteModel = function (event, model, account, project) {
			console.log("setupDeleteModel,", project )
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
		vm.delete = function () {

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
											console.log("Deleting", vm.projectToDeleteFrom)
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
			console.log("updateAccountModels", account, model)

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
				console.log("updateAccountModels - isUndefined")
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
	}
}());
