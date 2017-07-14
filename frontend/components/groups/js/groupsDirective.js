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
		.component("groups", groups);

	function groups() {
		return {
			restrict: 'EA',
			templateUrl: 'groups.html',
			bindings: {
				account: "=",
				model: "=",
				show: "=",
				showAdd: "=",
				showEdit: "=",
				canAdd: "=",
				onContentHeightRequest: "&",
				onShowItem : "&",
				hideItem: "=",
				selectedMenuOption: "="

			},
			controller: GroupsCtrl,
			controllerAs: 'vm'
		};
	}

	GroupsCtrl.$inject = ["$scope", "$timeout", "EventService", "GroupsService"];

	function GroupsCtrl ($scope, $timeout, EventService, GroupsService) {
		var vm = this,
			eventWatch,
			promise,
			colourChangeTimeout = null,
			hideAll = false;
		
		/*
		 * Init
		 */
		vm.$onInit = function() {
			
			vm.saveDisabled = true;
			vm.canAdd = true;
			vm.selectedGroup = null;
			vm.editingGroup = false;
			vm.editingText = "Start";
			vm.colourPickerColour = [255, 255, 255];
			vm.toShow = "showLoading";
			vm.loadingInfo = "Loading groups";
			setContentHeight();
			GroupsService.init(vm.account, vm.model);

			promise = GroupsService.getGroups();
			promise.then(function (data) {
				vm.groups = data.data;
				if (vm.groups.length > 0) {
					vm.toShow = "showGroups";
				}
				else {
					vm.toShow = "showInfo";
				}
				setContentHeight();
			});

		}

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
				if (vm.groups.length > 0) {
					vm.toShow = "showGroups";
				}
				else {
					vm.toShow = "showInfo";
				}
				vm.showAdd = false; // So that showing add works
				vm.canAdd = true;
				vm.showEdit = false; // So that closing edit works
				setContentHeight();
				setSelectedGroupHighlightStatus(false);
				vm.selectedGroup = null;
				doHideAll(hideAll);
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
				if (newValue) {
					setupEventWatch();
				} else if (angular.isDefined(eventWatch)) {
					eventWatch(); // Cancel event watching
				}
			}
		});

		/*
		 * Only watch for events when shown
		 */
		$scope.$watch("vm.show", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (!newValue) {
					vm.editingGroup = false; // To stop any event watching
					hideAll = false;
					vm.toShow ="showGroups";
					doHideAll(hideAll);
				}
			}
		});

		/*
		 * Watch showing of selected group's objects
		 */
		$scope.$watch("vm.showObjects", function (newValue) {
			if (angular.isDefined(newValue) && (vm.selectedGroup !== null)) {
				setGroupsVisibleStatus([vm.selectedGroup], newValue);
			}
		});

		/*
		 * Selecting a menu option
		 */
		$scope.$watch("vm.selectedMenuOption", function (newValue) {
			if (angular.isDefined(newValue)) {
				if (newValue.value === "hideAll") {
					hideAll = !hideAll;
					doHideAll(hideAll);
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
			vm.showObjects = true;
			vm.showEdit = true;
			setContentHeight();
			doHideAll(hideAll);
			setSelectedGroupHighlightStatus(true);
		};

		/**
		 * Callback to get the colour picker colour
		 *
		 * @param colour
		 */
		vm.colourPickerChange = function (colour) {
			vm.colourPickerColour = colour;
			if (vm.selectedGroup !== null) {
				if (colourChangeTimeout !== null) {
					$timeout.cancel(colourChangeTimeout);
				}
				colourChangeTimeout = $timeout(function() {
					vm.selectedGroup.color = colour;
					promise = GroupsService.updateGroup(vm.selectedGroup);
					promise.then(function (data) {
						setSelectedGroupHighlightStatus(true);
					});
				}, 500);
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
					promise = GroupsService.deleteGroup(vm.selectedGroup._id);
					promise.then(function (data) {
						if (data.statusText === "OK") {
							vm.groups.splice(i, 1);
							vm.selectedGroup = null;
							if (vm.groups.length > 0) {
								vm.toShow = "showGroups";
							} else {
								vm.toShow = "showInfo";
							}
							vm.canAdd = true;
							setContentHeight();
						}
					});
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
				promise = GroupsService.createGroup(vm.name, vm.colourPickerColour);
				promise.then(function (data) {
					if (data.statusText === "OK") {
						vm.groups.push(data.data);
						vm.selectedGroup = null;
						vm.toShow = "showGroups";
						vm.canAdd = true;
						vm.showAdd = false;
						setContentHeight();
					}
				});
			}
		};

		/**
		 * Set the height of the content
		 */
		function setContentHeight () {
			var contentHeight = 0,
				groupHeaderHeight = 56, // It could be higher for items with long text but ignore that
				baseGroupHeight = 210,
				addHeight = 250,
				infoHeight = 80,
				loadingHeight = 80;

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

				case "showInfo":
					contentHeight = infoHeight;
					break;

				case "showLoading":
					contentHeight = loadingHeight;
					break;
			}

			vm.onContentHeightRequest({height: contentHeight});
		}

		/**
		 * Set up event watching
		 */
		function setupEventWatch () {
			var index;

			eventWatch = $scope.$watch(EventService.currentEvent, function (event) {
				if (event.type === EventService.EVENT.VIEWER.OBJECT_SELECTED) {
					index = vm.selectedGroup.objects.indexOf(event.value.id);
					if (index !== -1) {
						vm.selectedGroup.objects.splice(index, 1);
					} else {
						vm.selectedGroup.objects.push(event.value.id);
					}

					promise = GroupsService.updateGroup(vm.selectedGroup);
					promise.then(function (data) {
						setSelectedGroupHighlightStatus(true);
					});
				}
			});
		}

		/**
		 * Set the highlight status of the selected group in its colour
		 *
		 * @param {Boolean} highlight
		 */
		function setSelectedGroupHighlightStatus (highlight) {
			var data;
			if ((vm.selectedGroup !== null) && (vm.selectedGroup.objects.length > 0)) {
				data = {
					source: "tree",
					account: vm.account,
					model: vm.model
				};
				if (highlight) {
					data.ids = vm.selectedGroup.objects;
					data.colour = vm.selectedGroup.color.map(function(item) {return (item / 255.0);}).join(" ");
				}
				else {
					data.ids = [];
				}
				EventService.send(EventService.EVENT.VIEWER.HIGHLIGHT_OBJECTS, data);
			}
		}

		/**
		 * Set the visible status of the selected group in its colour
		 *
		 * @param {Array} groups
		 * @param {Boolean} visible
		 */
		function setGroupsVisibleStatus (groups, visible) {
			var i, length,
				data,
				ids = [];

			// Get all the object IDs
			for (i = 0, length = groups.length; i < length; i += 1) {
				if (groups[i].objects.length > 0) {
					ids = ids.concat(groups[i].objects);
				}
			}

			if (ids.length > 0) {
				data = {
					source: "tree",
					account: vm.account,
					model: vm.model,
					ids: ids,
					visible: visible
				};
				EventService.send(EventService.EVENT.VIEWER.SWITCH_OBJECT_VISIBILITY, data);
			}
		}

		/**
		 * "Hide All" when showing groups should hide all the groups
		 * "Hide All" when showing a group should hide all groups except the selected group
		 *
		 * @param {Boolean} hideAllStatus
		 */
		function doHideAll (hideAllStatus) {
			var i, length, groups = [];
			if (vm.toShow === "showGroups") {
				setGroupsVisibleStatus(vm.groups, !hideAllStatus);
			}
			else if (vm.toShow === "showGroup") {
				for (i = 0, length = vm.groups.length; i < length; i += 1) {
					if (vm.groups[i]._id !== vm.selectedGroup._id) {
						groups.push(vm.groups[i]);
						setGroupsVisibleStatus(groups, !hideAll);
					}
					setGroupsVisibleStatus([vm.selectedGroup], true);
				}
			}
		}
	}
}());
