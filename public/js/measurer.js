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
	this.v1 = {x:0, y:0, z:0};
	this.v2 = {x:0, y:0, z:0};

	this.currentPoint = this.v1;

	this.updatePoint = function(x,y,z) 
	{
		this.currentPoint.x = x;
		this.currentPoint.y = y;
		this.currentPoint.z = z;

		document.getElementById("line").setAttribute("point", this.v1.x + " " + this.v1.y + " " + this.v1.z + "," + this.v2.x + " " + this.v2.y + " " + this.v2.z);
	}

	this.togglePoint = function()
	{
		if (this.currentPoint == this.v1)
		{
			this.currentPoint = this.v2;
			document.getElementById("lineTrafo").setAttribute("render", "true");
		} else {
			this.currentPoint = this.v1;
			document.getElementById("lineTrafo").setAttribute("render", "false");
		}
	};

	this.distance = function()
	{
		var vec = {x: (this.v1.x - this.v2.x),
			y: (this.v1.y - this.v2.y),
			z: (this.v1.z - this.v2.z)};

		return Math.sqrt ( Math.pow(vec.x, 2) + 
				Math.pow(vec.y, 2) + 
				Math.pow(vec.z, 2) );
	};
}

$(document).ready(function() {
	window.measurer = new Measurer();
	var shapes = document.getElementsByTagName("shape");

	for (var i = 0; i < shapes.length; i++) {
		shapes[i].onclick = function (event)
		{
			if (window.old_object)
				window.old_object.attr('emissiveColor', "0 0 0");

			document.getElementById('popup').style.visibility = "visible";

			window.old_object = $(this).children('appearance').children('material');
			$(this).children('appearance').children('material').attr('emissiveColor', '1.0 0.5 0');
			$('#mesh_name').text($(this).attr('def'));

			$('#price_val').text('£' + (Math.random() * 1000).toFixed(2));

			if (window.toggleMeasure)
			{
				window.measurer.togglePoint();	
			}
		};

		shapes[i].onmouseover = function (event)
		{
			if (window.toggleMeasure)
			{
				window.measurer.updatePoint(event.worldX, event.worldY, event.worldZ);			
			}
		};

		shapes[i].onmousemove = function (event)
		{
			if (window.toggleMeasure)
			{
				window.measurer.updatePoint(event.worldX, event.worldY, event.worldZ);
				$('#distance').text(measurer.distance().toFixed(2) + ' m');
			}	
		};
	}

	var scene = document.getElementsByTagName("scene")[0];

	var trans = document.createElement("Transform");
	trans.setAttribute("id", "lineTrafo");
	trans.setAttribute("render", "false");

	scene.appendChild(trans);

	var shape = document.createElement("Shape");
	shape.setAttribute("isPickable","false");

	trans.appendChild(shape);

	var app = document.createElement("Appearance");
	shape.appendChild(app);

	var mat = document.createElement("Material");
	mat.setAttribute("emissiveColor", "1 0 0");
	app.appendChild(mat);

	var dep = document.createElement("DepthMode");
	dep.setAttribute("enableDepthTest","false");
	app.appendChild(dep);

	var idls = document.createElement("IndexedLineSet");
	idls.setAttribute("coordIndex", "0 1 0 -1");
	shape.appendChild(idls);

	var coord = document.createElement("Coordinate");
	coord.setAttribute("id","line");
	coord.setAttribute("point"," 0.0 0.0 0.0, 1.0 1.0 1.0");
	idls.appendChild(coord);

});

document.onload = function(e) {
	window.toggleMeasure = false;

	jQuery("#view-everything").click(function(e) {
		document.getElementById("model").runtime.showAll();
	});

	jQuery("#view-def-viewpoint").click(function(e) {
		document.getElementById("model").runtime.resetView();
	});

	jQuery("#examine").click(function(e) {
		document.getElementById("model").runtime.showAll();
	});

	jQuery("#measure").click(function(e) {
		if (window.toggleMeasure)
		{
			$("#x3dom-model-canvas").css("cursor", "default");
			$("#distance").css("visibility", "hidden");
			$("#dist_name").css("visibility", "hidden");
		}
		else
		{
			$("#x3dom-model-canvas").css("cursor", "crosshair");
			$("#lineTrafo").prop("render", false);
			$("#distance").css("visibility", "visible");
			$("#dist_name").css("visibility", "visible");
		}

		window.toggleMeasure = !window.toggleMeasure;
	});

};

