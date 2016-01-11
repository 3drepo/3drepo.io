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

// Corresponds to RepoNodeCamera in C++ definition of 3D Repo

// var mongodb = require('mongodb');
var assert = require('assert');
// var UUID = require('node-uuid');
var C = require('./constants');
var Utils = require('./utils.js');

//-----------------------------------------------------------------------------
exports.decode = function(bson) {
	assert.equal(bson[C.REPO_NODE_LABEL_TYPE], C.REPO_NODE_TYPE_CAMERA, "Trying to convert " + bson[C.REPO_NODE_LABEL_TYPE] + " to " + C.REPO_NODE_TYPE_CAMERA);
		
	// Nothing to process at the moment, so return unmodified
	return bson;
};

//-----------------------------------------------------------------------------
/**
 * Returns a camera object ready for DB insertion. Appends the necessary fields
 * and performs checks to fill in any missing information such as empty name,
 * _id and shared_id fields.
 *
 * WARNING: input variables are pass by reference, any changes to them are 
 * carried over!
 */
exports.encode = function(camera, root_shared_id) {

    assert(camera, "repoNodeCamera: Camera object is empty");
    assert(root_shared_id, "repoNodeCamera: Root node is empty");

    var repo_camera = [];

    //-------------------------------------------------------------------------
    // ID field has to come first
    repo_camera[C.REPO_NODE_LABEL_ID] = Utils.generateUUID();

    //-------------------------------------------------------------------------
    // Name is required for shared_id hashing and has to be unique!
    // TODO: check number of cameras in the current revision and append count+1 to the name.
    repo_camera[C.REPO_NODE_LABEL_NAME] = camera.name ? camera.name : "camera";

    // TODO: add camera hash appendix
    repo_camera[C.REPO_NODE_LABEL_SHARED_ID] = Utils.generateUUID();
    repo_camera[C.REPO_NODE_LABEL_API] = 1;	
    repo_camera[C.REPO_NODE_LABEL_TYPE] = C.REPO_NODE_TYPE_CAMERA;

    repo_camera[C.REPO_NODE_LABEL_PARENTS] = [root_shared_id];
    repo_camera[C.REPO_NODE_LABEL_PATHS] = [[root_shared_id]];

    if (camera.look_at){
        repo_camera[C.REPO_NODE_LABEL_LOOK_AT] = camera.look_at;
    }

    if (camera.position){
        repo_camera[C.REPO_NODE_LABEL_POSITION] = camera.position;
    }

    if (camera.up){
        repo_camera[C.REPO_NODE_LABEL_UP] = camera.up;
    }

    if (camera.fov){
        repo_camera[C.REPO_NODE_LABEL_FOV] = camera.fov;
    }

    if (camera.near){
        repo_camera[C.REPO_NODE_LABEL_NEAR] = camera.near;
    }

    if (camera.far){
        repo_camera[C.REPO_NODE_LABEL_FAR] = camera.far;
    }

    if (camera.aspect_ratio){
        repo_camera[C.REPO_NODE_LABEL_ASPECT_RATIO] = camera.aspect_ratio;
    }
   
    return repo_camera;
};
