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
	) {

		this.customIcons = {
			extent: "M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",
			turntable1: "M7.66 13.84h6.41a19 19 0 0 0 6.11-1.2 4.78 4.78 0 0 0 1.26-.71 1.46 1.46 0 0 0 .32-.39.39.39 0 0 0 0-.25 2 2 0 0 0-.78-.88 8.17 8.17 0 0 0-1.54-.79 23.59 23.59 0 0 0-7.22-1.33 28.77 28.77 0 0 0-6.42.46 10.15 10.15 0 0 0-4.14 1.57 2 2 0 0 0-.67.81.83.83 0 0 0-.06.31H.01a1.63 1.63 0 0 1 .09-.69 2.9 2.9 0 0 1 .91-1.27 11.12 11.12 0 0 1 4.52-2 30.1 30.1 0 0 1 6.79-.73 25.19 25.19 0 0 1 7.84 1.09 10 10 0 0 1 2 .9 3.77 3.77 0 0 1 1.7 2 2.43 2.43 0 0 1-.08 1.62A3.45 3.45 0 0 1 23 13.5a6.86 6.86 0 0 1-1.86 1.25 21.16 21.16 0 0 1-6.86 1.72c-1 .11-2 .15-2.77.17H9.45l-1.79.11v-2.91z",
			turntable2: "M8.27 19.84v-9.12l-4.56 4.56 4.56 4.56",
			turntable3: "M10.63 6.52h3.05v2.17h-3.05z",
			helicopter: "M11.07 8.61h-.78A3.56 3.56 0 0 1 7.2 7.26a16.9 16.9 0 0 1-1.06-1.34 1.71 1.71 0 0 0-1.16-.77c-1-.17-2-.38-3-.57l-.39-.07a.9.9 0 0 1-.61-1.28.31.31 0 0 0 0-.34C.69 2.36.38 1.76.07 1.15-.06.9 0 .8.28.8a7.91 7.91 0 0 1 1 0 .89.89 0 0 1 .5.23c.51.55 1 1.12 1.5 1.62a.4.4 0 0 0 .22.1h4.41a.49.49 0 0 0 .25-.14.43.43 0 0 0 .14-.16.84.84 0 0 1 1-.59 1.53 1.53 0 0 0 .27 0v-.4H4A.56.56 0 1 1 4 .35h5.41a.28.28 0 0 0 .2-.06c.3-.41.56-.39.77.06h5.61a.56.56 0 1 1 0 1.11h-5.63v.42a4.87 4.87 0 0 0 .5 0 .62.62 0 0 1 .59.29.43.43 0 0 1 .08.11.85.85 0 0 0 .86.54A7 7 0 0 1 17.1 5.5a1.7 1.7 0 0 1 .4 1.23 1.46 1.46 0 0 1-.68 1.05 4.22 4.22 0 0 1-1.92.73.91.91 0 0 0-.74.48c-.06.1-.13.18-.21.3H16a1.57 1.57 0 0 0 .65-.2.62.62 0 0 0 .24-.36.58.58 0 0 1 .61-.43.55.55 0 0 1 .49.55 1.23 1.23 0 0 1-.35.86 2.12 2.12 0 0 1-1.6.71H7.13a.57.57 0 0 1-.63-.45.55.55 0 0 1 .6-.66h3.2a.42.42 0 0 0 .42-.21c.09-.16.21-.3.35-.49zm5.43-2.2a1.26 1.26 0 0 0-.35-.78 5.65 5.65 0 0 0-2.91-1.81c-.36-.1-.75-.13-1.15-.2v1.79a.29.29 0 0 0 .12.18c.31.24.62.49.94.71a.66.66 0 0 0 .35.12h3zm-3 2.19h-1.44a.14.14 0 0 0-.1 0l-.46.7h1.47a.2.2 0 0 0 .13-.08zm-11.18-5a.38.38 0 0 0-.39-.37.38.38 0 0 0 0 .76.38.38 0 0 0 .43-.35z",
			showAll: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
			isolate1: "M12,6.5A9.76,9.76,0,0,1,20.82,12,9.82,9.82,0,0,1,3.18,12,9.76,9.76,0,0,1,12,6.5m0-2A11.83,11.83,0,0,0,1,12a11.82,11.82,0,0,0,22,0A11.83,11.83,0,0,0,12,4.5Z",
			isolate2: "M12,7a5,5,0,1,0,5,5A5,5,0,0,0,12,7Zm0,8a3,3,0,1,1,3-3A3,3,0,0,1,12,15Z",
			focus: "M118.9,663.3H10v217.8C10,941.3,58.7,990,118.9,990h217.8V881.1H118.9V663.3z M118.9,118.9h217.8V10H118.9C58.7,10,10,58.7,10,118.9v217.8h108.9V118.9z M881.1,10H663.3v108.9h217.8v217.8H990V118.9C990,58.7,941.3,10,881.1,10z M881.1,881.1H663.3V990h217.8c60.2,0,108.9-48.7,108.9-108.9V663.3H881.1V881.1z M500,336.7c-90.1,0-163.3,73.2-163.3,163.3S409.9,663.3,500,663.3S663.3,590.1,663.3,500S590.1,336.7,500,336.7z",
		};

	}

	public $onInit() {

		this.showButtons = true;

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
				this.showViewingOptions = false;
			}
		}, false);

		this.selectedViewingOptionIndex = 1;

		this.leftButtons = [];
		this.leftButtons.push({
			label: "Extent",
			icon: "fa fa-home",
			month: (new Date()).getMonth(),
			click: () => { this.extent(); },
		});

		this.leftButtons.push({
			isViewingOptionButton: true,
			click: () => {
				this.showViewingOptions = !this.showViewingOptions;
			},
		});

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
			label: "Focus",
			icon: "fa fa-toggle-off",
			click: () => { this.focusMode(); },
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
		}

	}

	public showAll() {
		this.TreeService.showAllTreeNodes();
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
	templateUrl: "templates/bottom-buttons.html",
};

export const BottomButtonsComponentModule = angular
	.module("3drepo")
	.component("bottomButtons", BottomButtonsComponent);
