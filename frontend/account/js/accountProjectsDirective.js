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
				accounts: "="
			},
			controller: AccountProjectsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountProjectsCtrl.$inject = ["$scope", "$location", "$mdDialog", "$element", "$timeout", "$interval", "AccountService", "UtilsService"];

	function AccountProjectsCtrl($scope, $location, $mdDialog, $element, $timeout, $interval, AccountService, UtilsService) {
		var vm = this,
			promise,
			bid4FreeProjects = null,
			existingProjectToUpload,
			existingProjectFileUploader,
			newProjectFileUploader;

		/*
		 * Init
		 */
		vm.bif4FreeEnabled = false;
		vm.projectTypes = [
			"Architectural",
			"Structural",
			"Mechanical",
			"GIS",
			"Other"
		];
		vm.info = "Retrieving projects..,";
		vm.showProgress = true;

		// Setup file uploaders
		existingProjectFileUploader = $element[0].querySelector("#existingProjectFileUploader");
		existingProjectFileUploader.addEventListener(
			"change",
			function () {
				vm.uploadedFile = this.files[0];
				uploadModelToProject(existingProjectToUpload, this.files[0]);
			},
			false
		);
		newProjectFileUploader = $element[0].querySelector("#newProjectFileUploader");
		newProjectFileUploader.addEventListener(
			"change",
			function () {
				vm.uploadedFile = this.files[0];
				vm.newProjectFileSelected = true;
				$scope.$apply();
			},
			false
		);

		promise = AccountService.getProjectsBid4FreeStatus(vm.account);
		promise.then(function (data) {
			if (data.data.length > 0) {
				bid4FreeProjects = [];
				angular.forEach(data.data, function (value) {
					if (bid4FreeProjects.indexOf(value.project) === -1) {
						bid4FreeProjects.push(value.project);
					}
				});
				setupBid4FreeAccess();
			}
		});

		/*
		 * Added data to accounts and projects for UI
		 */
		$scope.$watch("vm.accounts", function () {
			var i, j, iLength, jLength;
			
			if (angular.isDefined(vm.accounts)) {
				console.log(vm.accounts);
				vm.showProgress = false;
				vm.projectsExist = (vm.accounts.length > 0);
				vm.info = vm.projectsExist ? "" : "There are currently no projects";
				for (i = 0, iLength = vm.accounts.length; i < iLength; i+= 1) {
					vm.accounts[i].name = vm.accounts[i].account;
					vm.accounts[i].showProjects = true;
					vm.accounts[i].showProjectsIcon = "folder_open";
					for (j = 0, jLength = vm.accounts[i].projects.length; j < jLength; j += 1) {
						vm.accounts[i].projects[j].name = vm.accounts[i].projects[j].project;
						if (vm.accounts[i].projects[j].timestamp !== null) {
							vm.accounts[i].projects[j].timestamp = UtilsService.formatTimestamp(vm.accounts[i].projects[j].timestamp, true);
						}
						vm.accounts[i].projects[j].bif4FreeEnabled = false;
						vm.accounts[i].projects[j].uploading = false;
						//vm.accounts[i].projects[j].canUpload = (vm.accounts[i].account === vm.account);
						vm.accounts[i].projects[j].canUpload = true;
					}
				}
				setupBid4FreeAccess();
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
		 * Go to the project viewer
		 *
		 * @param {String} account
		 * @param {String} project
		 */
		vm.goToProject = function (account, project) {
			if (project.timestamp === null) {
				vm.uploadModel(project);
			}
			else {
				$location.path("/" + account + "/" + project.name, "_self");
			}
		};

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
			vm.newProjectFileSelected = false;
			vm.newProjectData = {
				account: vm.account,
				type: vm.projectTypes[0]
			};
			vm.uploadedFile = null;
			$mdDialog.show({
				controller: function () {},
				templateUrl: "projectDialog.html",
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose:true,
				fullscreen: true,
				scope: $scope,
				preserveScope: true,
				onRemoving: function () {$scope.closeDialog();}
			});
		};
		
		/**
		 * Close the dialog
		 */
		vm.closeDialog = function() {
			$mdDialog.cancel();
		};

		/**
		 * Save a new project
		 */
		vm.saveNewProject = function () {
			var projectData,
				project;

			promise = AccountService.newProject(vm.newProjectData);
			promise.then(function (response) {
				console.log(response);
				vm.projectsExist = true;
				// Add project to list
				project = {
					name: response.data.project,
					canUpload: true,
					timestamp: "",
					bif4FreeEnabled: false
				};
				updateAccountProjects (response.data.account, project);
				// Save model to project
				if (vm.uploadedFile !== null) {
					uploadModelToProject (project, vm.uploadedFile);
				}
				vm.closeDialog();
			});
		};

		/**
		 *
		 * @param {String} project
		 */
		vm.uploadModel = function (project) {
			existingProjectFileUploader.value = "";
			existingProjectToUpload = project;
			existingProjectFileUploader.click();
		};

		/**
		 * Upload a file
		 */
		vm.uploadFile = function () {
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
			$mdDialog.show({
				controller: function () {},
				templateUrl: "databaseDialog.html",
				parent: angular.element(document.body),
				targetEvent: event,
				clickOutsideToClose:true,
				fullscreen: true,
				scope: $scope,
				preserveScope: true,
				onRemoving: function () {$scope.closeDialog();}
			});
		};

		/**
		 * Save a new database
		 */
		vm.saveNewDatabase = function () {
			promise = AccountService.newDatabase(vm.account, vm.newDatabaseName);
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
				console.log(vm.newDatabaseToken);
				vm.showPaymentWait = true;
			});
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
		}

		/**
		 * Upload file/model to project
		 * 
		 * @param project
		 * @param file
		 */
		function uploadModelToProject (project, file) {
			var interval,
				projectData = {
					account: vm.account,
					project: project.name
				};
			project.uploading = true;
			vm.showUploading = true;
			vm.showFileUploadInfo = false;
			projectData.uploadFile = file;
			promise = AccountService.uploadModel(projectData);
			promise.then(function (response) {
				console.log(response);
				if ((response.data.status === 400) || (response.data.status === 404)) {
					if (response.data.value === 68) {
						vm.fileUploadInfo = "Unsupported file format";
					}
					else if (response.data.value === 66) {
						vm.fileUploadInfo = "Insufficient quota for model";
					}
					else {
						vm.fileUploadInfo = "Error saving model";
					}
					vm.showUploading = false;
					vm.showFileUploadInfo = true;
					$timeout(function () {
						project.uploading = false;
					}, 4000);
				}
				else {
					interval = $interval(function () {
						promise = AccountService.uploadStatus(projectData);
						promise.then(function (response) {
							console.log(response);
							if (response.data.status === "ok") {
								project.timestamp = UtilsService.formatTimestamp(new Date(), true);
								vm.showUploading = false;
								$interval.cancel(interval);
								vm.showFileUploadInfo = true;
								vm.fileUploadInfo = "Uploaded";
								$timeout(function () {
									project.uploading = false;
								}, 4000);
							}
						});
					}, 1000);
				}
			});
		}

		vm.b4f = function (account, project) {
			$location.path("/" + account + "/" + project + "/bid4free", "_self");
		};

		function setupBid4FreeAccess () {
			if ((vm.accounts.length > 0) && (bid4FreeProjects !== null)) {
				angular.forEach(vm.accounts, function(account) {
					angular.forEach(account.projects, function(project) {
						project.bif4FreeEnabled = (bid4FreeProjects.indexOf(project.name) !== -1);
					});
				});
			}
		}
	}
}());
