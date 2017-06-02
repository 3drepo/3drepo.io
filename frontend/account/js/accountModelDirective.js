/**
 *
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
		.directive("accountModel", accountModel);

	function accountModel () {
		return {
			restrict: 'E',
			templateUrl: 'accountModel.html',
			scope: {
				account: "=",
				model: "=",
				project: "=",
				userAccount: "=",
				onUploadFile: "&",
				uploadedFile: "=",
				modelToUpload: "=",
				onShowPage: "&",
				onSetupDeleteModel: "&",
				quota: "=",
				isAccountAdmin: "=",
				subscriptions: "="
			},
			controller: AccountModelCtrl,
			controllerAs: 'vm',
			bindToController: true,
			link: function (scope, element) {
				// Cleanup when destroyed
				element.on('$destroy', function(){
					scope.vm.uploadedFileWatch(); // Disable events watch
					scope.vm.modelToUploadFileWatch();

				});
			}
		};
	}


	AccountModelCtrl.$inject = ["$scope", "$location", "$timeout", "$interval", "$filter", "UtilsService", "serverConfig", "RevisionsService", "NotificationService", "Auth", "AnalyticService"];

	function AccountModelCtrl ($scope, $location, $timeout, $interval, $filter, UtilsService, serverConfig, RevisionsService, NotificationService, Auth, AnalyticService) {

		var vm = this,
			infoTimeout = 4000,
			isUserAccount = (vm.account === vm.userAccount),
			dialogCloseToId;

		// Init

		vm.modelToUpload = null;
		vm.model.name = vm.model.model;
		vm.dialogCloseTo = "accountModelsOptionsMenu_" + vm.account + "_" + vm.model.name;

		dialogCloseToId = "#" + vm.dialogCloseTo;
		if (vm.model.timestamp !== null) {
			vm.model.timestampPretty = $filter("prettyDate")(vm.model.timestamp, {showSeconds: true});
		}
		vm.model.canUpload = true;
		// Options
		vm.modelOptions = {
			upload: {
				label: "Upload file", 
				icon: "cloud_upload", 
				hidden: !Auth.hasPermission(serverConfig.permissions.PERM_UPLOAD_FILES, vm.model.permissions)
			},
			team: {
				label: "Team", 
				icon: "group", 
				// !isUserAccount will be changed to Auth.hasPermission... when someone can pay for other accounts other than their own
				hidden: !isUserAccount
			},
			revision: {
				label: "Revisions", 
				icon: "settings_backup_restore", 
				hidden: false
			},
			modelsetting: {
				label: "Settings",
				 icon: "settings", 
				 hidden: !Auth.hasPermission(serverConfig.permissions.PERM_CHANGE_MODEL_SETTINGS, vm.model.permissions)
			}
		};
		if(vm.model.timestamp && !vm.model.federate){
			vm.modelOptions.download = {
				label: "Download", 
				icon: "cloud_download", 
				hidden: !Auth.hasPermission(serverConfig.permissions.PERM_DOWNLOAD_MODEL, vm.model.permissions)
			};
		}
		vm.uploadButtonDisabled = true;
		vm.modelOptions.delete = {
			label: "Delete", 
			icon: "delete", 
			hidden: !Auth.hasPermission(serverConfig.permissions.PERM_DELETE_MODEL, vm.model.permissions), 
			color: "#F44336"
		};


		watchModelStatus();

		if (vm.model.status === "processing") {

			vm.model.uploading = true;
			vm.fileUploadInfo = 'Processing...';

		}
		

		/*
		 * Watch changes in upload file
		 */
		vm.uploadedFileWatch = $scope.$watch("vm.uploadedFile", function () {

			if (angular.isDefined(vm.uploadedFile) && (vm.uploadedFile !== null) && (vm.uploadedFile.model.name === vm.model.name) && (vm.uploadedFile.account === vm.account)) {

				console.log("Uploaded file", vm.uploadedFile);
				uploadFileToModel(vm.uploadedFile.file, vm.uploadedFile.tag, vm.uploadedFile.desc);

			}
		});

		vm.modelToUploadFileWatch = $scope.$watch("vm.modelToUpload", function () {
			if(vm.modelToUpload){

				var names = vm.modelToUpload.name.split('.');
				
				vm.uploadErrorMessage = null;
				
				if(names.length === 1){
					vm.uploadErrorMessage = 'Filename must have extension';
					vm.modelToUpload = null;
					vm.uploadButtonDisabled = true;
				} else if(serverConfig.acceptedFormat.indexOf(names[names.length - 1].toLowerCase()) === -1) {
					vm.uploadErrorMessage = 'File format not supported';
					vm.modelToUpload = null;
					vm.uploadButtonDisabled = true;
				} else {
					vm.uploadButtonDisabled = false;
				}

			}
		});

		/**
		 * Go to the model viewer
		 */
		vm.goToModel = function () {
			if (!vm.model.uploading) {
				if (vm.model.timestamp === null) {
					// No timestamp indicates no model previously uploaded
					if(Auth.hasPermission(serverConfig.permissions.PERM_UPLOAD_FILES, vm.model.permissions)){
						vm.tag = null;
						vm.desc = null;
						vm.modelToUpload = null;
						UtilsService.showDialog("uploadModelDialog.html", $scope, event, true, null, false, dialogCloseToId);
					}
					else {
						console.warn("Incorrect permissions")
					}
				}
				else {
					console.log("location path being called")
					$location.path("/" + vm.account + "/" + vm.model.name, "_self").search("page", null);
					AnalyticService.sendEvent({
						eventCategory: 'Model',
						eventAction: 'view'
					});
				}
			}
		};


		/**
		 * Handle model option selection
		 * @param event
		 * @param option
		 */
		vm.doModelOption = function (event, option) {
			switch (option) {
				case "modelsetting":
					$location.search("proj", vm.model.name);
					$location.search("targetAcct", vm.account);
					vm.onShowPage({page: "modelsetting", callingPage: "teamspaces", data: {tabIndex: 0}});
					break;

				case "upload":
					vm.uploadErrorMessage = null;
					vm.modelToUpload = null;
					vm.tag = null;
					vm.desc = null;
					UtilsService.showDialog("uploadModelDialog.html", $scope, event, true, null, false, dialogCloseToId);
					//vm.uploadFile();
					break;

				case "download":
					window.open(
						serverConfig.apiUrl(serverConfig.GET_API, vm.account + "/" + vm.model.name + "/download/latest"),
						'_blank' 
					);

					AnalyticService.sendEvent({
						eventCategory: 'Model',
						eventAction: 'download'
					});

					break;

				case "team":
					setupEditTeam(event);
					break;

				case "delete":
					vm.onSetupDeleteModel({event: event, model: vm.model, account: vm.account, project: vm.project});
					break;

				case "revision":
					if(!vm.revisions){
						UtilsService.doGet(vm.account + "/" + vm.model.name + "/revisions.json").then(function(response){
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
			vm.onShowPage({page: "billing", callingPage: "teamspaces"});
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
			vm.onUploadFile({model: vm.model, account: vm.account});
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
				UtilsService.doGet(vm.account + "/" + vm.model.name + "/revisions.json").then(function(response){
					revisions = response.data;
					if(vm.tag){
						revisions.forEach(function(rev){
							if(rev.tag === vm.tag){
								vm.uploadErrorMessage = 'Revision name already exists';
							}
						});
					}

					if(!vm.uploadErrorMessage){
						vm.uploadedFile = {model: vm.model, account: vm.account, file: vm.modelToUpload, tag: vm.tag, desc: vm.desc};
						vm.closeDialog();
					}
				});
			}
		};

		/**
		* Go to the specified revision
		*/
		vm.goToRevision = function(revId){
			$location.path("/" + vm.account + "/" + vm.model.name + "/" + revId , "_self");
			AnalyticService.sendEvent({
				eventCategory: 'Model',
				eventAction: 'view'
			});
		};

		/**
		 * Upload file/model to model
		 * @param file
		 * @param tag
		 * @param desc
		 */
		function uploadFileToModel(file, tag, desc) {
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

					// Check for file size limit
					if (file.size > serverConfig.uploadSizeLimit) {
						$timeout(function () {

							vm.fileUploadInfo = "File exceeds size limit";
							$timeout(function () {
								vm.fileUploadInfo = "";
							}, infoTimeout);
						});
					}
					else {

						formData = new FormData();
						formData.append("file", file);

						if(tag){
							formData.append('tag', tag);
						}

						if(desc){
							formData.append('desc', desc);
						}

						promise = UtilsService.doPost(formData, vm.account + "/" + vm.model.name + "/upload", {'Content-Type': undefined});

						promise.then(function (response) {
							console.log("uploadModel", response);
							if ((response.status === 400) || (response.status === 404)) {
								// Upload error
								vm.model.uploading = false;
								vm.fileUploadInfo = UtilsService.getErrorMessage(response.data);

								$timeout(function () {
									vm.fileUploadInfo = "";
								}, infoTimeout);
							}
							else {
								
								AnalyticService.sendEvent({
									eventCategory: 'Model',
									eventAction: 'upload'
								});
							}
						});
					}
				}
			});
		}

		/**
		 * Watch file upload status
		 */
		function watchModelStatus(){

			NotificationService.subscribe.modelStatusChanged(vm.account, vm.model.model, function(data){

				console.log('upload status changed',  data);
				if ((data.status === "ok") || (data.status === "failed")) {
					if (data.status === "ok"
						|| (data.errorReason.value === UtilsService.getResponseCode('FILE_IMPORT_MISSING_TEXTURES') 
						|| data.errorReason.value === UtilsService.getResponseCode('FILE_IMPORT_MISSING_NODES'))) {
						vm.model.timestamp = new Date();
						vm.model.timestampPretty = $filter("prettyDate")(vm.model.timestamp, {showSeconds: true});
						vm.fileUploadInfo = "Model imported successfully";
						// clear revisions cache
						vm.revisions = null;
					}

					//status=ok can have an error message too
					if (data.hasOwnProperty("errorReason") && data.errorReason.message) {
						vm.fileUploadInfo = data.errorReason.message;
					} else if (data.status === "failed") {
						vm.fileUploadInfo = "Failed to import model";
					}

					vm.model.uploading = false;

					$scope.$apply();
					$timeout(function () {
						vm.fileUploadInfo = "";
					}, infoTimeout);
					
				} else if (data.status === 'uploading'){

					vm.model.uploading = true;
					vm.fileUploadInfo = 'Uploading...';
					$scope.$apply();

				} else if (data.status === 'processing'){
					vm.model.uploading = true;
					vm.fileUploadInfo = 'Processing...';
					$scope.$apply();
				}
			});

			$scope.$on('$destroy', function(){
				NotificationService.unsubscribe.modelStatusChanged(vm.account, vm.model.model);
			});
		}

		/**
		 * Set up team of model
		 *
		 * @param {Object} event
		 */
		function setupEditTeam (event) {
			vm.item = vm.model;
			UtilsService.showDialog("teamDialog.html", $scope, event, true, null, false, dialogCloseToId);
		}
	}
}());
