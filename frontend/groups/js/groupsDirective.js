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
		.directive("groups", groups);

	function groups() {
		return {
			restrict: 'EA',
			templateUrl: 'groups.html',
			scope: {
				show: "=",
				showAdd: "=",
				canAdd: "=",
				onContentHeightRequest: "&",
				onShowItem : "&",
				hideItem: "="
			},
			controller: GroupsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	GroupsCtrl.$inject = ["$scope", "EventService"];

	function GroupsCtrl ($scope, EventService) {
		var vm = this,
			eventWatch = null;
		
		/*
		 * Init
		 */
		vm.toShow = "showGroups";
		vm.saveDisabled = true;
		vm.canAdd = true;
		vm.selectedGroup = null;
		vm.editingGroup = false;
		vm.editingText = "Start";
		vm.groups = [
			{name: "Doors", colour: [255, 0, 0]},
			{name: "Toilets", colour: [0, 255, 0]},
			{name: "Windows", colour: [0, 0, 255]}
		];
		setContentHeight();

		/*
		 * Handle showing of adding a new issue
		 */
		$scope.$watch("vm.showAdd", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				vm.toShow = "showAdd";
				vm.onShowItem();
				vm.canAdd = false;
				vm.selectedGroup = null;
				vm.name = "";
				setContentHeight();
			}
		});

		/*
		 * Handle parent notice to hide a selected group or add group
		 */
		$scope.$watch("vm.hideItem", function (newValue) {
			if (angular.isDefined(newValue) && newValue) {
				vm.toShow = "showGroups";
				vm.showAdd = false;
				vm.canAdd = true;
				vm.selectedGroup = null;
				setContentHeight();
			}
		});

		/*
		 * Save button disabled when no name is input
		 */
		$scope.$watch("vm.name", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.saveDisabled = (angular.isUndefined(newValue) || (newValue.toString() === ""));
			}
		});

		/*
		 * Toggle editing of group
		 */
		$scope.$watch("vm.editingGroup", function (newValue) {
			if (angular.isDefined(newValue)) {
				vm.editingText = newValue ? "Stop" : "Start";
			}
		});


		/*
		 * Only watch for events when shown
		 */
		$scope.$watch("vm.show", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (newValue) {
					setupEventWatch();
				}
				else if (angular.isDefined(eventWatch)) {
					eventWatch(); // Cancel event watching
				}
			}
		});

		/**
		 * Show the group details and highlight the group objects
		 *
		 * @param index
		 */
		vm.showGroup = function (index) {
			vm.selectedGroup = vm.groups[index];
			vm.toShow = "showGroup";
			vm.onShowItem();
			vm.canAdd = false;
			vm.editingGroup = false;
			setContentHeight();
		};

		/**
		 * Callback to get the colour picker colour
		 * 
		 * @param colour
		 */
		vm.colourPickerChange = function (colour) {
			vm.colourPickerColour = colour;
			if (vm.selectedGroup !== null) {
				vm.selectedGroup.colour = colour;
			}
		};

		/**
		 * Convert colour array to rgb string
		 * 
		 * @param {Array} colour
		 * @returns {string}
		 */
		vm.colourToString = function (colour) {
			return "rgb(" + colour.join(",") + ")";
		};

		/**
		 * Delete the selected group
		 */
		vm.deleteGroup = function () {
			var i, length;

			for (i = 0, length = vm.groups.length; i < length; i += 1) {
				if (vm.groups[i].name === vm.selectedGroup.name) {
					vm.groups.splice(i, 1);
					vm.selectedGroup = null;
					vm.toShow = "showGroups";
					vm.canAdd = true;
					setContentHeight();
					break;
				}
			}
		};

		/**
		 * Save a group
		 */
		vm.saveGroup = function () {
			var i, length, nameExists = false;

			// Cannot have groups with duplicate names
			for (i = 0, length = vm.groups.length; i < length; i += 1) {
				if (vm.groups[i].name === vm.name) {
					nameExists = true;
					break;
				}
			}

			if (!nameExists) {
				vm.groups.push({
					name: vm.name,
					colour: vm.colourPickerColour
				});
				vm.selectedGroup = null;
				vm.toShow = "showGroups";
				vm.canAdd = true;
				vm.showAdd = false;
				setContentHeight();
			}
		};

		/**
		 * Set the height of the content
		 */
		function setContentHeight () {
			var contentHeight = 0,
				groupHeaderHeight = 60, // It could be higher for items with long text but ignore that
				baseGroupHeight = 260,
				addHeight = 250;

			switch (vm.toShow) {
				case "showGroups":
					angular.forEach(vm.groups, function() {
						contentHeight += groupHeaderHeight;
					});
					break;
				case "showGroup":
					contentHeight = baseGroupHeight;
					break;
				case "showAdd":
					contentHeight = addHeight;
					break;
			}

			vm.onContentHeightRequest({height: contentHeight});
		}

		/**
		 * Set up event watching
		 */
		function setupEventWatch () {
			eventWatch = $scope.$watch(EventService.currentEvent, function (event) {
				console.log("Groups:", event);
				if (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) {
					console.log(event.value);
				}
			});
		}
	}
}());
