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
				issueId: "=",
				state:    "=",
				keysDown: "="
			},
			templateUrl: "project.html",
            controller: ProjectCtrl,
			controllerAs: "vm",
			bindToController: true
        };
    }

	ProjectCtrl.$inject = ["$timeout", "$scope", "$element", "$compile", "EventService", "ProjectService", "TreeService", "RevisionsService"];

	function ProjectCtrl($timeout, $scope, $element, $compile, EventService, ProjectService, TreeService, RevisionsService) {
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
		vm.pointerEvents = "inherit";

		// Warn when user click refresh
		var refreshHandler = function (e){
			var confirmationMessage = "This will reload the whole model, are you sure?";

			e.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
			return confirmationMessage;              // Gecko, WebKit, Chrome <34
		}

		window.addEventListener("beforeunload", refreshHandler);


		// create a fake state to prevent the back button
		history.pushState(null, null, document.URL);

		// popup when user click back button
		var popStateHandler = function () {
			// the fake state has already been popped by user at this moment

			if(confirm('It will go back to project listing page, are you sure?')){
				// pop one more state if user actually wants to go back
				history.go(-1);
			} else {
				// recreate a fake state
				history.pushState(null, null, document.URL);
			}
		};

		//listen for user clicking the back button
		window.addEventListener('popstate', popStateHandler);

		$scope.$on('$destroy', function(){
			window.removeEventListener("beforeunload", refreshHandler);
			window.removeEventListener('popstate', popStateHandler);
		});

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
					icon: "fa-print"
				},
				// {
				// 	value: "importBCF",
				// 	label: "Import BCF",
				// 	selected: false,
				// 	noToggle: true,
				// 	icon: "fa-cloud-upload"
				// },
				{
					value: "exportBCF",
					label: "Export BCF",
					selected: false,
					noToggle: true,
					icon: "fa-cloud-download",
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
				},
				{
					value: "showSubProjects",
					label: "Show sub project issues",
					toggle: true,
					selected: false,
					firstSelected: false,
					secondSelected: false,
				},{
					upperDivider: true,
					label: "Created by: "
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


				ProjectService.getProjectInfo(vm.account, vm.project).then(function (data) {
					vm.settings = data;

					var index = -1;

					if(!data.federate){
						panelCard.left[issuesCardIndex].menu.find(function(item, i){
							if(item.value === 'showSubProjects'){
								index = i;
							}

						});

						if(index !== -1){
							panelCard.left[issuesCardIndex].menu.splice(index, 1);
						}
					}

					EventService.send(EventService.EVENT.PROJECT_SETTINGS_READY, data);
				});

				RevisionsService.listAll(vm.account, vm.project).then(function(revisions){
					EventService.send(EventService.EVENT.REVISIONS_LIST_READY, revisions);
				});

				TreeService.init(vm.account, vm.project, vm.branch, vm.revision).then(function(data){
					vm.treeMap = TreeService.getMap(data.nodes);
					EventService.send(EventService.EVENT.TREE_READY, data);
				});
			}
		});


		$timeout(function () {
			EventService.send(EventService.EVENT.VIEWER.LOAD_PROJECT, {account: vm.account, project: vm.project, branch: vm.branch, revision: vm.revision });
			EventService.send(EventService.EVENT.PANEL_CONTENT_SETUP, panelCard);
		});

		$scope.$watch("vm.issueId", function(){
			if(vm.issueId){
				// timeout to make sure event is sent after issue panel card is setup
				$timeout(function () {
					EventService.send(EventService.EVENT.SELECT_ISSUE, vm.issueId);
				});
			}
		});


		/*
		 * Watch for events
		 */
		$scope.$watch(EventService.currentEvent, function (event) {
			var element;

			vm.event = event;

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
				vm.pointerEvents = event.value.on ? "none" : "inherit";
			} else if (event.type === EventService.EVENT.MEASURE_MODE) {
				if (event.value) {
					// Create measure display
					element = angular.element("<tdr-measure id='tdrMeasure' account='vm.account' project='vm.project' settings='vm.settings' ></tdr-measure>");
					angular.element($element[0].querySelector("#project")).append(element);
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
		 * Get the current multi selection
		 * @param selectedObjects
		 */
		vm.setSelectedObjects = function (selectedObjects) {
			vm.selectedObjects = selectedObjects;
		};

		/**
		 * Initalise the list of selected objects
		 * @param data
		 */
		vm.setInitialSelectedObjects = function (data) {
			vm.initialSelectedObjects = data.selectedObjects;
			// Set the value to null so that it will be registered again
			$timeout(function () {
				vm.initialSelectedObjects = null;
			});
		};

		/**
		 * Send event
		 * @param type
		 * @param value
		 */
		vm.sendEvent = function (type, value) {
			EventService.send(type, value);
		};
	}
}());
