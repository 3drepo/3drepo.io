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

const SORT_BUTTON_STATES = {
	ASCENDING: "asc",
	DESCENDNIG: "desc"
};

class ListSortButtonController implements ng.IController {
	public static $inject: string[] = [];

	private SORT_BUTTON_STATES = SORT_BUTTON_STATES;
	private currentSort;

	private onChange;

	public $onInit(): void {
		this.currentSort = SORT_BUTTON_STATES.ASCENDING;
	}

	public onSortChange(): void {
		if (this.currentSort === SORT_BUTTON_STATES.ASCENDING) {
			this.currentSort = SORT_BUTTON_STATES.DESCENDNIG;
		} else if (this.currentSort === SORT_BUTTON_STATES.DESCENDNIG) {
			this.currentSort = SORT_BUTTON_STATES.ASCENDING;
		}

		if (this.onChange) {
			this.onChange({order: this.currentSort});
		}
	}

	public isDescending(): boolean {
		return this.currentSort === SORT_BUTTON_STATES.DESCENDNIG;
	}
}

export const ListSortButtonComponent: ng.IComponentOptions = {
	bindings: {
		onChange: "&?"
	},
	controller: ListSortButtonController,
	controllerAs: "vm",
	templateUrl: "templates/list-sort-button.html"
};

export const ListSortButtonComponentModule = angular
	.module("3drepo")
	.component("listSortButton", ListSortButtonComponent);
