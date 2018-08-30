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

class PanelCardChipsFilterController implements ng.IController {
	public static $inject: string[] = [
		"$mdConstant"
	];

	public suggestions: Array<{name: string, type: string}> = [];
	public chips: Array<{name: string, type: string}> = [];

	private selectedItem: any = null;
	private searchText: string = null;
	private chipSeparators: any[];
	private placeHolder: string = "Search";

	constructor(private $mdConstant: any) {
		this.chipSeparators = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA, $mdConstant.KEY_CODE.SPACE];
	}

	public $onInit() {
		this.chips = [];
	}

	private transformChip(chip) {
		// If it is an object, it's already a known chip
		if (angular.isObject(chip)) {
			return chip;
		}

		// Otherwise, create a new one
		return { name: chip, type: "" };
	}

	private querySearch(query) {
		const results = query ? (this.suggestions || []).filter( this.matchAutocomplete.bind(this, query)) : [];
		return results;
	}

	private formatChip(chip) {
		return  chip.type + (chip.type === "" ? "" : ":" ) + chip.name;
	}

	/**
	 * Filter the suggestion
	 */
	private matchAutocomplete(query, suggestion) {
		const l = angular.lowercase;
		const lowercaseQuery = l(query);
		return (l(suggestion.name).indexOf(lowercaseQuery) === 0) ||
				(l(suggestion.type).indexOf(lowercaseQuery) === 0);
	}
}

export const PanelCardChipsFilterComponent: ng.IComponentOptions = {
	bindings: {
		chips: "=",
		suggestions: "=",
		placeHolder: "@"
	},

	controller: PanelCardChipsFilterController,
	controllerAs: "vm",
	templateUrl: "templates/panel-card-chips-filter.html"
};

export const PanelCardChipsFilterComponentModule = angular
	.module("3drepo")
	.component("panelCardChipsFilter", PanelCardChipsFilterComponent);
