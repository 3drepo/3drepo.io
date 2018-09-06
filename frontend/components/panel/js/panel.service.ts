/**
 *  Copyright (C) 2017 3D Repo Ltd
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

interface IPanelCards {
	left: IPanelCard[];
	right: IPanelCard[];
}

interface IPanelCard {
	type: string;
	title: string;
	showLiteMode: boolean;
	show: boolean;
	help: string;
	icon: string;
	fixedHeight: boolean;
	options: any[];
	add?: boolean;
	menu?: IMenuItem[];
	minHeight?: number;
}

export interface IMenuItem {
	hidden: boolean;
	label: string;
	value?: string;
	selected?: boolean;
	stopClose?: boolean;
	firstSelectedIcon?: string;
	secondSelectedIcon?: string;
	toggle?: boolean;
	toggleFilterChips?: boolean;
	firstSelected?: boolean;
	secondSelected?: boolean;
	keepCheckSpace?: boolean;
	noToggle?: boolean;
	icon?: string;
	divider?: boolean;
	upperDivider?: boolean;
	disabled?: boolean;
	menu?: IMenuItem[];
	subItem?: IMenuItem;
}

export class PanelService {

	public static $inject: string[] = [
		"EventService",
		"TreeService"
	];

	private panelCards: IPanelCards;
	private templatepanelCards: IPanelCards;

	constructor(
		private EventService: any,
		private TreeService: any
	) {
		this.reset();
	}

	public reset() {
		this.panelCards = {
			left: [],
			right: []
		};

		this.panelCards.left.push({
			type: "issues",
			title: "Issues",
			showLiteMode: true,
			show: true,
			help: "List current issues",
			icon: "place",
			menu: [
				{
					hidden: false,
					value: "print",
					label: "Print",
					selected: false,
					noToggle: true,
					icon: "fa-print"
				},
				{
					hidden: false,
					value: "importBCF",
					label: "Import BCF",
					selected: false,
					noToggle: true,
					icon: "fa-upload"
				},
				{
					hidden: false,
					value: "exportBCF",
					label: "Export BCF",
					selected: false,
					noToggle: true,
					icon: "fa-cloud-download",
					divider: true
				},
				{
					hidden: false,
					value: "sortByDate",
					label: "Sort by Date",
					firstSelectedIcon: "fa-sort-amount-desc",
					secondSelectedIcon: "fa-sort-amount-asc",
					toggle: false,
					selected: false,
					firstSelected: true,
					secondSelected: false,
					keepCheckSpace: false
				},
				{
					hidden: false,
					value: "status",
					label: "Status",
					toggle: false,
					selected: false,
					firstSelected: false,
					secondSelected: false,
					keepCheckSpace: false,
					toggleFilterChips: true,
					menu: [{
							hidden: false,
							value: "open",
							label: "Open",
							toggle: true
						}, {
							hidden: false,
							value: "in progress",
							label: "In progress",
							toggle: true
						}, {
							hidden: false,
							value: "for approval",
							label: "For approval",
							toggle: true
						}, {
							hidden: false,
							value: "closed",
							label: "Closed",
							toggle: true
						}]
				},
				{
					hidden: false,
					value: "priority",
					label: "Priority",
					toggle: false,
					selected: false,
					firstSelected: false,
					secondSelected: false,
					keepCheckSpace: false,
					toggleFilterChips: true,
					menu: [{
							hidden: false,
							value: "none",
							label: "None",
							toggle: true
						}, {
							hidden: false,
							value: "low",
							label: "Low",
							toggle: true
						}, {
							hidden: false,
							value: "medium",
							label: "Medium",
							toggle: true
						}, {
							hidden: false,
							value: "high",
							label: "High",
							toggle: true
						}]
				},
				{
					hidden: false,
					value: "showSubModels",
					label: "Show sub model issues",
					toggle: true,
					selected: false,
					firstSelected: false,
					secondSelected: false,
					keepCheckSpace: true
				}
			],
			minHeight: 260,
			fixedHeight: false,
			options: [
				{type: "menu", visible: true},
				{
					type: "chips-filter",
					visible: true,
					suggestions: [
						{type: "Status", name: "closed"},
						{type: "Status", name: "open"}]
				}
			],
			add: true
		});

		this.panelCards.left.push({
			type: "groups",
			title: "Groups",
			showLiteMode: true,
			show: false,
			help: "List current groups",
			icon: "group_work",
			minHeight: 80,
			fixedHeight: false,
			menu: [
				{
					hidden: false,
					value: "overrideAll",
					label: "Override All",
					selected: false,
					toggle: true,
					keepCheckSpace: true
				},
				{
					hidden: false,
					value: "deleteAll",
					label: "Delete All",
					selected: false,
					noToggle: true,
					icon: "delete"
				}
			],
			options: [
				{type: "menu", visible: true}
			]
		});

		this.panelCards.left.push({
			type: "viewpoints",
			title: "Views",
			showLiteMode: true,
			show: false,
			help: "List current viewpoints",
			icon: "camera_alt",
			minHeight: 80,
			fixedHeight: false,
			options: []
		});

		this.panelCards.left.push({
			type: "tree",
			title: "Tree",
			showLiteMode: true,
			show: false,
			help: "Model elements shown in a tree structure",
			icon: "device_hub",
			minHeight: 80,
			fixedHeight: false,
			menu: [
				{
					hidden: false,
					value: "showAll",
					label: "Show All",
					selected: false,
					noToggle: true,
					icon: "fa-eye"
				},
				{
					hidden: false,
					value: "isolate",
					label: "Isolate Selected",
					selected: false,
					noToggle: true,
					icon: "fa-scissors"
				},
				{
					hidden: false,
					value: "hideIfc",
					label: "Hide IFC spaces",
					selected: true,
					toggle: true,
					keepCheckSpace: true,
					icon: "fa-home"
				}
			],
			options: [
				{type: "menu", visible: true},
				{type: "filter", visible: true}
			]
		});

		this.panelCards.left.push({
			type: "clip",
			title: "Clip",
			showLiteMode: false,
			show: false,
			help: "Clipping plane",
			icon: "crop",
			fixedHeight: true,
			options: [
				{type: "visible", visible: true}
			]
		});

		this.panelCards.left.push({
			type: "compare",
			title: "Compare",
			showLiteMode: false,
			show: false,
			help: "Show clashes and differences between models",
			icon: "compare",
			minHeight: 80,
			fixedHeight: false,
			options: []
		});

		this.panelCards.left.push({
			type: "gis",
			title: "GIS",
			showLiteMode: false,
			show: false,
			help: "Add various GIS data to the view",
			icon: "layers",
			minHeight: 80,
			fixedHeight: false,
			options: []
		});

		this.panelCards.right.push({
			type: "docs",
			title: "BIM Data",
			show: false,
			showLiteMode: false,
			help: "Documents",
			icon: "content_copy",
			minHeight: 80,
			fixedHeight: false,
			options: [
				{type: "close", visible: true}
			]
		});

	}

	/**
	 * Adds a menu item for chips filtering.
	 * This method is used from within the contained panelCard
	 * generally for creating menues from data from an API call.
	 *
	 * @param panelType The type of the panel e.g. "issues"
	 * @param menuItem The new menu containing all the menu items for filtering
	 * @param subItems The menu items that will be added to the new menu
	 */
	public setChipFilterMenuItem( panelType: string, menuItem: any, subItems: any[] ) {
		let panel: IPanelCard = this.panelCards.left.find((pc) => pc.type === panelType );

		const newMenu: IMenuItem =  {
			hidden: false,
			value: menuItem.value,
			label: menuItem.label,
			toggle: false,
			toggleFilterChips: true
		};

		newMenu.menu = subItems.map((si) => ({
			value: si.value,
			label: si.label,
			hidden: false,
			toggle: true
		}));

		if (!!panel) {
			this.setPanelMenu(panel, newMenu);
		}

		panel = this.panelCards.right.find((pc) => pc.type === panelType );

		if (!!panel) {
			this.setPanelMenu(panel, newMenu);
		}
	}

	public setPanelMenu(panel: IPanelCard,  menu: any) {
		const oldMenuIndex = panel.menu.findIndex((mi) => mi.value === menu.value);

		if (oldMenuIndex > 0) {
			panel.menu[oldMenuIndex] = menu;
		} else {
			panel.menu.push(menu);
		}
	}

	/**
	 * Toggles the selected property inside a submenuitem.
	 * This method is being used by the chips filter subsystem for reflecting
	 * which chips are actually being selected in the chips.
	 * @param panelCardType the panel card that contains the menu. ie: "issues"
	 * @param menuType the menu type. ie: "priority" from  the issues panel card
	 * @param menuSubType the submenu type. ie: "none" in the priority menu from the issues panel card
	 */
	public toggleChipsValueFromMenu(panelCardType: string, menuType: string, menuSubType: string) {
		let panelCard = this.panelCards.left.find( (pc) => pc.type === panelCardType);

		if (!!panelCard) {
			this.toggleChipsValueFromMenuInPanelCard(panelCard, menuType, menuSubType);
		}

		panelCard = this.panelCards.right.find( (pc) => pc.type === panelCardType);

		if (!!panelCard) {
			this.toggleChipsValueFromMenuInPanelCard(panelCard, menuType, menuSubType);
		}
	}

	public toggleChipsValueFromMenuInPanelCard(panelCard: IPanelCard,  menuType: string, menuSubType: string ) {
		const menu = panelCard.menu.find((m) => m.value === menuType);
		if (!!menu && menu.toggleFilterChips) {
			const item = menu.menu.find((m) => m.value === menuSubType );
			if (!!item) {
				item.selected = !item.selected;
			}
		}
	}

	public hideSubModels(issuesCardIndex: number, hide: boolean) {

		this.panelCards.left[issuesCardIndex].menu
			.forEach((item) => {
				if (item.value === "showSubModels") {
					item.hidden = hide;
				}
			});

	}

	public getCardIndex(type: string): number {
		let index = -1;
		const obj = this.panelCards.left.forEach((panel, i) => {
			if (panel.type === type) {
				index = i;
			}
		});
		return index;
	}

	public getMenuIndex(cardIndex: any, value: string): number {
		let index = -1;
		const obj = this.panelCards.left[cardIndex].menu.forEach((item, i) => {
			if (item.value === value) {
				index = i;
			}
		});
		return index;
	}

	public setMenuItemToggle(panelType: string, menuItemValue: string, on: boolean) {
		const cardIndex = this.getCardIndex(panelType);
		const menuItemIndex = this.getMenuIndex(cardIndex, menuItemValue);

		const hideIfcMenuItem = this.panelCards.left[cardIndex]
			.menu[menuItemIndex];

		// Change state if different
		if (hideIfcMenuItem.selected !== on) {
			hideIfcMenuItem.selected = on;
		}
	}

	public setHideIfc(value: boolean) {
		this.setMenuItemToggle("tree", "hideIfc", value);
	}

	public setOverrideAll(value: boolean) {
		this.setMenuItemToggle("groups", "overrideAll", value);
	}
}

export const PanelServiceModule = angular
	.module("3drepo")
	.service("PanelService", PanelService);
