/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

var Viewer = function() {

	this.lookAtObject = function(obj)
	{
		$("#viewer")[0].runtime.fitObject(obj, true);
	};

	this.clickedFromView = false;

	this.previousSelectedOneSided = [];
	this.previousSelectedTwoSided = [];

	this.selectGroup = function(group)
	{
		if(!this.clickedFromView)
			this.lookAtObject(group);

		this.setApp(group);

		this.clickedFromView = false;

		//floating.addAllFloats(rootObj);

	}

	this.applyApp = function(nodes, factor, emiss, otherSide)
	{
		previous = [];

		if(otherSide)
		{
			for(var m_idx = 0; m_idx < nodes.length; m_idx++)
			{
				var origDiff = nodes[m_idx]._x3domNode._vf.diffuseColor;
				nodes[m_idx]._x3domNode._vf.diffuseColor.setValues(origDiff.multiply(factor));

				var origAmb = nodes[m_idx]._x3domNode._vf.ambientIntensity;
				nodes[m_idx]._x3domNode._vf.ambientIntensity = origAmb * factor;

				nodes[m_idx]._x3domNode._vf.emissiveColor.setValueByStr(emiss);

				previous[m_idx] = nodes[m_idx];
			}
		} else {
			for(var m_idx = 0; m_idx < nodes.length; m_idx++)
			{
				var origDiff = nodes[m_idx]._x3domNode._vf.backDiffuseColor;
				nodes[m_idx]._x3domNode._vf.backDiffuseColor.setValues(origDiff.multiply(factor));

				var origAmb = nodes[m_idx]._x3domNode._vf.backAmbientIntensity;
				nodes[m_idx]._x3domNode._vf.backAmbientIntensity = origAmb * factor;

				nodes[m_idx]._x3domNode._vf.backEmissiveColor.setValueByStr(emiss);

				previous[m_idx] = nodes[m_idx];
			}
		}

		return previous;
	}


	this.setApp = function(group)
	{
		this.applyApp(this.previousSelectedOneSided, 2.0, "0.0 0.0 0.0", false);
		this.applyApp(this.previousSelectedTwoSided, 2.0, "0.0 0.0 0.0", false);
		this.applyApp(this.previousSelectedTwoSided, 2.0, "0.0 0.0 0.0", true);

		var twoGrpNodes = group.getElementsByTagName("TwoSidedMaterial");
		var oneGrpNodes = group.getElementsByTagName("Material");

		this.previousSelectedOneSided = [];
		this.previousSelectedTwoSided = [];

		this.previousSelectedOneSided = this.applyApp(oneGrpNodes, 0.5, "1.0 0.5 0.0", false);
		this.previousSelectedTwoSided = this.applyApp(twoGrpNodes, 0.5, "1.0 0.5 0.0", false);
		this.applyApp(twoGrpNodes, 0.5, "1.0 0.5 0.0", true);
	}
};

$(document).ready( function() {
	$("#view-everything").click(function(e) {
		$("#viewer")[0].runtime.showAll();
	});

	$("#view-def-viewpoint").click(function(e) {
		$("#viewer")[0].runtime.resetView();
	});

	$("#examine").click(function(e) {
		$("#viewer")[0].runtime.showAll();
	});
});

// When the user clicks on the background the select nothing.
$(document).on("bgroundClicked", function(event) {
	viewer.setApp([]);
});

$(document).on("clickObject", function(event, objEvent) {
	//viewer.lookAtObject(objEvent.target);
	viewer.clickedFromView = true;
	viewer.setApp(objEvent.target);
});

// $('scene')[0]._x3domNode.getVolume().center


$(document).on("onLoaded", function(event, objEvent) {
	$('#viewer')[0].runtime.showAll();

	var bboxCenter = $('scene')[0]._x3domNode.getVolume().center;

	$('#sceneVP')[0].setAttribute('centerofrotation', bboxCenter.x + ', ' + bboxCenter.y + ', ' + bboxCenter.z);
	$('#sceneVP')[0].addEventListener('viewpointChanged', onViewpointChange, false);

});


$(document).ready( function() {
	window.viewer = new Viewer();
});
