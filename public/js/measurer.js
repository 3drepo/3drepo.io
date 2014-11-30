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

var Measurer = function() {
	this.v1 = [0,0,0];
	this.v2 = [0,0,0];

	this.currentPoint = this.v1;

	this.updatePoint = function(x, y, z) {
		this.currentPoint[0] = x;
		this.currentPoint[1] = y;
		this.currentPoint[2] = z;
	
		document.getElementById("line").setAttribute("point", this.v1.join(" ") + "," + this.v2.join(" "));
	}

	this.togglePoint = function() {
		if (this.currentPoint == this.v1) {
			this.currentPoint = this.v2;
			this.updatePoint(this.v1[0], this.v1[1], this.v1[2]);
			document.getElementById("lineTrans").setAttribute("render", "true");
		} else {
			this.currentPoint = this.v1;
			document.getElementById("lineTrans").setAttribute("render", "false");
		}
	};

	this.distance = function() {
		
		var dist = (this.v1[0] - this.v2[0]) * (this.v1[0] - this.v2[0]);
		dist += (this.v1[1] - this.v2[1]) * (this.v1[1] - this.v2[1]);
		dist += (this.v1[2] - this.v2[2]) * (this.v1[2] - this.v2[2]);
		
		return Math.sqrt(dist);
	};
};

$(document).on("onMouseMove", function(event, objEvent) {
	if (window.toggleMeasure)
	{
		window.measurer.updatePoint(objEvent.worldX, objEvent.worldY, objEvent.worldZ);
		$('#distance').text(measurer.distance().toFixed(2) + ' m');
	}
});

$(document).on("onMouseOver", function(event, objEvent) {
	if(window.toggleMeasure) {
		window.measurer.updatePoint(objEvent.worldX, objEvent.worldY, objEvent.worldZ);
	}
});

$(document).on("clickObject", function(event, objEvent) {
	if(window.toggleMeasure)
		window.measurer.togglePoint();
});	
	
$(document).ready( function() {
	window.measurer = new Measurer();
	window.toggleMeasure = false;

	$("#measure").click(function(e) {
		if (window.toggleMeasure) {
			$("#x3dom-viewer-canvas").css("cursor", "default");
			$("#popup").css("visibility", "hidden");
			$("#distance").css("visibility", "hidden");
			$("#dist_name").css("visibility", "hidden");
		} else {
			$("#x3dom-viewer-canvas").css("cursor", "crosshair");
			$("#popup").css("visibility", "visible");
			$("#distance").css("visibility", "visible");
			$("#dist_name").css("visibility", "visible");
		}

		window.toggleMeasure = !window.toggleMeasure;
	});

});

