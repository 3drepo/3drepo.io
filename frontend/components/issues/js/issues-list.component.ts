/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the issueComp of the GNU Affero General Public License as
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
import { APIService } from "../../home/js/api.service";
import { IssuesService } from "./issues.service";
import { IChip } from "../../panel/js/panel-card-chips-filter.component";

class IssuesListController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$window",
		"$timeout",
		"$compile",
		"$element",

		"APIService",
		"IssuesService",
		"ClientConfigService"
	];

	private toShow: string;
	private info: string;
	private focusedIssueIndex: any;
	private selectedIssueIndex: any;
	private internalSelectedIssue: any;
	private onEditIssue: any;
	private contentHeight: any;
	private allIssues: any;
	private menuOption: any;
	private importBcf: any;
	private account: string;
	private model: string;
	private revision: string;
	private filterText: string;
	private bcfInputHandler: any;
	private filterChips: IChip[];

	constructor(
		private $scope,
		private $window,
		private $timeout,
		private $compile,
		private $element,

		private apiService: APIService,
		private issuesService: IssuesService,
		private clientConfigService: any
	) {}

	public $onInit() {

		this.toShow = "list";
		this.focusedIssueIndex = null;
		this.selectedIssueIndex = null;
		this.internalSelectedIssue = null;
		this.setupBcfImportInput();
		this.watchers();

	}

	public watchers() {

		this.$scope.$watch(
			() => {
				return this.issuesService.state.allIssues;
			},
			() => {
				this.allIssues = this.issuesService.state.allIssues;
			},
			true
		);

		this.$scope.$watch("vm.issuesToShow", () => {
			this.setContentAndSize();
			this.issuesService.showIssuePins();
		});

		this.$scope.$watchCollection("vm.filterChips", (chips) => {
			this.issuesService.setupIssuesToShow(this.model, chips);
		});

		this.$scope.$watch("vm.menuOption", () => {

			// Menu option
			if (this.menuOption && this.menuOption.value) {

				this.handleMenuOptions();
				this.issuesService.setupIssuesToShow(this.model, this.filterChips);
			}

		});

		this.$scope.$watch(
			() => {
				return this.issuesService.getDisplayIssue();
			},
			(issueToDisplay) => {
				if (issueToDisplay) {
					this.editIssue(issueToDisplay);
				}
			},
			true
		);

	}

	public setupBcfImportInput() {

		if (this.bcfInputHandler) {
			return;
		}

		const template = `<input
							id='bcfImportInput'
							type='file'
							style='display: none;'
							accept='.zip,.bcfzip,.bcf'>`;

		const linkFn = this.$compile(template);
		const content = linkFn(this.$scope);
		this.$element.append(content);

		this.$timeout(() => {
			this.bcfInputHandler = document.getElementById("bcfImportInput");
			this.bcfInputHandler.addEventListener("change", () => {
				if (this.bcfInputHandler && this.bcfInputHandler.files) {
					this.importBcf({file: this.bcfInputHandler.files[0]});
				} else {
					console.error("No file selected");
				}
				this.bcfInputHandler.value = null; // Reset the change watcher
			});
		});

	}

	public handleMenuOptions() {
		const ids = [];
		this.issuesService.state.issuesToShow.forEach((issue) => {
			ids.push(issue._id);
		});

		switch (this.menuOption.value) {

			case "sortByDate":
				this.issuesService.state.issueDisplay.sortOldestFirst =
					!this.issuesService.state.issueDisplay.sortOldestFirst;
				break;

			case "showClosed":
				this.issuesService.state.issueDisplay.showClosed =
					!this.issuesService.state.issueDisplay.showClosed;
				break;

			case "showSubModels":
				this.issuesService.state.issueDisplay.showSubModelIssues =
					!this.issuesService.state.issueDisplay.showSubModelIssues;
				break;

			case "print":
				const printEndpoint = this.account + "/" + this.model + "/issues.html?ids=" + ids.join(",");
				const printUrl = this.clientConfigService.apiUrl(this.clientConfigService.GET_API, printEndpoint);
				this.$window.open(printUrl, "_blank");
				break;

			case "exportBCF":
				const bcfEndpoint = this.account + "/" + this.model + "/issues.bcfzip?ids=" + ids.join(",");
				const bcfUrl = this.clientConfigService.apiUrl(this.clientConfigService.GET_API, bcfEndpoint);
				this.$window.open(bcfUrl, "_blank");
				break;

			case "importBCF":
				this.$timeout(() => {
					this.bcfInputHandler.click();
				});
				break;

			case "filterRole":
				const roleIndex = this.issuesService.state.issueDisplay.excludeRoles.indexOf(this.menuOption.role);
				if (this.menuOption.selected) {
					if (roleIndex !== -1) {
						this.issuesService.state.issueDisplay.excludeRoles.splice(roleIndex, 1);
					}
				} else {
					if (roleIndex === -1) {
						this.issuesService.state.issueDisplay.excludeRoles.push(this.menuOption.role);
					}
				}
				break;
		}

	}

	public setContentAndSize() {
		// Setup what to show
		if (this.issuesService.state.issuesToShow.length > 0) {
			this.toShow = "list";
			const buttonSpace = 70;
			const numOfIssues = this.issuesService.state.issuesToShow.length;
			const heights = this.issuesService.state.heights.issuesListItemHeight + buttonSpace;
			const issuesHeight = numOfIssues * heights;
			this.contentHeight({height: issuesHeight });
		} else {
			this.toShow = "info";
			this.info = "There are currently no open issues";
			this.contentHeight({height: this.issuesService.state.heights.infoHeight});
		}

	}

	public selectIssue(issue) {
		this.issuesService.setSelectedIssue(issue, false, this.revision);
		angular.element(this.$window).triggerHandler("resize");
	}

	public isSelectedIssue(issue) {
		return this.issuesService.isSelectedIssue(issue);
	}

	public editIssue(issue) {
		this.onEditIssue({issue});
	}

}

export const IssuesListComponent: ng.IComponentOptions = {
	bindings: {
		account: "<",
		model: "<",
		revision: "<",
		allIssues: "<",
		issuesToShow: "<",
		filterChips: "=",
		filterText: "<",
		onEditIssue: "&",
		nonListSelect: "<",
		contentHeight: "&",
		menuOption: "<",
		importBcf: "&",
		selectedIssue: "<",
		issueDisplay: "<"
	},
	controller: IssuesListController,
	controllerAs: "vm",
	templateUrl: "templates/issues-list.html"
};

export const IssuesListComponentModule = angular
	.module("3drepo")
	.component("issuesList", IssuesListComponent);
