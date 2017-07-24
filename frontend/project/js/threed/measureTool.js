/**
 *  Copyright (C) 2014 3D Repo Ltd
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

var MeasureTool = {};

(function() {
    "use strict";

    MeasureTool = function(viewer){
        this.viewer = viewer;

        this.lineStarted       = false;
        this.inMeasureMode     = false;
        this.measureCoords     = [null, null];
        this.measureLine       = null;
        this.measureLineCoords = null;

        this.mouseDownFunction = this.measureMouseDown.bind(this);
        this.mouseMoveFunction = this.measureMouseMove.bind(this);

        this.viewArea     = this.viewer.getViewArea();
        this.doc          = this.viewArea._doc;
        this._pickingInfo = this.viewArea._pickingInfo;

        this.element = document.getElementById("x3dom-default-canvas");
    };


    MeasureTool.prototype.measureMouseMove = function(event)
    {
        this.measureCoords[1] = this._pickingInfo.pickPos;
        this.updateMeasureLine();

        console.log("MOVE", this._pickingInfo.pickPos);
    };

    MeasureTool.prototype.measureMouseDown = function(event)
    {
        console.log("MEASURE DOWN", this.lineStarted);
        
        var pos = this._pickingInfo.pickPos;

        if (pos !== null)
        {
            if (!this.lineStarted)
            {
                this.createMeasureLine();
                this.measureCoords[0] = pos;

                this.viewer.onMouseMove(this.mouseMoveFunction);
            } else {
                this.measureCoords[1] = pos;
                this.viewer.offMouseMove(this.mouseMoveFunction);
            }

            this.lineStarted = !this.lineStarted;

            console.log("MC: ", this.measureCoords);
        }

    };

    MeasureTool.prototype.measureMode = function (on) {
        console.log("MEASURE MODE", on); //this.lineStarted)
        
        this.doc.inMeasureMode = ! this.doc.inMeasureMode;

        if (on) {
            this.element.style.cursor = "crosshair";

            this.viewer.onMouseDown(this.mouseDownFunction);
  
            this.viewer.highlightObjects();

            // Switch off the pick point functionality
            this.viewer.disableClicking();
        } else {
            this.deleteMeasureLine();
            this.element.style.cursor = "-webkit-grab";

            this.viewer.offMouseDown(this.mouseDownFunction);
            this.viewer.offMouseMove(this.mouseMoveFunction);
  
            // Restore the previous functionality
            this.viewer.enableClicking();
        }
    };

    MeasureTool.prototype.createMeasureLine = function() {
        if (this.measureLine !== null)
        {
            this.deleteMeasureLine();
        }

        var lineDepth,
            lineApp,
            line,
            colors;

        var line = document.createElement("LineSet");
        line.setAttribute("vertexCount", 8);

        this.measureLineCoords = document.createElement("Coordinate");
        this.measureLineCoords.setAttribute("point", "0 0 0,0 0 0,0 0 0,0 0 0,0 0 0,0 0 0,0 0 0,0 0 0");
        line.appendChild(this.measureLineCoords);

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

        this.measureLine = document.createElement("Shape");
        this.measureLine.appendChild(lineApp);
        this.measureLine.appendChild(line);

        this.viewer.scene.appendChild(this.measureLine);
    };

    MeasureTool.prototype.updateMeasureLine = function()
    {
        if (this.lineStarted)
        {
            var coordString = "";

            if (this.measureCoords[0] !== null && this.measureCoords[1] !== null)
            {
                var startCoordArray = this.measureCoords[0].toGL();
                var endCoordArray   = this.measureCoords[1].toGL();

                coordString += startCoordArray.join(" ") + ",";
                coordString += startCoordArray[0] + " " + startCoordArray[1] + " " + endCoordArray[2] + ",";
                coordString += startCoordArray[0] + " " + startCoordArray[1] + " " + endCoordArray[2] + ",";
                coordString += endCoordArray[0] + " " + startCoordArray[1] + " " + endCoordArray[2] + ",";
                coordString += endCoordArray[0] + " " + startCoordArray[1] + " " + endCoordArray[2] + ",";
                coordString += endCoordArray.join(" ") + ",";
                coordString += endCoordArray.join(" ") + ",";
                coordString += startCoordArray.join(" ");

                this.measureLineCoords.setAttribute("point", coordString);
                //console.log("COORD: " + coordString);
            }
        }
    };

    MeasureTool.prototype.deleteMeasureLine = function () {
        if (this.measureLine !== null) {
            this.measureLine.parentElement.removeChild(this.measureLine);
            this.measureLine = null;
            this.measureLineCoords = null;
            this.measureCoords = [null, null];

            this.lineStarted = false;
        }
    };
})();

