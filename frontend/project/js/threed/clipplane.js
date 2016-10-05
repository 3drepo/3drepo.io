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

var ClipPlane = {};

(function() {
    "use strict";
    
	/*
	 * Clipping plane constructor and manipulator
	 *
	 * Inspired by the work of Timo on 16.06.2014.
	 *
	 * @constructor
	 * @this {ClipPlane}
	 * @param {number} id - Unique ID for this clipping plane
	 * @param {Viewer} parentViewer - Parent viewer
	 * @param {string} axis - Letter representing the axis: "X", "Y" or "Z"
	 * @param {array} colour - Array representing the color of the slice
	 * @param {number} percentage - Percentage along the bounding box to clip
	 * @param {number} clipDirection - Direction of clipping (-1 or 1)
	 * @param {parentNode} node to append the clipping plane onto
	 */
	ClipPlane = function(id, viewer, axis, colour, distance, percentage, clipDirection, parentNode) {
		var self = this;

		console.log("creating clipping plane...");
		console.log(parentNode);
		// Public properties

		/**
		 * Axis on which the clipping plane is based
		 * @type {string}
		 */
		this.axis = "X";

		/**
		 * Value representing the direction of clipping
		 * @type {number}
		 */
		this.clipDirection = (clipDirection === undefined) ? -1 : clipDirection;

		/**
		 * Value representing the percentage distance from the origin of
		 * the clip plane
		 * @type {number}
		 */
		this.percentage = (percentage === undefined) ? 1.0 : percentage;

		/**
		 * Value representing the distance from the origin of
		 * the clip plane
		 * @type {number}
		 */
		this.distance = distance;

		/**
		 * Volume containing the clipping plane
		 * @type {BoxVolume}
		 */
		var volume = null;

		/**
		 * DOM Element representing the clipping plane
		 * @private
		 * @type {HTMLElement}
		 */
		var clipPlaneElem = document.createElement("ClipPlane");

		/**
		 * Normal vector to the clipping plane
		 * @private
		 * @type {SFVec3f}
		 */
		var normal = new x3dom.fields.SFVec3f(0, 0, 0);

		/**
		 * Coordinate frame for clipping plane
		 * @private
		 * @type {HTMLElement}
		 */
		var coordinateFrame = document.createElement("Transform");

		/**
		 * Outline shape
		 * @private
		 * @type {HTMLElement}
		 */
		var outline = document.createElement("Shape");

		/**
		 * Outline appearance
		 * @private
		 * @type {HTMLElement}
		 */
		var outlineApp = document.createElement("Appearance");

		/**
		 * Outline material
		 * @private
		 * @type {HTMLElement}
		 */
		var outlineMat = document.createElement("Material");

		/**
		 * Outline line set
		 * @private
		 * @type {HTMLElement}
		 */
		var outlineLines = document.createElement("LineSet");

		/**
		 * Outline coordinates
		 * @private
		 * @type {HTMLElement}
		 */
		var outlineCoords = document.createElement("Coordinate");

		/**
		 * Bounding box scale avoids flickering at edges
		 * @private
		 * @type {number}
		 */
		var BBOX_SCALE = 1.0001;

		/**
		 * Get my unique ID
		 */
		this.getID = function() {
			return id;
		};

		/**
		 * Set the coordinates of the clipping plane outline
		 */
		var setOutlineCoordinates = function() {
			var min = volume.min.multiply(BBOX_SCALE).toGL();
			var max = volume.max.multiply(BBOX_SCALE).toGL();

			var axisIDX = "XYZ".indexOf(self.axis);
			var outline = [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0]
			];

			var minor = (axisIDX + 1) % 3;
			var major = (axisIDX + 2) % 3;

			outline[0][minor] = min[minor];
			outline[0][major] = max[major];

			outline[1][minor] = min[minor];
			outline[1][major] = min[major];

			outline[2][minor] = max[minor];
			outline[2][major] = min[major];

			outline[3][minor] = max[minor];
			outline[3][major] = max[major];

			outline[4][minor] = min[minor];
			outline[4][major] = max[major];

			outlineCoords.setAttribute("point",
				outline.map(function(item) {
					return item.join(" ");
				}).join(",")
			);
		};

		/**
		 * Move the clipping plane
		 * @param {number} percentage - Percentage of entire clip volume to move across
		 */
		this.movePlane = function(percentage) {
			// Update the transform containing the clipping plane
			var axisIDX = "XYZ".indexOf(this.axis);
			var min = volume.min.multiply(BBOX_SCALE).toGL();
			var max = volume.max.multiply(BBOX_SCALE).toGL();


			self.percentage = percentage;
			var distance = 0.0;

			if (self.distance) {
				distance = self.distance;
			} else {
				distance = ((max[axisIDX] - min[axisIDX]) * percentage) + min[axisIDX];
			}

			console.log("distance: " + distance);
			// Update the clipping element plane equation
			clipPlaneElem.setAttribute("plane", normal.toGL().join(" ") + " " + distance);

			var translation = [0, 0, 0];
			translation[axisIDX] = -distance * this.clipDirection;
			coordinateFrame.setAttribute("translation", translation.join(","));
		};

		/**
		 * Change the clipping axis
		 * @param {string} axis - Axis on which the clipping plane acts
		 */
		this.changeAxis = function(axis) {
			this.axis = axis.toUpperCase();

			// When the axis is change the normal to the plane is changed
			normal.x = (axis === "X") ? this.clipDirection : 0;
			normal.y = (axis === "Y") ? this.clipDirection : 0;
			normal.z = (axis === "Z") ? this.clipDirection : 0;

			// Reset plane to the start
			this.movePlane(self.percentage);

			setOutlineCoordinates();
		};

		/**
		 * Transform the clipping plane by the given matrix
		 * @param {sfmatrix4f} matrix - transformation matrix to apply to clipping plane
		 */
		this.transformClipPlane = function(matrix)
		{

			var axisIDX = "XYZ".indexOf(this.axis);
			var min = volume.min.toGL();
			var max = volume.max.toGL();

			var point = min;
			point[axisIDX] = ((max[axisIDX] - min[axisIDX]) * percentage) + min[axisIDX];

			
			normal = matrix.multMatrixVec(normal);

			normal.normalize();

			var pntX3dom = new x3dom.fields.SFVec3f(point[0], point[1], point[2]);
			pntX3dom = matrix.multMatrixPnt(pntX3dom);
			this.distance = normal.dot(pntX3dom) * BBOX_SCALE;

			var plane = new x3dom.fields.SFVec4f(normal.x, normal.y, normal.z, -this.distance);

			console.log("new plane: " + plane.toGL());


			//random point on the plane
			var planePnt = null;
			if(normal.z != 0)
			{
				planePnt = new x3dom.fields.SFVec3f(0, 0, plane.w/normal.z);
			}
			else if(normal.y != 0)
			{
				planePnt = new x3dom.fields.SFVec3f(0, plane.w/normal.y, 0);
			}
			else if(normal.x != 0)
			{
				planePnt = new x3dom.fields.SFVec3f(plane.w/normal.x, 0, 0);
			}
			else
			{
				console.error("Failed to find plane point, normal direction is 0 0 0!");
			}


			// Update the clipping element plane equation
			clipPlaneElem.setAttribute("plane", plane.toGL().join(" "));


			//determine the outline of the clipping plane by intersection with the global bounding box	
			var fullVolume = viewer.runtime.getBBox(viewer.getScene());
			var min = fullVolume.min.multiply(BBOX_SCALE);
			var max = fullVolume.max.multiply(BBOX_SCALE);

			//[pointA, pointB]
			var bboxOutline = [
				[new x3dom.fields.SFVec3f(min.x, min.y, min.z), new x3dom.fields.SFVec3f(max.x, min.y, min.z)],
				[new x3dom.fields.SFVec3f(min.x, min.y, min.z), new x3dom.fields.SFVec3f(min.x, max.y, min.z)],
				[new x3dom.fields.SFVec3f(min.x, min.y, min.z), new x3dom.fields.SFVec3f(min.x, min.y, max.z)],
				[new x3dom.fields.SFVec3f(max.x, min.y, min.z), new x3dom.fields.SFVec3f(max.x, max.y, min.z)],
				[new x3dom.fields.SFVec3f(max.x, min.y, min.z), new x3dom.fields.SFVec3f(max.x, min.y, max.z)],
				[new x3dom.fields.SFVec3f(min.x, max.y, min.z), new x3dom.fields.SFVec3f(max.x, max.y, min.z)],
				[new x3dom.fields.SFVec3f(min.x, max.y, min.z), new x3dom.fields.SFVec3f(min.x, max.y, max.z)],
				[new x3dom.fields.SFVec3f(min.x, max.y, max.z), new x3dom.fields.SFVec3f(max.x, max.y, max.z)],
				[new x3dom.fields.SFVec3f(min.x, max.y, max.z), new x3dom.fields.SFVec3f(min.x, min.y, max.z)],
				[new x3dom.fields.SFVec3f(min.x, min.y, max.z), new x3dom.fields.SFVec3f(max.x, min.y, max.z)],
				[new x3dom.fields.SFVec3f(max.x, min.y, max.z), new x3dom.fields.SFVec3f(max.x, max.y, max.z)],
				[new x3dom.fields.SFVec3f(max.x, max.y, min.z), new x3dom.fields.SFVec3f(max.x, max.y, max.z)],
				];

			var outline = [];
			
			for(var i = 0; i < bboxOutline.length; ++i)
			{

				var lineDir = bboxOutline[i][1].subtract(bboxOutline[i][0]);
				lineDir = lineDir.normalize();
				var dotProd =lineDir.dot(normal); 
				if(Math.abs(dotProd) > 0.000001)
				{
					//dot product isn't zero -> has single point intersection
					var d = (planePnt.subtract(bboxOutline[i][0])).dot(normal) / dotProd;
					var intersectPnt = lineDir.multiply(d).add(bboxOutline[i][0]);
					
					//the intersection point must lie within the global bbox
					if(intersectPnt.x >= min.x && intersectPnt.x <= max.x 
							&& intersectPnt.y >= min.y && intersectPnt.y <= max.y 
							&& intersectPnt.z >= min.z && intersectPnt.z <= max.z)
					{
						outline.push(intersectPnt.toGL());	
					}	
			/*		console.log("["+i+"] has intersection point.");
					console.log("min:" +  min.toGL() + " max:  " + max.toGL());
					console.log("line vector: " + lineDir.toGL());
					console.log("normal: " + normal.toGL());
					console.log ("d - " + d);
					console.log("line points: " + bboxOutline[i][0].toGL() + " , " + bboxOutline[i][1].toGL());
					console.log("planePnt points: " + planePnt.toGL());
					console.log("plane: " + plane.toGL());
				    console.log("intersecting point" + intersectPnt.toGL());*/
				}
//				console.log("["+i+"] dot Product: " + dotProd);
			}

//			console.log("outline size: " + outline.length + " bbox length: " + bboxOutline.length);
//			console.log(outline);

			outlineCoords.setAttribute("point",
				outline.map(function(item) {
					return item.join(" ");
				}).join(","));
		}

		/**
		 * Destroy me and everything connected with me
		 */
		this.destroy = function() {
			if (clipPlaneElem && clipPlaneElem.parentNode) {
				clipPlaneElem.parentNode.removeChild(clipPlaneElem);
			}

			if (coordinateFrame && coordinateFrame.parentNode) {
				coordinateFrame.parentNode.removeChild(coordinateFrame);
			}
		};

		// Construct and connect everything together
		outlineMat.setAttribute("emissiveColor", colour.join(" "));
		outlineLines.setAttribute("vertexCount", 5);
		outlineLines.appendChild(outlineCoords);

		outlineApp.appendChild(outlineMat);
		outline.appendChild(outlineApp);
		outline.appendChild(outlineLines);

		coordinateFrame.appendChild(outline);

		// Attach to the root node of the viewer
		viewer.getScene().appendChild(coordinateFrame);
		if(parentNode)
		{
			volume = viewer.runtime.getBBox(parentNode);
		}
		else
		{
			volume = viewer.runtime.getBBox(viewer.getScene());
		}

		// Move the plane to finish construction
		this.changeAxis(axis);

		viewer.getScene().appendChild(clipPlaneElem);

		this.movePlane(percentage);

		console.log("here");
		console.log(parentNode);
		if(parentNode)
			this.transformClipPlane(parentNode._x3domNode.getCurrentTransform());


	};


}());
