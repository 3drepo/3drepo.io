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
			promise;

		vm.sections = [];
		vm.sectionType = "keyValue";

		promise = BidService.getUserBid($location.search().package);
		promise.then(function (response) {
			vm.title = response.data.packageName;
		});

		vm.addSection = function () {
			vm.sections.push({title: vm.sectionTitle, type: vm.sectionType, items: []});
		};

		vm.addItem = function (sectionIndex) {
			if (vm.sections[sectionIndex].type === "keyValue") {
				vm.sections[sectionIndex].items.push({key: "", description: ""});
			}
			else if (vm.sections[sectionIndex].type === "table") {
				vm.sections[sectionIndex].items.push({key: "", description: ""});
			}
		};
	}
}());
