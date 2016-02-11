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
		.directive("bid4freeWorkspace", bid4freeWorkspace);

	function bid4freeWorkspace() {
		return {
			restrict: 'E',
			templateUrl: 'bid4freeWorkspace.html',
			scope: {},
			controller: Bid4freeWorkspaceCtrl,
			controllerAs: "vm",
			bindToController: true
		};
	}

	Bid4freeWorkspaceCtrl.$inject = ["$scope", "$location", "BidService", "StateManager"];

	function Bid4freeWorkspaceCtrl($scope, $location, BidService, StateManager) {
		var vm = this,
			promise, tcPromise,
			locationSearch = $location.search();

		vm.sections = [];
		vm.sectionType = "keyvalue";
		vm.showSaveConfirmation = false;
		if (angular.isDefined(BidService.boq)) {
			vm.boq = BidService.boq;
			setBoqTotal();
		}
		else {
			vm.boq = [
				{type: "Single-Flush: 800 x 2100", code: 3, quantity: 7},
				{type: "Pocket_Slider_Door_5851: 2.027 x 0.945", code: 51, quantity: 3},
				{type: "Entrance door: Entrance door", code: 60, quantity: 2},
				{type: "M_Double-Flush: 1730 x 2134mm", code: 65, quantity: 1},
				{type: "Curtain Wall Dbl Glass: Curtain Wall Dbl Glass", code: 68, quantity: 3}
			];
			BidService.boq = vm.boq;
		}

		// Get the user's bid information for the package
		promise = BidService.getUserBid($location.search().package);
		promise.then(function (response) {
			vm.title = StateManager.state.project + " / " + response.data.packageName;
		});

		// Get Terms and Conditions
		tcPromise = BidService.getTermsAndConditions($location.search().package);
		tcPromise.then(function (response) {
			var i, length;
			vm.sections = response.data;
			for (i = 0, length = vm.sections.length; i < length; i += 1) {
				vm.sections[i].showInput = false;
			}
		});

		// Select the correct tab
		vm.selectedTab = $location.search().tab;

		// Todo - find a way to change the URL without loading the page
		$scope.$watch("vm.selectedTab", function (newValue) {
			// Need to find
			/*
			locationSearch.tab = newValue;
			$location.search(locationSearch);
			*/
		});

		/**
		 * Add a section
		 */
		vm.addSection = function () {
			vm.sections.push(
				{
					block: vm.sectionTitle,
					items: []
				}
			);
			vm.showSaveConfirmation = false;
		};

		/**
		 * Toggle new item input (clear the fields if toggled off)
		 * @param index
		 */
		vm.toggleItemInput = function (index) {
			vm.sections[index].showInput = !vm.sections[index].showInput;
			if (!vm.sections[index].showInput) {
				vm.sections[index].newItemName = undefined;
				vm.sections[index].newItemDescription = undefined;
			}
			vm.showSaveConfirmation = false;
		};

		/**
		 * Add an item to a section
		 * @param sectionIndex
		 */
		vm.addItem = function (sectionIndex) {
			if (angular.isDefined(vm.sections[sectionIndex].newItemName) && angular.isDefined(vm.sections[sectionIndex].newItemDescription)) {
				vm.sections[sectionIndex].items.push(
					{
						type: "keyvalue",
						keys: [
							{
								name: vm.sections[sectionIndex].newItemName,
								datatype: "string",
								control: "text"
							}
						],
						values: [
							vm.sections[sectionIndex].newItemDescription
						]
					}
				);
				vm.sections[sectionIndex].newItemName = undefined;
				vm.sections[sectionIndex].newItemDescription = undefined;
				vm.sections[sectionIndex].showInput = false;
			}
		};

		/**
		 * Save to database
		 */
		vm.save = function () {
			promise = BidService.updateTermsAndConditions($location.search().package, vm.sections);
			promise.then(function (response) {
				vm.showSaveConfirmation = true;
			});
		};

		/**
		 * Handle rate change of BoQ item
		 * @param index
		 */
		vm.boqRateChange = function (index) {
			vm.boq[index].price = parseFloat(parseFloat(vm.boq[index].quantity) * parseFloat(vm.boq[index].rate)).toFixed(2);
			setBoqTotal();
		};

		function setBoqTotal () {
			var i, length, total = 0;
			for (i = 0, length = vm.boq.length; i < length; i += 1) {
				if (angular.isDefined(vm.boq[i].price)) {
					total += parseFloat(vm.boq[i].price);
				}
			}
			vm.boqTotal = total.toFixed(2);
			BidService.boqTotal = vm.boqTotal;
		};

		/**
		 * Go to the main Bid4Free page
		 */
		vm.goToMainPage = function () {
			$location
				.path(StateManager.state.account + "/" + StateManager.state.project + "/bid4free", "_self")
				.search({package: $location.search().package});
		};

		vm.init = function () {
			vm.data = [
				{
					block: "Instruction to SC",
					items: [
						{
							type: "keyvalue",
							keys: [
								{
									name: "Test",
									datatype: "string",
									control: "text"
								}
							],
							values: [
								"Test description"
							]
						}
					]
				}
			];
			promise = BidService.updateTermsAndConditions($location.search().package, vm.data);
			promise.then(function (response) {
				console.log(response);
			});
		};
	}
}());
