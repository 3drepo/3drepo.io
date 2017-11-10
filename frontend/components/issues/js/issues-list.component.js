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
				issuesToShow: "<",
				filterText: "<",
				onEditIssue: "&",
				nonListSelect: "<",
				contentHeight: "&",
				menuOption: "<",
				importBcf: "&",
				selectedIssue: "<",
				issueDisplay: "<"
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

			vm.toShow = "list";
			vm.focusedIssueIndex = null;
			vm.selectedIssueIndex = null;
			vm.internalSelectedIssue = null;

		};

		$scope.$watch(function(){
			IssuesService.state.displayIssue;
		}, function(){
			vm.checkShouldShowIssue();
		}, true);

		vm.editIssue = function (issue) {
			vm.onEditIssue({issue: issue});
		};

		vm.checkShouldShowIssue = function() {
			var issueToDisplay = IssuesService.getDisplayIssue();
			if (issueToDisplay) {
				vm.editIssue(issueToDisplay);
				$timeout(function(){
					IssuesService.showIssue(issueToDisplay);
				}.bind(this), 50);
			}
		};

		// All issues
		$scope.$watch(function(){
			return IssuesService.state.allIssues;
		}, function(){
	
			if (IssuesService.state.allIssues) {
				if (IssuesService.state.allIssues.length > 0) {

					vm.toShow = "list";
					vm.setupIssuesToShow();

				} else {
					
					vm.toShow = "info";
					vm.info = "There are currently no open issues";
					vm.contentHeight({height: IssuesService.state.heights.infoHeight});
				}
			}

			vm.allIssues = IssuesService.state.allIssues;
			vm.checkShouldShowIssue();

		}, true);

		$scope.$watch("vm.filterText", function() {

			// Filter text
			vm.setupIssuesToShow();

		});

		$scope.$watch("vm.menuOption", function(){

			// Menu option
			if (vm.menuOption && vm.menuOption.value) {

				switch(vm.menuOption.value) {
				
				case "sortByDate":
					//vm.sortOldestFirst = !vm.sortOldestFirst;
					IssuesService.state.issueDisplay.sortOldestFirst = !IssuesService.state.issueDisplay.sortOldestFirst;
					break;
				
				case "showClosed":
					//vm.showClosed = !vm.showClosed;
					IssuesService.state.issueDisplay.showClosed = !IssuesService.state.issueDisplay.showClosed;
					break;

				case "showSubModels":
					//vm.showSubModelIssues = !vm.showSubModelIssues;
					IssuesService.state.issueDisplay.showSubModelIssues = !IssuesService.state.issueDisplay.showSubModelIssues;
					break;
				
				case "print":
					var ids = [];
					IssuesService.state.issuesToShow.forEach(function(issue){
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
					var roleIndex = IssuesService.state.issueDisplay.excludeRoles.indexOf(vm.menuOption.role);
					if(vm.menuOption.selected){
						if(roleIndex !== -1){
							IssuesService.state.issueDisplay.excludeRoles.splice(roleIndex, 1);
						}
					} else {
						if(roleIndex === -1){
							IssuesService.state.issueDisplay.excludeRoles.push(vm.menuOption.role);
						}
					}
					break;

				}

				vm.setupIssuesToShow();

			}

		});

		vm.setupIssuesToShow = function() {

			IssuesService.setupIssuesToShow(vm.model, vm.filterText);

			// Setup what to show
			if (IssuesService.state.issuesToShow.length > 0) {
				vm.toShow = "list";
				var buttonSpace = 70;
				var numOfIssues = IssuesService.state.issuesToShow.length;
				var heights = IssuesService.state.heights.issuesListItemHeight + buttonSpace;
				var issuesHeight = numOfIssues * heights;
				vm.contentHeight({height: issuesHeight });
			} else {
				vm.toShow = "info";
				vm.info = "There are currently no open issues";
				vm.contentHeight({height: IssuesService.state.heights.infoHeight});
			}

			IssuesService.showIssuePins(vm.account, vm.model);
		};

		vm.selectIssue = function (issue) {
			IssuesService.setSelectedIssue(issue);
		};

		vm.isSelectedIssue = function(issue) {
			return IssuesService.isSelectedIssue(issue);
		};

	}
}());
