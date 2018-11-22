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
import * as API from '../../../services/api";
import { APIService } from "../../home/js/api.service';
import { dispatch } from "../../../helpers/migration";
import { IChip } from '../../panel/js/panel-card-chips-filter.component';
import { IssuesService } from "./issues.service";
import { NotificationsActions } from "../../../modules/notifications";
import { StateManagerService } from "../../home/js/state-manager.service";

class IssuesListController implements ng.IController {

	public static $inject: string[] = [
		'$scope',
		'$window',
		'$timeout',
		'$compile',
		'$element',
		'$filter',

		'IssuesService',
        'ClientConfigService',
        'StateManager',
		'PanelService'
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
		private $filter,

		private issuesService: IssuesService,
		private clientConfigService: any,
		private stateManager: StateManagerService,
		private PanelService: any
	) {}

	public $onInit() {
		this.toShow = 'list';
		this.focusedIssueIndex = null;
		this.internalSelectedIssue = null;
		this.setupBcfImportInput(); // Necessary since angularjs doesnt support ng-change with file typeinputs.
		this.watchers();
	}

	public watchers() {

		this.$scope.$watch(
			() => {
				return this.issuesService.state.allIssues;
			},
			() => {
				this.allIssues = this.issuesService.state.allIssues;
				this.issuesService.setupIssuesToShow(this.model, this.filterChips);
			},
			true
		);

		this.$scope.$watch("vm.stateManager.state.notificationId", this.filterByNotification.bind(this));

		this.$scope.$watch('vm.issuesToShow', () => {
			this.setContentAndSize();
			this.issuesService.showIssuePins();
		});

		this.$scope.$watchCollection('vm.filterChips', (chips: IChip[], oldChips: IChip[]) => {
			const dateFromChip = chips.find((c) => c.type === 'date_from');
			const dateToChip = chips.find((c) => c.type === 'date_to');

			const oldDateFromChip = oldChips.find((c) => c.type === 'date_from');
			const oldDateToChip = oldChips.find((c) => c.type === 'date_to');

			if (this.stateManager.state.notificationId && chips.length === 0) {
				this.stateManager.state.notificationId = null;
			}

			if (!!dateFromChip && !!dateToChip) {
				if (dateFromChip.value.getTime() > dateToChip.value.getTime()) {
					if (!oldDateFromChip  || dateFromChip.value !== oldDateFromChip.value) {
						this.issuesService.setToDateMenuValue(dateFromChip.value);
						dateToChip.value = dateFromChip.value;
						dateToChip.name = this.$filter('date')(dateToChip.value, 'd/M/yyyy');
					}

					if (!oldDateToChip  || dateToChip.value !== oldDateToChip.value) {
						this.issuesService.setFromDateMenuValue(dateToChip.value);
						dateFromChip.value = dateToChip.value;
						dateFromChip.name = this.$filter('date')(dateFromChip.value, 'd/M/yyyy');
					}
				}
			}

			this.issuesService.setupIssuesToShow(this.model, chips);
		});

		this.$scope.$watch('vm.menuOption', () => {

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

	public filterByNotification(notificationId) {
		if (notificationId) {
			let chip: IChip = {name: "assignedIssues",
			nameType: "Notification",
			value: [],
			type: "notification"};

			this.filterChips = [chip];

			dispatch(NotificationsActions.sendUpdateNotificationRead(notificationId, true));
			API.getNotification(notificationId)
			.then((n) => {
				chip = {name: "assignedIssues",
					nameType: "Notification",
					value: n.data.issuesId,
					type: "notification"};

				this.filterChips = [chip];
			});
		}
	}

	public setupBcfImportInput() {
		document.getElementById('bcfImportInput').addEventListener('change', this.onChangeBCFInput.bind(this));
	}

	public onChangeBCFInput(event: Event): void {
		const input: HTMLInputElement = event.currentTarget as HTMLInputElement;

		if (input.files) {
			this.importBcf({file: input.files[0]});
		} else {
			console.error('No file selected');
		}

		input.value = null;
	}

	public handleMenuOptions() {
		const ids = [];
		this.issuesService.state.issuesToShow.forEach((issue) => {
			ids.push(issue._id);
		});

		switch (this.menuOption.value) {

			case 'sortByDate':
				this.issuesService.state.issueDisplay.sortOldestFirst =
					!this.issuesService.state.issueDisplay.sortOldestFirst;
				break;

			case 'showClosed':
				this.issuesService.state.issueDisplay.showClosed =
					!this.issuesService.state.issueDisplay.showClosed;
				break;

			case 'showSubModels':
				this.issuesService.state.issueDisplay.showSubModelIssues =
					!this.issuesService.state.issueDisplay.showSubModelIssues;
				break;

			case 'print':
				const printEndpoint = this.account + '/' + this.model + '/issues.html?ids=' + ids.join(',');
				const printUrl = this.clientConfigService.apiUrl(this.clientConfigService.GET_API, printEndpoint);
				this.$window.open(printUrl, '_blank');
				break;

			case 'exportBCF':
				const bcfEndpoint = this.account + '/' + this.model + '/issues.bcfzip?ids=' + ids.join(',');
				const bcfUrl = this.clientConfigService.apiUrl(this.clientConfigService.GET_API, bcfEndpoint);
				this.$window.open(bcfUrl, '_blank');
				break;

			case 'downloadJSON':
				const jsonEndpoint = this.account + '/' + this.model + '/issues.json';
				this.PanelService.downloadJSON('issues', jsonEndpoint);
				break;

			case 'importBCF':
				document.getElementById('bcfImportInput').click();
				break;

			case 'filterRole':
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
			this.toShow = 'list';
			const buttonSpace = 70;
			const numOfIssues = this.issuesService.state.issuesToShow.length;
			const heights = this.issuesService.state.heights.issuesListItemHeight + buttonSpace;
			const issuesHeight = numOfIssues * heights;
			this.contentHeight({height: issuesHeight });
		} else {
			this.toShow = 'info';
			this.info = this.filterChips.length > 0 ? 'No results found' : 'There are currently no open issues';
			this.contentHeight({height: this.issuesService.state.heights.infoHeight});
		}

	}

	public selectIssue(issue) {
		this.issuesService.setSelectedIssue(issue, false, this.revision);
		angular.element(this.$window).triggerHandler('resize');
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
		account: '<',
		model: '<',
		revision: '<',
		allIssues: '<',
		issuesToShow: '<',
		filterChips: '=',
		filterText: '<',
		onEditIssue: '&',
		nonListSelect: '<',
		contentHeight: '&',
		menuOption: '<',
		importBcf: '&',
		selectedIssue: '<',
		issueDisplay: '<'
	},
	controller: IssuesListController,
	controllerAs: 'vm',
	templateUrl: 'templates/issues-list.html'
};

export const IssuesListComponentModule = angular
	.module('3drepo')
	.component('issuesList', IssuesListComponent);
