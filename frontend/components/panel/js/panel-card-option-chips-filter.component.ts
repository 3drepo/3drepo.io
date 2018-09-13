/**
 *  Copyright (C) 2018 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

class PanelCardOptionChipsFilterController implements ng.IController {

	public static $inject: string[] = [];
	public chipsFilterVisible: boolean;

	public toggleFilter(event: any) {
		event.stopPropagation();
		this.chipsFilterVisible = !this.chipsFilterVisible;
	}
}

export const PanelCardOptionChipsFilterComponent: ng.IComponentOptions = {
	bindings: {
		chipsFilterVisible: "="
	},
	controller: PanelCardOptionChipsFilterController,
	controllerAs: "vm",
	templateUrl: "templates/panel-card-option-chips-filter.html"
};

export const PanelCardOptionChipsFilterComponentModule = angular
	.module("3drepo")
	.component("panelCardOptionChipsFilter", PanelCardOptionChipsFilterComponent);
