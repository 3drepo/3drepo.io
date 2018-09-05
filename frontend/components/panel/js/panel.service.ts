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

interface IMenuItem {
	hidden: boolean;
	label: string;
	value?: string;
	role?: string;
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
				},
				{
					hidden: false,
					upperDivider: true,
					disabled: true,
					label: "Created by: "
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

	public setPanelMenu(side: string, panelType: string, newMenu: any[]) {

		// Check if the card exists
		const item = this.panelCards[side].find((content) => {
			return content.type === panelType;
		});

		// Append all the menu items to it
		if (item && item.menu) {
			newMenu.forEach((newItem) => {
				const exists = item.menu.find( (oldItem) => oldItem.role === newItem.role);
				if (!exists) {
					item.menu.push(newItem);
				}
			});
		}

	}

	public setIssuesMenu(jobsData: any) {
		return;

		const menu: IMenuItem[] = [];
		jobsData.forEach((role) => {
			menu.push({
				value: "filterRole",
				hidden: false,
				role: role._id,
				label: role._id,
				keepCheckSpace: true,
				toggle: true,
				selected: true,
				stopClose: true,
				firstSelected: false,
				secondSelected: false
			});
		});

		this.setPanelMenu("left", "issues", menu);
	}

	public toggleChipsValueFromMenu(cardType: string, menuType: string, menuSubType: string) {
		let panelCard = this.panelCards.left.find( (pc) => pc.type === cardType);

		if (!!panelCard) {
			this.toggleChipsValueFromMenuInPanelCard(panelCard, menuType, menuSubType);
		}

		panelCard = this.panelCards.right.find( (pc) => pc.type === cardType);

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
