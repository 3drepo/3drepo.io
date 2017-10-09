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
		.component("accountLicenses", {
			restrict: "EA",
			templateUrl: "templates/account-licenses.html",
			bindings: {
				account: "<",
				showPage: "&"
			},
			controller: AccountLicensesCtrl,
			controllerAs: "vm"
		});
	
	AccountLicensesCtrl.$inject = ["$scope", "UtilsService", "StateManager", "APIService"];

	function AccountLicensesCtrl($scope, UtilsService, StateManager, APIService) {
		var vm = this;

		vm.$onInit = function() {
			vm.promise = null;
			vm.jobs = [];
			APIService.get(vm.account + "/subscriptions").then(function(res){
				vm.subscriptions = res.data;
			});
			APIService.get(vm.account + "/jobs").then(function(data){
				vm.jobs = data.data;
			});

		};

		/*
		 * Watch subscriptions
		 */
		$scope.$watch("vm.subscriptions", function () {

			if(!vm.subscriptions){
				return;
			}

			vm.unassigned = [];
			vm.licenses = [];
			vm.allLicensesAssigned = false;
			vm.numLicensesAssigned = 0;
			vm.numLicenses = vm.subscriptions.length;
			vm.toShow = (vm.numLicenses > 0) ? "0+": "0";

			for (var i = 0; i < vm.numLicenses; i += 1) {
				if (vm.subscriptions[i].hasOwnProperty("assignedUser")) {
					vm.licenses.push({
						user: vm.subscriptions[i].assignedUser,
						id: vm.subscriptions[i]._id,
						job: vm.subscriptions[i].job,
						showRemove: (vm.subscriptions[i].assignedUser !== vm.account)
					});
				} else {
					vm.unassigned.push(vm.subscriptions[i]._id);
				}
			}
			vm.allLicensesAssigned = (vm.unassigned.length === 0);
			vm.numLicensesAssigned = vm.numLicenses - vm.unassigned.length;
		});

		/*
		 * Watch changes to the new license assignee name
		 */
		$scope.$watch("vm.newLicenseAssignee", function (newValue) {
			vm.addMessage = "";
			vm.addDisabled = !(angular.isDefined(newValue) && (newValue.toString() !== ""));
		});

		vm.assignJob = function(index){
			var licence = vm.licenses[index];
	
			APIService.put(
				{job: licence.job},
				vm.account + "/subscriptions/" + licence.id + "/assign"
			).then(function(res){
				if (res.status !== 200) {

					vm.addMessage = res.data.message;
				}
			});
		};

		vm.addJob = function(){

			var job = { _id: vm.newJob };
			vm.addJobMessage = null;

			APIService.post(vm.account + "/jobs", job)
				.then(function(res){
					if (res.status !== 200) {
						vm.addJobMessage = res.data.message;
					} else {
						vm.jobs.push(job);
					}
				});
		};

		vm.removeJob = function(index){

			vm.deleteJobMessage = null;
			var url = vm.account + "/jobs/" + vm.jobs[index]._id;
			APIService.delete(url, null).then(function(res){
				if (res.status !== 200) {
					vm.deleteJobMessage = res.data.message;
				} else {
					vm.jobs.splice(index, 1);
				}
			});
		};

		/**
		 * Assign a license to the selected user
		 */
		vm.assignLicense = function (event) {
			var doSave = false,
				enterKey = 13;

			if (angular.isDefined(event)) {
				if (event.which === enterKey) {
					doSave = true;
				}
			} else {
				doSave = true;
			}

			if (doSave) {
				APIService.post(
					vm.account + "/subscriptions/" + vm.unassigned[0] + "/assign",
					{user: vm.newLicenseAssignee}
				).then(function (response) {
					if (response.status === 200) {
						vm.addMessage = "User " + vm.newLicenseAssignee + " assigned a license";
						vm.licenses.push({user: response.data.assignedUser, id: response.data._id, showRemove: true});
						vm.unassigned.splice(0, 1);
						vm.allLicensesAssigned = (vm.unassigned.length === 0);
						vm.numLicensesAssigned = vm.numLicenses - vm.unassigned.length;
						vm.addDisabled = vm.allLicensesAssigned;
						vm.newLicenseAssignee = "";
					} else if (response.status === 400) {
						vm.addMessage = "This user has already been assigned a license";
					} else if (response.status === 404) {
						vm.addMessage = "User not found";
					}
				});
			}
		};

		/**
		 * Remove a license
		 *
		 * @param index
		 */
		vm.removeLicense = function (index) {
			var removeUrl = vm.account + "/subscriptions/" + vm.licenses[index].id + "/assign";
			APIService.delete(removeUrl, {})
				.then(function (response) {
					if (response.status === 200) {
						vm.unassigned.push(vm.licenses[index].id);
						vm.licenses.splice(index, 1);
						vm.addDisabled = false;
						vm.allLicensesAssigned = false;
						vm.numLicensesAssigned = vm.numLicenses - vm.unassigned.length;
					} else if (response.status === 400) {
						//var message = UtilsService.getErrorMessage(response.data);
						var responseCode = UtilsService.getResponseCode("USER_IN_COLLABORATOR_LIST");
						if (response.data.value === responseCode) {
							vm.licenseAssigneeIndex = index;
							vm.models = response.data.models;
							vm.projects = response.data.projects;
							if(response.data.teamspace){
								vm.teamspacePerms = response.data.teamspace.permissions.join(", ");
							}
							
							UtilsService.showDialog("remove-license-dialog.html", $scope);
						}
					}
				});
		};

		/**
		 * Remove license from user who is a team member of a model
		 */
		vm.removeLicenseConfirmed = function () {
			var license = vm.licenses[vm.licenseAssigneeIndex].id;
			var removeLicenseUrl = vm.account + "/subscriptions/" + license + "/assign?cascadeRemove=true";
			APIService.delete(removeLicenseUrl, {})
				.then(function (response) {
					if (response.status === 200) {
						vm.unassigned.push(vm.licenses[vm.licenseAssigneeIndex].id);
						vm.licenses.splice(vm.licenseAssigneeIndex, 1);
						vm.addDisabled = false;
						vm.allLicensesAssigned = false;
						vm.numLicensesAssigned = vm.numLicenses - vm.unassigned.length;
						UtilsService.closeDialog();
					}
				});
		};

		vm.goToBillingPage = function () {
			//StateManager.clearQuery("page");
			StateManager.setQuery({page: "billing"});
		};
	}
}());
