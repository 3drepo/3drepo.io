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

// Corresponds to repoNodeTransformation in C++ definition of 3D Repo

var mongodb = require('mongodb');
var assert = require('assert');
var UUID = require('node-uuid');
var C = require('./constants');

exports.decode = function(bson, meshes, cameras) {
	assert.equal(bson[C.REPO_NODE_LABEL_TYPE], C.REPO_NODE_TYPE_TRANSFORMATION, "Trying to convert " + bson[C.REPO_NODE_LABEL_TYPE] + " to " + C.REPO_NODE_TYPE_TRANSFORMATION);

	//---------------------------------------------------------------------	
	// Meshes & Cameras extraction	
	var mMeshes = new Array();
	var mCameras = new Array();
	if (bson[C.REPO_NODE_LABEL_CHILDREN])
	{
		for (var i = 0; i < bson[C.REPO_NODE_LABEL_CHILDREN].length; ++i) {			
			var childIDbytes = bson[C.REPO_NODE_LABEL_CHILDREN][i][C.REPO_NODE_LABEL_ID].buffer;
			var childID = UUID.unparse(childIDbytes);

			// If child is a mesh
			var mesh = meshes[childID];
			if (mesh) {
				mMeshes.push(childID);
			}
			
			// If child is a camera
			var camera = cameras[childID];
			if (camera) {
				mCameras.push(childID);
			}
		}
	}	

	//---------------------------------------------------------------------
	// Meshes
	// TODO: rename to meshes
	if (mMeshes.length > 0) 
		bson[C.M_MESHES] = mMeshes;

	//---------------------------------------------------------------------
	// Cameras
	if (mCameras.length > 0)
		bson[C.REPO_NODE_LABEL_CAMERAS] = mCameras;
	
	return bson;
};
