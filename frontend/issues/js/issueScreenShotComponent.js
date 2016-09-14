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
				templateUrl: "issueScreenShot.html",
				bindings: {
					sendEvent: "&",
					close: "&"
				}
			}
		);

	IssuesScreenShotCtrl.$inject = ["$q", "$timeout", "UtilsService", "EventService"];

	function IssuesScreenShotCtrl ($q, $timeout, UtilsService, EventService) {
		var self = this,
			screenShotPromise = $q.defer(),
			issueScreenShotCanvas = document.getElementById("issueScreenShotCanvas"),
			issueScreenShotCanvasContext = issueScreenShotCanvas.getContext("2d"),
			screenShotImage = new Image(),
			// Inspired by confile's answer - http://stackoverflow.com/a/28241682/782358
			innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
			innerHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,

			penIndicator,
			mouse_drag_x = 0, mouse_drag_y = 0,
			last_mouse_drag_x = -1, last_mouse_drag_y = -1,
			mouse_button = 0,
			mouse_dragging = false,
			pen_col = "#DD0000",
			penIndicatorSize = 8,
			penToIndicatorRatio = 0.8,
			pen_size = penIndicatorSize * penToIndicatorRatio,
			hasDrawnOnCanvas = false;

		// Set the screen shot canvas to 80% screen size
		issueScreenShotCanvas.width = (innerWidth * 80) / 100;
		issueScreenShotCanvas.height = (innerHeight * 80) / 100;

		// Get the screen shot
		this.sendEvent({type:EventService.EVENT.VIEWER.GET_SCREENSHOT, value: {promise: screenShotPromise}});
		screenShotPromise.promise.then(function (screenShot) {
			screenShotImage.src = screenShot;
			issueScreenShotCanvasContext.drawImage(screenShotImage, 0, 0, issueScreenShotCanvas.width, issueScreenShotCanvas.height);
			self.initCanvas(issueScreenShotCanvas);
			self.setupScribble();
		});

		this.closeDialog = function () {
			UtilsService.closeDialog();
			this.close();
		};

		/**
		 * Setup canvas and event listeners
		 * @param canvas
		 */
		this.initCanvas = function (canvas)
		{
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
				// vm.pointerEvents = "none";
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
				// vm.pointerEvents = "auto";
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
				// vm.pointerEvents = "auto";
			}, false);

			canvas.addEventListener('mousemove', function (evt) {
				window.status='MOVE: ' + evt.layerX + ", " + evt.layerY;
				mouse_drag_x = evt.layerX;
				mouse_drag_y = evt.layerY;

				if (!mouse_dragging && !self.showPenIndicator) {
					$timeout(function () {
						self.showPenIndicator = true;
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
				//setPenIndicatorPosition(evt.layerX, evt.layerY);
			}, false);
		};

		/**
		 * Update the canvas
		 *
		 * @param canvas
		 */
		function updateImage(canvas)
		{
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
		this.setupErase = function () {
			issueScreenShotCanvasContext.globalCompositeOperation = "destination-out";
			pen_col = "rgba(0, 0, 0, 1)";
			// vm.canvasPointerEvents = "auto";
		}

		/**
		 * Set up drawing
		 */
		this.setupScribble = function () {
			issueScreenShotCanvasContext.globalCompositeOperation = "source-over";
			pen_col = "#FF0000";
			pen_size = penIndicatorSize;
			// vm.canvasPointerEvents = "auto";
		}
	}
}());