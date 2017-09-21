/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the issuesList of the GNU Affero General Public License as
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
		.component("issuesList", {
			controller: IssuesListCtrl,
			controllerAs: "vm",
			templateUrl: "templates/issues-list.html",
			bindings: {
				account: "<",
				model: "<",
				allIssues: "<",
				treeMap: "<",
				filterText: "<",
				event: "<",
				onEditIssue: "&",
				onSelectIssue: "&",
				nonListSelect: "<",
				keysDown: "=",
				contentHeight: "&",
				menuOption: "<",
				importBcf: "&",
				selectedIssue: "<",
				displayIssue: "<",
				userJob: "<",
				issueDisplay: "<",
				availableJobs: "<"
			}
		});

	IssuesListCtrl.$inject = ["$scope", "$filter", "$window", "UtilsService", "IssuesService", "EventService", "ClientConfigService", "$timeout"];

	function IssuesListCtrl ($scope, $filter, $window, UtilsService, IssuesService, EventService, ClientConfigService, $timeout) {
		var vm = this;

		// Init
		vm.$onInit = function() {
			vm.UtilsService = UtilsService;
			vm.IssuesService = IssuesService;
			vm.setFocus = setFocus;
			vm.focusedIssueIndex = null;
			vm.excludeRoles = [];
			vm.showSubModelIssues = false;
			vm.showClosed = false;
			vm.sortOldestFirst = false;
			vm.infoHeight = 135;
			vm.issuesListItemHeight = 141;
			vm.selectedIssueIndex = null;
			vm.internalSelectedIssue = null;
			vm.modelLoaded = false;
		};


		// All issues
		$scope.$watch("vm.allIssues", function(){
			var index;
			var updatedIssue = IssuesService.updatedIssue;

			if (vm.allIssues) {
				if (vm.allIssues.length > 0) {
					vm.toShow = "list";

					// Check for updated issue
					if (updatedIssue) {
						index = vm.allIssues.findIndex(function (issue) {
							return (issue._id === updatedIssue._id);
						});
						vm.allIssues[index] = updatedIssue;
					}

					// Check for issue display
					if (vm.issueDisplay.showClosed) {
						vm.showClosed = vm.issueDisplay.showClosed;
					}
					if (vm.issueDisplay.sortOldestFirst) {
						vm.sortOldestFirst = vm.issueDisplay.sortOldestFirst;
					}
					if (vm.issueDisplay.showSubModelIssues){
						vm.showSubModelIssues = vm.issueDisplay.showSubModelIssues;
					}
					setupIssuesToShow();

					showPins();
				} else {
					vm.toShow = "info";
					vm.info = "There are currently no open issues";
					vm.contentHeight({height: vm.infoHeight});
				}
			}

		});

		$scope.$watch(EventService.currentEvent, function(event) {
			
			if (event.type === EventService.EVENT.VIEWER.MODEL_LOADED) {
				//console.log("Disabled - Heard event VIEWER.MODEL_LOADED in issues.component.js - model is:", event.value);
				vm.modelLoaded = true;
			} 
			
		});

		$scope.$watch("vm.filterText", function() {

			// Filter text
			setupIssuesToShow();
			showPins();

		});

		$scope.$watch("vm.menuOption", function(){

			// Menu option
			if (vm.menuOption) {
				if (vm.menuOption.value === "sortByDate") {
					vm.sortOldestFirst = !vm.sortOldestFirst;
					vm.issueDisplay.sortOldestFirst = vm.sortOldestFirst;
				} else if (vm.menuOption.value === "showClosed") {
					vm.showClosed = !vm.showClosed;
					vm.issueDisplay.showClosed = vm.showClosed;
				} else if (vm.menuOption.value === "showSubModels") {
					vm.showSubModelIssues = !vm.showSubModelIssues;
					vm.issueDisplay.showSubModelIssues = vm.showSubModelIssues;
				} else if (vm.menuOption.value === "print") {
					var ids = [];
					
					vm.issuesToShow.forEach(function(issue){
						ids.push(issue._id);
					});

					$window.open(ClientConfigService.apiUrl(ClientConfigService.GET_API, vm.account + "/" + vm.model + "/issues.html?ids=" + ids.join(",")), "_blank");
				} else if (vm.menuOption.value === "exportBCF") {
					$window.open(ClientConfigService.apiUrl(ClientConfigService.GET_API, vm.account + "/" + vm.model + "/issues.bcfzip"), "_blank");
				} else if (vm.menuOption.value === "importBCF") {

					var file = document.createElement("input");
					file.setAttribute("type", "file");
					file.setAttribute("accept", ".zip,.bcfzip");
					file.click();

					file.addEventListener("change", function () {
						vm.importBcf({file: file.files[0]});
					});
				} else if(vm.menuOption.value === "filterRole"){
					
					var roleIndex = vm.excludeRoles.indexOf(vm.menuOption.role);

					if(vm.menuOption.selected){
						if(roleIndex !== -1){
							vm.excludeRoles.splice(roleIndex, 1);
						}
					} else {
						if(roleIndex === -1){
							vm.excludeRoles.push(vm.menuOption.role);
						}
					}

					
				}
				setupIssuesToShow();
				showPins();
			}

		});

		$scope.$watch("vm.updatedIssue", function(){

			// Updated issue
			if (vm.updatedIssue) {
				for (var i = 0; i < vm.allIssues.length; i++) {
					if (vm.updatedIssue._id === vm.allIssues[i]._id) {
						vm.allIssues[i] = vm.updatedIssue;
						break;
					}
				}
			}

		});

		$scope.$watch("vm.selectedIssue", function(){

			// Selected issue
			if (vm.selectedIssue && vm.issuesToShow) {

				for (var i = 0; i < vm.issuesToShow.length; i++) {
					// To clear any previously selected issue
					vm.issuesToShow[i].selected = false;
					vm.issuesToShow[i].focus = false;

					// Set up the current selected iss
					if (vm.selectedIssue && vm.issuesToShow[i]._id === vm.selectedIssue._id) {
						vm.internalSelectedIssue = vm.issuesToShow[i];
						vm.internalSelectedIssue.selected = true;
						vm.internalSelectedIssue.focus = true;
						vm.focusedIssueIndex = i;
						vm.selectedIssueIndex = i;
					}
				}
			}

		});

		$scope.$watch("vm.displayIssue", function(){

			// Selected issue
			if(vm.displayIssue){
				
				vm.editIssue(vm.displayIssue);
				$timeout(function(){
					showIssue(vm.displayIssue);
				}.bind(this), 1500);

			}

		}, true);

		
		/**
		 * Select issue
		 * @param event
		 * @param issue
		 */
		vm.select = function (event, issue) {
			if (event.type === "click") {

				if ((vm.internalSelectedIssue === null) || (vm.internalSelectedIssue._id === issue._id)) {
					resetViewerState(issue);
					setViewerState(issue);
				} else {
					setViewerState(issue);
				}

				vm.onSelectIssue({issue: vm.internalSelectedIssue});
			}
		};

		function resetViewerState(issue) {

			vm.internalSelectedIssue = issue;
			vm.internalSelectedIssue.selected = false;
			vm.internalSelectedIssue.focus = false;

			deselectPin(vm.internalSelectedIssue);

		}

		function setViewerState(issue) {

			vm.internalSelectedIssue = issue;
			vm.internalSelectedIssue.selected = true;
			vm.internalSelectedIssue.focus = true;

			showIssue(vm.internalSelectedIssue);
			setSelectedIssueIndex(vm.internalSelectedIssue);

		}

		/**
		 * Set focus on issue
		 * @param issue
		 * @param index
		 */
		function setFocus (issue, index) {
			if (vm.internalSelectedIssue !== null) {
				vm.internalSelectedIssue.focus = false;
			}
			vm.focusedIssueIndex = index;
			issue.focus = true;
		}

		/**
		 * Allow set focus
		 */
		vm.initSetFocus = function () {
			if (vm.setFocus === null) {
				vm.setFocus = setFocus;
			}
		};

		/**
		 * Remove focus from issue
		 * @param event
		 * @param issue
		 */
		vm.removeFocus = function (event, issue) {
			vm.focusedIssueIndex = null;
			issue.focus = false;
		};

		/**
		 * Set up editing of issue
		 */
		vm.editIssue = function (issue) {
			vm.onEditIssue({issue: issue});
		};

		/**
		 * Set the selected issue index
		 * @param selectedIssue
		 */
		function setSelectedIssueIndex(selectedIssueObj) {
			var i, length;

			if (selectedIssueObj !== null) {
				for (i = 0, length = vm.issuesToShow.length; i < length; i += 1) {
					if (vm.issuesToShow[i]._id === selectedIssueObj._id) {
						vm.selectedIssueIndex = i;
					}
				}
			} else {
				vm.selectedIssueIndex = null;
			}
		}

		/**
		 * Show issue details
		 * @param issue
		 */
		function showIssue (issue) {
			IssuesService.showIssue(issue);
		}

		/**
		 * Set the issue pin to look deselected
		 * @param issue
		 */
		function deselectPin (issue) {
			IssuesService.deselectPin(issue);
		}

		// Helper function for searching strings
		function stringSearch(superString, subString) {
			if(!superString){
				return false;
			}

			return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
		}

		/**
		 * Setup the issues to show
		 */
		function setupIssuesToShow () {

			vm.issuesToShow = [];

			if (vm.allIssues.length > 0) {

				// Sort
				vm.issuesToShow = vm.allIssues.slice();
				vm.issuesToShow.sort(function(a, b){
					if (vm.sortOldestFirst) {
						return a.created > b.created;
					} 
					return a.created < b.created;
				});

				// TODO: There is certainly a better way of doing this, but I don't want to
				// dig into it right before release

				// Filter text
				var someText = angular.isDefined(vm.filterText) && vm.filterText !== "";
				if (someText) {

					vm.issuesToShow = ($filter("filter")(vm.issuesToShow, function(issue) {
						// Required custom filter due to the fact that Angular
						// does not allow compound OR filters
						var i;

						// Search the title
						var show = stringSearch(issue.title, vm.filterText);
						show = show || stringSearch(issue.timeStamp, vm.filterText);
						show = show || stringSearch(issue.owner, vm.filterText);

						// Search the list of assigned issues
						if (!show && issue.hasOwnProperty("assigned_roles")) {
							i = 0;
							while(!show && (i < issue.assigned_roles.length)) {
								show = show || stringSearch(issue.assigned_roles[i], vm.filterText);
								i += 1;
							}
						}

						// Search the comments
						if (!show && issue.hasOwnProperty("comments")) {
							i = 0;

							while(!show && (i < issue.comments.length)) {
								show = show || stringSearch(issue.comments[i].comment, vm.filterText);
								show = show || stringSearch(issue.comments[i].owner, vm.filterText);
								i += 1;
							}
						}

						return show;
					}));
				} 

				// Closed
				for (var i = (vm.issuesToShow.length - 1); i >= 0; i -= 1) {
					//console.log(vm.showClosed, vm.issuesToShow[i])
					if (!vm.showClosed && (vm.issuesToShow[i].status === "closed")) {
						vm.issuesToShow.splice(i, 1);
					}
				}

				// Sub models
				vm.issuesToShow = vm.issuesToShow.filter(function (issue) {
					return vm.showSubModelIssues ? true : (issue.model === vm.model);
				});

				//Roles Filter
				vm.issuesToShow = vm.issuesToShow.filter(function(issue){
					return vm.excludeRoles.indexOf(issue.creator_role) === -1;
				});
			}

			// Setup what to show
			if (vm.issuesToShow.length > 0) {
				vm.toShow = "list";
				var buttonSpace = 70;
				var issuesHeight = vm.issuesToShow.length * vm.issuesListItemHeight + buttonSpace;
				vm.contentHeight({height: issuesHeight });
			} else {
				vm.toShow = "info";
				vm.info = "There are currently no open issues";
				vm.contentHeight({height: vm.infoHeight});
			}
		}

		/**
		 * Add issue pins to the viewer
		 */
		function showPins () {
		
			// Go through all issues with pins
			vm.allIssues.forEach(function(issue){

				if (issue.position.length > 0) {

					// If we are showing all the closed issues, or it's open
					var show = (vm.showClosed === true || issue.status === "open");

					if (show) {
						// Create new pin
						var pinData = {
							id: issue._id,
							position: issue.position,
							norm:issue.norm,
							account: issue.account,
							model: issue.model
						};
						var pinColor = Pin.pinColours.blue;
						var isSelectedPin = vm.selectedIssue && issue._id === vm.selectedIssue._id;

						if (isSelectedPin) {
							pinColor = Pin.pinColours.yellow;
						}

						IssuesService.addPin(pinData, pinColor, issue.viewpoint);
					} else {
						// Remove pin
						IssuesService.removePin(issue._id);
					}
					
				}

			});
		}


	}
}());
