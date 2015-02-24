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

/*******************************************************************************
 * Render Binary format data of parts of a mesh
 *
 * @param {dbInterface} dbInterface - Database interface object
 * @param {string} dbName - Database containing the project to get object from
 * @param {string} project - The name of the project containing the mesh
 * @param {string} uuid - UUID of the mesh to be rendered
 * @param {string} type - Part of the mesh to be rendered (normals, texcoords, indices, coords)
 * @param {Object} res - The http response object
 * @param {function} callback - Callback function that takes an Error object
 *******************************************************************************/
function render(dbInterface, dbName, project, uuid, type, res, callback) {
	logger.log('debug', 'Requesting b ' + type + ' for ' + uuid);

	dbInterface.getObject(dbName, project, uuid, function(err, doc) {
		if (err) return callback(err);

		var mesh = doc.meshes[uuid];

		switch (type) {
			case "normals":
				res.write(mesh.normals.buffer, 'binary');
				res.end();
				break;
			case "texcoords":
				res.write(mesh.uv_channels.buffer, 'binary');
				res.end();
				break;
			case "indices":
				var buf = new Buffer(mesh.faces_count * 2 * 3);
				var copy_idx = 0;
				var orig_idx = mesh.faces.buffer;

				for (var face_idx = 0; face_idx < mesh.faces_count; face_idx++) {
					for (var vert_comp = 0; vert_comp < 3; vert_comp++) {
						var byte_position = (16 * face_idx) + (vert_comp + 1) * 4;
						var idx_val = orig_idx.readUInt16LE(byte_position);

						buf.writeUInt16LE(idx_val, copy_idx);
						copy_idx += 2;
					}
				}

				res.write(buf, 'binary');
				res.end();
				break;
			case "coords":
				res.write(mesh.vertices.buffer, 'binary');
				res.end();
				break;
		}
	});
};

// Set up REST routing calls
exports.route = function(router)
{
    router.get('bin', '/:account/:project/:uid', function(res, params, err_callback) {
	var type = params.query.type;

        render(router.dbInterface, params.account, params.project, params.uid, type, res, function(res)
        {
		if(err.value)
			err_callback(err);
		else
			res.json(res);
        });
    });
};


