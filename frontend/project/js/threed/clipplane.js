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
	ClipPlane = function(id, viewer, axis, normal, colour, distance, percentage, clipDirection, parentNode) {
		var self = this;

		// Public properties

		/**
		 * Value representing the direction of clipping
		 * @type {number}
		 */
		this.clipDirection = (clipDirection === undefined) ? -1 : clipDirection;

		/**
		 * Value representing the distance from the origin of
		 * the clip plane
		 * @type {number}
		 */
		this.distance = distance;
		
		/**
		 * Normal vector to the clipping plane
		 * @private
		 * @type {SFVec3f}
		 */
		this.normal = (normal == undefined)? [0,0,0] : normal ;

		/**
		 * Volume containing the clipping plane
		 * @type {BoxVolume}
		 */
		var volume = null;


		/**
		 * Bounding box of the scene
		 * * @type {BoxVolume}
		 */
		var sceneBbox = null;

		/**
		 * DOM Element representing the clipping plane
		 * @private
		 * @type {HTMLElement}
		 */
		var clipPlaneElem = document.createElement("ClipPlane");


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
		var setOutlineCoordinates = function(axis) {
			var min = volume.min.multiply(BBOX_SCALE).toGL();
			var max = volume.max.multiply(BBOX_SCALE).toGL();

			var axisIDX = "XYZ".indexOf(axis);
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
		 * Given a list of vertices, return its outline
		 */
		this.determineOutline = function(vertices)
		{
			var min = vertices[0].slice();
			var max = vertices[0].slice();

			for(var i = 1; i < vertices.length; ++i)
			{
				for(var j = 0; j < 3; ++j)
				{
					if(min[j] > vertices[i][j])
					{
						min[j] = vertices[i][j]
					}


					if(max[j] < vertices[i][j])
					{
						max[j] = vertices[i][j]
					}
				}
			}

			var centrePnt = new x3dom.fields.SFVec3f((max[0]+min[0])/2.0, (max[1]+min[1])/2.0,(max[2]+min[2])/2.0);

			var outline = [vertices[0], null, null, null];

			var basePnt = new x3dom.fields.SFVec3f(vertices[0][0], vertices[0][1], vertices[0][2]);
			var baseToCen = basePnt.subtract(centrePnt);



			//There are only 4 vertices, taking first as base point, 2 would be perpendicular and 1 would not.
			for(var i = 1; i < vertices.length; ++i)
			{	
				var currentPnt = new x3dom.fields.SFVec3f(vertices[i][0], vertices[i][1], vertices[i][2]);
				var curToCen = currentPnt.subtract(centrePnt);
				var dotProd = Math.abs(baseToCen.normalize().dot(curToCen.normalize()));
				if(Math.abs(dotProd - 1.0) < 0.01)
				{

					//not perpendicular, must be the opposite point
					outline[2] = vertices[i];

				}
				else
				{
					//the vectors are perpendicular
					//this must be 2 or 4
					if(outline[1])
					{
						outline[3] = vertices[i];
					}
					else
					{
						outline[1] = vertices[i];
					}
				}
			}

			outline.push(vertices[0]);

			return outline;
		}


		/**
		 * Move the clipping plane
		 * @param {number} percentage - Percentage of entire clip volume to move across
		 */
		this.movePlane = function(axis, percentage) {
			axis = axis.toUpperCase();
			// When the axis is change the normal to the plane is changed
			this.normal = [ (axis === "X") ? this.clipDirection : 0,
					(axis === "Y") ? this.clipDirection : 0,
					(axis === "Z") ? this.clipDirection : 0];

			// Update the transform containing the clipping plane
			var axisIDX = "XYZ".indexOf(axis);
			var min = volume.min.multiply(BBOX_SCALE).toGL();
			var max = volume.max.multiply(BBOX_SCALE).toGL();


			self.distance = ((max[axisIDX] - min[axisIDX]) * percentage) + min[axisIDX];

			// Update the clipping element plane equation
			clipPlaneElem.setAttribute("plane", this.normal.join(" ") + " " + self.distance);

			var translation = [0, 0, 0];
			translation[axisIDX] = -self.distance * this.clipDirection;
			coordinateFrame.setAttribute("translation", translation.join(","));

			setOutlineCoordinates(axis);
		};

		/**
		 * Transform the clipping plane by the given matrix
		 * @param {sfmatrix4f} matrix - transformation matrix to apply to clipping plane
		 */
		this.transformClipPlane = function(matrix, writeProperties)
		{

			var min = volume.min.toGL();
			var max = volume.max.toGL();
			var point = min;

			var normal_x3d = new x3dom.fields.SFVec3f(this.normal[0], this.normal[1], this.normal[2]);
			point = normal_x3d.multiply(-this.distance).toGL();

			normal_x3d = matrix.multMatrixVec(normal_x3d);
			normal_x3d.normalize();

			var planePnt = new x3dom.fields.SFVec3f(point[0], point[1], point[2]);
			planePnt = matrix.multMatrixPnt(planePnt);
			var distance = -normal_x3d.dot(planePnt) * BBOX_SCALE;
			

			var plane = new x3dom.fields.SFVec4f(normal_x3d.x, normal_x3d.y, normal_x3d.z, distance);


			if(writeProperties)
			{				

				// Update the clipping element plane equation
				clipPlaneElem.setAttribute("plane", plane.toGL().join(" "));
				//The clip outline doesn't need translation, it should be in the right place
				//set it to move by a bit so it's not cut off by the clipping plane.
			

				var translation = [-(max[0]-min[0])*0.001, -(max[1]-min[1])*0.001, -(max[2]-min[0])*0.001];
				coordinateFrame.setAttribute("translation", translation.join(" "));
	
				this.normal = normal_x3d.toGL();
				this.distance = distance;

			

				//determine the outline of the clipping plane by intersection with the global bounding box	

				var min = sceneBbox.min.multiply(BBOX_SCALE);
				var max = sceneBbox.max.multiply(BBOX_SCALE);
	
				//[pointA, pointB]
				var bboxOutline = [
					[new x3dom.fields.SFVec3f(min.x, min.y, min.z), new x3dom.fields.SFVec3f(max.x, min.y, min.z)],
					[new x3dom.fields.SFVec3f(min.x, min.y, min.z), new x3dom.fields.SFVec3f(min.x, max.y, min.z)],
					[new x3dom.fields.SFVec3f(min.x, min.y, min.z), new x3dom.fields.SFVec3f(min.x, min.y, max.z)],
					[new x3dom.fields.SFVec3f(min.x, max.y, min.z), new x3dom.fields.SFVec3f(min.x, max.y, max.z)],
					[new x3dom.fields.SFVec3f(max.x, max.y, min.z), new x3dom.fields.SFVec3f(max.x, max.y, max.z)],
					[new x3dom.fields.SFVec3f(max.x, min.y, min.z), new x3dom.fields.SFVec3f(max.x, max.y, min.z)],
					[new x3dom.fields.SFVec3f(max.x, min.y, min.z), new x3dom.fields.SFVec3f(max.x, min.y, max.z)],
					[new x3dom.fields.SFVec3f(max.x, min.y, max.z), new x3dom.fields.SFVec3f(max.x, max.y, max.z)],
					[new x3dom.fields.SFVec3f(min.x, min.y, max.z), new x3dom.fields.SFVec3f(max.x, min.y, max.z)],
					[new x3dom.fields.SFVec3f(min.x, max.y, max.z), new x3dom.fields.SFVec3f(max.x, max.y, max.z)],
					[new x3dom.fields.SFVec3f(min.x, max.y, max.z), new x3dom.fields.SFVec3f(min.x, min.y, max.z)],
					[new x3dom.fields.SFVec3f(min.x, max.y, min.z), new x3dom.fields.SFVec3f(max.x, max.y, min.z)],
					];

				var outline = [];
			
				for(var i = 0; i < bboxOutline.length; ++i)
				{

					var lineDir = bboxOutline[i][1].subtract(bboxOutline[i][0]);
					lineDir = lineDir.normalize();
					var dotProd =lineDir.dot(normal_x3d); 
					if(Math.abs(dotProd) > 0.000001)
					{
						//dot product isn't zero -> has single point intersection
						var d = (planePnt.subtract(bboxOutline[i][0])).dot(normal_x3d) / dotProd;
						var intersectPnt = lineDir.multiply(d).add(bboxOutline[i][0]);
						
						//the intersection point must lie within the global bbox
						if(intersectPnt.x >= min.x && intersectPnt.x <= max.x 
								&& intersectPnt.y >= min.y && intersectPnt.y <= max.y 
								&& intersectPnt.z >= min.z && intersectPnt.z <= max.z)
						{
							outline.push(intersectPnt.toGL());	
						}	

					}
	
				}

				outline = this.determineOutline(outline);

				outlineCoords.setAttribute("point",
				outline.map(function(item) {
					return item.join(" ");
				}).join(","));
			}


			return {normal: normal_x3d.toGL(), distance: distance};
		}

		this.getProperties = function(matrix)
		{

			var res = JSON.parse(JSON.stringify(this));
			if(matrix)
			{
				var newValues = this.transformClipPlane(matrix, false);	
				res.normal  = newValues.normal;
				res.distance = newValues.distance;
			}


			return res;
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

		sceneBbox = viewer.runtime.getBBox(viewer.getScene());

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
			volume = sceneBbox;
			
		}

		// Move the plane to finish construction
		if(axis != "")
		{		
			this.movePlane(axis, percentage);
		}

		viewer.getScene().appendChild(clipPlaneElem);


		if(parentNode)
			this.transformClipPlane(parentNode._x3domNode.getCurrentTransform(), true);


	};


}());
