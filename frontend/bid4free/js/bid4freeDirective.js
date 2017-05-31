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
		.directive("bid4free", bid4free);

	function bid4free() {
		return {
			restrict: 'E',
			templateUrl: 'bid4free.html',
			scope: {
				account:  "=",
				model:  "=",
				branch:   "=",
				revision: "=",
				state:    "="
			},
			controller: Bid4FreeCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	Bid4FreeCtrl.$inject = ["$scope", "$element", "$timeout", "BidService", "modelService"];

	function Bid4FreeCtrl($scope, $element, $timeout, BidService, modelService) {
		var vm = this,
			promise, modelUserRolesPromise, modelSummaryPromise,
			currentSelectedPackageIndex;

		// Init view/model vars
		vm.invitedSubContractors = [];
		vm.addSubContractorDisabled = true;
		vm.responded = false;
		vm.packageSelected = false;
		vm.statusInfo = "No package currently selected";
		vm.savemodelSummaryDisabled = true;
		vm.savePackageDisabled = true;
		vm.showmodelSummaryInput = true;

		BidService.setAccountAndmodel(vm.account, vm.model);

		// Setup sub contractors
		vm.subContractors = [
			{user: "Pinakin"},
			{user: "Carmen"},
			{user: "Henry"},
			{user: "B4F_su8C0n_01"},
			{user: "B4F_su8C0n_02"},
			{user: "B4F_su8C0n_03"},
			{user: "B4F_su8C0n_04"},
			{user: "B4F_su8C0n_05"},
			{user: "B4F_su8C0n_06"},
			{user: "B4F_su8C0n_07"},
			{user: "B4F_su8C0n_08"},
			{user: "B4F_su8C0n_09"},
			{user: "B4F_su8C0n_10"},
			{user: "B4F_su8C0n_11"},
			{user: "B4F_su8C0n_12"},
			{user: "B4F_su8C0n_13"},
			{user: "B4F_su8C0n_14"},
			{user: "B4F_su8C0n_15"}
		];
		vm.notInvitedSubContractors = JSON.parse(JSON.stringify(vm.subContractors));

		// Setup the model summary defaults
		vm.modelSummary = {
			site: {label: "Site", type: "input", inputType: "text", value: undefined},
			code: {label: "Code", type: "input", inputType: "text", value: undefined},
			client: {label: "Client", type: "input", inputType: "text", value: undefined},
			budget: {label: "Budget", type: "input", inputType: "number", value: undefined},
			contact: {label: "Contact", type: "input", inputType: "text", value: undefined},
			completedBy: {label: "Completed by", type: "date", value: undefined}
		};

		// Setup the package summary defaults
		vm.packageSummary = {
			name: {label: "Name", type: "input", inputType: "text", value: undefined},
			site: {label: "Site", type: "input", inputType: "text", value: undefined},
			code: {label: "Code", type: "input", inputType: "text", value: undefined},
			budget: {label: "Budget", type: "input", inputType: "number", value: undefined},
			area: {label: "Area", type: "input", inputType: "text", value: undefined},
			contact: {label: "Contact", type: "input", inputType: "text", value: undefined},
			completedBy: {label: "Completed by", type: "date", value: undefined}
		};

		// Get the model summary
		modelSummaryPromise = modelService.getmodelSummary();
		modelSummaryPromise.then(function (response) {
			console.log(response);
			if ((response.hasOwnProperty("data")) && !((response.data === null) || (response.data === ""))) {
				vm.showmodelSummaryInput = false;
				vm.modelSummary.name = {value: response.data.name};
				vm.modelSummary.site.value = response.data.site;
				vm.modelSummary.code.value = response.data.code;
				vm.modelSummary.client.value = response.data.client;
				vm.modelSummary.budget.value = response.data.budget;
				vm.modelSummary.completedByPretty = prettyDate(new Date(response.data.completedBy));
			}
		});

		// Get type of role
		modelUserRolesPromise = modelService.getUserRolesFormodel();
		modelUserRolesPromise.then(function (data) {
			var i, length;
			vm.userIsASubContractor = false;
			for (i = 0, length = data.length; i < length; i += 1) {
				if (data[i] === "SubContractor") {
					vm.userIsASubContractor = true;
					break;
				}
			}
			vm.userIsAMainContractor = !vm.userIsASubContractor;
			if (vm.userIsAMainContractor) {
				vm.listTitle = "Packages";
				// Get all packages for model
				promise = BidService.getPackage();
				promise.then(function (response) {
					console.log(response);
					var i, length;
					vm.packages = response.data;
					if (vm.packages.length === 0) {
						vm.summaryInfo = "There are no packages for this model";
						vm.statusInfo = "There are no packages for this model";
					}
					else {
						vm.summaryInfo = "No packages currently selected";
						vm.statusInfo = "No packages currently selected";
						for (i = 0, length = vm.packages.length; i < length; i += 1) {
							vm.packages[i].completedByPretty = prettyDate(new Date(vm.packages[i].completedBy));
							vm.packages[i].selected = false;
						}

						vm.fileUploadAction = "/api/" + vm.account + "/" + vm.model + "/packages/" +  vm.packages[0].name + "/attachments";
					}
				});
			}
		});

		$scope.$watch("vm.subContractorUser", function (newValue) {
			vm.addSubContractorDisabled = !angular.isDefined(newValue);
		});

		$scope.$watch("vm.modelSummary", function (newValue, oldValue) {
			var input;
			if (angular.isDefined(newValue)) {
				if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
					vm.savemodelSummaryDisabled = false;
					for (input in vm.modelSummary) {
						if (vm.modelSummary.hasOwnProperty(input) && (angular.isUndefined(vm.modelSummary[input].value))) {
							vm.savemodelSummaryDisabled = true;
							break;
						}
					}
				}
			}
		}, true);

		$scope.$watch("vm.packageSummary", function (newValue, oldValue) {
			var input;
			if (angular.isDefined(newValue)) {
				if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
					vm.savePackageDisabled = false;
					for (input in vm.packageSummary) {
						if (vm.packageSummary.hasOwnProperty(input) && (angular.isUndefined(vm.packageSummary[input].value))) {
							vm.savePackageDisabled = true;
							break;
						}
					}
					vm.showInfo = false;
				}
			}
		}, true);

		/**
		 * Save the model summary
		 */
		vm.savemodelSummary = function () {
			var data = {}, input;
			for (input in vm.modelSummary) {
				if (vm.modelSummary.hasOwnProperty(input)) {
					data[input] = vm.modelSummary[input].value;
				}
			}
			vm.savemodelSummaryDisabled = true;
			vm.showmodelSummaryInput = false;
			promise = modelService.createmodelSummary(data);
			promise.then(function (response) {
				console.log(response);
				vm.modelSummary.name = {value: response.data.name};
				vm.modelSummary.completedByPretty = prettyDate(new Date(response.data.completedBy));
			});
		};

		/**
		 * Save a package
		 */
		vm.savePackage = function () {
			var data = {}, input;
			// Setup data to be saved
			for (input in vm.packageSummary) {
				if (vm.packageSummary.hasOwnProperty(input)) {
					data[input] = vm.packageSummary[input].value;
				}
			}
			// Save data
			promise = BidService.addPackage(data);
			promise.then(function (response) {
				vm.showInfo = true;
				vm.savePackageDisabled = (response.statusText === "OK");
				if (vm.savePackageDisabled) {
					data.completedByPretty = prettyDate(new Date(data.completedBy));
					vm.packages.push(data);
					vm.info = "Package " + vm.packageSummary.name.value + " saved";
				}
				else {
					vm.info = "Error saving package " + vm.name;
				}
			});
		};

		/**
		 * Invite a sub contractor to bid for a package
		 */
		vm.inviteSubContractor = function () {
			var i, length, index;
			for (i = 0, length = vm.notInvitedSubContractors.length; i < length; i += 1) {
				if (vm.subContractorUser === vm.notInvitedSubContractors[i].user) {
					index = i;
					break;
				}
			}
			var data = {
				user: vm.notInvitedSubContractors[index].user
			};
			promise = BidService.inviteSubContractor(vm.selectedPackage.name, data);
			promise.then(function (response) {
				if (response.statusText === "OK") {
					vm.subContractorsInvited = true;
					//vm.notInvitedSubContractors[index].accepted = null;
					vm.invitedSubContractors.push(vm.notInvitedSubContractors[index]);
					vm.invitedSubContractors[vm.invitedSubContractors.length - 1].invitedIcon = "fa fa-circle-thin";
					vm.notInvitedSubContractors.splice(index, 1);
					vm.subContractor = undefined;
				}
			});
		};

		/**
		 * Award a package to a sub contractor
		 * @param index
		 */
		vm.awardToSubContractor = function (index) {
			var i, length;
			promise = BidService.awardBid(vm.selectedPackage.name, vm.invitedSubContractors[index]._id);
			promise.then(function (response) {
				if (response.statusText === "OK") {
					vm.awarded = true;
					vm.inviteTitle = "Status";
					vm.invitedSubContractors[index].accepted = true;
					for (i = 0, length = vm.invitedSubContractors.length; i < length; i += 1) {
						if (vm.invitedSubContractors[i].accepted) {
							vm.invitedSubContractors[i].invitedIcon = (i === index) ? getStatusIcon("won") : getStatusIcon("lost");
							//vm.invitedSubContractors[i].accepted = false;
						}
					}
				}
			});
		};

		/**
		 * Show package summary and status
		 * @param index
		 */
		vm.showPackage = function (index) {
			var i, j, lengthI, lengthJ;
			vm.showInput = false;
			vm.showSummary = true;
			vm.showFileUploadedInfo = false;
			vm.packageNotAwarded = true;
			vm.subContractorUser = undefined;
			vm.showInfo = false;
			vm.selectedPackage = vm.packages[index];
			console.log(vm.selectedPackage);
			$timeout(function () {
				setupFileUploader(); // timeout needed for uploader button to be available in in DOM
			}, 500);
			promise = BidService.getBids(vm.selectedPackage.name);
			promise.then(function (response) {
				if (response.statusText === "OK") {
					vm.packageSelected = true;

					if (angular.isDefined(currentSelectedPackageIndex)) {
						vm.packages[currentSelectedPackageIndex].selected = false;
					}
					vm.packages[index].selected = true;
					currentSelectedPackageIndex = index;

					vm.awarded = false;
					vm.inviteTitle = "Invite";
					vm.notInvitedSubContractors = JSON.parse(JSON.stringify(vm.subContractors));
					vm.invitedSubContractors = response.data;
					console.log(vm.invitedSubContractors);
					vm.subContractorsInvited = (vm.invitedSubContractors.length > 0);
					for (i = 0, lengthI = vm.invitedSubContractors.length; i < lengthI; i += 1) {

						// Show the correct status for an invited sub contractor
						if (vm.invitedSubContractors[i].accepted === null) {
							vm.invitedSubContractors[i].invitedIcon = getStatusIcon("invited");
						}
						else {
							if (vm.invitedSubContractors[i].awarded === null) {
								vm.invitedSubContractors[i].invitedIcon = getStatusIcon("accepted");
							}
							else if (vm.invitedSubContractors[i].awarded) {
								vm.awarded = true;
								vm.inviteTitle = "Status";
								vm.packageNotAwarded = false;
								vm.invitedSubContractors[i].invitedIcon = getStatusIcon("won");
							}
							else {
								vm.invitedSubContractors[i].invitedIcon = getStatusIcon("lost");
							}
						}

						// Set up the not invited sub contractors list
						for (j = 0, lengthJ = vm.notInvitedSubContractors.length; j < lengthJ; j += 1) {
							if (vm.notInvitedSubContractors[j].user === vm.invitedSubContractors[i].user) {
								vm.notInvitedSubContractors.splice(j, 1);
								break;
							}
						}
					}
				}
			});
		};

		/**
		 * Show inputs to add a package
		 */
		vm.setupAddPackage = function () {
			vm.packageSelected = true; // Cheat :-)
			vm.showInput = true;
			vm.showSummary = false;
		};

		/**
		 * Select a package
		 * @param packageName
		 */
		vm.selectPackage = function (packageName) {
			vm.selectedPackageName = packageName;
		};

		/**
		 * Package invite has been accepted by a sub contractor
		 */
		vm.inviteAccepted = function () {
			vm.packageInviteAccepted = true;
		};

		/**
		 * Convert a date to a readable version
		 * @param date
		 * @returns {string}
		 */
		function prettyDate (date) {
			return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
		}

		function getStatusIcon (status) {
			var icon = "";
			if (status === "won") {
				icon = "fa fa-check md-accent";
			}
			else if (status === "lost") {
				icon = "fa fa-remove md-warn";
			}
			else if (status === "accepted") {
				icon = "fa fa-check";
			}
			else if (status === "declined") {
				icon = "fa fa-remove";
			}
			else if (status === "invited") {
				icon = "fa fa-circle-thin";
			}
			return icon;
		}

		function setupFileUploader () {
			var fileUploader = $element[0].querySelector("#fileUploader");
			if (fileUploader !== null) {
				fileUploader.addEventListener(
					"change",
					function () {
						var files = this.files;
						promise = BidService.saveFiles(vm.packages[0].name, files);
						promise.then(function (response) {
							console.log(response);
							vm.showFileUploadedInfo = true;
							vm.uploadedFilename = response.data[0].filename;
						});
					},
					false);
			}
		}
	}
}());
