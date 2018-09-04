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

import {memoize} from "lodash";

const COLORS = {
	RED: "rgba(255,0,0,1)",
	GREEN: "rgba(0, 255, 0, 1)",
	SKY_BLUE: "rgba(0, 255, 255, 1)",
	BLUE: "rgba(0, 0, 255, 1)",
	YELLOW: "rgba(255, 255, 0, 1)",
	PURPLE: "rgba(255, 0, 255, 1)",
	BLACK: "rgba(0,0,0,1)",
	BLACK_TRANSPARENT: "rgba(0,0,0,0)",
	WHITE: "rgba(255,255,255,1)",
	WHITE_TRANSPARENT: "rgba(255,255,255,0)"
};

const componentToHex = memoize((c) => {
	const hex = c.toString(16);
	return hex.length === 1 ? "0" + hex : hex;
});

const rgbaToHex = memoize((rgbaColor) => {
	const [r, g, b] = rgbaColor.match(/[.\d]+/g).map(Number);
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
});

const hexToRgba = memoize((hex) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.toLowerCase());

	return result
		? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, 1)`
		: COLORS.BLACK;
});

const findColorPositionOnCanvas = (canvas, colorHash): { x: number, y: number } => {
	const ctx = canvas.getContext("2d");
	const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	const rgbaColor = hexToRgba(colorHash);

	const position = { x: 0, y: 0 };
	for (let i = 0; i < data.length; i += 4) {
		const isSameColor = `rgba(${data[i]}, ${data[i + 1]}, ${data[i + 2]}, 1)` === rgbaColor;
		if (isSameColor) {
			position.x = i / 4 % canvas.width;
			position.y = (i / 4 - position.x) / canvas.width;
			break;
		}
	}
	return position;
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
	private colorHash;
	private color;
	private colorRgba;
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
		this.togglePanelListeners();
		this.toggleCanvasListeners();
	}

	public onModelChange = (): void => {
		this.setColor(this.ngModelCtrl.$viewValue);
	}

	public onUpdate(): void {
		this.ngModelCtrl.$setViewValue(`#${this.color.toUpperCase()}`);
	}

	public setColor(colorHash = ""): void {
		this.colorHash = `${colorHash}`;
		this.color = colorHash.replace("#", "");
		this.colorRgba = hexToRgba(colorHash);
	}

	public togglePanel($event): void {
		$event.stopPropagation();
		this.isOpened = !this.isOpened;
		if (this.isOpened && !this.isInitilized) {
			this.togglePanelListeners(true);
			this.toggleCanvasListeners(true);
			this.initializeBlockCanvas();
			this.initializeStripCanvas();
			this.isInitilized = true;
		}
		if (this.isOpened) {
			this.setColor(this.ngModelCtrl.$viewValue);
			this.fillBlockCanvas(this.colorRgba);
		} else {
			this.togglePanelListeners();
			this.toggleCanvasListeners();
		}
	}

	public togglePanelListeners(shouldOpen = true): void {
		const method = shouldOpen ? "addEventListener" : "removeEventListener";
		this.bodyElement[method]("click", this.onOuterClick);
	}

	public toggleCanvasListeners(shouldBind = true): void {
		const method = shouldBind ? "addEventListener" : "removeEventListener";

		this.colorStripCanvas[method]("click", this.onStripCanvasClick, false);
		this.colorBlockCanvas[method]("click", this.onBlockCanvasClick, false);
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
		const currentColor = hexToRgba(this.colorHash);
		this.fillBlockCanvas(currentColor);

		const colorPosition = findColorPositionOnCanvas(this.colorBlockCanvas, this.colorHash);
		this.setBlockColorPointerPosition(colorPosition.x, colorPosition.y);
	}

	public fillBlockCanvas(rgbaColor): void {
		const ctx = this.colorBlockCanvas.getContext("2d");
		const width = this.colorBlockCanvas.width;
		const height = this.colorBlockCanvas.height;
		ctx.fillStyle = rgbaColor;
		ctx.fillRect(0, 0, width, height);

		const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
		whiteGradient.addColorStop(0, COLORS.WHITE);
		whiteGradient.addColorStop(1, COLORS.WHITE_TRANSPARENT);
		ctx.fillStyle = whiteGradient;
		ctx.fillRect(0, 0, width, height);

		const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
		blackGradient.addColorStop(0, COLORS.BLACK_TRANSPARENT);
		blackGradient.addColorStop(1, COLORS.BLACK);
		ctx.fillStyle = blackGradient;
		ctx.fillRect(0, 0, width, height);
	}

	public initializeStripCanvas(): void {
		const ctx = this.colorStripCanvas.getContext("2d");
		const width = this.colorStripCanvas.width;
		const height = this.colorStripCanvas.height;
		ctx.rect(0, 0, width, height);

		this.fillStripCanvas();
	}

	public fillStripCanvas(): void {
		const ctx = this.colorStripCanvas.getContext("2d");
		const width = this.colorStripCanvas.width;
		const height = this.colorStripCanvas.height;

		const gradient = ctx.createLinearGradient(0, 0, 0, height);
		gradient.addColorStop(0, COLORS.RED);
		gradient.addColorStop(0.17, COLORS.YELLOW);
		gradient.addColorStop(0.34, COLORS.GREEN);
		gradient.addColorStop(0.51, COLORS.SKY_BLUE);
		gradient.addColorStop(0.68, COLORS.BLUE);
		gradient.addColorStop(0.85, COLORS.PURPLE);
		gradient.addColorStop(1, COLORS.RED);

		ctx.fillStyle = gradient;
		ctx.fill();
	}

	public onStripCanvasClick = (event): void => {
		const ctx = this.colorStripCanvas.getContext("2d");
		const x = event.offsetX;
		const y = event.offsetY;

		const imageData = ctx.getImageData(x, y, 1, 1).data;
		const rgbaColor = `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, 1)`;
		this.setColor(rgbaToHex(rgbaColor).toUpperCase());

		this.fillBlockCanvas(this.colorRgba);
		this.onColorHashChange(this.color, {x, y});
	}

	public onBlockCanvasClick = (event): void => {
		const ctx = this.colorBlockCanvas.getContext("2d");
		const x = event.offsetX;
		const y = event.offsetY;

		const imageData = ctx.getImageData(x, y, 1, 1).data;
		const rgbaColor = `rgba(${imageData[0]}, ${imageData[1]}, ${imageData[2]}, 1)`;

		this.setColor(rgbaToHex(rgbaColor).toUpperCase());
		this.onColorHashChange(this.color, {x, y});
	}

	public onColorHashChange = (color = this.color, position?): void => {
		const isValidColor = /(^[0-9A-F]{6}$)/i.test(this.color.toUpperCase());

		if (isValidColor) {
			this.setColor(`#${this.color}`);
			if (!position) {
				this.fillBlockCanvas(this.colorHash);
			}

			const colorBlockPosition = position || findColorPositionOnCanvas(this.colorBlockCanvas, this.colorHash);
			this.setBlockColorPointerPosition(colorBlockPosition.x, colorBlockPosition.y);
		}
	}

	public onPredefinedColorClick = (predefinedColor): void => {
		this.setColor(predefinedColor.toUpperCase());
		this.fillBlockCanvas(this.colorRgba);
		this.onColorHashChange();
	}

	public setBlockColorPointerPosition(x, y): void {
		const pointer = this.colorBlockCanvas.nextElementSibling;
		pointer.style.left = `${x}px`;
		pointer.style.top = `${y}px`;
	}

	public saveColor($event): void {
		this.onUpdate();
		this.togglePanel($event);
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
