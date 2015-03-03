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
		var mat = obj._x3domNode.getCurrentTransform();
		var min = x3dom.fields.SFVec3f.MAX();
		var max = x3dom.fields.SFVec3f.MIN();
		obj._x3domNode.getVolume().getBounds(min, max);

		min = mat.multMatrixPnt(min);
		max = mat.multMatrixPnt(max);

		var bboxcenter = x3dom.fields.SFVec3f;

		bboxcenter.x = (min.x + max.x) / 2;
		bboxcenter.y = (min.y + max.y) / 2;
		bboxcenter.z = (min.z + max.z) / 2;

		this.lookAtPoint(bboxcenter.x, bboxcenter.y, bboxcenter.z);
	};

	this.color_dict = {"Office_A_20110811" : "0.1 0.0 0.0", "Office_S_20110811" : "0.0 0.0 0.1", "Office_MEP_20110811" : "0.0 0.1 0.1"};

	this.previousSelected = [];

	this.selectGroup = function(group)
	{
		this.lookAtObject(group);
		this.setApp(group);
		//floating.addAllFloats(rootObj);

	}

	this.setApp = function(group)
	{
		for(var m_idx = 0; m_idx < this.previousSelected.length; m_idx++)
		{
			this.previousSelected[m_idx].setAttribute("emissiveColor", "0.0 0.0 0.0");
		}

		var twoGrpNodes = group.getElementsByTagName("TwoSidedMaterial");
		var oneGrpNodes = group.getElementsByTagName("Material");

		this.previousSelected = [];

		for(var m_idx = 0; m_idx < oneGrpNodes.length; m_idx++)
		{
			oneGrpNodes[m_idx].setAttribute("emissiveColor", "1.0 0.5 0.0");
			this.previousSelected[m_idx] = oneGrpNodes[m_idx];
		}

		for(var m_idx = 0; m_idx < twoGrpNodes.length; m_idx++)
		{
			twoGrpNodes[m_idx].setAttribute("emissiveColor", "1.0 0.5 0.0");
			this.previousSelected[m_idx + oneGrpNodes.length] = twoGrpNodes[m_idx];
		}
	}

	this.lookAtPoint = function(x,y,z) {
		var model = $("#viewer")[0];
		if(model && model.runtime){
			var pickVec = new x3dom.fields.SFVec3f(x,y,z);
			model.runtime.canvas.doc._viewarea._pick = pickVec;
			model.runtime.canvas.doc._viewarea.onDoubleClick();
		}
	};
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

	// Very bad hacky way of doing this, speak to Fraunhofer
	var twoMatNodes = document.getElementsByTagName("TwoSidedMaterial")
	var oneMatNodes = document.getElementsByTagName("Material");
	var mat_nodes = $.merge(oneMatNodes, twoMatNodes);

	for(var m_idx = 0; m_idx < mat_nodes.length; m_idx++)
	{
		mat_nodes[m_idx].setAttribute("emissiveColor", "0 0 0");
		mat_nodes[m_idx].setAttribute("transparency", "0.0");
	}

});

$(document).on("clickObject", function(event, objEvent) {
	//viewer.lookAtObject(objEvent.target);
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
