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

declare var Viewer;

class BottomButtonsController implements ng.IController {

	public static $inject: string[] = [
		"ViewerService",
		"TreeService",
	];

	private showButtons: boolean;
	private showViewingOptionButtons: boolean;
	private viewingOptions: any;
	private selectedViewingOptionIndex: number;
	private leftButtons: any[];
	private selectedMode: string;

	constructor(
		private ViewerService: any,
		private TreeService: any,
	) {}

	public $onInit() {

		this.showButtons = true;
		this.showViewingOptionButtons = false;

		this.viewingOptions = {
			Helicopter : {
				mode: Viewer.NAV_MODES.HELICOPTER,
			},
			Turntable : {
				mode: Viewer.NAV_MODES.TURNTABLE,
			},
		};

		document.addEventListener("click", (event: any) => {
			// If the click is on the scene somewhere, hide the buttons
			const valid = event && event.target && event.target.classList;
			if (valid && event.target.classList.contains("emscripten")) {
				this.showViewingOptionButtons = false;
			}
		}, false);

		this.selectedViewingOptionIndex = 1;

		this.leftButtons = [];
		this.leftButtons.push({
			label: "Show All",
			icon: "fa fa-eye",
			click: () => { this.showAll(); },
		});

		this.leftButtons.push({
			label: "Isolate",
			icon: "fa fa-scissors",
			click: () => { this.isolate(); },
		});

		this.leftButtons.push({
			label: "Extent",
			icon: "fa fa-home",
			month: (new Date()).getMonth(),
			click: () => { this.extent(); },
		});

		/*this.leftButtons.push({
			label: "Turntable",
			lick: () => { this.setViewingOptions(undefined); },
		});*/

		this.selectedMode = "Turntable";
		this.setViewingOption(this.selectedMode);

	}

	public extent() {
		this.ViewerService.goToExtent();
	}

	public setViewingOption(type) {

		if (type !== undefined) {
			// Set the viewing mode
			this.selectedMode = type;
			this.ViewerService.setNavMode(this.viewingOptions[type].mode);
			this.showViewingOptionButtons = false;
		} else {
			this.showViewingOptionButtons = !this.showViewingOptionButtons;
		}

	}

	public showAll() {
		this.TreeService.showAllTreeNodesAndIFCs();
	}

	public isolate() {
		this.TreeService.isolateSelected();
	}

}

export const BottomButtonsComponent: ng.IComponentOptions = {
	bindings: {},
	controller: BottomButtonsController,
	controllerAs: "vm",
	templateUrl: "templates/bottom-buttons.html",
};

export const BottomButtonsComponentModule = angular
	.module("3drepo")
	.component("bottomButtons", BottomButtonsComponent);
