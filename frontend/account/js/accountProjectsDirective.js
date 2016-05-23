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
				projectsGrouped: "="
			},
			controller: AccountProjectsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountProjectsCtrl.$inject = ["$scope", "$location", "$mdDialog", "$element", "$timeout", "AccountService"];

	function AccountProjectsCtrl($scope, $location, $mdDialog, $element, $timeout, AccountService) {
		var vm = this,
			promise,
			bid4FreeProjects = null,
			fileUploader = $element[0].querySelector("#fileUploader");

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
		vm.accounts = [];
		vm.info = "Retrieving projects..,";
		vm.showProgress = true;
		vm.paypalReturnUrl = "http://3drepo.io/";

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
		 * Handle changes to the state manager Data
		 * Reformat the grouped projects to enable toggling of projects list
		 */
		$scope.$watch("vm.projectsGrouped", function () {
			if (angular.isDefined(vm.projectsGrouped)) {
				vm.showProgress = false;
				vm.accounts = [];
				vm.projectsExist = !((Object.keys(vm.projectsGrouped).length === 0) && (vm.projectsGrouped.constructor === Object));
				vm.info = vm.projectsExist ? "" : "There currently no projects";
				angular.forEach(vm.projectsGrouped, function(value, key) {
					angular.forEach(value, function(project) {
						project = {
							name: project.name,
							timestamp: project.timestamp,
							bif4FreeEnabled: false
						};
						project.canUpload = (key === vm.account);
						updateAccountProjects(key, project);
					});
				});
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
			$location.path("/" + account + "/" + project, "_self");
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
		
		vm.uploadModel = function () {
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
					projectData = response.data;
					projectData.uploadFile = vm.uploadedFile;
					promise = AccountService.uploadModel(projectData);
					promise.then(function (response) {
						console.log(response);
					});
				}
				vm.closeDialog();
			});
		};

		/**
		 *
		 * @param {String} project
		 */
		vm.uploadModel = function (project) {
			vm.projectData = {
				account: vm.account,
				project: project
			};
			setupFileUploader(
				function (file) {
					vm.projectData.uploadFile = file;
					promise = AccountService.uploadModel(vm.projectData);
					promise.then(function (response) {
						console.log(response);
					});
				}
			);
			fileUploader.click();
		};

		/**
		 * Upload a file
		 */
		vm.uploadFile = function () {
			setupFileUploader(
				function (file) {
					vm.uploadedFile = file;
				}
			);
			fileUploader.click();
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
		 * Set up action on file upload
		 *
		 * @param {Function} callback
		 */
		function setupFileUploader (callback) {
			fileUploader.addEventListener(
				"change",
				function (event) {
					callback(this.files[0]);
				},
				false
			);
		}

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

		vm.b4f = function (account, project) {
			console.log(account, project);
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
