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
		.directive("accountProject", accountProject);

	function accountProject () {
		return {
			restrict: 'E',
			templateUrl: 'accountProject.html',
			scope: {
				account: "=",
				project: "=",
				onUploadFile: "&",
				uploadedFile: "=",
				onShowPage: "&",
				onSetupDeleteProject: "&",
				quota: "=",
				subscriptions: "="
			},
			controller: AccountProjectCtrl,
			controllerAs: 'vm',
			bindToController: true,
			link: function (scope, element) {
				// Cleanup when destroyed
				element.on('$destroy', function(){
					scope.vm.uploadedFileWatch(); // Disable events watch
				});
			}
		};
	}

	AccountProjectCtrl.$inject = ["$scope", "$location", "$timeout", "$interval", "$filter", "UtilsService", "serverConfig"];

	function AccountProjectCtrl ($scope, $location, $timeout, $interval, $filter, UtilsService, serverConfig) {
		var vm = this,
			infoTimeout = 4000;

		// Init
		vm.project.name = vm.project.project;
		if (vm.project.timestamp !== null) {
			vm.project.timestampPretty = $filter("prettyDate")(vm.project.timestamp, {showSeconds: true});
		}
		vm.project.canUpload = true;
		vm.projectOptions = {
			upload: {label: "Upload file", icon: "cloud_upload"},
			projectsetting: {label: "Settings", icon: "settings"},
			team: {label: "Team", icon: "group"},
			delete: {label: "Delete", icon: "delete"}
		};
		checkFileUploading();

		/*
		 * Watch changes in upload file
		 */
		vm.uploadedFileWatch = $scope.$watch("vm.uploadedFile", function () {
			if (angular.isDefined(vm.uploadedFile) && (vm.uploadedFile !== null) && (vm.uploadedFile.project.name === vm.project.name)) {
				console.log("Uploaded file", vm.uploadedFile);
				uploadFileToProject(vm.uploadedFile.file);
			}
		});

		/**
		 * Go to the project viewer
		 */
		vm.goToProject = function () {
			if (!vm.project.uploading) {
				if (vm.project.timestamp === null) {
					// No timestamp indicates no model previously uploaded
					vm.uploadFile();
				}
				else {
					$location.path("/" + vm.account + "/" + vm.project.name, "_self").search("page", null);
				}
			}
		};

		/**
		 * Call parent upload function
		 */
		vm.uploadFile = function () {
			vm.onUploadFile({project: vm.project});
		};

		/**
		 * Handle project option selection
		 *
		 * @param event
		 * @param option
		 */
		vm.doProjectOption = function (event, option) {
			switch (option) {
				case "projectsetting":
					console.log('Settings clicked');
					$location.search("proj", vm.project.name);
					vm.onShowPage({page: "projectsetting", callingPage: "repos"});
					break;

				case "upload":
					vm.uploadFile();
					break;

				case "team":
					setupEditTeam(event);
					break;

				case "delete":
					vm.onSetupDeleteProject({event: event, project: vm.project});
					break;
			}
		};

		/**
		 * Go to the billing page to add more licenses
		 */
		vm.setupAddLicenses = function () {
			vm.onShowPage({page: "billing", callingPage: "repos"});
			UtilsService.closeDialog();
		};

		/**
		 * Close the dialog
		 */
		vm.closeDialog = function() {
			UtilsService.closeDialog();
		};

		/**
		 * Upload file/model to project
		 *
		 * @param file
		 */
		function uploadFileToProject (file) {
			var promise,
				formData;

			// Check the quota
			promise = UtilsService.doGet(vm.account + ".json");
			promise.then(function (response) {
				console.log(response);
				if (file.size > response.data.accounts[0].quota.spaceLimit) {
					// Show the over quota dialog
					UtilsService.showDialog("overQuotaDialog.html", $scope, null, true);
				}
				else {
					vm.project.uploading = true;
					vm.showUploading = true;
					vm.showFileUploadInfo = false;

					// Check for file size limit
					if (file.size > serverConfig.uploadSizeLimit) {
						$timeout(function () {
							vm.showUploading = false;
							vm.showFileUploadInfo = true;
							vm.fileUploadInfo = "File exceeds size limit";
							$timeout(function () {
								vm.project.uploading = false;
							}, infoTimeout);
						});
					}
					else {
						formData = new FormData();
						formData.append("file", file);
						promise = UtilsService.doPost(formData, vm.account + "/" + vm.project.name + "/upload", {'Content-Type': undefined});
						promise.then(function (response) {
							console.log("uploadModel", response);
							if ((response.data.status === 400) || (response.data.status === 404)) {
								// Upload error
								if (response.data.value === 68) {
									vm.fileUploadInfo = "Unsupported file format";
								}
								else if (response.data.value === 66) {
									vm.fileUploadInfo = "Insufficient quota for model";
								}
								vm.showUploading = false;
								vm.showFileUploadInfo = true;
								$timeout(function () {
									vm.project.uploading = false;
								}, infoTimeout);
							}
							else {
								console.log("Polling upload!");
								pollUpload();
							}
						});
					}
				}
			});
		}

		/**
		 * Display file uploading and info
		 */
		function checkFileUploading () {
			var promise = UtilsService.doGet(vm.account + "/" + vm.project.name + ".json");
			promise.then(function (response) {
				if (response.data.status === "processing") {
					vm.project.uploading = true;
					vm.showUploading = true;
					vm.showFileUploadInfo = false;
					pollUpload();
				}
			});
		}

		/**
		 * Poll uploading of file
		 */
		function pollUpload () {
			var interval,
				promise;

			interval = $interval(function () {
				promise = UtilsService.doGet(vm.account + "/" + vm.project.name + ".json");
				promise.then(function (response) {
					console.log("uploadStatus", response);
					if ((response.data.status === "ok") || (response.data.status === "failed")) {
						if (response.data.status === "ok") {
							vm.project.timestamp = new Date();
							vm.project.timestampPretty = $filter("prettyDate")(vm.project.timestamp, {showSeconds: true});
							vm.fileUploadInfo = "Uploaded";
						}
						else {
							if (response.data.hasOwnProperty("errorReason")) {
								vm.fileUploadInfo = response.data.errorReason.message;
							}
							else {
								vm.fileUploadInfo = "Failed to upload file";
							}
						}
						vm.showUploading = false;
						$interval.cancel(interval);
						vm.showFileUploadInfo = true;
						$timeout(function () {
							vm.project.uploading = false;
						}, infoTimeout);
					}
				});
			}, 1000);
		}

		/**
		 * Set up team of project
		 *
		 * @param {Object} event
		 */
		function setupEditTeam (event) {
			vm.item = vm.project;
			UtilsService.showDialog("teamDialog.html", $scope, event);
		}

	}
}());
