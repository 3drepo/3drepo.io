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

var Pin = {};

(function() {
	"use strict";

	// Constants go here
	var ORANGE_HIGHLIGHT = "1.0 0.7 0.0";
	var GREY_PIN = [0.5, 0.5, 0.5];

	var PIN_RADIUS = 0.25;
	var PIN_HEIGHT = 1.0;
	var GHOST_OPACITY = 0.4;
	var OPAQUE_OPACITY = 1.0 - GHOST_OPACITY;

	/*
	 * Pin shape constructor and manipulator
	 *
	 * @constructor
	 * @this {Pin}
	 * @param {number} id - Unique ID for this clipping plane
	 * @param {Viewer} parentViewer - Parent viewer
	 * @param {string} axis - Letter representing the axis: "X", "Y" or "Z"
	 * @param {array} colour - Array representing the color of the slice
	 * @param {number} percentage - Percentage along the bounding box to clip
	 * @param {number} clipDirection - Direction of clipping (-1 or 1)
	 * @param {string} account - database it came from
	 * @param {string} project - name of the project
	 */
	Pin = function(id, element, trans, position, norm, scale, colours, viewpoint, account, project) {
		var self = this;

		self.id = id;

		self.highlighted = false;

		self.element = element;
		self.trans = trans;
		self.scale = scale;
		self.viewpoint = viewpoint;
		self.account = account;
		self.project = project;

		self.ghostConeIsHighlighted = null;
		self.coneIsHighlighted = null;

		self.ghostPinHeadNCol = null;
		self.pinHeadNCol = null;

		self.ghostPinHeadColour = null;
		self.pinHeadColour = null;

		self.ghostPinHeadIsHighlighted = null;
		self.pinHeadIsHighlighted = null;

		self.coneDepth = null;
		self.pinHeadDepth = null;

		// Initialize the colours and numColours that
		// are passed in
		self.numColours = 0;

		if (typeof colours === "undefined") {
			self.numColours = 1;
			colours = [1.0, 0.0, 0.0];
		} else if (typeof colours[0] === "number") {
			self.numColours = 1;
		} else {
			self.numColours = colours.length;
		}

		self.colours = colours;

		var parent = document.createElement("MatrixTransform");
		parent.setAttribute("id", self.id);
		parent.setAttribute("matrix", trans.toGL().toString());

		// Transform the normal into the coordinate frame of the parent
		self.modelTransform = document.createElement("Transform");

		var axisAngle = ViewerUtil.rotAxisAngle([0, 1, 0], norm);
		self.modelTransform.setAttribute("rotation", axisAngle.toString());
		self.modelTransform.setAttribute("translation", position.join(" "));

		parent.appendChild(self.modelTransform);

		colours = colours.join(" ");
		this.createBasicPinShape(self.modelTransform, "ALWAYS", GHOST_OPACITY, true);
		this.createBasicPinShape(self.modelTransform, "LESS", OPAQUE_OPACITY, false);

		self.element.appendChild(parent);
	};

	Pin.prototype.remove = function(id) {
		var pinPlacement = document.getElementById(id);
		if (pinPlacement !== null) {
			pinPlacement.parentElement.removeChild(pinPlacement);
		}
	};

	Pin.prototype.changeColour = function(colours) {
		var self = this;
		// Find both the material for the ghosted pin and the opaque pin

		if ((typeof colours === "undefined") || (!colours.length)) {
			colours = GREY_PIN;
		}

		if (typeof colours[0] === "number") {
			self.numColours = 1;
		} else {
			self.numColours = colours.length;
		}

		self.colours = colours;

		self.pinHeadNCol.setAttribute("value", self.numColours);
		self.pinHeadColour.setAttribute("value", self.colours.join(" "));

		self.ghostPinHeadNCol.setAttribute("value", self.numColours);
		self.ghostPinHeadColour.setAttribute("value", self.colours.join(" "));
	};

	Pin.prototype.highlight = function()
	{
		var self = this;

		self.highlighted = !self.highlighted;

		var depthMode = self.highlighted ? "ALWAYS" : "LESS" ;
		var highlighted = self.highlighted.toString();

		self.pinHeadIsHighlighted.setAttribute("value", highlighted);
		self.ghostPinHeadIsHighlighted.setAttribute("value", highlighted);
		self.coneIsHighlighted.setAttribute("value", highlighted);
		self.ghostConeIsHighlighted.setAttribute("value", highlighted);

		self.pinHeadDepth.setAttribute("depthFunc", depthMode);
		self.coneDepth.setAttribute("depthFunc", depthMode);
	};

	Pin.prototype.createBasicPinShape = function(parent, depthMode, opacity, ghostPin) {
		var self = this;

		var ORANGE_HIGHLIGHT = "1.0000 0.7 0.0";

		var coneHeight = PIN_HEIGHT - 2 * PIN_RADIUS;
		var pinshape = document.createElement("Group");
		pinshape.setAttribute("onclick", "clickPin(event)");

		var pinshapeapp = document.createElement("Appearance");
		//pinshape.appendChild(pinshapeapp);

		var pinshapescale = document.createElement("Transform");
		pinshapescale.setAttribute("scale", self.scale + " " + self.scale + " " + self.scale);
		pinshape.appendChild(pinshapescale);

		var pinshapeconetrans = document.createElement("Transform");
		pinshapeconetrans.setAttribute("translation", "0.0 " + (0.5 * coneHeight) + " 0.0");
		pinshapescale.appendChild(pinshapeconetrans);

		var pinshapeconerot = document.createElement("Transform");

		pinshapeconerot.setAttribute("rotation", "1.0 0.0 0.0 3.1416");
		pinshapeconetrans.appendChild(pinshapeconerot);

		var pinshapeconeshape = document.createElement("Shape");
		pinshapeconerot.appendChild(pinshapeconeshape);

		var pinshapecone = document.createElement("Cone");
		pinshapecone.setAttribute("bottomRadius", (PIN_RADIUS * 0.5).toString());
		pinshapecone.setAttribute("height", coneHeight.toString());

		var coneApp = pinshapeapp.cloneNode(true);

		var coneshader = document.createElement("ComposedShader");
		coneApp.appendChild(coneshader);

		var coneMat = document.createElement("Material");
		coneMat.setAttribute("diffuseColor", "1.0 1.0 1.0");
		coneMat.setAttribute("transparency", opacity);
		coneApp.appendChild(coneMat);

		var conehighlight = document.createElement("field");
		conehighlight.setAttribute("type", "SFVec3f");
		conehighlight.setAttribute("name", "highlightColor");
		conehighlight.setAttribute("value", ORANGE_HIGHLIGHT);
		coneshader.appendChild(conehighlight);

		var coneishighlighted = document.createElement("field");
		//coneishighlighted.setAttribute("id", self.id + "_cone" + (ghostPin ? "_ghost" : "") + "_ishighlighted");
		coneishighlighted.setAttribute("type", "SFBool");
		coneishighlighted.setAttribute("name", "highlightPin");
		coneishighlighted.setAttribute("value", "false");
		coneshader.appendChild(coneishighlighted);

		if (ghostPin)
		{
			self.ghostConeIsHighlighted = coneishighlighted;
		} else {
			self.coneIsHighlighted = coneishighlighted;
		}

		var coneuseclipplane = document.createElement("field");
		coneuseclipplane.setAttribute("type", "SFBool");
		coneuseclipplane.setAttribute("name", "useClipPlane");
		coneuseclipplane.setAttribute("value", ghostPin);
		coneshader.appendChild(coneuseclipplane);

		var conevert = document.createElement("ShaderPart");
		conevert.setAttribute("type", "VERTEX");
		conevert.setAttribute("USE", "noShadeVert");
		coneshader.appendChild(conevert);

		var conefrag = document.createElement("ShaderPart");
		conefrag.setAttribute("type", "FRAGMENT");
		conefrag.setAttribute("USE", "noShadeFrag");
		coneshader.appendChild(conefrag);

		var conedepth = document.createElement("DepthMode");

		if (!ghostPin) {
			self.coneDepth = conedepth;
		}

		conedepth.setAttribute("depthFunc", depthMode);
		conedepth.setAttribute("enableDepthTest", (!ghostPin).toString());
		coneApp.appendChild(conedepth);

		pinshapeconeshape.appendChild(coneApp);
		pinshapeconeshape.appendChild(pinshapecone);

		var pinshapeballtrans = document.createElement("Transform");
		pinshapeballtrans.setAttribute("translation", "0.0 " + (1.4 * coneHeight) + " 0.0");
		pinshapescale.appendChild(pinshapeballtrans);

		var pinshapeballshape = document.createElement("Shape");
		pinshapeballtrans.appendChild(pinshapeballshape);

		var pinshapeball = document.createElement("Sphere");
		pinshapeball.setAttribute("radius", PIN_RADIUS.toString());

		var ballApp = pinshapeapp.cloneNode(true);

		pinshapeballshape.appendChild(pinshapeball);
		pinshapeballshape.appendChild(ballApp);

		var pinheadMat = document.createElement("Material");
		pinheadMat.setAttribute("diffuseColor", "1.0 1.0 1.0");
		pinheadMat.setAttribute("transparency", opacity);
		ballApp.appendChild(pinheadMat);

		var pinshader = document.createElement("ComposedShader");
		ballApp.appendChild(pinshader);

		var pinheadradius = document.createElement("field");
		pinheadradius.setAttribute("type", "SFFloat");
		pinheadradius.setAttribute("name", "radius");
		pinheadradius.setAttribute("value", PIN_RADIUS.toString());
		pinshader.appendChild(pinheadradius);

		var pinheadncol = document.createElement("field");
		//self.pinheadncol.setAttribute("id", self.id + (ghostPin ? "_ghost" : "") + "_ncol");
		pinheadncol.setAttribute("type", "SFFloat");
		pinheadncol.setAttribute("name", "numColours");
		pinheadncol.setAttribute("value", self.numColours);
		pinshader.appendChild(pinheadncol);

		if (ghostPin)
		{
			self.ghostPinHeadNCol = pinheadncol;
		} else {
			self.pinHeadNCol = pinheadncol;
		}

		var pinheadcolor = document.createElement("field");
		//self.pinheadcolor.setAttribute("id", self.id + (ghostPin ? "_ghost" : "") + "_col");
		pinheadcolor.setAttribute("type", "MFFloat");
		pinheadcolor.setAttribute("name", "multicolours");
		pinheadcolor.setAttribute("value", self.colours);
		pinshader.appendChild(pinheadcolor);

		if (ghostPin)
		{
			self.ghostPinHeadColour = pinheadcolor;
		} else {
			self.pinHeadColour = pinheadcolor;
		}

		var pinheadhighlight = document.createElement("field");
		pinheadhighlight.setAttribute("type", "SFVec3f");
		pinheadhighlight.setAttribute("name", "highlightColor");
		pinheadhighlight.setAttribute("value", ORANGE_HIGHLIGHT);
		pinshader.appendChild(pinheadhighlight);

		var pinheadishighlighted = document.createElement("field");
		//self.pinheadishighlighted.setAttribute("id", self.id + (ghostPin ? "_ghost" : "") + "_ishighlighted");
		pinheadishighlighted.setAttribute("type", "SFBool");
		pinheadishighlighted.setAttribute("name", "highlightPin");
		pinheadishighlighted.setAttribute("value", "false");
		pinshader.appendChild(pinheadishighlighted);

		if (ghostPin)
		{
			self.ghostPinHeadIsHighlighted = pinheadishighlighted;
		} else {
			self.pinHeadIsHighlighted = pinheadishighlighted;
		}

		var pinuseclipplane = document.createElement("field");
		pinuseclipplane.setAttribute("type", "SFBool");
		pinuseclipplane.setAttribute("name", "useClipPlane");
		pinuseclipplane.setAttribute("value", (!ghostPin).toString());
		pinshader.appendChild(pinuseclipplane);

		var pinvert = document.createElement("ShaderPart");
		pinvert.setAttribute("type", "VERTEX");
		pinvert.setAttribute("USE", "multiVert");
		pinshader.appendChild(pinvert);

		var pinfrag = document.createElement("ShaderPart");
		pinfrag.setAttribute("type", "FRAGMENT");
		pinfrag.setAttribute("USE", "multiFrag");
		pinshader.appendChild(pinfrag);

		var pinheaddepth = document.createElement("DepthMode");

		if (!ghostPin) {
			self.pinHeadDepth = pinheaddepth;
			//.setAttribute("id", self.id + "_depth");
		}

		pinheaddepth.setAttribute("depthFunc", depthMode);
		pinheaddepth.setAttribute("enableDepthTest", (!ghostPin).toString());
		ballApp.appendChild(pinheaddepth);

		parent.appendChild(pinshape);
	};

}());
