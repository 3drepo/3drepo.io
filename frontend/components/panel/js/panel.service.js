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

(function () {
	"use strict";

	angular.module("3drepo")
		.service("PanelService", PanelService);

	PanelService.$inject = ["EventService", "TreeService"];

	function PanelService(EventService, TreeService) {
		
		var issuesPanelCard = {
			left: [],
			right: []
		};
		

		issuesPanelCard.left.push({
			type: "issues",
			title: "Issues",
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
					selected: true,
					firstSelected: true,
					secondSelected: false
				},
				{
					hidden: false,
					value: "showClosed",
					label: "Show resolved issues",
					toggle: true,
					selected: false,
					firstSelected: false,
					secondSelected: false
				},
				{
					hidden: false,
					value: "showSubModels",
					label: "Show sub model issues",
					toggle: true,
					selected: false,
					firstSelected: false,
					secondSelected: false
				},{
					hidden: false,
					upperDivider: true,
					label: "Created by: "
				}
			],
			minHeight: 260,
			fixedHeight: false,
			options: [
				{type: "menu", visible: true},
				{type: "filter", visible: true},
				{type: "pin", visible: false},
				{type: "erase", visible: false},
				{type: "scribble", visible: false}
			],
			add: true
		});

		issuesPanelCard.left.push({
			type: "tree",
			title: "Tree",
			show: false,
			help: "Model elements shown in a tree structure",
			icon: "device_hub",
			minHeight: 80,
			fixedHeight: false,
			options: [
				{type: "filter", visible: true}
			]
		});

		issuesPanelCard.left.push({
			type: "clip",
			title: "Clip",
			show: false,
			help: "Clipping plane",
			icon: "crop_original",
			fixedHeight: true,
			options: [
				{type: "visible", visible: true}
			]
		});

		issuesPanelCard.right.push({
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

		issuesPanelCard.right.push({
			type: "building",
			title: "Building",
			show: false,
			help: "Building",
			icon: "fa-cubes",
			fixedHeight: true,
			options: [
			]
		});


		var service = {

			issuesPanelCard : issuesPanelCard,
			hideSubModels: hideSubModels,
			handlePanelEvent: handlePanelEvent

		};
	
		return service;
	
		///////////////

		function hideSubModels(issuesCardIndex, hide) {
			
			issuesPanelCard.left[issuesCardIndex].menu
				.forEach(function(item){
					if(item.value === "showSubModels") {
						item.hidden = hide;
					}
				});

		}

		function handlePanelEvent(panelType, event, eventData){

			if  (event === EventService.EVENT.PANEL_CARD_ADD_MODE ||
				event === EventService.EVENT.PANEL_CARD_EDIT_MODE
			) {
				if (panelType === "tree") {
					// If another card is in modify mode don't show a node if an object is clicked in the viewer
					TreeService.setHighlightSelected(!eventData.on);
				}
			} 
			
		}

	}
}());
