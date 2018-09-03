/**
 *	Copyright (C) 2016 3D Repo Ltd
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

const STRIP_MAIN_COLORS = {
	RED: "rgba(255,0,0,1)",
	GREEN: "rgba(0, 255, 0, 1)",
	SKY_BLUE: "rgba(0, 255, 255, 1)",
	BLUE: "rgba(0, 0, 255, 1)",
	YELLOW: "rgba(255, 255, 0, 1)",
	PURPLE: "rgba(255, 0, 255, 1)"
};

class ColorPickerController implements ng.IController {
	public static $inject: string[] = [
		"$element",
		"$document",
		"$timeout"
	];

	private containerElement;
	private panelElement;
	private bodyElement;
	private colorBlockCanvas;
	private colorStripCanvas;
	private ngModelCtrl;
	private color;
	private isOpened;
	private isInitilized;

	constructor(
		private $element: any,
		private $document: any,
		private $timeout: any
	) {}

	public $onInit(): void {
		this.ngModelCtrl.$render = this.onModelChange;
	}

	public $postLink(): void {
		this.containerElement = this.$element[0].querySelectorAll(".colorPicker")[0];
		this.panelElement = this.$element[0].querySelectorAll(".colorPickerPanel")[0];
		this.bodyElement = this.$document.find("body")[0];

		this.colorBlockCanvas = this.panelElement.querySelectorAll(".colorBlock")[0];
		this.colorStripCanvas = this.panelElement.querySelectorAll(".colorStrip")[0];
	}

	public $onDestroy(): void {
		this.toggleListeners();
	}

	public onModelChange = (): void => {
		this.color = this.ngModelCtrl.$viewValue;
	}

	public onUpdate(): void {
		this.ngModelCtrl.$setViewValue(this.color);
	}

	public togglePanel($event): void {
		$event.stopPropagation();
		this.isOpened = !this.isOpened;
		if (this.isOpened && !this.isInitilized) {
			this.toggleListeners(true);
			this.initializeBlockCanvas();
			this.initializeStripCanvas();
			this.isInitilized = true;
		}
	}

	public toggleListeners(shouldOpen = true): void {
		const method = shouldOpen ? "addEventListener" : "removeEventListener";
		this.bodyElement[method]("click", this.onOuterClick);
	}

	public onOuterClick = (event): void => {
		const isClickedChildOfPanel = this.panelElement.contains(event.target);
		if (!isClickedChildOfPanel) {
			this.$timeout(() => {
				this.isOpened = false;
			});
		}
	}

	public initializeBlockCanvas(): void {
		const ctx = this.colorBlockCanvas.getContext("2d");
		const width = this.colorBlockCanvas.width;
		const height = this.colorBlockCanvas.height;
		const x = 0;
		const y = 0;
		const drag = false;

		ctx.rect(0, 0, width, height);
		this.fillBlockCanvas(STRIP_MAIN_COLORS.RED, width, height);
	}

	public fillBlockCanvas(rgbaColor, width, height): void {
		const ctx = this.colorBlockCanvas.getContext("2d");
		ctx.fillStyle = rgbaColor;
		ctx.fillRect(0, 0, width, height);

		const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
		whiteGradient.addColorStop(0, 'rgba(255,255,255,1)');
		whiteGradient.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = whiteGradient;
		ctx.fillRect(0, 0, width, height);

		const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
		blackGradient.addColorStop(0, 'rgba(0,0,0,0)');
		blackGradient.addColorStop(1, 'rgba(0,0,0,1)');
		ctx.fillStyle = blackGradient;
		ctx.fillRect(0, 0, width, height);
	}

	public initializeStripCanvas(): void {
		const ctx = this.colorStripCanvas.getContext("2d");
		const width = this.colorStripCanvas.width;
		const height = this.colorStripCanvas.height;
		ctx.rect(0, 0, width, height);

		const gradient = ctx.createLinearGradient(0, 0, 0, height);
		gradient.addColorStop(0, STRIP_MAIN_COLORS.RED);
		gradient.addColorStop(0.17, STRIP_MAIN_COLORS.YELLOW);
		gradient.addColorStop(0.34, STRIP_MAIN_COLORS.GREEN);
		gradient.addColorStop(0.51, STRIP_MAIN_COLORS.SKY_BLUE);
		gradient.addColorStop(0.68, STRIP_MAIN_COLORS.BLUE);
		gradient.addColorStop(0.85, STRIP_MAIN_COLORS.PURPLE);
		gradient.addColorStop(1, STRIP_MAIN_COLORS.RED);

		ctx.fillStyle = gradient;
		ctx.fill();

		this.fillStripCanvas();
	}

	public fillStripCanvas(rgbaColor?): void {
		const ctx = this.colorStripCanvas.getContext("2d");
		const width = this.colorStripCanvas.width;
		const height = this.colorStripCanvas.height;
	}
}

export const ColorPickerComponent: ng.IComponentOptions = {
	require: {
		ngModelCtrl: "ngModel"
	},
	bindings: {
		ngModel: "<",
		predefinedColors: "<?",
		placeholder: "@?"
	},
	controller: ColorPickerController,
	controllerAs: "vm",
	templateUrl: "templates/color-picker.html"
};

export const ColorPickerComponentModule = angular
	.module("3drepo")
	.component("colorPicker", ColorPickerComponent);
