/**
 *	Copyright (C) 2014 3D Repo Ltd
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
import { PanelService } from "./panel.service";

class PanelCardController implements ng.IController {

	public static $inject: string[] = [
		"$window",
		"$scope",
		"$timeout",
		"$element",
		"$compile",

		"PanelService",
		"EventService"
	];

	public vm = this;

	private showHelp;
	private visibleStatus;
	private showFilter;
	private chipsFilterVisible;
	private chipsFilterSuggestions;

	private showClearFilterButton;
	private showAdd;
	private hideMenuButton;
	private currentHighlightedOptionIndex;
	private contentHeight;
	private contentData;
	private options;
	private statusIcon;
	private hideSelectedItem;
	private selectedMenuOption;
	private onHeightRequest;
	private chipsFilterChips;

	constructor(
		private $window: ng.IWindowService,
		private $scope: ng.IScope,
		private $timeout: ng.ITimeoutService,
		private $element: ng.IRootElementService,
		private $compile: ng.ICompileService,

		private panelService: PanelService,
		private eventService: any
	) {}

	public $onInit() {

		this.showHelp = false;
		this.showFilter = false; // This flag is only set in the panel-card-option-filter.component

		this.chipsFilterVisible = false; // This flag is only set in the panel-card-option-chip-filter.component
		this.chipsFilterSuggestions = [];
		this.chipsFilterVisible = false;
		this.chipsFilterChips = [];

		this.visibleStatus = false;
		this.showClearFilterButton = false;
		this.showAdd = false;
		this.hideMenuButton = false;
		this.currentHighlightedOptionIndex = -1;

		angular.element(() => {
			this.options = angular.element(this.$element[0].querySelector("#options"));
		});

		this.watchers();
	}

	public isDefined(variable) {
		return variable !== undefined && variable !== null;
	}

	public watchers() {

		this.$scope.$watch("vm.contentData.type", (newValue) => {
			if (newValue) {
				angular.element(() => {
					this.createToolbarOptions();
					this.statusIcon = this.contentData.icon;
				});
			}
		});

		/*
		* Watch show on contentData to toggle elements off
		*/
		this.$scope.$watch("vm.contentData.show", (newValue) => {
			if ((this.isDefined(newValue) && !newValue)) {
				this.hideItem();
			}
		});

		/*
		* Watch for card in edit mode
		*/
		this.$scope.$watch("vm.showEdit", (newValue) => {
			if (this.isDefined(newValue)) {
				this.hideItem();
			}
		});

		/*
		* Watch for content item to hide itself
		*/
		this.$scope.$watch("vm.hideSelectedItem", (newValue) => {
			if (this.isDefined(newValue) && newValue) {
				this.statusIcon = this.contentData.icon;
			}
		});

		/*
		* Watch for content item to hide itself
		*/
		this.$scope.$watch("vm.chipsFilterVisible", (visible) => {
			// Recalculate the height
			this.onContentHeightRequest(this.contentData.requestedHeight);

			if (!visible && this.chipsFilterChips.length > 0) {
				this.chipsFilterChips = [];
			}
		});

		this.$scope.$watch ( () => this.$element[0].querySelector("#header").clientHeight,
			(newValue, oldValue) => {
				this.contentData.panelTakenHeight = newValue;
				this.onContentHeightRequest(this.contentData.requestedHeight);
		});

		this.$scope.$watch("vm.selectedMenuOption", (newValue: any) => {
			if (!!newValue && newValue.toggleFilterChips) {
				this.toggleFilterChips(newValue.value, newValue.subItem.value);
			}
		});

		this.$scope.$watchCollection("vm.chipsFilterChips", (newValue: any[], oldValue: any[]) => {
			let diff: any[] = newValue.filter( (nv) => oldValue.indexOf((ov) => nv.type === ov.type && nv.name === ov.name) < 0);

			diff = diff.concat(oldValue.filter((ov) =>
						newValue.indexOf((nv) => nv.type === ov.type && nv.name === ov.name) < 0));

			// if (newValue.length > oldValue.length) { // A chip has been added
			// 	diff = newValue[newValue.length - 1]; // Assumption: the new value is appended to the end of the chips array
			// }

			// if (newValue.length < oldValue.length) { // A chip has been deleted
			// 	diff = oldValue.find((ov) => !newValue.some( (nv) => nv.type === ov.type && nv.name === ov.name));
			// }

			if (!!diff) {  // this is for toggling the value in the menu
				diff.forEach((c) => this.panelService.toggleChipsValueFromMenu(this.contentData.type, c.type, c.name));
			}

			if (newValue.length > 0 && !this.chipsFilterVisible) {
				this.chipsFilterVisible = true;
			}
		});

		this.$scope.$watchCollection("vm.contentData.menu", (newValue: any[], oldValue: any[]) => {
			if (!newValue) {
				return;
			}

			const suggestions = newValue.filter((mi) => mi.toggleFilterChips).reduce((accum: any[], menuItem: any) => {
				// Transforms the menu item to suggestions format
				const menuSuggestions: any[] = menuItem.menu.map((subItem) => ({type : menuItem.value, name: subItem.value}));

				// Concats the new suggestions with the ones from previous menuitems
				return accum.concat(menuSuggestions);
			}, []);

			this.chipsFilterSuggestions = suggestions;
		});
	}

	/*
	* Watch type on contentData to create content and tool bar options
	*/
	public hasFilter() {
		const filter = this.contentData.options.find((item) => item.type === "filter");
		return filter !== undefined;
	}

	/*
	* Watch type on contentData to create content and tool bar options
	*/
	public hasChipsFilter() {
		const filter = this.contentData.options.find((item) => item.type === "chips-filter");
		return filter !== undefined;
	}

	public toggleFilterChips(type: string, name: string): void {
		const chipIndex = this.chipsFilterChips.findIndex( (c) => c.type === type && c.name === name);

		if (chipIndex === -1) {
			this.chipsFilterChips.push( { type, name });
		} else {
			this.chipsFilterChips.splice(chipIndex, 1);
		}
	}

	/**
	 * A content item is requesting a height change
	 * @param height
	 */
	public onContentHeightRequest(height) { // *** This method is angular-binded to
											// the content component inside the panel card ***
		this.contentHeight = height;

		// *** This method is angular-binded from the parent component that contains the panel card:
		// Alias for PanelController.heightRequest(contentItem: any, height: number) ***
		this.onHeightRequest({
			contentItem: this.contentData,
			height: this.contentHeight
		});
	}

	/**
	 * Content wants to show an individual item
	 */
	public showItem() {
		this.statusIcon = "arrow_back";
		this.hideMenuButton = true;
		this.hideSelectedItem = false; // So that a change to this value is propagated
	}

	/**
	 * Content wants to show it's main content
	 */
	public hideItem() {
		this.statusIcon = this.contentData.icon;
		this.hideMenuButton = false;
		this.hideSelectedItem = true;
	}

	/**
	 * Create the tool bar options
	 */
	public createToolbarOptions() {
		let option;
		let optionElement;
		const optionData = this.contentData.options;

		if (this.contentData.hasOwnProperty("options")) {

			optionData.forEach((op, i) => {
				const optionType = op.type;
				optionElement = this.getOptionElement(optionType, i);
				option = angular.element(optionElement);
				// Create the element
				if (option !== null && this.options) {
					this.options.prepend(option);
					this.$compile(option)(this.$scope);
				}
			});

		}

	}

	public getOptionElement(optionType, i) {

		let optionElement = `<panel-card-option-${optionType}
							id='panel-card-option-${optionType}'`;

		const isMenuOrFilter = optionType === "menu" || optionType === "filter";

		if (isMenuOrFilter) {
			optionElement += ` ng-if='!vm.hideMenuButton' `;
		} else {
			optionElement += ` ng-if='vm.contentData.options[${i}].visible'`;
		}

		this.contentData.options[i].color = "";

		const options = this.getOptionSpecificAttrs(optionType);
		optionElement += ` style='color:{{vm.contentData.options[${i}].color}}'
						   ${options} />`;

		return optionElement;
	}

	public getOptionSpecificAttrs(optionType) {

		switch (optionType) {
		case "filter":
			return "show-filter='vm.showFilter'";

		case "chips-filter":
			return "chips-filter-visible='vm.chipsFilterVisible'";

		case "visible":
			return " visible='vm.visible'";

		case "menu":
			return "menu='vm.contentData.menu' selected-menu-option='vm.selectedMenuOption'";

		case "close":
			return "show='vm.contentData.show'";
		}
	}

	public showToolbarOptions(addOptions, show) {
		this.contentData.options.forEach((option) => {
			if (addOptions.indexOf(option.type) !== -1) {
				option.visible = show;
			}
		});

	}

}

export const PanelCardComponent: ng.IComponentOptions = {
	bindings: {
		account: "=",
		branch: "=",
		contentData: "=",
		model: "=",
		modelSettings: "=",
		onHeightRequest: "&",
		position: "=",
		revision: "=",
		selectedObjects: "=",
		setInitialSelectedObjects: "&"
	},
	controller: PanelCardController,
	controllerAs: "vm",
	templateUrl: "templates/panel-card.html"
};

export const PanelCardComponentModule = angular
	.module("3drepo")
	.component("panelCard", PanelCardComponent);
