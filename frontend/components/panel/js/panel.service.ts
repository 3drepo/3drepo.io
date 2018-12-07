import { APIService } from './../../home/js/api.service';
import { IssuesChatEvents } from '../../chat/js/issues.chat.events';
import { consolidateStreamedStyles } from 'styled-components';

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
	isReactComponent?: boolean;
	panelTakenHeight?: number;
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
	date?: boolean;
	dateValue?: Date;
}

export class PanelService {

	public static $inject: string[] = [
		'$filter',
		'$state',
		'EventService',
		'TreeService',
		'APIService',
		'ViewerService'
	];

	private panelCards: IPanelCards;
	private templatepanelCards: IPanelCards;

	constructor(
		private $filter: any,
		private $state: any,
		private EventService: any,
		private TreeService: any,
		private apiService: APIService,
		private viewerService: any
	) {
		this.reset();
	}

	public reset() {
		const { issueId, riskId } = this.$state.params;
		this.panelCards = {
			left: [],
			right: []
		};

		this.panelCards.left.push({
			type: 'issues',
			title: 'Issues',
			showLiteMode: true,
			show: issueId || !riskId,
			help: 'List current issues',
			icon: 'place',
			menu: [
				{
					hidden: false,
					value: 'print',
					label: 'Create Report',
					selected: false,
					noToggle: true,
					icon: 'fa-print'
				},
				{
					hidden: false,
					value: 'importBCF',
					label: 'Import BCF',
					selected: false,
					noToggle: true,
					icon: 'fa-upload'
				},
				{
					hidden: false,
					value: 'exportBCF',
					label: 'Export BCF',
					selected: false,
					noToggle: true,
					icon: 'fa-cloud-download',
					divider: true
				},
				{
					hidden: false,
					value: 'downloadJSON',
					label: 'Download JSON',
					selected: false,
					noToggle: true,
					icon: 'fa-download',
					divider: true
				},
				{
					hidden: false,
					value: 'sortByDate',
					label: 'Sort by Date',
					firstSelectedIcon: 'fa-sort-amount-desc',
					secondSelectedIcon: 'fa-sort-amount-asc',
					toggle: false,
					selected: false,
					firstSelected: true,
					secondSelected: false,
					keepCheckSpace: false
				},
				{
					hidden: false,
					value: 'status',
					label: 'Status',
					toggle: false,
					selected: false,
					firstSelected: false,
					secondSelected: false,
					keepCheckSpace: false,
					toggleFilterChips: true,
					upperDivider: true,
					menu: [{
							hidden: false,
							value: 'open',
							label: 'Open',
							toggle: true,
							stopClose: true
						}, {
							hidden: false,
							value: 'in progress',
							label: 'In progress',
							toggle: true,
							stopClose: true
						}, {
							hidden: false,
							value: 'for approval',
							label: 'For approval',
							toggle: true
						}, {
							hidden: false,
							value: 'closed',
							label: 'Closed',
							toggle: true,
							stopClose: true
						}]
				},
				{
					hidden: false,
					value: 'priority',
					label: 'Priority',
					toggle: false,
					selected: false,
					firstSelected: false,
					secondSelected: false,
					keepCheckSpace: false,
					toggleFilterChips: true,
					menu: [{
							hidden: false,
							value: 'none',
							label: 'None',
							toggle: true,
							stopClose: true
						}, {
							hidden: false,
							value: 'low',
							label: 'Low',
							toggle: true,
							stopClose: true
						}, {
							hidden: false,
							value: 'medium',
							label: 'Medium',
							toggle: true,
							stopClose: true
						}, {
							hidden: false,
							value: 'high',
							label: 'High',
							toggle: true,
							stopClose: true
						}]
				},
				{
					value: 'topic_type', // the whole menu will be replaced once the topic types are loaded
					hidden: false,
					label: 'Type',
					toggle: false
				},
				{
					value: 'creator_role', // the whole menu will be replaced once the creators roles are loaded
					hidden: false,
					label: 'Created by',
					toggle: false
				},
				{
					value: 'assigned_roles', // the whole menu will be replaced once the assigned roles are loaded
					hidden: false,
					label: 'Assigned to',
					toggle: false
				},
				{
					value: 'date',
					hidden: false,
					label: 'Date',
					toggle: false,
					menu: [{
							hidden: false,
							value: 'from',
							label: 'From',
							stopClose: true,
							toggleFilterChips: true,
							date: true
						},
						{
							hidden: false,
							value: 'to',
							label: 'To     ',
							stopClose: true,
							toggleFilterChips: true,
							date: true
						}
					]
				},
				{
					hidden: false,
					value: 'showSubModels',
					label: 'Show sub model issues',
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
				{type: 'menu', visible: true},
				{
					type: 'chips-filter',
					visible: true
				}
			],
			add: true
		});

		this.panelCards.left.push({
			type: 'risks',
			title: 'SafetiBase',
			showLiteMode: true,
			show: Boolean(riskId),
			help: 'Risk register',
			icon: 'report_problem',
			minHeight: 260,
			fixedHeight: false,
			menu: [
				{
					hidden: false,
					value: 'print',
					label: 'Create Report',
					selected: false,
					noToggle: true,
					icon: 'fa-print'
				},
				{
					hidden: false,
					value: 'showPins',
					label: 'Show Pins',
					toggle: true,
					selected: true,
					noToggle: false,
					keepCheckSpace: true
				},
				{
					hidden: false,
					value: 'downloadJSON',
					label: 'Download JSON',
					selected: false,
					noToggle: true,
					icon: 'fa-download'
				},
				{
					hidden: false,
					value: 'mitigation_status',
					label: 'Mitigation Status',
					toggle: false,
					selected: false,
					firstSelected: false,
					secondSelected: false,
					keepCheckSpace: false,
					toggleFilterChips: true,
					upperDivider: true,
					menu: [{
							hidden: false,
							value: '',
							label: 'Unmitigated',
							toggle: true,
							stopClose: true
						}, {
							hidden: false,
							value: 'proposed',
							label: 'Proposed',
							toggle: true,
							stopClose: true
						}, {
							hidden: false,
							value: 'agreed_partial',
							label: 'Agreed (Partial)',
							toggle: true,
							stopClose: true
						}, {
							hidden: false,
							value: 'agreed_fully',
							label: 'Agreed (Fully)',
							toggle: true,
							stopClose: true
						}, {
							hidden: false,
							value: 'rejected',
							label: 'Rejected',
							toggle: true,
							stopClose: true
						}]
				},
				{
					value: 'creator_role', // the whole menu will be replaced once the creators roles are loaded
					hidden: false,
					label: 'Created by',
					toggle: false
				},
				{
					value: 'assigned_roles', // the whole menu will be replaced once the assigned roles are loaded
					hidden: false,
					label: 'Assigned to',
					toggle: false
				}
			],
			options: [
				{type: 'menu', visible: true},
				{type: 'chips-filter', visible: true}
			],
			add: true
		});

		this.panelCards.left.push({
			type: 'groups',
			title: 'Groups',
			showLiteMode: true,
			show: false,
			help: 'List current groups',
			icon: 'group_work',
			minHeight: 80,
			fixedHeight: false,
			menu: [
				{
					hidden: false,
					value: 'overrideAll',
					label: 'Override All',
					selected: false,
					toggle: true,
					keepCheckSpace: true
				},
				{
					hidden: false,
					value: 'deleteAll',
					label: 'Delete All',
					selected: false,
					noToggle: true,
					icon: 'fa-trash'
				},
				{
					hidden: false,
					value: 'downloadJSON',
					label: 'Download JSON',
					selected: false,
					noToggle: true,
					icon: 'fa-download'
				}
			],
			options: [
				{type: 'menu', visible: true},
				{type: 'filter', visible: true}
			],
			add: true
		});

		this.panelCards.left.push({
			type: 'viewpoints',
			title: 'Views',
			showLiteMode: true,
			show: false,
			help: 'List current viewpoints',
			icon: 'camera_alt',
			minHeight: 80,
			fixedHeight: false,
			options: [
				{type: 'filter', visible: true}
			],
			isReactComponent: true
		});

		this.panelCards.left.push({
			type: 'tree',
			title: 'Tree',
			showLiteMode: true,
			show: false,
			help: 'Model elements shown in a tree structure',
			icon: 'device_hub',
			minHeight: 80,
			fixedHeight: false,
			menu: [
				{
					hidden: false,
					value: 'showAll',
					label: 'Show All',
					selected: false,
					noToggle: true,
					icon: 'fa-eye'
				},
				{
					hidden: false,
					value: 'isolate',
					label: 'Isolate Selected',
					selected: false,
					noToggle: true,
					icon: 'fa-scissors'
				},
				{
					hidden: false,
					value: 'hideIfc',
					label: 'Hide IFC spaces',
					selected: true,
					toggle: true,
					keepCheckSpace: true,
					icon: 'fa-home'
				}
			],
			options: [
				{type: 'menu', visible: true},
				{type: 'filter', visible: true}
			]
		});

		this.panelCards.left.push({
			type: 'compare',
			title: 'Compare',
			showLiteMode: false,
			show: false,
			help: 'Show clashes and differences between models',
			icon: 'compare',
			minHeight: 265,
			fixedHeight: false,
			options: []
		});

		this.panelCards.left.push({
			type: 'gis',
			title: 'GIS',
			showLiteMode: false,
			show: false,
			help: 'Add various GIS data to the view',
			icon: 'layers',
			minHeight: 265,
			fixedHeight: false,
			options: [],
			isReactComponent: true
		});

		this.panelCards.right.push({
			type: 'docs',
			title: 'BIM Data',
			show: false,
			showLiteMode: false,
			help: 'Documents',
			icon: 'content_copy',
			minHeight: 80,
			fixedHeight: false,
			options: [
				{type: 'close', visible: true}
			]
		});

	}

	/**
	 * Download server response JSON file from panel menu
	 *
	 * @param content The JSON response to download
	 * @param fileName Choice of filename : "risks.json", "issues.json", "groups.json"
	 * @param modelID Model ID to used to obtain model data.
	 * @param account User account used as param to obtain model data.
	 */

	public downloadJSON(fileName, endpoint) {
		const timestamp = this.$filter('prettyDate')(Date.now(), {showSeconds: false});
		const modelName = this.viewerService.viewer ? this.viewerService.viewer.settings.name : '';
		this.apiService.get(endpoint).then((res) => {
			const content = JSON.stringify(res.data, null, 2);
			const a = document.createElement('a');
			const file = new Blob([content]);
			a.href = URL.createObjectURL(file);
			a.download = `${modelName}_${timestamp}_${fileName}.json`;
			document.body.appendChild(a); // needed for firefox
			a.click();
			document.body.removeChild(a);
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
	public setChipFilterMenuItem(panelType: string, menuItem: any, subItems: any[]) {
		let panel: IPanelCard = this.panelCards.left.find((pc) => pc.type === panelType);

		const newMenu: IMenuItem = {
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
			toggle: true,
			stopClose: true
		}));

		if (!!panel) {
			this.setPanelMenu(panel, newMenu);
		}

		panel = this.panelCards.right.find((pc) => pc.type === panelType);

		if (!!panel) {
			this.setPanelMenu(panel, newMenu);
		}
	}

	public setPanelMenu(panel: IPanelCard, menu: any) {
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
	public setSelectedFromMenu(panelCardType: string, menuType: string, menuSubType: string, selected: boolean) {
		this.getPanelsByType(panelCardType).forEach(
			(panelCard) => this.setSelectedMenuInPanelCard(panelCard, menuType, menuSubType, selected));
	}

	public setSelectedMenuInPanelCard(panelCard: IPanelCard, menuType: string, menuSubType: string, selected: boolean) {
		const item = this.getSubmenu(panelCard, menuType, menuSubType);
		if (!item) { return; }
		item.selected = selected;
	}

	public setDateValueFromMenu(panelCardType: string, menuType: string, menuSubType: string, value: Date) {
		this.getPanelsByType(panelCardType).forEach(
			(panelCard) => this.setDateValueFromMenuInPanelCard(panelCard, menuType, menuSubType, value));
	}

	public setDateValueFromMenuInPanelCard(panelCard: IPanelCard, menuType: string, menuSubType: string, value: Date) {
		const item = this.getSubmenu(panelCard, menuType, menuSubType);
		if (!item) { return; }
		item.dateValue = value;
	}

	public getSubmenu(panelCard: IPanelCard, menuType: string, menuSubType: string): IMenuItem {
		const menu = panelCard.menu.find((m) => m.value === menuType);
		if (!menu) { return null; }
		return menu.menu.find((m) => m.value === menuSubType);
	}

	public getPanelsByType(panelCardType: string): IPanelCard[] {
		const panels: IPanelCard[] = [];
		let panelCard = this.panelCards.left.find((pc) => pc.type === panelCardType);

		if (panelCard) {
			panels.push(panelCard);
		}

		panelCard = this.panelCards.right.find((pc) => pc.type === panelCardType);

		if (panelCard) {
			panels.push(panelCard);
		}

		return panels;
	}

	public hidePanelsByType(panelCardType: string) {
		this.getPanelsByType(panelCardType).forEach((panel) => {
			panel.show = false;
		});
	}

	public showPanelsByType(panelCardType: string) {
		this.getPanelsByType(panelCardType).forEach((panel) => {
			panel.show = true;
		});
	}

	public hideSubModels(issuesCardIndex: number, hide: boolean) {

		this.panelCards.left[issuesCardIndex].menu
			.forEach((item) => {
				if (item.value === 'showSubModels') {
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
		this.setMenuItemToggle('tree', 'hideIfc', value);
	}

	public setOverrideAll(value: boolean) {
		this.setMenuItemToggle('groups', 'overrideAll', value);
	}
}

export const PanelServiceModule = angular
	.module('3drepo')
	.service('PanelService', PanelService);
