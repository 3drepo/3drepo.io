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

export class PanelService {

	public static $inject: string[] = [
		"EventService",
		"TreeService"
	];

	private panelCards: any;
	private templatepanelCards: any;

	constructor(
		private EventService: any,
		private TreeService: any
	) {
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
					value: "showClosed",
					label: "Show closed issues",
					toggle: true,
					selected: false,
					firstSelected: false,
					secondSelected: false,
					keepCheckSpace: true
				},
				{
					hidden: false,
					value: "showSubModels",
					label: "Show sub model issues",
					toggle: true,
					selected: false,
					firstSelected: false,
					secondSelected: false
				}, {
					hidden: false,
					upperDivider: true,
					label: "Created by: "
				}
			],
			minHeight: 260,
			fixedHeight: false,
			options: [
				{type: "menu", visible: true},
				{type: "filter", visible: true}
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
			icon: "crop_original",
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
			icon: "landscape",
			minHeight: 80,
			fixedHeight: false,
			options: []
		});

		this.panelCards.right.push({
			type: "docs",
			title: "Meta Data",
			show: false,
			help: "Documents",
			icon: "content_copy",
			minHeight: 80,
			fixedHeight: false,
			options: [
				{type: "close", visible: true}
			]
		});

		this.memoizepanelCards();

	}

	public setPanelMenu(side, type, menu) {

		const item = this.panelCards[side].find((content) => {
			return content.type === type;
		});

		// TODO: This is ugly, why are we doing this?
		if (item && item.menu) {
			menu.forEach((newItem) => {
				const exists = item.menu.find((oldItem) => {
					return oldItem.role === newItem.role;
				});
				if (!exists) {
					item.menu.push(newItem);
				}
			});
		}

	}

	public createRoleFilters(role) {
		return {
			value: "filterRole",
			role: role._id,
			label: role._id,
			keepCheckSpace: true,
			toggle: true,
			selected: true,
			firstSelected: false,
			secondSelected: false
		}
	}

	public memoizepanelCards() {
		this.templatepanelCards = angular.copy(this.panelCards);
	}

	public reset() {
		this.panelCards = angular.copy(this.templatepanelCards);
	}

	public hideSubModels(issuesCardIndex, hide) {

		this.panelCards.left[issuesCardIndex].menu
			.forEach((item) => {
				if (item.value === "showSubModels") {
					item.hidden = hide;
				}
			});

	}

	public getCardIndex(type) {
		let index = -1;
		const obj = this.panelCards.left.forEach((panel, i) => {
			if (panel.type === type) {
				index = i;
			}
		});
		return index;
	}

	public setHideIfc(value: boolean) {

		const issuesCardIndex = this.getCardIndex("issues"); // index of tree panel
		const menuItemIndex = this.getCardIndex("issues"); // index of hideIfc

		const hideIfcMenuItem = this.panelCards.left[issuesCardIndex]
			.menu[menuItemIndex];

		// Change state if different
		if (hideIfcMenuItem.selected !== value) {
			hideIfcMenuItem.selected = value;
		}
	}

}

export const PanelServiceModule = angular
	.module("3drepo")
	.service("PanelService", PanelService);
