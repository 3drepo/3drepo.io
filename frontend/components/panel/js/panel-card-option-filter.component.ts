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

class PanelCardOptionFilterController implements ng.IController {

	public static $inject: string[] = [];

	public showFilter;

	constructor() {
		this.showFilter = false;
	}

	// TODO: This is a work around because
	// not entirely sure how this.menu is generated etc
	public toggleFilter(event) {
		event.stopPropagation();
		this.showFilter = !this.showFilter;
	}

}

export const PanelCardOptionFilterComponent: ng.IComponentOptions = {
	bindings: {
		showFilter: "=",
	},
	controller: PanelCardOptionFilterController,
	controllerAs: "vm",
	templateUrl: "templates/panel-card-option-filter.html",
};

export const PanelCardOptionFilterComponentModule = angular
	.module("3drepo")
	.component("panelCardOptionFilter", PanelCardOptionFilterComponent);
