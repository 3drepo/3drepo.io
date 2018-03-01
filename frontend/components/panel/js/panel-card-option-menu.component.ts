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
		"$timeout",
	];

	public menu;
	public selectedMenuOption;
	public sortIndex;

	constructor(
		private $timeout: ng.ITimeoutService,
	) {}

	public $ngInit() {}

	// TODO: Not actually sure what's going on here?
	public menuItemSelected(index: number) {

		const menuItem = this.menu[index];

		if (menuItem.hasOwnProperty("toggle")) {
			if (menuItem.toggle) {
				menuItem.selected = !menuItem.selected;
				this.selectedMenuOption = menuItem;
			} else {
				if (index !== this.sortIndex) {
					this.sortIndex = index;
				}
				this.menu[this.sortIndex].firstSelected = !this.menu[this.sortIndex].firstSelected;
				this.menu[this.sortIndex].secondSelected = !this.menu[this.sortIndex].secondSelected;
				this.selectedMenuOption = this.menu[this.sortIndex];
			}
		} else {
			this.selectedMenuOption = menuItem;
		}

		// TODO: What is this about? - James
		// 'Reset' this.selectedMenuOption so that selecting the same option can be registered down the line
		this.$timeout(() => {
			this.selectedMenuOption = undefined;
		});
	}

}

export const PanelCardOptionMenuComponent: ng.IComponentOptions = {
	bindings: {
		menu: "=",
		selectedMenuOption: "=",
	},
	controller: PanelCardOptionMenuController,
	controllerAs: "vm",
	templateUrl: "templates/panel-card-option-menu.html",
};

export const PanelCardOptionMenuComponentModule = angular
	.module("3drepo")
	.component("panelCardOptionMenu", PanelCardOptionMenuComponent);
