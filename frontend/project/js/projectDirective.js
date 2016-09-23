/**
 *	Copyright (C) 2014 3D Repo Ltd
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
	.directive("project", project);

    function project() {
        return {
            restrict: "E",
            scope: {
				account:  "=",
				project:  "=",
				branch:   "=",
				revision: "=",
				state:    "="
			},
			templateUrl: "project.html",
            controller: ProjectCtrl,
			controllerAs: "vm",
			bindToController: true
        };
    }

	ProjectCtrl.$inject = ["$timeout", "$scope", "$element", "$compile", "EventService", "ProjectService"];

	function ProjectCtrl($timeout, $scope, $element, $compile, EventService, ProjectService) {
		var vm = this, i, length,
			panelCard = {
				left: [],
				right: []
			},
			projectUI,
			issueArea,
			issuesCardIndex = 0;

		/*
		 * Init
		 */
		vm.pointerEvents = "auto";
		vm.keysDown = [];

		/*
		 * Get the project element
		 */
		$timeout(function () {
			projectUI = angular.element($element[0].querySelector('#projectUI'));
		});

		panelCard.left.push({
			type: "issues",
			title: "Issues",
			show: true,
			help: "List current issues",
			icon: "place",
			menu: [
				{
					value: "print",
					label: "Print",
					selected: false,
					noToggle: true,
					icon: "fa-print",
					divider: true
				},
				{
					value: "sortByDate",
					label: "Sort by Date",
					firstSelectedIcon: "fa-sort-amount-desc",
					secondSelectedIcon: "fa-sort-amount-asc",
					toggle: false,
					selected: true,
					firstSelected: true,
					secondSelected: false
				},
				{
					value: "showClosed",
					label: "Show resolved issues",
					toggle: true,
					selected: false,
					firstSelected: false,
					secondSelected: false
				}
			],
			minHeight: 260,
			fixedHeight: false,
			options: [
				{type: "menu", visible: true},
				{type: "filter", visible: true},
				{type: "pin", visible: false},
				{type: "erase", visible: false},
				{type: "scribble", visible: false}
			],
			add: true
		});

		 panelCard.left.push({
			 type: "tree",
			 title: "Tree",
			 show: false,
			 help: "Model elements shown in a tree structure",
			 icon: "device_hub",
			 minHeight: 80,
			 fixedHeight: false,
			 options: [
			 	{type: "filter", visible: true}
			 ]
		 });

		/*
		panelCard.left.push({
			type: "groups",
			title: "Groups",
			show: true,
			help: "groups of objects",
			icon: "view_comfy",
			minHeight: 80,
			fixedHeight: false,
			options: [
				{type: "menu", visible: true}
			],
			menu: [
				{
					value: "hideAll",
					label: "Hide Groups",
					selected: false,
					toggle: true
				}
			],
			add: true
		});
		*/

		panelCard.left.push({
			type: "clip",
			title: "Clip",
			show: false,
			help: "Clipping plane",
			icon: "crop_original",
			fixedHeight: true,
			options: [
				{type: "visible", visible: true}
			]
		});

		panelCard.right.push({
			type: "docs",
			title: "Data",
			show: false,
			help: "Documents",
			icon: "content_copy",
			minHeight: 80,
			fixedHeight: false,
			options: [
				{type: "close", visible: true}
			]
		});

		panelCard.right.push({
			type: "building",
			title: "Building",
			show: false,
			help: "Building",
			icon: "fa-cubes",
			fixedHeight: true,
			options: [
			]
		});


		$scope.$watchGroup(["vm.account","vm.project"], function()
		{
			if (angular.isDefined(vm.account) && angular.isDefined(vm.project)) {
				// Add filtering options for the Issues card menu
				/*
				ProjectService.getRoles(vm.account, vm.project).then(function (data) {
					for (i = 0, length = data.length; i < length; i += 1) {
						panelCard.left[issuesCardIndex].menu.push(
							{
								value: "filterRole_" + data[i].role,
								label: data[i].role,
								toggle: true,
								selected: true,
								firstSelected: false,
								secondSelected: false
							}
						);
					}
				});
				*/

				ProjectService.getProjectInfo(vm.account, vm.project).then(function (data) {
					vm.settings = data.settings;
					EventService.send(EventService.EVENT.PROJECT_SETTINGS_READY, {
						account: data.account,
						project: data.project,
						settings: data.settings
					});
				});
			}
		});

		$timeout(function () {
			EventService.send(EventService.EVENT.CREATE_VIEWER, {
				name: "default",
				account:  vm.account,
				project:  vm.project,
				branch:   vm.branch,
				revision: vm.revision,
				at:       StateManager.query.at,
				up:       StateManager.query.up,
				view:     StateManager.query.view
			});

			EventService.send(EventService.EVENT.PANEL_CONTENT_SETUP, panelCard);
		});

		/*
		 * Watch for events
		 */
		$scope.$watch(EventService.currentEvent, function (event) {
			var parent = angular.element($element[0].querySelector("#project")),
				element;

			if (event.type === EventService.EVENT.TOGGLE_ISSUE_AREA) {
				if (event.value.on) {
					issueArea = angular.element("<issue-area></issue-area>");
					if (event.value.hasOwnProperty("issue")) {
						vm.issueAreaIssue = event.value.issue;
						issueArea = angular.element("<issue-area data='vm.issueAreaIssue'></issue-area>");
					}
					else if (event.value.hasOwnProperty("type")) {
						vm.issueAreaType = event.value.type;
						issueArea = angular.element("<issue-area type='vm.issueAreaType'></issue-area>");
					}
					projectUI.prepend(issueArea);
					$compile(issueArea)($scope);
				}
				else {
					if (angular.isDefined(issueArea)) {
						issueArea.remove();
					}
				}
			}
			else if (event.type === EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING) {
				vm.pointerEvents = event.value.on ? "none" : "auto";
			} else if (event.type === EventService.EVENT.MEASURE_MODE) {
				if (event.value) {
					// Create measure display
					element = angular.element("<tdr-measure id='tdrMeasure' account='vm.account' project='vm.project' settings='vm.settings' ></tdr-measure>");
					parent.append(element);
					$compile(element)($scope);

				}
				else {
					// Remove measure display
					element = angular.element($element[0].querySelector("#tdrMeasure"));
					element.remove();
				}
			}
		});

		/**
		 * Keep a list of keys held down
		 * For changes to be registered by directives and especially components the list needs to be recreated
		 *
		 * @param event
		 */
		vm.keyAction = function (event) {
			var i;
			// Recreate list
			var tmp = vm.keysDown;
			delete vm.keysDown;
			vm.keysDown = angular.copy(tmp);

			// Update list, but avoid repeat
			if (event.type === "keydown") {
				if (vm.keysDown.indexOf(event.which) === -1) {
					vm.keysDown.push(event.which);
				}
			}
			else if (event.type === "keyup") {
				// Remove all instances of the key (multiple instances can happen if keyup wasn't registered)
				for (i = (vm.keysDown.length - 1); i >= 0; i -= 1) {
					if (vm.keysDown[i] === event.which) {
						vm.keysDown.splice(i, 1);
					}
				}
			}
		};
	}
}());
