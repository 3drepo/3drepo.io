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

class PanelCardOptionMenuController implements ng.IController {

	public static $inject: string[] = [
		"$timeout"
	];

	public menu;
	public buttonLabel: string = "";
	public selectedMenuOption;

	constructor(
		private $timeout: ng.ITimeoutService
	) {}

	public $ngInit() {}

	public menuItemSelected(menuItem, parentMenuItem = null) {

		if (menuItem.hasOwnProperty("toggle")) {
			if (menuItem.toggle) {
				menuItem.selected = !menuItem.selected;
			} else {
				// If its not a toogle type item then it switches between
				// the two selected icons for the menu-item.
				// Normally used for sorting type of menu-item.

				menuItem.firstSelected = !menuItem.firstSelected;
				menuItem.secondSelected = !menuItem.secondSelected;
			}
		}

		if (!!parentMenuItem) {
			const subitem = angular.copy(menuItem);
			menuItem = angular.copy(parentMenuItem);
			menuItem.subItem = subitem;
		}

		this.selectedMenuOption = menuItem;
	}

}

export const PanelCardOptionMenuComponent: ng.IComponentOptions = {
	bindings: {
		menu: "=",
		selectedMenuOption: "=",
		buttonLabel: "&?"
	},
	controller: PanelCardOptionMenuController,
	controllerAs: "vm",
	templateUrl: "templates/panel-card-option-menu.html"
};

export const PanelCardOptionMenuComponentModule = angular
	.module("3drepo")
	.component("panelCardOptionMenu", PanelCardOptionMenuComponent);
