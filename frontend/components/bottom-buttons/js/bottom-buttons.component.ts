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
		"IconsConstant"
	];

	private showButtons: boolean;
	private viewingOptions: any;
	private selectedViewingOptionIndex: number;
	private leftButtons: any[];
	private selectedMode: string;
	private showViewingOptions: boolean;
	private customIcons: any;
	private isFocusMode: boolean;
	private escapeFocusModeButton: HTMLElement;

	constructor(
		private ViewerService: any,
		private TreeService: any,
		private IconsConstant: any
	) {

		this.customIcons = this.IconsConstant;

	}

	public $onInit() {

		this.showButtons = true;

		this.viewingOptions = {
			Helicopter : {
				mode: Viewer.NAV_MODES.HELICOPTER
			},
			Turntable : {
				mode: Viewer.NAV_MODES.TURNTABLE
			}
		};

		document.addEventListener("click", (event: any) => {
			// If the click is on the scene somewhere, hide the buttons
			const valid = event && event.target && event.target.classList;
			if (valid && event.target.classList.contains("emscripten")) {
				this.showViewingOptions = false;
			}
		}, false);

		this.selectedViewingOptionIndex = 1;

		this.leftButtons = [];
		this.leftButtons.push({
			label: "Extent",
			icon: "fa fa-home",
			month: (new Date()).getMonth(),
			click: () => { this.extent(); }
		});

		this.leftButtons.push({
			isViewingOptionButton: true,
			click: () => {
				this.showViewingOptions = !this.showViewingOptions;
			}
		});

		this.leftButtons.push({
			label: "Show All",
			click: () => { this.showAll(); }
		});

		this.leftButtons.push({
			label: "Hide",
			click: () => { this.hide(); }
		});

		this.leftButtons.push({
			label: "Isolate",
			click: () => { this.isolate(); }
		});

		this.leftButtons.push({
			label: "Focus",
			click: () => { this.focusMode(); }
		});

		this.selectedMode = "Turntable";
		this.setViewingOption(this.selectedMode);

		this.isFocusMode = false;

		this.escapeFocusModeButton = document.createElement("md-button");
		this.escapeFocusModeButton.className = "focus-button";
		const icon = document.createElement("md-icon");
		icon.innerHTML = "clear";
		icon.className = "angular-material-icons material-icons close-icon";

		this.escapeFocusModeButton.appendChild(icon);
		document.getElementsByTagName("home")[0].appendChild(this.escapeFocusModeButton);

		// Bind a click handler to exit focus mode
		this.escapeFocusModeButton.addEventListener("click", this.focusMode.bind(this));

	}

	public extent() {
		this.ViewerService.goToExtent();
	}

	public setViewingOption(type) {

		if (type !== undefined) {
			// Set the viewing mode
			this.selectedMode = type;
			this.ViewerService.setNavMode(this.viewingOptions[type].mode);
			this.showViewingOptions = false;
		}

	}

	public showAll() {
		this.TreeService.showAllTreeNodes(true);
	}

	public hide() {
		this.TreeService.hideSelected();
	}

	public isolate() {
		this.TreeService.isolateSelected();
	}

	public focusMode() {

		this.isFocusMode = !this.isFocusMode;
		this.setFocusModeButtonVisibility();

	}

	public getAllElementHolder(): any {
		return document.getElementsByClassName("homeHolder")[0];
	}

	public setFocusModeButtonVisibility() {
		if (this.isFocusMode) {
			this.escapeFocusModeButton.style.display = "initial";
		} else {
			this.escapeFocusModeButton.style.display = "none";
		}
		const allElementsHolder = this.getAllElementHolder();
		allElementsHolder.style.visibility = (this.isFocusMode) ? "hidden" : "visible";
	}

}

export const BottomButtonsComponent: ng.IComponentOptions = {
	bindings: {},
	controller: BottomButtonsController,
	controllerAs: "vm",
	templateUrl: "templates/bottom-buttons.html"
};

export const BottomButtonsComponentModule = angular
	.module("3drepo")
	.component("bottomButtons", BottomButtonsComponent);
