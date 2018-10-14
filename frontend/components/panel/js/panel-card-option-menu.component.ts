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
import { IMenuItem } from "./panel.service";

class PanelCardOptionMenuController implements ng.IController {

	public static $inject: string[] = [
		"$element",
		"$scope",
	];

	public menu;
	public buttonLabel: string = "";
	public selectedMenuOption;
	private isOpen:boolean = false;
	private elem;

	constructor(
		private $element: ng.IRootElementService,
		private $scope
	) {}

	public addPreventCloseToDatepicker() {
		const pickerButtons = this.$element[0].getElementsByClassName("md-datepicker button");
		Array.from(pickerButtons).forEach((p) => p.setAttribute("md-prevent-menu-close", "true"))
	}

	public menuItemSelected(menuItem: IMenuItem, parentMenuItem: IMenuItem) {
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

		menuItem = angular.copy(menuItem);

		// If its a submenu item thats being clicked then
		// pass on the parent and the item as a subitem
		if (!!parentMenuItem) {
			const subitem = menuItem;
			menuItem = angular.copy(parentMenuItem);
			menuItem.subItem = subitem;
		}

		this.selectedMenuOption = menuItem;
	}

	public onClickItem(menuItem: IMenuItem, parentMenuItem: IMenuItem = null) {
		console.log('menu method run');
		const elem = document.querySelector('.datePicker');
		// const elem = document.getElementsByTagName("md-datepicker");
		console.log(elem);
		this.isOpen = true;
		if (menuItem.date) {
			return;
		}
		this.menuItemSelected(menuItem, parentMenuItem);
	}

	public onDateChanged(item: IMenuItem, parentMenuItem: IMenuItem,  menu) {
		this.menuItemSelected(item, parentMenuItem);
		if (!item.stopClose) {
			menu.close(true, {closeAll: true});
		}
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
