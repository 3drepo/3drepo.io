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

	IssuesListCtrl.$inject = [
		"$scope", "$filter", "$window", "APIService", 
		"IssuesService", "ClientConfigService", 
		"$timeout", "ViewerService"
	];

	function IssuesListCtrl (
		$scope, $filter, $window, APIService, IssuesService, 
		ClientConfigService, $timeout, ViewerService
	) {

		var vm = this;

		// Init
		vm.$onInit = function() {
			vm.APIService = APIService;
			vm.IssuesService = IssuesService;
			vm.focusedIssueIndex = null;
			vm.excludeRoles = [];
			vm.showSubModelIssues = false;
			vm.showClosed = false;
			vm.sortOldestFirst = false;
			vm.infoHeight = 135;
			vm.issuesListItemHeight = 141;
			vm.selectedIssueIndex = null;
			vm.internalSelectedIssue = null;
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
					vm.setupIssuesToShow();

					vm.showPins();
				} else {
					vm.toShow = "info";
					vm.info = "There are currently no open issues";
					vm.contentHeight({height: vm.infoHeight});
				}
			}

		});

		$scope.$watch("vm.filterText", function() {

			// Filter text
			vm.setupIssuesToShow();
			vm.showPins();

		});

		$scope.$watch("vm.menuOption", function(){

			// Menu option
			if (vm.menuOption && vm.menuOption.value) {

				switch(vm.menuOption.value) {
				
				case "sortByDate":
					vm.sortOldestFirst = !vm.sortOldestFirst;
					vm.issueDisplay.sortOldestFirst = vm.sortOldestFirst;
					break;
				
				case "showClosed":
					vm.showClosed = !vm.showClosed;
					vm.issueDisplay.showClosed = vm.showClosed;
					break;

				case "showSubModels":
					vm.showSubModelIssues = !vm.showSubModelIssues;
					vm.issueDisplay.showSubModelIssues = vm.showSubModelIssues;
					break;
				
				case "print":
					var ids = [];
					vm.issuesToShow.forEach(function(issue){
						ids.push(issue._id);
					});
					var printEndpoint = vm.account + "/" + vm.model + "/issues.html?ids=" + ids.join(",");
					var printUrl = ClientConfigService.apiUrl(ClientConfigService.GET_API, printEndpoint);
					$window.open(printUrl, "_blank");
					break;

				case "exportBCF":
					var bcfEndpoint = vm.account + "/" + vm.model + "/issues.bcfzip";
					var bcfUrl = ClientConfigService.apiUrl(ClientConfigService.GET_API, bcfEndpoint);
					$window.open(bcfUrl, "_blank");
					break;

				case "importBCF":
					var file = document.createElement("input");
					file.setAttribute("type", "file");
					file.setAttribute("accept", ".zip,.bcfzip");
					file.click();

					file.addEventListener("change", function () {
						vm.importBcf({file: file.files[0]});
					});
					break;

				case "filterRole":
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
					break;

				}

				vm.setupIssuesToShow();
				vm.showPins();
			}

		});

		// $scope.$watch("vm.updatedIssue", function(){

		// 	// Updated issue
		// 	if (vm.updatedIssue) {
		// 		for (var i = 0; i < vm.allIssues.length; i++) {
		// 			if (vm.updatedIssue._id === vm.allIssues[i]._id) {
		// 				vm.allIssues[i] = vm.updatedIssue;
		// 				break;
		// 			}
		// 		}
		// 	}

		// });

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

		}, true);

		$scope.$watch("vm.displayIssue", function(){

			// Selected issue
			if (vm.displayIssue){
				vm.editIssue(vm.displayIssue);
				$timeout(function(){
					IssuesService.showIssue(vm.displayIssue);
				}.bind(this), 500);

			}

		}, true);
		
		/**
		 * Select issue
		 * @param event
		 * @param issue
		 */
		vm.select = function (issue) {
			
			if (
				vm.internalSelectedIssue === null || 
				vm.internalSelectedIssue._id === issue._id
			) {
				vm.resetViewerState(issue);
				vm.setViewerState(issue);
			} else {
				vm.setViewerState(issue);
			}
			
			vm.onSelectIssue({issue: vm.internalSelectedIssue});
			
		};

		vm.resetViewerState = function(issue) {

			vm.internalSelectedIssue = issue;
			vm.internalSelectedIssue.selected = false;
			vm.internalSelectedIssue.focus = false;

			IssuesService.deselectPin(vm.internalSelectedIssue);

		};

		vm.setViewerState = function(issue) {

			vm.internalSelectedIssue = issue;
			vm.internalSelectedIssue.selected = true;
			vm.internalSelectedIssue.focus = true;

			IssuesService.showIssue(vm.internalSelectedIssue);
			vm.setSelectedIssueIndex(vm.internalSelectedIssue);

		}; 

		/**
		 * Set focus on issue
		 * @param issue
		 * @param index
		 */
		vm.setFocus = function(issue, index) {
			if (vm.internalSelectedIssue !== null) {
				vm.internalSelectedIssue.focus = false;
			}
			vm.focusedIssueIndex = index;
			issue.focus = true;
		};

		/**
		 * Remove focus from issue
		 * @param issue
		 */
		vm.removeFocus = function (issue) {
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
		vm.setSelectedIssueIndex = function(selectedIssueObj) {

			if (selectedIssueObj !== null) {
				for (var i = 0; i < vm.issuesToShow.length; i += 1) {
					if (vm.issuesToShow[i]._id === selectedIssueObj._id) {
						vm.selectedIssueIndex = i;
					}
				}
			} else {
				vm.selectedIssueIndex = null;
			}

		};

		// Helper function for searching strings
		vm.stringSearch = function(superString, subString) {
			if(!superString){
				return false;
			}

			return (superString.toLowerCase().indexOf(subString.toLowerCase()) !== -1);
		};

		/**
		 * Setup the issues to show
		 */
		vm.setupIssuesToShow = function() {

			vm.issuesToShow = [];

			if (vm.allIssues.length > 0) {

				// Sort
				vm.issuesToShow = vm.allIssues.slice();
				if (vm.sortOldestFirst) {
					vm.issuesToShow.sort(function(a, b){
						return a.created - b.created;
					});
				} else {
					vm.issuesToShow.sort(function(a, b){
						return b.created - a.created;
					});
				}
				
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
						var show = vm.stringSearch(issue.title, vm.filterText);
						show = show || vm.stringSearch(issue.timeStamp, vm.filterText);
						show = show || vm.stringSearch(issue.owner, vm.filterText);

						// Search the list of assigned issues
						if (!show && issue.hasOwnProperty("assigned_roles")) {
							i = 0;
							while(!show && (i < issue.assigned_roles.length)) {
								show = show || vm.stringSearch(issue.assigned_roles[i], vm.filterText);
								i += 1;
							}
						}

						// Search the comments
						if (!show && issue.hasOwnProperty("comments")) {
							i = 0;

							while(!show && (i < issue.comments.length)) {
								show = show || vm.stringSearch(issue.comments[i].comment, vm.filterText);
								show = show || vm.stringSearch(issue.comments[i].owner, vm.filterText);
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

		};

		/**
		 * Add issue pins to the viewer
		 */
		vm.showPins = function() {

			// TODO: This is still inefficent and unclean
			vm.allIssues.forEach(function(issue){
				var show = vm.issuesToShow.find(function(shownIssue){
					return issue._id === shownIssue._id;
				});

				// Check that there is a position for the pin
				var pinPosition = issue.position && issue.position.length;

				if (show !== undefined && pinPosition) {

					var pinColor = Pin.pinColours.blue;
					var isSelectedPin = vm.selectedIssue && issue._id === vm.selectedIssue._id;

					if (isSelectedPin) {
						pinColor = Pin.pinColours.yellow;
					}

					ViewerService.addPin({
						id: issue._id,
						account: vm.account,
						model: vm.model,
						pickedPos: issue.position,
						pickedNorm: issue.norm,
						colours: pinColor,
						viewpoint: issue.viewpoint
					});

				} else {
					// Remove pin
					ViewerService.removePin({ id: issue._id });
				}
			});

		};


	}
}());
