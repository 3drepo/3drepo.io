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

var FloatingMetas = function() {
	this.floats = [];
	this.topNum = 5;
	this.minBiggestSize = 0;

	this.clearFloats = function()
	{
		for(var idx = 0; idx < this.floats.length; idx++)
		{
			this.floats[idx].divElem.remove();
			this.floats[idx].line.remove();
		}

		this.minBiggestSize = 0;
		this.floats = [];
	}

	this.addAllFloats = function(group)
	{
		if(group.tagName == "Shape")
			var shps = [group];
		else
			var shps = group.getElementsByTagName("Shape");

		this.clearFloats();

		for(var idx = 0; idx < shps.length; idx++)
		{
			floating.addFloatingMeta(shps[idx], shps[idx]["id"]);
		}

		this.updateFloats();
	}

	this.addFloatingMeta = function(obj, info)
	{
		var min = x3dom.fields.SFVec3f.MIN();
		var max = x3dom.fields.SFVec3f.MAX();

		obj._x3domNode.getVolume().getBounds(min, max);

		var sz = (max.x - min.x) * (max.y - min.y) * (max.z - min.z);

		// Is the object big enough to make
		// it into the top N
		if (sz > this.minBiggestSize)
		{
			var floatMeta = {};

			floatMeta.divElem = document.createElement("div");
			floatMeta.divElem.setAttribute('class', 'floatingMeta');
			floatMeta.divElem.setAttribute('id', 'meta-' + obj.getAttribute('id'));
			floatMeta.divElem.innerHTML = info;

			floatMeta.size = sz;

			floatMeta.x3domobj = obj;

			floatMeta.line = document.createElement("div");
			floatMeta.line.setAttribute('class', 'line');

			floatMeta.bboxMin = min;
			floatMeta.bboxMax = max;

			if(this.floats.length == this.topNum)
			{
				this.floats[this.topNum - 1].divElem.remove();
				this.floats[this.topNum - 1].line.remove();
				delete this.floats[this.topNum - 1];
				this.floats.splice(this.topNum - 1, 1);
			}

			document.body.appendChild(floatMeta.divElem);
			document.body.appendChild(floatMeta.line);

			this.floats.push(floatMeta);
			this.floats.sort(function (a,b) { return a.size - b.size;})
		}
	}

	this.updateFloats = function()
	{
		for (var idx = 0; idx < this.floats.length; idx++)
		{
			var currFloat = this.floats[idx];

			var mat = currFloat.x3domobj._x3domNode.getCurrentTransform();

			min = mat.multMatrixPnt(currFloat.bboxMin);
			max = mat.multMatrixPnt(currFloat.bboxMax);

			var bboxcenter = x3dom.fields.SFVec3f;

			bboxcenter.x = (min.x + max.x) / 2;
			bboxcenter.y = (min.y + max.y) / 2;
			bboxcenter.z = (min.z + max.z) / 2;

			var model = $("#viewer")[0];
			var viewerWidth = $("#viewer").width();
			var viewerHeight = $("#viewer").height();
			var pos2d = model.runtime.calcPagePos(bboxcenter.x, bboxcenter.y, bboxcenter.z);

			var halfWidth = viewerWidth / 2;

			var divWidth  = $(this.floats[idx].divElem).width();
			var divHeight = $(this.floats[idx].divElem).height();
			var leftCoord = (pos2d[0] - (halfWidth / 2) - (divWidth / 2));

			this.floats[idx].divElem.style.left = leftCoord + "px";
			this.floats[idx].divElem.style.top  = (pos2d[1] - (divHeight / 2)) + "px";

			this.floats[idx].line.style.top     = pos2d[1] + "px";
			this.floats[idx].line.style.left    = (leftCoord + divWidth) + "px";
			this.floats[idx].line.style.width   = (pos2d[0] - (leftCoord + divWidth)) + "px";
		}
	}
};

$(document).on("onViewpointChange", function(event, objEvent) {
	//floating.updateFloats();
});

$(document).on("clickObject", function(event, objEvent) {
	//floating.addAllFloats(objEvent.target);
});

$(document).on("onLoaded", function(event, objEvent) {
	document.getElementById('sceneVP').addEventListener('viewpointChanged', onViewpointChange, false);

	//floating.addAllFloats(document);
});

$(document).on("bgroundClicked", function(event, objEvent) {
	//floating.addAllFloats(document);
});

$(document).ready( function() {
	window.floating = new FloatingMetas();
});
