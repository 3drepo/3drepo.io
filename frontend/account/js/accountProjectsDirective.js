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

	AccountProjectsCtrl.$inject = ["$scope", "$location", "$mdDialog", "$element", "AccountService"];

	function AccountProjectsCtrl($scope, $location, $mdDialog, $element, AccountService) {
		var vm = this,
			promise,
			bid4FreeProjects = null,
			userAccount,
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
			var account,
				data;
			vm.accounts = [];
			angular.forEach(vm.projectsGrouped, function(value, key) {
				account = {
					name: key,
					projects: [],
					showProjects: true,
					showProjectsIcon: "folder_open"
				};
				angular.forEach(value, function(project) {
					data = {
						name: project.name,
						timestamp: project.timestamp,
						bif4FreeEnabled: false
					};
					data.canUpload = (account.name === vm.account);
					account.projects.push(data);
				});
				vm.accounts.push(account);
				if (account.name === vm.account) {
					userAccount = vm.accounts[vm.accounts.length - 1];
				}
			});
			setupBid4FreeAccess();
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
			var projectData;

			promise = AccountService.newProject(vm.newProjectData);
			promise.then(function (response) {
				console.log(response);
				// Add project to list
				userAccount.projects.push({
					name: response.data.project,
					canUpload: true,
					timestamp: "",
					bif4FreeEnabled: false
				});
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

		vm.test = function () {
			console.log(123);
		};

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
