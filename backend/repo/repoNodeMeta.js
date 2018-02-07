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

// Corresponds to repoNodeMesh in C++ definition of 3D Repo
// var mongodb = require('mongodb');
// var assert = require('assert');
// var UUID = require('node-uuid');
// var C = require('./constants');

exports.decode = function(bson /*, meta*/) {
	if (bson.mime)
	{
		bson.data = {};
		bson.data.buffer = new Buffer.alloc(bson.metadata.data.buffer.length);
		bson.metadata.data.buffer.copy(bson.data.buffer);

		delete bson.metadata;
	}

	return bson;
};

