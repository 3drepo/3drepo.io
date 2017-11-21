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

class PanelCardFilterController implements ng.IController {

	public static $inject: string[] = [
		"$timeout",
		"$scope",
		"$element",
	];

	private filterTimeout = null;
	private filterInputText;
	private filterInput;
	private filterText;
	private showClearFilterButton;
	private showFilter;

	constructor(
		private $timeout: ng.ITimeoutService,
		private $scope: ng.IScope,
		private $element: ng.IRootElementService,
	) {
		this.watchers();
	}

	public isDefined(variable) {
		return variable !== undefined && variable !== null;
	}

	public watchers() {

		this.$scope.$watch("vm.filterInputText", (newValue) => {
			if (this.isDefined(newValue)) {
				if (this.filterTimeout !== null) {
					this.$timeout.cancel(this.filterTimeout);
				}
				this.filterTimeout = this.$timeout(() => {
					this.filterText = this.filterInputText;
					this.showClearFilterButton = (this.filterInputText !== "");
				}, 50);
			}
		});

		this.$scope.$watch("vm.showFilter", (newValue) => {
			if (this.isDefined(newValue) && newValue) {
				this.$timeout(() => {
					this.filterInput = angular.element(this.$element[0].querySelector("#panelCardFilterInput"));
					this.filterInput.focus();
				});
			}
		});
	}

	public clearFilter() {
		this.filterInputText = "";
		this.filterInput.focus();
		this.showFilter = false;
	}

}

export const PanelCardFilterComponent: ng.IComponentOptions = {
	bindings: {
		filterText: "=",
		showFilter: "=",
	},
	controller: PanelCardFilterController,
	controllerAs: "vm",
	templateUrl: "templates/panel-card-filter.html",
};

export const PanelCardFilterComponentComponentModule = angular
	.module("3drepo")
	.component("panelCardFilter", PanelCardFilterComponent);
