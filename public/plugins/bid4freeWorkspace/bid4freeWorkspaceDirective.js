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

	Bid4freeWorkspaceCtrl.$inject = ["$location", "BidService"];

	function Bid4freeWorkspaceCtrl($location, BidService) {
		var vm = this,
			promise, tcPromise;

		vm.sections = [];
		vm.sectionType = "keyvalue";

		promise = BidService.getUserBid($location.search().package);
		promise.then(function (response) {
			vm.title = response.data.packageName;
		});

		tcPromise = BidService.getTermsAndConditions($location.search().package);
		tcPromise.then(function (response) {
			var i, length;
			console.log(response);
			vm.sections = response.data;
			for (i = 0, length = vm.sections.length; i < length; i += 1) {
				vm.sections[i].showInput = false;
			}
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
		};

		vm.toggleItemInput = function (index) {
			vm.sections[index].showInput = !vm.sections[index].showInput;
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
				/*
				if (vm.sections[sectionIndex].items[0].type === "keyvalue") {
				}
				else if (vm.sections[sectionIndex].type === "table") {
					vm.sections[sectionIndex].items.push({key: "", description: ""});
				}
				*/
			}
		};

		/**
		 * Save to database
		 */
		vm.save = function () {
			promise = BidService.updateTermsAndConditions($location.search().package, vm.sections);
			promise.then(function (response) {
				console.log(response);
			});
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
