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
			controllerAs: 'vm',
			bindToController: true,
			templateUrl: "issuesList.html",
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
				keysDown: "<",
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

	IssuesListCtrl.$inject = ["$filter", "$window", "UtilsService", "IssuesService", "EventService", "serverConfig", "$timeout"];

	function IssuesListCtrl ($filter, $window, UtilsService, IssuesService, EventService, serverConfig, $timeout) {
		var vm = this,
			selectedIssue = null,
			selectedIssueIndex = null,
			issuesListItemHeight = 141,
			infoHeight = 81,
			issuesToShowWithPinsIDs,
			sortOldestFirst = false,
			showClosed = false,
			focusedIssueIndex = null,
			rightArrowDown = false,
			showSubModelIssues = false,
			excludeRoles = [];

		// Init
		vm.$onInit = function() {
			vm.UtilsService = UtilsService;
			vm.IssuesService = IssuesService;
			vm.setFocus = setFocus;
		}
		
		/**
		 * Monitor changes to parameters
		 * @param {Object} changes
		 */
		vm.$onChanges = function (changes) {
			var i, length,
				index,
				upArrow = 38,
				downArrow = 40,
				rightArrow = 39,
				keysDown,
				event = {type: "click"},
				updatedIssue = IssuesService.updatedIssue;

			// All issues
			if (changes.hasOwnProperty("allIssues") && vm.allIssues) {
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
						showClosed = vm.issueDisplay.showClosed;
					}
					if (vm.issueDisplay.sortOldestFirst) {
						sortOldestFirst = vm.issueDisplay.sortOldestFirst;
					}
					if (vm.issueDisplay.showSubModelIssues){
						showSubModelIssues = vm.issueDisplay.showSubModelIssues;
					}
					setupIssuesToShow();
					showPins();
				}
				else {
					vm.toShow = "info";
					vm.info = "There are currently no open issues";
					vm.contentHeight({height: infoHeight});
				}
			}

			// Filter text
			if (changes.hasOwnProperty("filterText") && (typeof vm.filterText !== "undefined")) {
				setupIssuesToShow();
				showPins();
			}

			// Menu option
			if (changes.hasOwnProperty("menuOption") && vm.menuOption) {
				if (vm.menuOption.value === "sortByDate") {
					sortOldestFirst = !sortOldestFirst;
					vm.issueDisplay.sortOldestFirst = sortOldestFirst;
				}
				else if (vm.menuOption.value === "showClosed") {
					showClosed = !showClosed;
					vm.issueDisplay.showClosed = showClosed;
				}
				else if (vm.menuOption.value === "showSubModels") {
					showSubModelIssues = !showSubModelIssues;
					vm.issueDisplay.showSubModelIssues = showSubModelIssues;
				}
				else if (vm.menuOption.value === "print") {
					var ids = [];
					
					vm.issuesToShow.forEach(function(issue){
						ids.push(issue._id);
					});

					$window.open(serverConfig.apiUrl(serverConfig.GET_API, vm.account + "/" + vm.model + "/issues.html?ids=" + ids.join(',')), "_blank");
				}
				else if (vm.menuOption.value === "exportBCF") {
					$window.open(serverConfig.apiUrl(serverConfig.GET_API, vm.account + "/" + vm.model + "/issues.bcfzip"), "_blank");
				}
				else if (vm.menuOption.value === "importBCF") {

					var file = document.createElement('input');
					file.setAttribute('type', 'file');
					file.setAttribute('accept', '.zip,.bcfzip');
					file.click();

					file.addEventListener("change", function () {
						vm.importBcf({file: file.files[0]});
					});
				} else if(vm.menuOption.value === "filterRole"){
					
					var index = excludeRoles.indexOf(vm.menuOption.role);

					if(vm.menuOption.selected){
						if(index !== -1){
							excludeRoles.splice(index, 1);
						}
					} else {
						if(index === -1){
							excludeRoles.push(vm.menuOption.role);
						}
					}

					
				}
				setupIssuesToShow();
				showPins();
			}

			// Updated issue
			if (changes.hasOwnProperty("updatedIssue") && vm.updatedIssue) {
				for (i = 0, length = vm.allIssues.length; i < length; i += 1) {
					if (vm.updatedIssue._id === vm.allIssues[i]._id) {
						vm.allIssues[i] = vm.updatedIssue;
						break;
					}
				}
			}

			// Selected issue
			if (changes.hasOwnProperty("selectedIssue") && vm.issuesToShow) {
				for (i = 0, length = vm.issuesToShow.length; i < length; i += 1) {
					// To clear any previously selected issue
					vm.issuesToShow[i].selected = false;
					vm.issuesToShow[i].focus = false;

					// Set up the current selected iss
					if (vm.selectedIssue && vm.issuesToShow[i]._id === vm.selectedIssue._id) {
						selectedIssue = vm.issuesToShow[i];
						selectedIssue.selected = true;
						selectedIssue.focus = true;
						focusedIssueIndex = i;
						selectedIssueIndex = i;
					}
				}
			}

			if(changes.hasOwnProperty('displayIssue') && vm.displayIssue){
				var that = this;

				vm.editIssue(vm.displayIssue);
				$timeout(function(){
					showIssue(that.displayIssue);
				}, 1500);

			}
		};

		/**
		 * Select issue
		 * @param event
		 * @param issue
		 */
		vm.select = function (event, issue) {
			if (event.type === "click") {

				if ((selectedIssue === null) || (selectedIssue._id === issue._id)) {
					resetViewerState(issue);
					setViewerState(issue);
				}
				else {
					setViewerState(issue);
				}

				vm.onSelectIssue({issue: selectedIssue});
			}
		};

		function resetViewerState(issue) {

			selectedIssue = issue;
			selectedIssue.selected = false;
			selectedIssue.focus = false;

			deselectPin(selectedIssue);

		}

		function setViewerState(issue) {

			selectedIssue = issue;
			selectedIssue.selected = true;
			selectedIssue.focus = true;

			showIssue(selectedIssue);
			setSelectedIssueIndex(selectedIssue);

		}

		/**
		 * Set focus on issue
		 * @param issue
		 * @param index
		 */
		function setFocus (issue, index) {
			if (selectedIssue !== null) {
				selectedIssue.focus = false;
			}
			focusedIssueIndex = index;
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
			focusedIssueIndex = null;
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
		function setSelectedIssueIndex(selectedIssue) {
			var i, length;

			if (selectedIssue !== null) {
				for (i = 0, length = vm.issuesToShow.length; i < length; i += 1) {
					if (vm.issuesToShow[i]._id === selectedIssue._id) {
						selectedIssueIndex = i;
					}
				}
			}
			else {
				selectedIssueIndex = null;
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

		/**
		 * Setup the issues to show
		 */
		function setupIssuesToShow () {
			var i = 0, j = 0, length = 0,
				sortedIssuesLength;

			vm.issuesToShow = [];
			issuesToShowWithPinsIDs = {};

			if (vm.allIssues.length > 0) {
				// Sort
				vm.issuesToShow = [vm.allIssues[0]];
				for (i = 1, length = vm.allIssues.length; i < length; i += 1) {
					for (j = 0, sortedIssuesLength = vm.issuesToShow.length; j < sortedIssuesLength; j += 1) {
						if (((vm.allIssues[i].created < vm.issuesToShow[j].created) && (sortOldestFirst)) ||
							((vm.allIssues[i].created > vm.issuesToShow[j].created) && (!sortOldestFirst))) {
							vm.issuesToShow.splice(j, 0, vm.allIssues[i]);
							break;
						}
						else if (j === (vm.issuesToShow.length - 1)) {
							vm.issuesToShow.push(vm.allIssues[i]);
						}
					}
				}

				// Filter text
				if (angular.isDefined(vm.filterText) && vm.filterText !== "") {

					// Helper function for searching strings
					var stringSearch = function(superString, subString)
					{
						if(!superString){
							return false;
						}

						return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
					};

					vm.issuesToShow = ($filter('filter')(vm.issuesToShow, function(issue) {
						// Required custom filter due to the fact that Angular
						// does not allow compound OR filters
						var i;

						// Search the title
						var show = stringSearch(issue.title, vm.filterText);
						show = show || stringSearch(issue.timeStamp, vm.filterText);
						show = show || stringSearch(issue.owner, vm.filterText);

						// Search the list of assigned issues
						if (!show && issue.hasOwnProperty("assigned_roles"))
						{
							i = 0;
							while(!show && (i < issue.assigned_roles.length))
							{
								show = show || stringSearch(issue.assigned_roles[i], vm.filterText);
								i += 1;
							}
						}

						// Search the comments
						if (!show && issue.hasOwnProperty("comments"))
						{
							i = 0;

							while(!show && (i < issue.comments.length))
							{
								show = show || stringSearch(issue.comments[i].comment, vm.filterText);
								show = show || stringSearch(issue.comments[i].owner, vm.filterText);
								i += 1;
							}
						}

						return show;
					}));
				}

				// Closed
				for (i = (vm.issuesToShow.length - 1); i >= 0; i -= 1) {
					if (!showClosed && (vm.issuesToShow[i].status === "closed")) {
						vm.issuesToShow.splice(i, 1);
					}
				}

				// Sub models
				vm.issuesToShow = vm.issuesToShow.filter(function (issue) {
					return showSubModelIssues ? true : (issue.model === vm.model);
				});

				//Roles Filter
				vm.issuesToShow = vm.issuesToShow.filter(function(issue){
					return excludeRoles.indexOf(issue.creator_role) === -1;
				});
			}

			// Create list of issues to show with pins
			for (i = 0, length = vm.issuesToShow.length; i < length; i += 1) {
				if (vm.issuesToShow[i].position.length > 0) {
					issuesToShowWithPinsIDs[vm.issuesToShow[i]._id] = true;
				}
			}

			// Setup what to show
			if (vm.issuesToShow.length > 0) {
				vm.toShow = "list";
				var buttonSpace = 70;
				var issuesHeight = vm.issuesToShow.length * issuesListItemHeight + buttonSpace;
				vm.contentHeight({height: issuesHeight });
			}
			else {
				vm.toShow = "info";
				vm.info = "No issues to show";
				vm.contentHeight({height: infoHeight});
			}
		}

		/**
		 * Add issue pins to the viewer
		 */
		function showPins () {
			var i, length,
				pin,
				pinData;

			// Go through all issues with pins
			for (i = 0, length = vm.allIssues.length; i < length; i += 1) {
				if (vm.allIssues[i].position.length > 0) {
					pin = angular.element(document.getElementById(vm.allIssues[i]._id));
					if (pin.length > 0) {
						// Existing pin
						if (issuesToShowWithPinsIDs[vm.allIssues[i]._id]) {
							pin[0].setAttribute("render", "true");
						}
						else {
							pin[0].setAttribute("render", "false");
						}
					}
					else {
                        if (issuesToShowWithPinsIDs[vm.allIssues[i]._id]) {
                            // Create new pin
                            pinData = {
                                id: vm.allIssues[i]._id,
                                position: vm.allIssues[i].position,
                                norm: vm.allIssues[i].norm,
                                account: vm.allIssues[i].account,
                                model: vm.allIssues[i].model
                            };
                            var pinColor = IssuesService.pinColours.blue;
                            if (vm.selectedIssue && vm.allIssues[i]._id === vm.selectedIssue._id) {
                                pinColor = IssuesService.pinColours.yellow;
                            }
                            IssuesService.addPin(pinData, [pinColor], vm.allIssues[i].viewpoint);
                        }
					}
				}
			}
		}
	}
}());
