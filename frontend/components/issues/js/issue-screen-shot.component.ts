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

class IssueScreenshotController implements ng.IController {

	public static $inject: string[] = [
		"$q",
		"$timeout",
		"$element",

		"APIService",
		"EventService",
		"ViewerService",
		"DialogService",
	];

	private highlightBackground: string; // = "#FF9800";
	private screenShotPromise: any;
	private scribbleCanvas: any;
	private scribbleCanvasContext;

	private screenShotSave;

	private innerWidth;
	private innerHeight;

	private penIndicator;

	private mouseDragX;
	private mouseDragY;
	private lastMouseDragX;
	private lastMouseDragY;

	private mouseButton;
	private mouseDragging;
	private penCol;
	private penIndicatorSize;
	private penToIndicatorRatio;
	private penSize;
	private hasDrawnOnCanvas: boolean;

	private screenShot;
	private screenShotUse;
	private actions;
	private showPenIndicator;

	private currentAction;
	private actionsPointerEvents;

	private isEraseMode: boolean;

	private penColors;

	constructor(
		private $q: ng.IQService,
		private $timeout: ng.ITimeoutService,
		private $element: ng.IRootElementService,

		private APIService,
		private EventService,
		private ViewerService,
		private DialogService,
	) {}

	public $onInit() {

		this.highlightBackground = "#FF9800";
		this.screenShotPromise = this.$q.defer();

		// Inspired by confile's answer - http://stackoverflow.com/a/28241682/782358
		this.innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		this.innerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

		this.mouseDragX = 0;
		this.mouseDragY = 0;
		this.lastMouseDragX = -1;
		this.lastMouseDragY = -1;

		this.isEraseMode = false;
		this.mouseButton = 0;
		this.mouseDragging = false;
		this.penCol = "#DD0000";
		this.penIndicatorSize = 16;
		this.hasDrawnOnCanvas = false;

		this.penColors = {
			red : {
				color: "#DD0000",
				label:  "Red",
			},
			green : {
				color: "#00dd44",
				label:  "Green",
			},
			blue : {
				color: "#004edd",
				label:  "Blue",
			},
			eraser : {
				color: "rgba(0, 0, 0, 1)",
				label: "Eraser",
			},
		};

		if (typeof this.screenShot !== "undefined") {
			this.screenShotUse = this.screenShot;
		} else {
			this.$element.ready(() => {

				// Get scribble canvas
				this.scribbleCanvas = document.getElementById("scribbleCanvas");
				this.scribbleCanvasContext = this.scribbleCanvas.getContext("2d");

				// Set the screen shot canvas to 80% screen size
				this.scribbleCanvas.width = (innerWidth * 80) / 100;
				this.scribbleCanvas.height = (innerHeight * 80) / 100;

				// Set up canvas
				this.initCanvas(this.scribbleCanvas);
				this.setupScribble();

				// Pen indicator
				this.showPenIndicator = false;
				this.changePenSize();
				this.actionsPointerEvents = "auto";

				// Get the screen shot
				this.ViewerService.getScreenshot(this.screenShotPromise);

				this.screenShotPromise.promise.then((screenShot) => {
					this.screenShotUse = screenShot;
				}).catch((error) => {
					console.error("Screenshot Error:", error);
				});

				// Set up action buttons
				this.actions = {
					draw : {icon: "border_color", action: "draw", label: "Draw", color: this.highlightBackground},
					erase : {icon: "fa fa-eraser", action: "erase", label: "Erase", color: ""},
				};

				this.currentAction = "draw";
			});

		}

	}

	public changePenSize() {
		this.penToIndicatorRatio = 0.5;
		this.penSize = this.penIndicatorSize * this.penToIndicatorRatio;
		const el = this.$element[0].querySelector("#issueScreenShotPenIndicator");
		this.penIndicator = angular.element(el);
		this.penIndicator.css("font-size", this.penIndicatorSize + "px");
	}

	public closeDialog() {
		this.DialogService.closeDialog();
	}

	public normaliseInteraction(coordinate, event) {
		switch (coordinate) {
			case "x":
				if (event.layerX) {
					return event.layerX;
				} else {
					const touch = event.touches[0];
					const canvasEl = touch.target.getBoundingClientRect();
					return touch.clientX - canvasEl.x;
				}
			case "y":
				if (event.layerY) {
					return event.layerY;
				} else {
					const touch = event.touches[0];
					const canvasEl = touch.target.getBoundingClientRect();
					return touch.clientY - canvasEl.y;
				}
			}
	}

	public startDraw(event: any, canvas: any) {

		event.preventDefault();
		event.stopPropagation();
		event.returnValue = false;

		this.mouseDragX = this.normaliseInteraction("x", event);
		this.mouseDragY = this.normaliseInteraction("y", event);
		this.mouseDragging = true;

		this.updateImage(canvas);
		this.EventService.send(this.EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING, {on: true});
		this.actionsPointerEvents = "none";
	}

	public endDraw(event: any, canvas: any) {

		event.preventDefault();
		event.stopPropagation();
		event.returnValue = false;

		this.mouseButton = 0;
		this.mouseDragging = false;
		this.lastMouseDragX = -1;
		this.lastMouseDragY = -1;

		this.updateImage(canvas);
		this.EventService.send(this.EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING, {on: false});
		this.actionsPointerEvents = "auto";
	}

	public outOfDrawCanvas(event: any, canvas: any) {

		event.preventDefault();
		event.stopPropagation();
		event.returnValue = false;

		this.mouseButton = 0;
		this.mouseDragging = false;
		this.lastMouseDragX = -1;
		this.lastMouseDragY = -1;
		this.updateImage(canvas);

		this.EventService.send(this.EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING, {on: false});
		this.actionsPointerEvents = "auto";
	}

	public moveOnDrawCanvas(event: any, canvas: any) {
		event.preventDefault();
		event.stopPropagation();
		event.returnValue = false;

		this.mouseDragX = this.normaliseInteraction("x", event);
		this.mouseDragY = this.normaliseInteraction("y", event);

		if (!this.mouseDragging && !this.showPenIndicator) {
			this.$timeout(() => {
				this.showPenIndicator = true;
			});
		} else {
			if ((this.lastMouseDragX !== -1) && (!this.hasDrawnOnCanvas)) {
				this.hasDrawnOnCanvas = true;
			}
			this.updateImage(canvas);
		}

		this.setPenIndicatorPosition(event.layerX, event.layerY);
	}

	public addCanvasEventListener(canvas, eventName, callback) {
		canvas.addEventListener(eventName, (event) => {
			callback(event, canvas);
		}, false);
	}

	public initCanvas(canvas: any) {

		this.addCanvasEventListener(canvas, "touchstart", this.startDraw.bind(this));
		this.addCanvasEventListener(canvas, "mousedown", this.startDraw.bind(this));

		this.addCanvasEventListener(canvas, "touchend", this.endDraw.bind(this));
		this.addCanvasEventListener(canvas, "mouseup", this.endDraw.bind(this));

		this.addCanvasEventListener(canvas, "touchleave", this.outOfDrawCanvas.bind(this));
		this.addCanvasEventListener(canvas, "mouseout", this.outOfDrawCanvas.bind(this));

		this.addCanvasEventListener(canvas, "touchmove", this.moveOnDrawCanvas.bind(this));
		this.addCanvasEventListener(canvas, "mousemove", this.moveOnDrawCanvas.bind(this));

	}

	public updateImage(canvas) {

		if (this.currentAction === "" || !this.mouseDragging) {
			return;
		}

		const context = canvas.getContext("2d");

		if (this.lastMouseDragX < 0 || this.lastMouseDragY < 0) {
			this.lastMouseDragX = this.mouseDragX;
			this.lastMouseDragY = this.mouseDragY;
			return;
		}

		context.lineWidth = this.penSize;
		context.strokeStyle = this.penCol;

		// Draw line
		context.beginPath();
		context.lineCap = "round";
		context.moveTo(this.lastMouseDragX, this.lastMouseDragY);
		context.lineTo(this.mouseDragX, this.mouseDragY);

		context.stroke();

		this.lastMouseDragX = this.mouseDragX;
		this.lastMouseDragY = this.mouseDragY;
	}

	public setupErase() {
		this.isEraseMode = true;
		this.scribbleCanvasContext.globalCompositeOperation = "destination-out";
		this.penCol = "rgba(0, 0, 0, 1)";
	}

	public setupScribble() {
		this.isEraseMode = false;
		this.scribbleCanvasContext.globalCompositeOperation = "source-over";
		this.penCol = "#DD0000";
	}

	public doAction(action) {

		const disableAction = action === this.currentAction;
		if (disableAction) {
			action = "";
		}

		for (const actionKey in this.actions) {
			if (action !== actionKey) {
				this.actions[actionKey].color = "";
			} else if (action === actionKey) {
				this.actions[actionKey].color = this.highlightBackground;
			}
		}

		switch (action) {
		case "draw":
			this.setupScribble();
			break;

		case "erase":
			this.setupErase();
			break;
		}

		this.currentAction = action;
	}

	public saveScreenshot() {
		const screenShotCanvas: any = document.getElementById("screenShotCanvas");
		const screenShotCanvasContext = screenShotCanvas.getContext("2d");
		const screenShotImage = new Image();
		let	screenShot;

		screenShotCanvas.width = this.scribbleCanvas.width;
		screenShotCanvas.height = this.scribbleCanvas.height;
		screenShotImage.src = this.screenShotUse;
		screenShotCanvasContext.drawImage(screenShotImage, 0, 0, screenShotCanvas.width, screenShotCanvas.height);
		screenShotCanvasContext.drawImage(this.scribbleCanvas, 0, 0);

		screenShot = screenShotCanvas.toDataURL("image/png");
		this.screenShotSave({screenShot});

		this.closeDialog();
	}

	public setPenIndicatorPosition(x: number, y: number) {

		const width = this.penIndicator[0].offsetWidth;
		const height = this.penIndicator[0].offsetHeight;

		const positionLeft = x - width / 2;
		const positionTop = (y - height / 2) + 50;

		this.penIndicator.css("left", positionLeft + "px");
		this.penIndicator.css("top", positionTop + "px");
	}

}

export const IssuesScreenshotComponent: ng.IComponentOptions = {
	bindings: {
		screenShotSave: "&",
		screenShot: "=",
	},
	controller: IssueScreenshotController,
	controllerAs: "vm",
	templateUrl: "templates/issue-screen-shot.html",
};

export const IssuesScreenShotComponentModule = angular
	.module("3drepo")
	.component("issuesScreenShot", IssuesScreenshotComponent);
