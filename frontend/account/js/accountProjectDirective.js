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
				userAccount: "=",
				onUploadFile: "&",
				uploadedFile: "=",
				projectToUpload: "=",
				onShowPage: "&",
				onSetupDeleteProject: "&",
				quota: "=",
				isAccountAdmin: "=",
				subscriptions: "="
			},
			controller: AccountProjectCtrl,
			controllerAs: 'vm',
			bindToController: true,
			link: function (scope, element) {
				// Cleanup when destroyed
				element.on('$destroy', function(){
					scope.vm.uploadedFileWatch(); // Disable events watch
					scope.vm.projectToUploadFileWatch();

				});
			}
		};
	}


	AccountProjectCtrl.$inject = ["$scope", "$location", "$timeout", "$interval", "$filter", "UtilsService", "serverConfig", "RevisionsService", "NotificationService"];

	function AccountProjectCtrl ($scope, $location, $timeout, $interval, $filter, UtilsService, serverConfig, RevisionsService, NotificationService) {

		var vm = this,
			infoTimeout = 4000,
			isUserAccount = (vm.account === vm.userAccount),
			dialogCloseToId;

		// Init

		function checkProjectPermission(action){
			if(action === 'upload' || action === 'download'){
				
				return vm.project.roleFunctions.indexOf('admin') !== -1 
				|| vm.project.roleFunctions.indexOf('collaborator') !== -1;

			} else if (action === 'delete' || action === 'projectsetting') {
				return vm.project.roleFunctions.indexOf('admin') !== -1;
			}
		}

		vm.selectedFile = null;
		vm.project.name = vm.project.project;
		vm.dialogCloseTo = "accountProjectsOptionsMenu_" + vm.account + "_" + vm.project.name;
		dialogCloseToId = "#" + vm.dialogCloseTo;
		if (vm.project.timestamp !== null) {
			vm.project.timestampPretty = $filter("prettyDate")(vm.project.timestamp, {showSeconds: true});
		}
		vm.project.canUpload = true;
		// Options
		vm.projectOptions = {
			upload: {label: "Upload file", icon: "cloud_upload", hidden: !checkProjectPermission('upload')},
			team: {label: "Team", icon: "group", hidden: !isUserAccount},
			revision: {label: "Revisions", icon: "settings_backup_restore", hidden: false},
			projectsetting: {label: "Settings", icon: "settings", hidden: !checkProjectPermission('projectsetting')}
		};
		if(vm.project.timestamp && !vm.project.federate){
			vm.projectOptions.download = {label: "Download", icon: "cloud_download", hidden: !checkProjectPermission('download')};
		}
		vm.uploadButtonDisabled = true;
		vm.projectOptions.delete = {label: "Delete", icon: "delete", hidden: !checkProjectPermission('delete'), color: "#F44336"};

		checkFileUploading();

		/*
		 * Watch changes in upload file
		 */
		vm.uploadedFileWatch = $scope.$watch("vm.uploadedFile", function () {

			if (angular.isDefined(vm.uploadedFile) && (vm.uploadedFile !== null) && (vm.uploadedFile.project.name === vm.project.name)) {

				console.log("Uploaded file", vm.uploadedFile);
				uploadFileToProject(vm.uploadedFile.file, vm.tag, vm.desc);

			}
		});

		vm.projectToUploadFileWatch = $scope.$watch("vm.projectToUpload", function () {
			if(vm.projectToUpload){

				var names = vm.projectToUpload.name.split('.');
				
				vm.uploadErrorMessage = null;
				
				if(names.length === 1){
					vm.uploadErrorMessage = 'Filename must have extension';
					vm.uploadButtonDisabled = true;
				} else if(serverConfig.acceptedFormat.indexOf(names[names.length - 1]) === -1) {
					vm.uploadErrorMessage = 'File format not supported';
					vm.uploadButtonDisabled = true;
				} else {
					vm.uploadButtonDisabled = false;
				}

			}
		});

		/**
		 * Go to the project viewer
		 */
		vm.goToProject = function () {
			if (!vm.project.uploading) {
				if (vm.project.timestamp === null) {
					// No timestamp indicates no model previously uploaded
					if(checkProjectPermission('upload')){
						vm.tag = null;
						vm.desc = null;
						vm.selectedFile = null;
						UtilsService.showDialog("uploadProjectDialog.html", $scope, event, true, null, false, dialogCloseToId);
					}
				}
				else {
					$location.path("/" + vm.account + "/" + vm.project.name, "_self").search("page", null);
				}
			}
		};


		/**
		 * Handle project option selection
		 * @param event
		 * @param option
		 */
		vm.doProjectOption = function (event, option) {
			switch (option) {
				case "projectsetting":
					$location.search("proj", vm.project.name);
					$location.search("targetAcct", vm.account);
					vm.onShowPage({page: "projectsetting", callingPage: "repos"});
					break;

				case "upload":
					vm.uploadErrorMessage = null;
					vm.tag = null;
					vm.desc = null;
					UtilsService.showDialog("uploadProjectDialog.html", $scope, event, true, null, false, dialogCloseToId);
					//vm.uploadFile();
					break;

				case "download":
					window.open(
						serverConfig.apiUrl(serverConfig.GET_API, vm.account + "/" + vm.project.name + "/download/latest"),
						'_blank' 
					);
					break;

				case "team":
					setupEditTeam(event);
					break;

				case "delete":
					vm.onSetupDeleteProject({event: event, project: vm.project, account: vm.account});
					break;

				case "revision":
					if(!vm.revisions){
						UtilsService.doGet(vm.account + "/" + vm.project.name + "/revisions.json").then(function(response){
							vm.revisions = response.data;
						});
					}
					UtilsService.showDialog("revisionsDialog.html", $scope, event, true, null, false, dialogCloseToId);
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
		 * When users click select file
		 */
		vm.selectFile = function(){
			vm.onUploadFile({project: vm.project});
		};


		/**
		 * When users click upload after selecting
		 */
		vm.uploadFile = function () {
			var revisions;
			vm.uploadErrorMessage = null;

			if(vm.tag && RevisionsService.isTagFormatInValid(vm.tag)){
				vm.uploadErrorMessage = 'Invalid revision name';
			} else {
				UtilsService.doGet(vm.account + "/" + vm.project.name + "/revisions.json").then(function(response){
					revisions = response.data;
					if(vm.tag){
						revisions.forEach(function(rev){
							if(rev.tag === vm.tag){
								vm.uploadErrorMessage = 'Revision name already exists';
							}
						});
					}

					if(!vm.uploadErrorMessage){
						vm.uploadedFile = {project: vm.project, file: vm.projectToUpload};
						vm.closeDialog();
					}
				});
			}
		};

		/**
		* Go to the specified revision
		*/
		vm.goToRevision = function(revId){
			$location.path("/" + vm.account + "/" + vm.project.name + "/" + revId , "_self");
		};

		/**
		 * Upload file/model to project
		 * @param file
		 * @param tag
		 * @param desc
		 */
		function uploadFileToProject(file, tag, desc) {
			var promise,
				formData;

			// Check the quota
			promise = UtilsService.doGet(vm.userAccount + ".json");

			promise.then(function (response) {

				var targetAccount = response.data.accounts.find(function(account){
					return account.account === vm.account;
				});

				var quota = targetAccount.quota;
				vm.targetAccountQuota = quota;

				if (file.size > (quota.spaceLimit - quota.spaceUsed)) {
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

						vm.uploadFileName = file.name;

						formData = new FormData();
						formData.append("file", file);

						if(tag){
							formData.append('tag', tag);
						}

						if(desc){
							formData.append('desc', desc);
						}

						promise = UtilsService.doPost(formData, vm.account + "/" + vm.project.name + "/upload", {'Content-Type': undefined});

						promise.then(function (response) {
							console.log("uploadModel", response);
							if ((response.status === 400) || (response.status === 404)) {
								// Upload error
								if (response.data.value === 68) {
									vm.fileUploadInfo = "Unsupported file format";
								}
								else if (response.data.value === 66) {
									vm.fileUploadInfo = "Insufficient quota for model";
								}
								else {
									vm.fileUploadInfo = response.data.message;
								}
								
								vm.showUploading = false;
								vm.showFileUploadInfo = true;
								$timeout(function () {
									vm.project.uploading = false;
								}, infoTimeout);
							}
							else {
								console.log("Polling upload!");
								watchProjectStatus();
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
					watchProjectStatus();
				}
			});
		}

		/**
		 * Watch file upload status
		 */
		function watchProjectStatus(){
			NotificationService.subscribe.projectStatusChanged(vm.account, vm.project.project, function(data){
				console.log('upload status changed',  data);
				if ((data.status === "ok") || (data.status === "failed")) {
					if (data.status === "ok") {
						vm.project.timestamp = new Date();
						vm.project.timestampPretty = $filter("prettyDate")(vm.project.timestamp, {showSeconds: true});
						vm.fileUploadInfo = "Uploaded";
						// clear revisions cache
						vm.revisions = null;
					}

					//status=ok can have an error message too
					if (data.hasOwnProperty("errorReason")) {
						vm.fileUploadInfo = data.errorReason.message;
					} else if (data.status === "failed") {
						vm.fileUploadInfo = "Failed to upload file";
					}

					vm.showUploading = false;
					vm.showFileUploadInfo = true;
					$scope.$apply();
					$timeout(function () {
						vm.project.uploading = false;
					}, infoTimeout);
					

					NotificationService.unsubscribe.projectStatusChanged(vm.account, vm.project.project);
				}
			});
		}

		/**
		 * Set up team of project
		 *
		 * @param {Object} event
		 */
		function setupEditTeam (event) {
			vm.item = vm.project;
			UtilsService.showDialog("teamDialog.html", $scope, event, true, null, false, dialogCloseToId);
		}
	}
}());
