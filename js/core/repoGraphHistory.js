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

// Corresponds to repoGraphHistory in C++ definition of 3D Repo

var mongodb = require('mongodb');
var assert = require('assert');
var UUID = require('node-uuid');
var C = require('./constants');
//var repoNodeRevision = require('./repoNodeRevision');

// Documentation
// http://mongodb.github.com/node-mongodb-native/contents.html

/**
 * Converts a given array of bson elements into a history graph object.
 *
 * @param {Array} bsonArray
 */
exports.decode = function(bsonArray) {
	var rootNode;

	// return variable
	var history = new Object();
	history[C.REPO_HISTORY_LABEL_REVISIONS_COUNT] = 0;

	// Sort documents into categories (dictionaries of {id : bson} pairs)
	// UUID is a binary object of subtype 3 (old) or 4 (new)
	// see http://mongodb.github.com/node-mongodb-native/api-bson-generated/binary.html
	var revisions = new Object();

	if (bsonArray) {
		// Separate out all the revisions and
		// find the single root node
		for (var i = 0; i < bsonArray.length; ++i) {
			bson = bsonArray[i];
			if (!bson[C.REPO_NODE_LABEL_SHARED_ID]) {
				logger.log('error', 'Shared UUID not found!');
			} else {

				// Unique ID (UID) of a revision
				var idBytes = bson[C.REPO_NODE_LABEL_ID].buffer;
				bson.id = UUID.unparse(idBytes);

				// Shared ID (SID) of a revision (its branch ID)
				idBytes = bson[C.REPO_NODE_LABEL_SHARED_ID].buffer;
				bson.branch = UUID.unparse(idBytes);

				switch(bson[C.REPO_NODE_LABEL_TYPE]) {
					case C.REPO_NODE_TYPE_REVISION :
						revisions[bson.id] = bson;
						history[C.REPO_HISTORY_LABEL_REVISIONS_COUNT]++;
						if (!bson[C.REPO_NODE_LABEL_PARENTS])
							rootNode = bson;
						break;
					default :
						logger.log('error','Unsupported node type found: ' + bson[C.REPO_NODE_LABEL_TYPE]);
				}
			}
		}
	}

	/*
	 * TODO: change all to revisions and SID to UID
	 *
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
	*/

	//---------------------------------------------------------------------
	// Revisions
	history.revisions = revisions;


	//---------------------------------------------------------------------
	// Register root node
	if (rootNode)
		history.root = rootNode;

	return history;
};
