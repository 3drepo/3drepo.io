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

var MeasureTool = {};

(function() {
	"use strict";

	MeasureTool = function(viewer){
		var self = this;

		this.viewer = viewer;

		this.lineStarted       = false;
		this.inMeasureMode     = false;
		this.measureCoords     = [null, null];
		this.measureLine       = null;
		this.measureLineCoords = null;

		this.measureMouseMove = function(event)
		{
			var viewArea = self.viewer.getViewArea();
			var pickingInfo = viewArea._pickingInfo;

			self.measureCoords[1] = pickingInfo.pickPos;
			self.updateMeasureLine();
		};

		this.measureMouseDown = function(event)
		{
			var viewArea = self.viewer.getViewArea();
			var pickingInfo = viewArea._pickingInfo;

			if (!self.lineStarted)
			{
				self.measureCoords[0] = pickingInfo.pickPos;
				self.lineStarted      = true;

				self.createMeasureLine();
				self.viewer.onMouseMove(self.measureMouseMove);
			} else {
				self.measureCoords[1] = pickingInfo.pickPos;
				self.lineStarted      = false;

				self.viewer.offMouseMove(self.measureMouseMove);
			}
		};
	};

	MeasureTool.prototype.measureMode = function (on) {
		var self = this;

		var element = document.getElementById("x3dom-default-canvas");
		if (on) {
			self.inMeasureMode   = true;
			element.style.cursor = "crosshair";
			self.viewer.onMouseDown(self.measureMouseDown);
			self.viewer.onMouseMove(self.measureMouseMove);

			self.viewer.highlightObjects();

			// Switch off the pick point functionality
			self.viewer.disableClicking();
		} else {
			self.inMeasureMode   = false;
			self.deleteMeasureLine();
			element.style.cursor = "-webkit-grab";
			self.viewer.offMouseDown(self.measureMouseDown);
			self.viewer.offMouseMove(self.measureMouseMove);

			// Restore the previous functionality
			self.viewer.enableClicking();
		}
	};

	MeasureTool.prototype.createMeasureLine = function() {
		var self = this;

		if (self.measureLine !== null)
		{
			self.deleteMeasureLine();
		}

		var lineDepth,
			lineApp,
			line,
			colors;

		var line = document.createElement("LineSet");
		line.setAttribute("vertexCount", 8);

		self.measureLineCoords = document.createElement("Coordinate");
		self.measureLineCoords.setAttribute("point", "0 0 0,0 0 0,0 0 0,0 0 0,0 0 0,0 0 0,0 0 0,0 0 0");
		line.appendChild(self.measureLineCoords);

		var colors = document.createElement("Color");
		colors.setAttribute("color", "0 1 0,0 1 0,1 0 0,1 0 0,0 0 1,0 0 1, 1 1 1, 1 1 1");
		line.appendChild(colors);

		var lineDepth = document.createElement("DepthMode");
		lineDepth.setAttribute("depthFunc", "ALWAYS");

		var lineApp = document.createElement("Appearance");
		lineApp.appendChild(lineDepth);

		var lineProperties = document.createElement("LineProperties");
		lineProperties.setAttribute("linewidthScaleFactor", 3.0);
		lineApp.appendChild(lineProperties);

		self.measureLine = document.createElement("Shape");
		self.measureLine.appendChild(lineApp);
		self.measureLine.appendChild(line);

		self.viewer.scene.appendChild(self.measureLine);
	};

	MeasureTool.prototype.updateMeasureLine = function()
	{
		var self = this;

		if (self.lineStarted)
		{
		var coordString = "";

			if (self.measureCoords[0] !== null && self.measureCoords[1] !== null)
			{
				var startCoordArray = self.measureCoords[0].toGL();
				var endCoordArray   = self.measureCoords[1].toGL();

				coordString += startCoordArray.join(" ") + ",";
				coordString += startCoordArray[0] + " " + startCoordArray[1] + " " + endCoordArray[2] + ",";
				coordString += startCoordArray[0] + " " + startCoordArray[1] + " " + endCoordArray[2] + ",";
				coordString += endCoordArray[0] + " " + startCoordArray[1] + " " + endCoordArray[2] + ",";
				coordString += endCoordArray[0] + " " + startCoordArray[1] + " " + endCoordArray[2] + ",";
				coordString += endCoordArray.join(" ") + ",";
				coordString += endCoordArray.join(" ") + ",";
				coordString += startCoordArray.join(" ");

				self.measureLineCoords.setAttribute("point", coordString);
			}
		}
	};

	MeasureTool.prototype.deleteMeasureLine = function () {
		var self = this;

		if (self.measureLine !== null) {
			self.measureLine.parentElement.removeChild(self.measureLine);
			self.measureLine = null;
			self.measureLineCoords = null;
		}
	};
})();

