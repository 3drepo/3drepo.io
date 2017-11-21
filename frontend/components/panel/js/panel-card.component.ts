
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

class PanelCardController implements ng.IController {

	public static $inject: string[] = [
		"$window",
		"$scope",
		"$timeout",
		"$element",
		"$compile",

		"PanelService",
		"EventService",
	];

	public vm = this;

	private showHelp;
	private visibleStatus;
	private showFilter;
	private showClearFilterButton;
	private showAdd;
	private hideMenuButton;
	private currentHighlightedOptionIndex;
	private contentHeight;
	private contentData;
	private options;
	private statusIcon;
	private hideSelectedItem;

	private onHeightRequest;

	constructor(
		private $window: ng.IWindowService,
		private $scope: ng.IScope,
		private $timeout: ng.ITimeoutService,
		private $element: ng.IRootElementService,
		private $compile: ng.ICompileService,

		private PanelService: any,
		private EventService: any,
	) {}

	public $onInit() {

		this.showHelp = false;
		this.showFilter = false;
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
		* Change toolbar options when toggling add functionality
		*/
		this.$scope.$watch("vm.showAdd", (newValue)  => {
			if (this.isDefined(newValue)) {
				this.toggleAdd(newValue);
			}
		});

		/*
		* Watch for card in edit mode
		*/
		this.$scope.$watch("vm.showEdit", (newValue) => {
			if (this.isDefined(newValue)) {
				this.PanelService.handlePanelEvent(
					this.contentData.type,
					this.EventService.EVENT.PANEL_CARD_EDIT_MODE,
					{on: true},
				);
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
	}

	/*
		* Watch type on contentData to create content and tool bar options
		*/

	public hasFilter() {
		const filter = this.contentData.options.find((item) => {
			return item.type === "filter";
		});
		return filter !== undefined;
	}

	/**
	 * A content item is requesting a height change
	 * @param height
	 */
	public onContentHeightRequest(height) {
		this.contentHeight = height;
		this.onHeightRequest({
			contentItem: this.contentData,
			height: this.contentHeight,
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

		// TODO: We shouldn't use string concat and angular.element
		// definite antipattern
		let option;
		let optionElement;
		const optionData = this.contentData.options;

		if (this.contentData.hasOwnProperty("options")) {

			optionData.forEach((op, i) => {
				const optionType = op.type;
				optionElement = this.getOptionElement(optionType, i);
				option = angular.element(optionElement);

				// Create the element
				if (option !== null) {
					this.options.prepend(option);
					this.$compile(option)(this.$scope);
				}
			});

		}

	}

	public getOptionElement(optionType, i) {

		let optionElement = "<panel-card-option-" + optionType;
		optionElement += " id='panal_card_option_" + optionType + "'";

		const isMenuOrFilter = optionType === "menu" || optionType === "filter";

		if (isMenuOrFilter) {
			optionElement += " ng-if='!vm.hideMenuButton'";
		} else {
			optionElement += " ng-if='vm.contentData.options[" + i + "].visible'";
		}

		this.contentData.options[i].color = "";

		optionElement += " style='color:{{vm.contentData.options[" + i + "].color}}'";
		optionElement += this.getOptionSpecificData(optionType);
		optionElement += "><panel-card-option-" + optionType + ">";

		return optionElement;
	}

	public getOptionSpecificData(optionType) {

		switch (optionType) {
		case "filter":
			return " show-filter='vm.showFilter'";

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

	public toggleAdd(on) {
		if (on) {
			if (this.contentData.type === "issues") {
				this.showToolbarOptions(["filter", "menu"], false);
			}
			this.hideItem();
			this.PanelService.handlePanelEvent(
				this.contentData.type,
				this.EventService.EVENT.PANEL_CARD_ADD_MODE,
				{on: true},
			);
		} else {
			if (this.contentData.type === "issues") {
				this.showToolbarOptions(["filter", "menu"], true);
			}
			this.hideItem();
			this.PanelService.handlePanelEvent(
				this.contentData.type,
				this.EventService.EVENT.PANEL_CARD_ADD_MODE,
				{on: false},
			);
		}
	}

}

export const PanelCardComponent: ng.IComponentOptions = {
	bindings: {
		account: "=",
		branch: "=",
		contentData: "=",
		keysDown: "=",
		model: "=",
		modelSettings: "=",
		onHeightRequest: "&",
		onShowFilter: "&",
		position: "=",
		revision: "=",
		selectedObjects: "=",
		setInitialSelectedObjects: "&",
	},
	controller: PanelCardController,
	controllerAs: "vm",
	templateUrl: "templates/panel-card.html",
};

export const PanelCardComponentModule = angular
	.module("3drepo")
	.component("panelCard", PanelCardComponent);
