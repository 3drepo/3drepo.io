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
var logIface = require('../logger.js');
var logger = logIface.logger;
var repoNodeMesh = require('../repoNodeMesh.js');
var responseCodes = require('../response_codes.js');


/*******************************************************************************
 * Render Binary format data of parts of a mesh
 *
 * @param {dbInterface} dbInterface - Database interface object
 * @param {string} dbName - Database containing the project to get object from
 * @param {string} project - The name of the project containing the mesh
 * @param {string} rid - Revision ID of the mesh to be rendered
 * @param {string} sid - Shared ID of the mesh to be rendered
 * @param {string} uuid - UUID of the mesh to be rendered
 * @param {string} type - Part of the mesh to be rendered (normals, texcoords, indices, coords)
 * @param {Object} res - The http response object
 * @param {function} callback - Callback function that takes an Error object
 *******************************************************************************/
function render(dbInterface, dbName, project, uuid, rid, sid, type, callback) {
	logger.log('debug', 'Requesting ' + type + ' for ' + uuid);

	dbInterface.getObject(dbName, project, uuid, rid, sid, true, {}, function(err, objType, uid, obj) {
		if (err.value)
			return callback(err);

		var mesh = obj.meshes[uuid];

		switch (type) {
			case "normals":
				return callback(responseCodes.OK, mesh['normals'].buffer);
			case "texcoords":
				return callback(responseCodes.OK, mesh['uv_channels'].buffer);
			case "indices":
				var buf = new Buffer(mesh.faces_count * 2 * 3);
				var copy_idx = 0;
				var orig_idx = mesh['faces'].buffer;

				for (var face_idx = 0; face_idx < mesh.faces_count; face_idx++) {
					for (var vert_comp = 0; vert_comp < 3; vert_comp++) {
						var byte_position = (16 * face_idx) + (vert_comp + 1) * 4;
						var idx_val = orig_idx.readUInt16LE(byte_position);

						buf.writeUInt16LE(idx_val, copy_idx);
						copy_idx += 2;
					}
				}

				return callback(responseCodes.OK, buf);
			case "coords":
				return callback(responseCodes.OK, mesh['vertices'].buffer);
		}
	});
};

// Set up REST routing calls
exports.route = function(router)
{
    router.get('bin', '/:account/:project/:uid', function(res, params, err_callback) {
		var type = params.query.mode;

        render(router.dbInterface, params.account, params.project, params.uid, null, null, type, err_callback);
    });

	router.get('bin', '/:account/:project/revision/:rid/:sid', function(res, params, err_callback) {
		var type = params.query.mode;

        render(router.dbInterface, params.account, params.project, null, params.rid, params.sid, type, err_callback);
	});

};


