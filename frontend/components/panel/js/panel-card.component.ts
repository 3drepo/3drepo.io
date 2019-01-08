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
import { PanelService, IMenuItem } from './panel.service';
import { IChip } from './panel-card-chips-filter.component';

class PanelCardController implements ng.IController {

	public static $inject: string[] = [
		'$window',
		'$scope',
		'$timeout',
		'$element',
		'$compile',
		'$filter',

		'PanelService',
		'EventService'
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
	private chipsFilterChips: IChip[];

	constructor(
		private $window: ng.IWindowService,
		private $scope: ng.IScope,
		private $timeout: ng.ITimeoutService,
		private $element: ng.IRootElementService,
		private $compile: ng.ICompileService,
		private $filter: any,

		private panelService: PanelService,
		private eventService: any
	) {}

	public $onInit() {

		this.showHelp = false;
		this.showFilter = false; // This flag is only set in the panel-card-option-filter.component

		this.chipsFilterVisible = false; // This flag is only set in the panel-card-option-chip-filter.component
		this.chipsFilterSuggestions = [];
		this.chipsFilterChips = [];

		this.visibleStatus = false;
		this.showClearFilterButton = false;
		this.showAdd = false;
		this.hideMenuButton = false;
		this.currentHighlightedOptionIndex = -1;

		angular.element(() => {
			this.options = angular.element(this.$element[0].querySelector('#options'));
		});

		this.watchers();
	}

	public isDefined(variable) {
		return variable !== undefined && variable !== null;
	}

	public watchers() {

		this.$scope.$watch('vm.contentData.type', (newValue) => {
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
		this.$scope.$watch('vm.contentData.show', (newValue) => {
			if ((this.isDefined(newValue) && !newValue)) {
				this.hideItem();
			}
		});

		/*
		* Watch for card in edit mode
		*/
		this.$scope.$watch('vm.showEdit', (newValue) => {
			if (this.isDefined(newValue)) {
				this.hideItem();
			}
		});

		/*
		* Watch for content item to hide itself
		*/
		this.$scope.$watch('vm.hideSelectedItem', (newValue) => {
			if (this.isDefined(newValue) && newValue) {
				this.statusIcon = this.contentData.icon;
			}
		});

		/*
		* Watch for content item to hide itself
		*/
		this.$scope.$watch('vm.chipsFilterVisible', (visible) => {
			// Recalculate the height
			this.onContentHeightRequest(this.contentData.requestedHeight);

			if (!visible && this.chipsFilterChips.length > 0) {
				this.chipsFilterChips = [];
			}
		});

		this.$scope.$watch ( () => this.$element[0].querySelector('#header').clientHeight,
			(newValue) => {
				this.contentData.panelTakenHeight = newValue;
				this.onContentHeightRequest(this.contentData.requestedHeight);
		});

		this.$scope.$watch('vm.selectedMenuOption', (newValue: any) => {
			if (!!newValue && (newValue.toggleFilterChips || (newValue.subItem && newValue.subItem.toggleFilterChips))) {
				this.toggleFilterChips(newValue);
			}
		});

		this.$scope.$watchCollection('vm.chipsFilterChips', (newValue: IChip[], oldValue: IChip[]) => {
			const deletedChips = oldValue.filter((old) => newValue.indexOf(old) === -1);
			const addedChips = newValue.filter((newV) => oldValue.indexOf(newV) === -1);

			deletedChips.forEach((c) => {
				if (Date.prototype.isPrototypeOf(c.value)) {
					const types = c.type.split('_');
					this.panelService.setDateValueFromMenu(this.contentData.type,  types[0], types[1], null);
					return;
				}
				this.panelService.setSelectedFromMenu(this.contentData.type, c.type, c.value, false);
			});

			addedChips.forEach((c) => {
				if (Date.prototype.isPrototypeOf(c.value)) {
					const types = c.type.split('_');
					this.panelService.setDateValueFromMenu(this.contentData.type,  types[0], types[1], c.value);
					return;
				}

				this.panelService.setSelectedFromMenu(this.contentData.type, c.type, c.value, true);
			});

			if (newValue.length > 0 && !this.chipsFilterVisible) {
				this.chipsFilterVisible = true;
			}
		});

		this.$scope.$watchCollection('vm.contentData.menu', (newValue: IMenuItem[], oldValue: IMenuItem[]) => {
			if (!newValue) {
				return;
			}

			const suggestions = newValue.filter((mi) => mi.toggleFilterChips && !mi.date)
				.reduce((accum: IChip[], menuItem: IMenuItem) => {
				// Transforms the menu item to suggestions format

				const menuSuggestions: IChip[] = menuItem.menu.map((subItem) => ({
					name: subItem.label,
					nameType: menuItem.label,
					type : menuItem.value,
					value: subItem.value
				}));

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
		const filter = this.contentData.options.find((item) => item.type === 'filter');
		return filter !== undefined;
	}

	/*
	* Watch type on contentData to create content and tool bar options
	*/
	public hasChipsFilter() {
		const filter = this.contentData.options.find((item) => item.type === 'chips-filter');
		return filter !== undefined;
	}

	public toggleFilterChips(item: IMenuItem): void {
		if (item.subItem.date) { // TODO: find a way to generalize this and make it cleaner.
			this.toggleDateFilterChip(item);
		} else {
			this.toggleStringFilterChip(item);
		}
	}

	public toggleStringFilterChip(item: IMenuItem) {
		const chipIndex =  this.chipsFilterChips.findIndex( (c) => c.type === item.value && c.value === item.subItem.value) ;

		if (chipIndex === -1) {
			this.chipsFilterChips.push({
				name: item.subItem.label,
				nameType: item.label,
				value: item.subItem.value,
				type: item.value
			});
		} else {
			this.chipsFilterChips.splice(chipIndex, 1);
		}
	}

	public toggleDateFilterChip(item: IMenuItem) {
		const chipIndex =  this.chipsFilterChips.findIndex( (c) => c.type === item.value + '_' + item.subItem.value);

		const newChip: IChip = {
			name: this.$filter('date')(item.subItem.dateValue, 'd/M/yyyy'),
			nameType: item.label + item.subItem.label,
			value: item.subItem.dateValue,
			type: item.value + '_' + item.subItem.value
		};

		if (chipIndex === -1) {
			this.chipsFilterChips.push(newChip);
		} else {
			this.chipsFilterChips.splice(chipIndex, 1, newChip);
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
		this.statusIcon = 'arrow_back';
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

		if (this.contentData.hasOwnProperty('options')) {

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

		const isMenuOrFilter = optionType === 'menu' || optionType === 'filter';

		if (isMenuOrFilter) {
			optionElement += ` ng-if='!vm.hideMenuButton' `;
		} else {
			optionElement += ` ng-if='vm.contentData.options[${i}].visible'`;
		}

		this.contentData.options[i].color = '';

		const options = this.getOptionSpecificAttrs(optionType);
		optionElement += ` style='color:{{vm.contentData.options[${i}].color}}'
						   ${options} />`;

		return optionElement;
	}

	public getOptionSpecificAttrs(optionType) {

		switch (optionType) {
		case 'filter':
			return 'show-filter=\'vm.showFilter\'';

		case 'chips-filter':
			return 'chips-filter-visible=\'vm.chipsFilterVisible\' ng-show=\'!vm.hideMenuButton\'';

		case 'visible':
			return ' visible=\'vm.visible\'';

		case 'menu':
			return 'menu=\'vm.contentData.menu\' selected-menu-option=\'vm.selectedMenuOption\'';

		case 'close':
			return 'show=\'vm.contentData.show\'';
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
		account: '=',
		branch: '=',
		contentData: '=',
		model: '=',
		modelSettings: '=',
		onHeightRequest: '&',
		position: '=',
		revision: '=',
		selectedObjects: '=',
		setInitialSelectedObjects: '&'
	},
	controller: PanelCardController,
	controllerAs: 'vm',
	templateUrl: 'templates/panel-card.html'
};

export const PanelCardComponentModule = angular
	.module('3drepo')
	.component('panelCard', PanelCardComponent);
