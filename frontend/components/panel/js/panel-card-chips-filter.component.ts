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

export interface IChip {
	name: string;
	nameType: string;
	value: string;
	type: string;
}

class PanelCardChipsFilterController implements ng.IController {
	public static $inject: string[] = [
		"$mdConstant"
	];

	public suggestions: IChip[] = [];
	public chips: IChip[] = [];

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

	private transformChip(chip): IChip {
		// If it is an object, it's already a known chip
		if (angular.isObject(chip)) {
			return chip;
		}

		// Otherwise, create a new one
		return { name: chip, value: chip, nameType: "", type: "" };
	}

	private querySearch(query: string): IChip[] {
		const results = query ? (this.suggestions || []).filter( this.matchAutocomplete.bind(this, query)) : [];
		return results;
	}

	private formatChip(chip) {
		return  chip.nameType + (chip.nameType === "" ? "" : ":" ) + chip.name;
	}

	/**
	 * Filter the suggestion
	 */
	private matchAutocomplete(query: string, suggestion: IChip): boolean {
		const l = angular.lowercase;
		const lowercaseQuery = l(query);
		return (l(suggestion.name).indexOf(lowercaseQuery) === 0) ||
				(l(suggestion.nameType).indexOf(lowercaseQuery) === 0);
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
