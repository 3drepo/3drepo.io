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

		AccountModelsCtrl.$inject = ["$scope", "$location", "$element", "$timeout", "AccountService", "UtilsService", "RevisionsService", "serverConfig", "AnalyticService", "NotificationService"];

		function AccountModelsCtrl($scope, $location, $element, $timeout, AccountService, UtilsService, RevisionsService, serverConfig, AnalyticService, NotificationService) {
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

			/*
			* Added data to accounts and models for UI
			*/
			$scope.$watch("vm.accounts", function () {
				var i, length;
				
				if (angular.isDefined(vm.accounts)) {
					//console.log('vm.accounts', vm.accounts);
					vm.showProgress = false;
					vm.modelsExist = (vm.accounts.length > 0);
					vm.info = vm.modelsExist ? "" : "There are currently no models";
					// Accounts
					for (i = 0, length = vm.accounts.length; i < length; i+= 1) {
						vm.accounts[i].name = vm.accounts[i].account;
						vm.accounts[i].showModels = true;
						vm.accounts[i].showModelsIcon = "folder_open";
						// Always show user account
						// Don't show account if it doesn't have any models - possible when user is a team member of a federation but not a member of a model in that federation!
						vm.accounts[i].showAccount = ((i === 0) || (vm.accounts[i].models.length !== 0));
						// Only show add model menu for user account
						vm.accounts[i].canAddModel = vm.accounts[i].isAdmin;

						if(vm.accounts[i].isAdmin){
							NotificationService.subscribe.newProject(vm.accounts[i].account, function(data){
								vm.newModelFileToUpload = null;
								vm.modelsExist = true;
								// Add model to list
								var model = {
									model: data.model,
									permissions: data.permissions,
									canUpload: true,
									timestamp: null
								};
								updateAccountModels(data.account, model);
								$scope.$apply();

							});
						}
					}
				}
			});

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

			/*
			* Watch new database name
			*/
			$scope.$watch("vm.newDatabaseName", function (newValue) {
				if (angular.isDefined(newValue)) {
					vm.newDatabaseButtonDisabled =
						(angular.isUndefined(newValue) || (angular.isDefined(newValue) && (newValue.toString() === "")));
				}
			}, true);

			/**
			 * Toggle display of models for an account
			 *
			 * @param {Number} index
			 */
			vm.toggleModelsList = function (index) {
				vm.accounts[index].showModels = !vm.accounts[index].showModels;
				vm.accounts[index].showModelsIcon = vm.accounts[index].showModels ? "folder_open" : "folder";
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
						console.log(response);
						if (response.data.status === 400) {
							vm.showNewModelErrorMessage = true;
							vm.newModelErrorMessage = response.data.message;
						}
						else {
							vm.modelsExist = true;
							// Add model to list
							model = {
								model: response.data.model,
								permissions: response.data.permissions,
								canUpload: true,
								timestamp: null
							};
							updateAccountModels(response.data.account, model);
							vm.closeDialog();

							AnalyticService.sendEvent({
								eventCategory: 'Model',
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
					console.log(response);
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
			vm.setupDeleteModel = function (event, model, account) {
				vm.modelToDelete = model;
				vm.deleteError = null;
				vm.deleteTitle = "Delete Model";
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
								for (j = 0, jLength = vm.accounts[i].models.length; j < jLength; j += 1) {
									if (vm.accounts[i].models[j].name === response.data.model) {
										vm.accounts[i].models.splice(j, 1);
										break;
									}
								}
							}
						}
						vm.closeDialog();

						AnalyticService.sendEvent({
							eventCategory: 'Model',
							eventAction: 'delete'
						});
					}
					else {
						vm.deleteError = "Error deleting model";
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
			function updateAccountModels (account, model) {
				var i, length,
					accountToUpdate;

				for (i = 0, length = vm.accounts.length; i < length; i += 1) {
					if (vm.accounts[i].name === account) {
						accountToUpdate = vm.accounts[i];
						accountToUpdate.models.push(model);
						break;
					}
				}
				if (angular.isUndefined(accountToUpdate)) {
					accountToUpdate = {
						name: account,
						models: [model],
						showModels: true,
						showModelsIcon: "folder_open"
					};
					accountToUpdate.canUpload = (account === vm.account);
					vm.accounts.push(accountToUpdate);
				}

				console.log('vmaccounts', vm.accounts);
				// Save model to model
				if (vm.newModelFileToUpload !== null) {
					$timeout(function () {
						vm.uploadedFile = {account: account, model: model, file: vm.newModelFileToUpload, tag: vm.tag, desc: vm.desc, newModel: true};
					});
				}
			}
		}
	}());
