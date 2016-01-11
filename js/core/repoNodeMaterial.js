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

// Corresponds to repoNodeMaterial in C++ definition of 3D Repo

// var mongodb = require('mongodb');
var assert = require('assert');
var UUID = require('node-uuid');
var C = require('./constants');

exports.decode = function(bson, textures) {
	assert.equal(bson[C.REPO_NODE_LABEL_TYPE], C.REPO_NODE_TYPE_MATERIAL, "Trying to convert " + bson[C.REPO_NODE_LABEL_TYPE] + " to material");

	// Supported only a single diffuse texture per material at the moment.
	if (bson[C.REPO_NODE_LABEL_CHILDREN]) {
		for (var i = 0; i < bson[C.REPO_NODE_LABEL_CHILDREN].length; ++i) {
			var childIDbytes = bson[C.REPO_NODE_LABEL_CHILDREN][i][C.REPO_NODE_LABEL_ID].buffer;
			var childID = UUID.unparse(childIDbytes);
			var texture = textures[childID];
			if (texture) {
				bson.diffuseTexture = childID;
				break;
			}
		}
	}
	return bson;
}; 
