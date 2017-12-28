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

class IssueListController implements ng.IController {

	public static $inject: string[] =  [
		"$scope",
		"$filter",
		"$window",
		"$timeout",

		"APIService",
		"IssuesService",
		"ClientConfigService",
	];

	private contentHeight;
	private importBcf;
	private onEditIssue;

	private toShow;
	private info;
	private allIssues;
	private menuOption;

	private account;
	private model;
	private filterText;

	private focusedIssueIndex;
	private selectedIssueIndex;
	private internalSelectedIssue;

	constructor(
		private $scope,
		private $filter,
		private $window,
		private $timeout,

		private APIService,
		private IssuesService,
		private ClientConfigService,
	) {}

	public $onInit() {
		this.toShow = "list";
		this.focusedIssueIndex = null;
		this.selectedIssueIndex = null;
		this.internalSelectedIssue = null;
		this.watchers();
	}

	public watchers() {
		this.$scope.$watch(
			() => {
				return this.IssuesService.state.displayIssue;
			}, () => {
				this.checkShouldShowIssue();
			}, true,
		);

			// All issues
		this.$scope.$watch(
			() => {
				return this.IssuesService.state.allIssues;
			}, () => {

			if (this.IssuesService.state.allIssues) {
				if (this.IssuesService.state.allIssues.length > 0) {

					this.toShow = "list";
					this.setupIssuesToShow();

				} else {

					this.toShow = "info";
					this.info = "There are currently no open issues";
					this.contentHeight({height: this.IssuesService.state.heights.infoHeight});
				}
			}

			this.allIssues = this.IssuesService.state.allIssues;
			this.checkShouldShowIssue();

			}, true,
		);

		this.$scope.$watch("vm.filterText", () => {

			// Filter text
			this.setupIssuesToShow();

		});

		this.$scope.$watch("vm.menuOption", () => {

			// Menu option
			if (this.menuOption && this.menuOption.value) {

				switch (this.menuOption.value) {

				case "sortByDate":
					this.IssuesService.state.issueDisplay.sortOldestFirst = !this.IssuesService.state.issueDisplay.sortOldestFirst;
					break;

				case "showClosed":
					this.IssuesService.state.issueDisplay.showClosed = !this.IssuesService.state.issueDisplay.showClosed;
					break;

				case "showSubModels":
					this.IssuesService.state.issueDisplay.showSubModelIssues =
					!this.IssuesService.state.issueDisplay.showSubModelIssues;
					break;

				case "print":
					const ids = [];
					this.IssuesService.state.issuesToShow.forEach((issue) => {
						ids.push(issue._id);
					});
					const printEndpoint = this.account + "/" + this.model + "/issues.html?ids=" + ids.join(",");
					const printUrl = this.ClientConfigService.apiUrl(this.ClientConfigService.GET_API, printEndpoint);
					this.$window.open(printUrl, "_blank");
					break;

				case "exportBCF":
					const bcfEndpoint = this.account + "/" + this.model + "/issues.bcfzip";
					const bcfUrl = this.ClientConfigService.apiUrl(this.ClientConfigService.GET_API, bcfEndpoint);
					this.$window.open(bcfUrl, "_blank");
					break;

				case "importBCF":
					const file = document.createElement("input");
					file.setAttribute("type", "file");
					file.setAttribute("accept", ".zip,.bcfzip");
					file.click();

					file.addEventListener("change", () => {
						this.importBcf({file: file.files[0]});
					});
					break;

				case "filterRole":
					const roleIndex = this.IssuesService.state.issueDisplay.excludeRoles.indexOf(this.menuOption.role);
					if (this.menuOption.selected) {
						if (roleIndex !== -1) {
							this.IssuesService.state.issueDisplay.excludeRoles.splice(roleIndex, 1);
						}
					} else {
						if (roleIndex === -1) {
							this.IssuesService.state.issueDisplay.excludeRoles.push(this.menuOption.role);
						}
					}
					break;

				}

				this.setupIssuesToShow();

			}

		});
	}

	public editIssue(issue) {
		this.onEditIssue({issue});
	}

	public checkShouldShowIssue() {
		const issueToDisplay = this.IssuesService.getDisplayIssue();
		if (issueToDisplay) {
			this.editIssue(issueToDisplay);
			this.$timeout(() => {
				this.IssuesService.showIssue(issueToDisplay);
			}, 50);
		}
	}

	public setupIssuesToShow() {

		this.IssuesService.setupIssuesToShow(this.model, this.filterText);

		// Setup what to show
		if (this.IssuesService.state.issuesToShow.length > 0) {
			this.toShow = "list";
			const buttonSpace = 70;
			const numOfIssues = this.IssuesService.state.issuesToShow.length;
			const heights = this.IssuesService.state.heights.issuesListItemHeight + buttonSpace;
			const issuesHeight = numOfIssues * heights;
			this.contentHeight({height: issuesHeight });
		} else {
			this.toShow = "info";
			this.info = "There are currently no open issues";
			this.contentHeight({height: this.IssuesService.state.heights.infoHeight});
		}

		this.IssuesService.showIssuePins(this.account, this.model);
	}

	public selectIssue(issue) {
		this.IssuesService.setSelectedIssue(issue);
	}

	public isSelectedIssue(issue) {
		return this.IssuesService.isSelectedIssue(issue);
	}

}

export const IssueListComponent: ng.IComponentOptions = {
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
		issueDisplay: "<",
	},
	controller: IssueListController,
	controllerAs: "vm",
	templateUrl: "templates/issues-list.html",
};

export const IssueListComponentModule = angular
	.module("3drepo")
	.component("issuesList", IssueListComponent);
