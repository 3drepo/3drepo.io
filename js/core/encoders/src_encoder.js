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
var log_iface = require('../logger.js');
var logger = log_iface.logger;
var repoNodeMesh = require('../repoNodeMesh.js');

function render(project, mesh, tex_uuid, res)
{
    logger.log('debug', 'Mesh #Verts: ' + mesh.vertices_count);
    logger.log('debug', 'Mesh #Faces: ' + mesh.faces_count);

    //mesh.faces_count /= 4;
    var src_json = {};
    src_json.accessors = {};

    src_json.accessors.indexViews = {};
    src_json.accessors.attributeViews = {};

    // Vertex Attribute
    src_json.accessors.attributeViews.attributeView0 = {};
    src_json.accessors.attributeViews.attributeView0.bufferView = 'bufferView0';
    src_json.accessors.attributeViews.attributeView0.byteOffset = 0;
    src_json.accessors.attributeViews.attributeView0.byteStride = 12;
    src_json.accessors.attributeViews.attributeView0.componentType = 5126;
    src_json.accessors.attributeViews.attributeView0.type = 'VEC3';
    src_json.accessors.attributeViews.attributeView0.count = mesh.vertices_count;
    src_json.accessors.attributeViews.attributeView0.decodeOffset = [0, 0, 0];
    src_json.accessors.attributeViews.attributeView0.decodeScale = [1, 1, 1];

    // Index Attribute
    src_json.accessors.indexViews.indexView0 = {};
    src_json.accessors.indexViews.indexView0.bufferView = 'bufferView1';
    src_json.accessors.indexViews.indexView0.byteOffset = 0;
    src_json.accessors.indexViews.indexView0.componentType = 5123;

	// Normal Attribute
    src_json.accessors.attributeViews.attributeView1 = {};
    src_json.accessors.attributeViews.attributeView1.bufferView = 'bufferView2';
    src_json.accessors.attributeViews.attributeView1.byteOffset = 0;
    src_json.accessors.attributeViews.attributeView1.byteStride = 12;
    src_json.accessors.attributeViews.attributeView1.componentType = 5126;
    src_json.accessors.attributeViews.attributeView1.type = 'VEC3';
    src_json.accessors.attributeViews.attributeView1.count = mesh.vertices_count;
    src_json.accessors.attributeViews.attributeView1.decodeOffset = [0, 0, 0];
    src_json.accessors.attributeViews.attributeView1.decodeScale = [1, 1, 1];

    // Buffer Chunking

    // Vertex Chunk
    src_json.bufferChunks = {};
    src_json.bufferChunks.chunk0 = {};
    src_json.bufferChunks.chunk0.byteOffset = 0;
    src_json.bufferChunks.chunk0.byteLength = mesh.vertices_count * 3 * 4;

    // Faces Indices
    src_json.bufferChunks.chunk1 = {};
    src_json.bufferChunks.chunk1.byteOffset = mesh.vertices_count * 3 * 4;
    src_json.bufferChunks.chunk1.byteLength = mesh.faces_count * 3 * 2;

    // Normals
    src_json.bufferChunks.chunk2 = {};
    src_json.bufferChunks.chunk2.byteOffset = src_json.bufferChunks.chunk1.byteOffset + mesh.faces_count * 2 * 3;
    src_json.bufferChunks.chunk2.byteLength = mesh.vertices_count * 3 * 4;

    // Buffer Views
    src_json.bufferViews = {};
    src_json.bufferViews.bufferView0 = {};
    src_json.bufferViews.bufferView0.chunks = ['chunk0'];

    src_json.bufferViews.bufferView1 = {};
    src_json.bufferViews.bufferView1.chunks = ['chunk1'];

    src_json.bufferViews.bufferView2 = {};
    src_json.bufferViews.bufferView2.chunks = ['chunk2'];

    // Mesh Header
    src_json.meshes = {};
    src_json.meshes[project] = {};
    src_json.meshes[project].attributes = {};
    src_json.meshes[project].indices = "indexView0";
    src_json.meshes[project].primitive = 4;
    src_json.meshes[project].attributes.position = 'attributeView0';
    src_json.meshes[project].attributes.normal = 'attributeView1';

    var bbox = repoNodeMesh.extractBoundingBox(mesh);

    src_json.meshes[project].bboxCenter = bbox.center;
    src_json.meshes[project].bboxSize = bbox.size;

    var orig_idx = mesh['faces'].buffer;

    // Turn api 2 indices into a new buffer
    var buf = new Buffer(mesh.faces_count * 2 * 3);
    var copy_idx = 0;

    var orig_idx_ptr = 0;

	var num_faces = 0;

    for (var face_idx = 0; face_idx < mesh.faces_count; face_idx++) {
        var num_comp = orig_idx.readUInt16LE(orig_idx_ptr);

        if (num_comp != 3) {
            logger.log('error', 'Non triangulated face with ' + num_comp + ' vertices.');
        } else {
			num_faces += 1;
            for (var vert_comp = 0; vert_comp < num_comp; vert_comp++) {
                var byte_position = orig_idx_ptr + (vert_comp + 1) * 4;
                var idx_val = orig_idx.readUInt16LE(byte_position);

                buf.writeUInt16LE(idx_val, copy_idx);
                copy_idx += 2;
            }
        }
        orig_idx_ptr += (num_comp + 1) * 4;
    }

	src_json.accessors.indexViews.indexView0.count = num_faces * 3;

    src_json.meta = {};
    src_json.meta.generator = "Generated by 3DRepo";
    src_json.textureViews = {};
    src_json.textures = {};

    if (tex_uuid != null) {
        src_json.bufferChunks.chunk3 = {};
        src_json.bufferChunks.chunk3.byteOffset = src_json.bufferChunks.chunk2.byteOffset + mesh.vertices_count * 3 * 4;
        src_json.bufferChunks.chunk3.byteLength = mesh.uv_channels_byte_count;

        src_json.bufferViews.bufferView3 = {};
        src_json.bufferViews.bufferView3.chunks = ['chunk3'];

        src_json.accessors.attributeViews.attributeView2 = {};
        src_json.accessors.attributeViews.attributeView2.bufferView = 'bufferView3';
        src_json.accessors.attributeViews.attributeView2.byteOffset = 0;
        src_json.accessors.attributeViews.attributeView2.byteStride = 8;
        src_json.accessors.attributeViews.attributeView2.componentType = 5126;
        src_json.accessors.attributeViews.attributeView2.type = 'VEC2';
        src_json.accessors.attributeViews.attributeView2.count = mesh.vertices_count;
        src_json.accessors.attributeViews.attributeView2.decodeOffset = [0, 0];
        src_json.accessors.attributeViews.attributeView2.decodeScale = [1, 1];

        src_json.meshes[project].attributes.texcoord = 'attributeView2';

        /*
        src_json.bufferChunks.chunk3 = {};
        src_json.bufferChunks.chunk3.byteOffset = src_json.bufferChunks.chunk2.byteOffset + mesh.vertices_count * 3 * 4;
        src_json.bufferChunks.chunk3.byteLength = texture.data_byte_count;

        src_json.textureViews.tex0 = {};
        src_json.textureViews.tex0.byteLength = texture.data_byte_count;
        src_json.textureViews.tex0.chunks = ['chunk3'];
        src_json.textureViews.tex0.format = texture.extension;

        src_json.textures.meshtex = {};
        src_json.textures.meshtex.textureView = 'tex0';
        src_json.textures.meshtex.imageByteLengths = [texture.data_byte_count];
        src_json.textures.meshtex.width = texture.width;
        src_json.textures.meshtex.height = texture.height;
        src_json.textures.meshtex.type = 5121;
        src_json.textures.meshtex.format = 6407;
        src_json.textures.meshtex.internalFormat = 6407;

        src_json.bufferChunks.chunk4 = {};
        src_json.bufferChunks.chunk4.byteOffset = src_json.bufferChunks.chunk3.byteOffset + texture.data_byte_count;
        src_json.bufferChunks.chunk4.byteLength = mesh.uv_channels_byte_count;

        */
    }

    var json_str = JSON.stringify(src_json);

    var magic_bit = new Buffer(4);
    magic_bit.writeUInt32LE(23, 0);

    var version = new Buffer(4);
    version.writeUInt32LE(42, 0);

    var head_string = new Buffer(4);
    head_string.writeUInt32LE(json_str.length, 0);

	res.write(magic_bit, 'binary');
	res.write(version, 'binary');
	res.write(head_string, 'binary');
	res.write(json_str);
	res.write(mesh['vertices'].buffer, 'binary');
	res.write(buf, 'binary');
	res.write(mesh['normals'].buffer, 'binary');

	if (tex_uuid != null) {
		//res.write(texture.data.buffer, 'binary');
		res.write(mesh['uv_channels'].buffer, 'binary');
	}

	res.end();
}

exports.route = function(router)
{
    router.get('src', '/:account/:project/:uid', function(res, params) {
        router.db_interface.getObject(null, params.project, params.uid, null, null, function(err, type, uid, obj)
        {
            if(err) throw err;

            if (type == "mesh")
            {
                var tex_uuid = null;

                if ("tex_uuid" in params.query)
                {
                    tex_uuid = params.query.tex_uuid;
                }

                render(params.project, obj.meshes[uid], tex_uuid, res);
            } else {
                throw new Error("Type of object not supported");
            }
        });
    });

    router.get('src', '/:account/:project/revision/:rid/:sid', function(res, params) {
        router.db_interface.getObject(null, params.project, null, params.rid, params.sid, function(err, type, uid, obj)
        {
            if(err) throw err;

            if (type == "mesh")
            {
                var tex_uuid = null;

                if ("tex_uuid" in params.query)
                {
                    tex_uuid = params.query.tex_uuid;
                }

                render(params.project, obj.meshes[uid], tex_uuid, res);
            } else {
                throw new Error("Type of object not supported");
            }
        });
    });
};


