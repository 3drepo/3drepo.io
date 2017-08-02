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
		.component("accountModel", {
			restrict: "E",
			templateUrl: "account-model.html",
			bindings: {
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
			controllerAs: "vm",
			link: function (scope, element) {
				// Cleanup when destroyed
				element.on("$destroy", function(){
					scope.vm.uploadedFileWatch(); // Disable events watch
					scope.vm.modelToUploadFileWatch();

				});
			}
		});

	AccountModelCtrl.$inject = ["$scope", "$location", "$timeout", "$interval", "$filter", "UtilsService", "serverConfig", "RevisionsService", "NotificationService", "AuthService", "AnalyticService", "AccountService", "AccountUploadService"];

	function AccountModelCtrl ($scope, $location, $timeout, $interval, $filter, UtilsService, serverConfig, RevisionsService, NotificationService, AuthService, AnalyticService, AccountService, AccountUploadService) {

		var vm = this;

			
		// Init

		vm.$onInit = function() {
			
			vm.infoTimeout = 4000,
			vm.isUserAccount = (vm.account === vm.userAccount);

			vm.modelToUpload = null;
			vm.dialogCloseTo = "accountModelsOptionsMenu_" + vm.account + "_" + vm.model.name;

			vm.dialogCloseToId = "#" + vm.dialogCloseTo;
			if (vm.model.timestamp !== null) {
				vm.model.timestampPretty = $filter("prettyDate")(vm.model.timestamp, {showSeconds: true});
			}
			
			vm.model.canUpload = true;
			// Options
			vm.modelOptions = {
				upload: {
					label: "Upload file", 
					icon: "cloud_upload", 
					hidden: !AuthService.hasPermission(serverConfig.permissions.PERM_UPLOAD_FILES, vm.model.permissions)
				},
				permissions: {
					label: "Permissions", 
					icon: "group", 
					// !vm.isUserAccount will be changed to AuthService.hasPermission... when someone can pay for other accounts other than their own
					hidden: !vm.isUserAccount
				},
				revision: {
					label: "Revisions", 
					icon: "settings_backup_restore", 
					hidden: false
				},
				modelsetting: {
					label: "Settings",
					icon: "settings", 
					hidden: !AuthService.hasPermission(serverConfig.permissions.PERM_CHANGE_MODEL_SETTINGS, vm.model.permissions)
				}
			};
			if(vm.model.timestamp && !vm.model.federate){
				vm.modelOptions.download = {
					label: "Download", 
					icon: "cloud_download", 
					hidden: !AuthService.hasPermission(serverConfig.permissions.PERM_DOWNLOAD_MODEL, vm.model.permissions)
				};
			}
			vm.uploadButtonDisabled = true;
			vm.modelOptions.delete = {
				label: "Delete", 
				icon: "delete", 
				hidden: !AuthService.hasPermission(serverConfig.permissions.PERM_DELETE_MODEL, vm.model.permissions), 
				color: "#F44336"
			};

			watchModelStatus();

			if (vm.model.processing) {
				vm.fileUploadInfo = "Processing...";
			}

			if (vm.model.uploading) {
				vm.fileUploadInfo = "Uploading...";
			}

			vm.revisionsLoading = true;

		};
		
		vm.modelToUploadFileWatch = $scope.$watch("vm.modelToUpload", function () {
			// Check that the file to be uploaded is valid!
			if(vm.modelToUpload){

				var names = vm.modelToUpload.name.split(".");
				
				vm.uploadErrorMessage = null;
				var extension = names[names.length - 1].toLowerCase()
				var valid = serverConfig.acceptedFormat.indexOf(extension) === -1;

				if(names.length === 1){
					vm.uploadErrorMessage = "Filename must have extension";
					vm.modelToUpload = null;
					vm.uploadButtonDisabled = true;
				} else if(valid) {
					vm.uploadErrorMessage = "File format not supported";
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
					if(AuthService.hasPermission(serverConfig.permissions.PERM_UPLOAD_FILES, vm.model.permissions)){
						vm.tag = null;
						vm.desc = null;
						vm.modelToUpload = null;
						UtilsService.showDialog("upload-model-dialog.html", $scope, event, true, null, false, vm.dialogCloseToId);
					} else {
						console.warn("Incorrect permissions");
					}
				} else {
					$location.path("/" + vm.account + "/" + vm.model.model, "_self").search("page", null);
					AnalyticService.sendEvent({
						eventCategory: "Model",
						eventAction: "view"
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

				$location.search("modelName", vm.model.name);
				$location.search("modelId", vm.model.model);
				$location.search("targetAcct", vm.account);
				$location.search("page", "modelsetting");

				vm.onShowPage({page: "modelsetting", callingPage: "permissionsspaces"});
				break;

			case "upload":
				vm.uploadErrorMessage = null;
				vm.modelToUpload = null;
				vm.tag = null;
				vm.desc = null;
				UtilsService.showDialog("upload-model-dialog.html", $scope, event, true, null, false, vm.dialogCloseToId);
				//vm.uploadFile();
				break;

			case "download":
				window.open(
					serverConfig.apiUrl(serverConfig.GET_API, vm.account + "/" + vm.model.model + "/download/latest"),
					"_blank" 
				);

				AnalyticService.sendEvent({
					eventCategory: "Model",
					eventAction: "download"
				});

				break;

			case "permissions":
				goToPermissions(event, vm.account, vm.project, vm.model);
				break;

			case "delete":
				vm.onSetupDeleteModel({event: event, model: vm.model, account: vm.account, project: vm.project});
				break;

			case "revision":
				if(!vm.revisions){
					UtilsService.doGet(vm.account + "/" + vm.model.model + "/revisions.json").then(function(response){
						vm.revisions = response.data;
						vm.revisionsLoading = false;
					});
				}
				UtilsService.showDialog("revisions-dialog.html", $scope, event, true, null, false, vm.dialogCloseToId);
				break;
			}
		};

		/**
		 * Go to the billing page to add more licenses
		 */
		vm.setupAddLicenses = function () {
			vm.onShowPage({page: "billing", callingPage: "permissionsspaces"});
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
		vm.uploadFile = function (model) {

			console.log("vm.uploadFile", model);

			vm.uploadErrorMessage = null;
			var uploadFileData = {
				model: vm.model, 
				account: vm.account, 
				file: vm.modelToUpload, 
				tag: vm.tag, 
				desc: vm.desc
			};

		
			AccountUploadService.uploadRevisionToModel(uploadFileData)
				.then(function(){
					vm.addButtons = false;
					vm.addButtonType = "add";
					vm.closeDialog();
				})
				.catch(function(errorMessage){
					vm.uploadErrorMessage = errorMessage;
				});

				

		};

		/**
		* Go to the specified revision
		*/
		vm.goToRevision = function(revId){
			$location.path("/" + vm.account + "/" + vm.model.model + "/" + revId , "_self");
			AnalyticService.sendEvent({
				eventCategory: "Model",
				eventAction: "view"
			});
		};

		/**
		 * Watch file upload status
		 */
		function watchModelStatus(){

			NotificationService.subscribe.modelStatusChanged(vm.account, vm.model.model, function(data){

				if ((data.status === "ok") || (data.status === "failed")) {
					if (data.status === "ok"
						|| (data.errorReason.value === UtilsService.getResponseCode("FILE_IMPORT_MISSING_TEXTURES") 
						|| data.errorReason.value === UtilsService.getResponseCode("FILE_IMPORT_MISSING_NODES"))) {
						vm.model.timestamp = new Date();
						vm.model.timestampPretty = $filter("prettyDate")(vm.model.timestamp, {showSeconds: true});
						vm.fileUploadInfo = "Model imported successfully";
						// clear revisions cache
						vm.revisions = null;
						vm.revisionsLoading = true;
					}

					//status=ok can have an error message too
					if (data.hasOwnProperty("errorReason") && data.errorReason.message) {
						vm.fileUploadInfo = data.errorReason.message;
					} else if (data.status === "failed") {
						vm.fileUploadInfo = "Failed to import model";
					}

					vm.model.uploading = false;
					vm.model.processing = false;

					$scope.$apply();
					// $timeout(function () {
					// 	vm.fileUploadInfo = "";
					// }, vm.infoTimeout);
					
				} else if (data.status === "uploading"){

					vm.model.processing = false;
					vm.model.uploading = true;
					vm.fileUploadInfo = "Uploading...";
					$scope.$apply();

				} else if (data.status === "processing"){

					vm.model.uploading = false;
					vm.model.processing = true;
					vm.fileUploadInfo = "Processing...";
					$scope.$apply();

				}
			});

			$scope.$on("$destroy", function(){
				NotificationService.unsubscribe.modelStatusChanged(vm.account, vm.model.model);
			});
		}

		/**
		 * Set up permissions of model
		 *
		 * @param {Object} event
		 */
		function goToPermissions(event, account, project, model) {
			//vm.account, vm.project, vm.model

			$location.search("account", account);
			$location.search("project", project.name);
			$location.search("model", model.model);
			$location.search("page", "assign");
			vm.onShowPage({page: "assign", callingPage: "teamspaces"});

		}
	}
}());
