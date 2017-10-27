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
	
	AccountLicensesCtrl.$inject = ["$scope", "APIService", "StateManager", "DialogService"];
	function AccountLicensesCtrl($scope, APIService, StateManager, DialogService) {
		var vm = this;

		vm.$onInit = function() {
			vm.promise = null;
			vm.jobs = [];
			APIService.get(vm.account + "/subscriptions")
				.then(function(response){
					vm.subscriptions = response.data;
					vm.initSubscriptions();
				})
				.catch(function(error){
					vm.handleError("retrieve", "subscriptions", error);
				});
			
			APIService.get(vm.account + "/jobs")
				.then(function(response){
					vm.jobs = response.data;
				})
				.catch(function(error){
					vm.handleError("retrieve", "jobs", error);
				});

			vm.jobColors = [
				"#a6cee3",
				"#1f78b4",
				"#213f99",
				"#b2df8a",
				"#33a02c",
				"#fb9a99",
				"#e31a1c",
				"#fdbf6f",
				"#ff7f00",
				"#e3bd1a",
				"#ffff99",
				"#b15928",
				"#cab2d6",
				"#6a3d9a"
			];

		};

		vm.initSubscriptions = function() {
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
		};

		/*
		 * Watch changes to the new license assignee name
		 */
		$scope.$watch("vm.newLicenseAssignee", function (newValue) {
			vm.addDisabled = !(angular.isDefined(newValue) && (newValue.toString() !== ""));
		});

		vm.updateJob = function(job) {

			var url = vm.account + "/jobs/" + job._id;

			APIService.put(url, job)
				.then(function(response){
					if (response.status !== 200) {
						throw(response);
					}
				})
				.catch(function(error){
					vm.handleError("update", "job", error);
				});
		};

		vm.assignJob = function(index){
			var licence = vm.licenses[index];
			
			var url = vm.account + "/subscriptions/" + licence.id + "/assign";

			APIService.put(url, {job: licence.job})
				.then(function(response){
					if (response.status !== 200) {
						throw(response);
					}
				})
				.catch(function(error){
					vm.handleError("assign", "job", error);
				});
		};

		vm.addJob = function(){

			var job = { _id: vm.newJob };
			vm.addJobMessage = null;

			APIService.post(vm.account + "/jobs", job)
				.then(function(response){
					if (response.status !== 200) {
						throw(response);
					} else {
						vm.jobs.push(job);
					}
				})
				.catch(function(error){
					vm.handleError("add", "job", error);
				});
		};

		vm.removeJob = function(index){

			vm.deleteJobMessage = null;
			var url = vm.account + "/jobs/" + vm.jobs[index]._id;
			APIService.delete(url, null)
				.then(function(response){
					if (response.status !== 200) {
						throw(response);
					} else {
						vm.jobs.splice(index, 1);
					}
				})
				.catch(function(error){
					vm.handleError("remove", "job", error);
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
				)
					.then(function (response) {
						if (response.status === 200) {
							vm.addMessage = "User " + vm.newLicenseAssignee + " assigned a license";
							vm.licenses.push({user: response.data.assignedUser, id: response.data._id, showRemove: true});
							vm.unassigned.splice(0, 1);
							vm.allLicensesAssigned = (vm.unassigned.length === 0);
							vm.numLicensesAssigned = vm.numLicenses - vm.unassigned.length;
							vm.addDisabled = vm.allLicensesAssigned;
							vm.newLicenseAssignee = "";
						} else if (response.status === 400) {
							throw(response);
						}
					})
					.catch(function(error){
						vm.handleError("assign", "licence", error);
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
					} 
				})
				.catch(function(error){

					if (error.status === 400) {
						var responseCode = APIService.getResponseCode("USER_IN_COLLABORATOR_LIST");
						if (error.data.value === responseCode) {
							vm.licenseAssigneeIndex = index;
							vm.models = error.data.models;
							vm.projects = error.data.projects;
							if(error.data.teamspace){
								vm.teamspacePerms = error.data.teamspace.permissions.join(", ");
							}
							
							DialogService.showDialog("remove-license-dialog.html", $scope);
						}
					} else {
						vm.handleError("remove", "licence", error);
					}
					
				});
		};

		vm.capitalizeFirstLetter = function(string) {
			return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
		};

		vm.handleError = function(action, type, error){
			var content = "Something went wrong trying to " + action + " the " + type + ". " +
			"If this continues please message support@3drepo.io.";
			var escapable = true;
			var title = "Error";
			DialogService.text(title, content, escapable);
			console.error("Something went wrong trying to " + action + " the " + type + ": ", error);
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
						DialogService.closeDialog();
					}
				})
				.catch(function(error){
					vm.handleError("remove", "licence", error);
				});
		};

		vm.goToBillingPage = function () {
			//StateManager.clearQuery("page");
			StateManager.setQuery({page: "billing"});
		};
	}
}());
