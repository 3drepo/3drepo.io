/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the issuesScreenShot of the GNU Affero General Public License as
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

(function () {
	"use strict";

	angular.module("3drepo")
		.component(
			"issuesScreenShot",
			{
				controller: IssuesScreenShotCtrl,
				controllerAs: "vm",
           		bindToController: true,
				templateUrl: "issueScreenShot.html",
				bindings: {
					sendEvent: "&",
					close: "&",
					screenShotSave: "&",
					screenShot: "="
				}
			}
		);

	IssuesScreenShotCtrl.$inject = ["$q", "$timeout", "$element", "UtilsService", "EventService"];

	function IssuesScreenShotCtrl ($q, $timeout, $element, UtilsService, EventService) {
		var vm = this,
			currentActionIndex = null,
			highlightBackground = "#FF9800",
			screenShotPromise = $q.defer(),
			scribbleCanvas,
			scribbleCanvasContext,
			// Inspired by confile's answer - http://stackoverflow.com/a/28241682/782358
			innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
			innerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,

			penIndicator,
			mouse_drag_x = 0, mouse_drag_y = 0,
			last_mouse_drag_x = -1, last_mouse_drag_y = -1,
			mouse_button = 0,
			mouse_dragging = false,
			pen_col = "#DD0000",
			penIndicatorSize = 16,
			penToIndicatorRatio = 0.5,
			pen_size = penIndicatorSize * penToIndicatorRatio,
			hasDrawnOnCanvas = false;

		if (typeof vm.screenShot !== "undefined") {
			vm.screenShotUse = vm.screenShot;
		}
		else {
			$timeout(function () {
				// Get scribble canvas
				scribbleCanvas = document.getElementById("scribbleCanvas");
				scribbleCanvasContext = scribbleCanvas.getContext("2d");

				// Set the screen shot canvas to 80% screen size
				scribbleCanvas.width = (innerWidth * 80) / 100;
				scribbleCanvas.height = (innerHeight * 80) / 100;

				// Set up canvas
				initCanvas(scribbleCanvas);
				setupScribble();

				// Pen indicator
				vm.showPenIndicator = false;
				penIndicator = angular.element($element[0].querySelector("#issueScreenShotPenIndicator"));
				penIndicator.css("font-size", penIndicatorSize + "px");

				vm.actionsPointerEvents = "auto";

				// Get the screen shot
				vm.sendEvent({type:EventService.EVENT.VIEWER.GET_SCREENSHOT, value: {promise: screenShotPromise}});
				screenShotPromise.promise.then(function (screenShot) {
					vm.screenShotUse = screenShot;
				});

				// Set up action buttons
				vm.actions = [
					{icon: "border_color", action: "draw", label: "Draw", color: highlightBackground},
					{icon: "fa fa-eraser", action: "erase", label: "Erase", color: ""}
				];
				currentActionIndex = 0;
			});
		}

		vm.closeDialog = function () {
			UtilsService.closeDialog();
			vm.close();
		};

		/**
		 * Setup canvas and event listeners
		 * @param canvas
		 */
		function initCanvas (canvas) {
			canvas.addEventListener('mousedown', function (evt) {
				mouse_drag_x = evt.layerX;
				mouse_drag_y = evt.layerY;
				mouse_dragging = true;

				updateImage(canvas);

				window.status='DOWN: '+evt.layerX+", "+evt.layerY;
				evt.preventDefault();
				evt.stopPropagation();
				evt.returnValue = false;

				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING, {on: true});
				vm.actionsPointerEvents = "none";
			}, false);

			canvas.addEventListener('mouseup', function (evt) {
				mouse_button = 0;
				mouse_dragging = false;
				last_mouse_drag_x = -1;
				last_mouse_drag_y = -1;

				updateImage(canvas);

				evt.preventDefault();
				evt.stopPropagation();
				evt.returnValue = false;

				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING, {on: false});
				vm.actionsPointerEvents = "auto";
			}, false);

			canvas.addEventListener('mouseout', function (evt) {
				mouse_button = 0;
				mouse_dragging = false;
				last_mouse_drag_x = -1;
				last_mouse_drag_y = -1;

				updateImage(canvas);

				evt.preventDefault();
				evt.stopPropagation();
				evt.returnValue = false;

				EventService.send(EventService.EVENT.TOGGLE_ISSUE_AREA_DRAWING, {on: false});
				vm.actionsPointerEvents = "auto";
			}, false);

			canvas.addEventListener('mousemove', function (evt) {
				window.status='MOVE: ' + evt.layerX + ", " + evt.layerY;
				mouse_drag_x = evt.layerX;
				mouse_drag_y = evt.layerY;

				if (!mouse_dragging && !vm.showPenIndicator) {
					$timeout(function () {
						vm.showPenIndicator = true;
					});
				}
				else {
					if ((last_mouse_drag_x !== -1) && (!hasDrawnOnCanvas)) {
						hasDrawnOnCanvas = true;
					}
					updateImage(canvas);
				}

				evt.preventDefault();
				evt.stopPropagation();
				evt.returnValue = false;
				setPenIndicatorPosition(evt.layerX, evt.layerY);
			}, false);
		}

		/**
		 * Update the canvas
		 *
		 * @param canvas
		 */
		function updateImage(canvas) {
			var context = canvas.getContext("2d");

			if (!mouse_dragging) {
				return;
			}

			if (last_mouse_drag_x < 0 || last_mouse_drag_y < 0)
			{
				last_mouse_drag_x = mouse_drag_x;
				last_mouse_drag_y = mouse_drag_y;
				return;
			}

			context.lineWidth = pen_size;
			context.strokeStyle = pen_col;

			// Draw line
			context.beginPath();
			context.lineCap = "round";
			context.moveTo(last_mouse_drag_x, last_mouse_drag_y);
			context.lineTo(mouse_drag_x, mouse_drag_y);
			//context.closePath();
			context.stroke();

			last_mouse_drag_x = mouse_drag_x;
			last_mouse_drag_y = mouse_drag_y;
		}

		/**
		 * Erase the canvas
		 */
		function setupErase () {
			scribbleCanvasContext.globalCompositeOperation = "destination-out";
			pen_col = "rgba(0, 0, 0, 1)";
			// vm.canvasPointerEvents = "auto";
		}

		/**
		 * Set up drawing
		 */
		function setupScribble () {
			scribbleCanvasContext.globalCompositeOperation = "source-over";
			pen_col = "#FF0000";
			//pen_size = penIndicatorSize;
			// vm.canvasPointerEvents = "auto";
		}


		vm.doAction = function (index) {
			if (currentActionIndex === null) {
				currentActionIndex = index;
				vm.actions[currentActionIndex].color = highlightBackground;
			}
			else if (currentActionIndex === index) {
				vm.actions[currentActionIndex].color = "";
				currentActionIndex = null;
			}
			else {
				vm.actions[currentActionIndex].color = "";
				currentActionIndex = index;
				vm.actions[currentActionIndex].color = highlightBackground;
			}

			switch (vm.actions[currentActionIndex].action) {
				case "draw":
					setupScribble();
					break;

				case "erase":
					setupErase();
					break;
			}
		};

		vm.save = function () {
			var	screenShotCanvas = document.getElementById("screenShotCanvas"),
				screenShotCanvasContext = screenShotCanvas.getContext("2d"),
				screenShotImage = new Image(),
				screenShot;

			screenShotCanvas.width = scribbleCanvas.width;
			screenShotCanvas.height = scribbleCanvas.height;
			screenShotImage.src = vm.screenShotUse;
			screenShotCanvasContext.drawImage(screenShotImage, 0, 0, screenShotCanvas.width, screenShotCanvas.height);
			screenShotCanvasContext.drawImage(scribbleCanvas, 0, 0);

			screenShot = screenShotCanvas.toDataURL('image/png');
			// Remove base64 header text
			//screenShot = screenShot.substring(screenShot.indexOf(",") + 1);
			//console.log(screenShot);
			vm.screenShotSave({screenShot: screenShot});

			vm.closeDialog();
		};

		/**
		 * Move the pen indicator
		 * @param x
		 * @param y
		 */
		function setPenIndicatorPosition (x, y) {
			var positionFactorX = 10.0,
				positionFactorY = 30.0;
			penIndicator.css("left", (x - positionFactorX) + "px");
			penIndicator.css("top", (y + positionFactorY) + "px");
		}
	}
}());