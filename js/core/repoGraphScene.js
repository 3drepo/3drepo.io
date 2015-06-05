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

// Corresponds to repoGraphScene in C++ definition of 3D Repo

var mongodb = require('mongodb');
var assert = require('assert');
var UUID = require('node-uuid');
var C = require('./constants');
var repoNodeMesh = require('./repoNodeMesh');
var repoNodeTransformation = require('./repoNodeTransformation');
var repoNodeMaterial = require('./repoNodeMaterial');
var repoNodeCamera = require('./repoNodeCamera');
var repoNodeMeta   = require('./repoNodeMeta');
var log_iface = require('./logger.js');
var logger = log_iface.logger;

// Documentation
// http://mongodb.github.com/node-mongodb-native/contents.html

/**
 * Converts a given array of bson elements into a scene object.
 *
 * @param {Array} bsonArray
 */
exports.decode = function(bsonArray) {
	var rootNode;

	// return variable
	var scene = new Object();
	scene[C.REPO_SCENE_LABEL_MESHES_COUNT] = 0;
	scene[C.REPO_SCENE_LABEL_MATERIALS_COUNT] = 0;
	scene[C.REPO_SCENE_LABEL_TEXTURES_COUNT] = 0;
	scene[C.REPO_SCENE_LABEL_CAMERAS_COUNT] = 0;
	scene[C.REPO_SCENE_LABEL_REF_COUNT] = 0;
	scene[C.REPO_SCENE_LABEL_META_COUNT] = 0;
	scene[C.REPO_SCENE_LABEL_MAPS_COUNT] = 0;

	// Sort documents into categories (dictionaries of {id : bson} pairs)
	// UUID is a binary object of subtype 3 (old) or 4 (new)
	// see http://mongodb.github.com/node-mongodb-native/api-bson-generated/binary.html
	var transformations = new Object();
	var meshes = new Object();
	var materials = new Object();
	var textures = new Object();
	var cameras = new Object();
	var refs = new Object();
	var metas = new Object();
	var maps = new Object();

	// dictionary of {shared_id : bson}
	var all = new Object();

	if (bsonArray) {
		// Separate out all the nodes, meshes, materials and textures and
		// find the single root node
		for (var i = 0; i < bsonArray.length; ++i) {
			bson = bsonArray[i];
			if (!bson[C.REPO_NODE_LABEL_SHARED_ID]) {
				logger.log('error','Shared UUID not found!');
			} else {
				var idBytes = bson[C.REPO_NODE_LABEL_ID].buffer;
				bson.id = UUID.unparse(idBytes);

				switch(bson[C.REPO_NODE_LABEL_TYPE]) {
					case C.REPO_NODE_TYPE_TRANSFORMATION :
						transformations[bson.id] = bson;
						if (!bson[C.REPO_NODE_LABEL_PARENTS])
							rootNode = bson;
						break;
					case C.REPO_NODE_TYPE_MESH :
						meshes[bson.id] = bson;
						scene[C.REPO_SCENE_LABEL_MESHES_COUNT]++;
						break;
					case C.REPO_NODE_TYPE_MATERIAL :
						materials[bson.id] = bson;
						scene[C.REPO_SCENE_LABEL_MATERIALS_COUNT]++;
						break;
					case C.REPO_NODE_TYPE_TEXTURE :
						textures[bson.id] = bson;
						scene[C.REPO_SCENE_LABEL_TEXTURES_COUNT]++;
						break;
					case C.REPO_NODE_TYPE_CAMERA :
						cameras[bson.id] = bson;
						scene[C.REPO_SCENE_LABEL_CAMERAS_COUNT]++;
						break;
					case C.REPO_NODE_TYPE_REF:
						refs[bson.id] = bson;
						scene[C.REPO_SCENE_LABEL_REF_COUNT]++;
						break;
					case C.REPO_NODE_TYPE_META:
						metas[bson.id] = bson;
						scene[C.REPO_SCENE_LABEL_METAS_COUNT]++;
						break;
					case C.REPO_NODE_TYPE_MAP:
						maps[bson.id] = bson;
						scene[C.REPO_SCENE_LABEL_MAPS_COUNT]++;
						break;
					default :
						logger.log('error','Unsupported node type found: ' + bson[C.REPO_NODE_LABEL_TYPE]);
				}

				var sidBytes = bson[C.REPO_NODE_LABEL_SHARED_ID].buffer;
				var sid = UUID.unparse(sidBytes);
				all[sid] = bson;
			}
		}
	}

	//---------------------------------------------------------------------
	// Propagate information about children from parental links
	// CAREFUL: under normal circumstances JavaScript is pass-by-value
	// unless you update the fields in place (using dot notation) or pass objects.
	// Hence children will be propagated to bson entries in array 'all' as well as 'meshes' etc.
	for (var sid in all) {
		var parents = all[sid][C.REPO_NODE_LABEL_PARENTS];
		if (parents) {
			for ( i = 0; i < parents.length; ++i) {
				var parentSidBytes = parents[i].buffer;
				var parent = all[UUID.unparse(parentSidBytes)];

				if (parent) {
					if (!parent[C.REPO_NODE_LABEL_CHILDREN])
						parent[C.REPO_NODE_LABEL_CHILDREN] = new Array();
					parent[C.REPO_NODE_LABEL_CHILDREN].push(all[sid]);
				}
			}
		}
	}

	//---------------------------------------------------------------------
	// Textures
	scene.textures = textures;

	//---------------------------------------------------------------------
	// Materials
	for (var id in materials) {
		materials[id] = repoNodeMaterial.decode(materials[id], scene.textures);
	}
	scene.materials = materials;

	//---------------------------------------------------------------------
	// Meshes
	for (var id in meshes) {
		meshes[id] = repoNodeMesh.decode(meshes[id], scene.materials);
	}
	scene.meshes = meshes;

	//---------------------------------------------------------------------
	// Cameras
	for (var id in cameras) {
		cameras[id] = repoNodeCamera.decode(cameras[id]);
	}
	scene.cameras = cameras;

	//---------------------------------------------------------------------
	// Attach ID of meshes to transformation which points to them (ID, not SID!)
	//var mTransformations = new Object();
	for (var id in transformations) {
		transformations[id] = repoNodeTransformation.decode(transformations[id], meshes, cameras);
	}

	//---------------------------------------------------------------------
	// Federation references
	scene.refs = refs;

	//---------------------------------------------------------------------
	// Metadata
	for (var id in metas) {
		metas[id] = repoNodeMeta.decode(metas[id]);
	}

	scene.metas = metas;

	//---------------------------------------------------------------------
	// Register root node
	if (rootNode)
		scene.mRootNode = rootNode;

	return scene;
};
