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
		.directive("accountProjects", accountProjects);

	function accountProjects() {
		return {
			restrict: 'EA',
			templateUrl: 'accountProjects.html',
			scope: {
				account: "=",
				accounts: "=",
				onShowPage: "&",
				quota: "=",
				subscriptions: "="
			},
			controller: AccountProjectsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountProjectsCtrl.$inject = ["$scope", "$location", "$element", "$timeout", "AccountService", "UtilsService"];

	function AccountProjectsCtrl($scope, $location, $element, $timeout, AccountService, UtilsService) {
		var vm = this,
			existingProjectToUpload,
			existingProjectFileUploader,
			newProjectFileUploader;

		/*
		 * Init
		 */
		vm.info = "Retrieving projects...";
		vm.showProgress = true;
		vm.projectTypes = ["Architectural", "Structural", "Mechanical", "GIS", "Other"];

		// Setup file uploaders
		existingProjectFileUploader = $element[0].querySelector("#existingProjectFileUploader");
		existingProjectFileUploader.addEventListener(
			"change",
			function () {
				vm.uploadedFile = {project: existingProjectToUpload, file: this.files[0]};
				$scope.$apply();
			},
			false
		);
		newProjectFileUploader = $element[0].querySelector("#newProjectFileUploader");
		newProjectFileUploader.addEventListener(
			"change",
			function () {
				vm.newProjectFileToUpload = this.files[0];
				vm.newProjectFileSelected = true;
				$scope.$apply();
			},
			false
		);

		/*
		 * Added data to accounts and projects for UI
		 */
		$scope.$watch("vm.accounts", function () {
			var i, length;
			
			if (angular.isDefined(vm.accounts)) {
				console.log(vm.accounts);
				vm.showProgress = false;
				vm.projectsExist = (vm.accounts.length > 0);
				vm.info = vm.projectsExist ? "" : "There are currently no projects";
				// Accounts
				for (i = 0, length = vm.accounts.length; i < length; i+= 1) {
					vm.accounts[i].name = vm.accounts[i].account;
					vm.accounts[i].showProjects = true;
					vm.accounts[i].showProjectsIcon = "folder_open";
				}
			}
		});

		/*
		 * Watch the new project type
		 */
		$scope.$watch("vm.newProjectData.type", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.showProjectTypeOtherInput = (newValue.toString() === "Other");
			}
		});

		/*
		 * Watch new project data
		 */
		$scope.$watch("vm.newProjectData", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.newProjectButtonDisabled =
					(angular.isUndefined(newValue.name) || (angular.isDefined(newValue.name) && (newValue.name === "")));
				
				if (!vm.newProjectButtonDisabled && (newValue.type === "Other")) {
					vm.newProjectButtonDisabled =
						(angular.isUndefined(newValue.otherType) || (angular.isDefined(newValue.otherType) && (newValue.otherType === "")));
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
		 * Toggle display of projects for an account
		 *
		 * @param {Number} index
		 */
		vm.toggleProjectsList = function (index) {
			vm.accounts[index].showProjects = !vm.accounts[index].showProjects;
			vm.accounts[index].showProjectsIcon = vm.accounts[index].showProjects ? "folder_open" : "folder";
		};

		/**
		 * Bring up dialog to add a new project
		 */
		vm.newProject = function (event) {
			vm.showNewProjectErrorMessage = false;
			vm.newProjectFileSelected = false;
			vm.newProjectData = {
				account: vm.account,
				type: vm.projectTypes[0]
			};
			vm.newProjectFileToUpload = null;
			UtilsService.showDialog("projectDialog.html", $scope, event, true);
		};
		
		/**
		 * Close the dialog
		 */
		vm.closeDialog = function() {
			UtilsService.closeDialog();
		};

		/**
		 * Save a new project
		 */
		vm.saveNewProject = function (event) {
			var project,
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
				promise = AccountService.newProject(vm.newProjectData);
				promise.then(function (response) {
					console.log(response);
					if (response.data.status === 400) {
						vm.showNewProjectErrorMessage = true;
						vm.newProjectErrorMessage = response.data.message;
					}
					else {
						vm.projectsExist = true;
						// Add project to list
						project = {
							project: response.data.project,
							canUpload: true,
							timestamp: null
						};
						updateAccountProjects (response.data.account, project);
						vm.closeDialog();
					}
				});
			}
		};

		/**
		 * Upload a file
		 *
		 * @param {Object} project
		 */
		vm.uploadFile = function (project) {
			console.log(project);
			existingProjectFileUploader.value = "";
			existingProjectToUpload = project;
			existingProjectFileUploader.click();
		};

		/**
		 * Upload a file
		 */
		vm.uploadFileForNewProject = function () {
			newProjectFileUploader.value = "";
			newProjectFileUploader.click();
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
		 * Set up deleting of project
		 *
		 * @param {Object} event
		 * @param {Object} project
		 */
		vm.setupDeleteProject = function (event, project) {
			vm.projectToDelete = project;
			vm.deleteError = null;
			vm.deleteTitle = "Delete Project";
			vm.deleteWarning = "Your data will be lost permanently and will not be recoverable";
			vm.deleteName = vm.projectToDelete.name;
			UtilsService.showDialog("deleteDialog.html", $scope, event, true);
		};

		/**
		 * Delete project
		 */
		vm.delete = function () {
			var i, iLength, j, jLength,
				promise;
			promise = UtilsService.doDelete({}, vm.account + "/" + vm.projectToDelete.name);
			promise.then(function (response) {
				if (response.status === 200) {
					// Remove project from list
					for (i = 0, iLength = vm.accounts.length; i < iLength; i += 1) {
						if (vm.accounts[i].name === response.data.account) {
							for (j = 0, jLength = vm.accounts[i].projects.length; j < jLength; j += 1) {
								if (vm.accounts[i].projects[j].name === response.data.project) {
									vm.accounts[i].projects.splice(j, 1);
									break;
								}
							}
						}
					}
					vm.closeDialog();
				}
				else {
					vm.deleteError = "Error deleting project";
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
		 * Add a project to an existing or create newly created account
		 *
		 * @param account
		 * @param project
		 */
		function updateAccountProjects (account, project) {
			var i, length,
				accountToUpdate;

			for (i = 0, length = vm.accounts.length; i < length; i += 1) {
				if (vm.accounts[i].name === account) {
					accountToUpdate = vm.accounts[i];
					accountToUpdate.projects.push(project);
					break;
				}
			}
			if (angular.isUndefined(accountToUpdate)) {
				accountToUpdate = {
					name: account,
					projects: [project],
					showProjects: true,
					showProjectsIcon: "folder_open"
				};
				accountToUpdate.canUpload = (account === vm.account);
				vm.accounts.push(accountToUpdate);
			}

			// Save model to project
			if (vm.newProjectFileToUpload !== null) {
				$timeout(function () {
					vm.uploadedFile = {project: project, file: vm.newProjectFileToUpload};
				});
			}
		}
	}
}());
