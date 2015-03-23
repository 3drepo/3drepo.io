/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var logIface = require('../logger.js');
var logger = logIface.logger;
var repoNodeMesh = require('../repoNodeMesh.js');
var responseCodes = require('../response_codes.js');

/*******************************************************************************
 * Render SRC format of a mesh
 *
 * @param {string} project - The name of the project containing the mesh
 * @param {RepoNodeMesh} mesh - The RepoNodeMesh object containing the mesh
 * @param {string} tex_uuid - A string representing the tex_uuid attached to the mesh
 * @param {boolean} embedded_texture - Determines whether or not the texture data is embedded in the SRC.
 * @param {Object} res - The http response object
 *******************************************************************************/
function render(project, mesh, tex_uuid, embedded_texture)
{
	logger.log('debug', 'Mesh #Verts: ' + mesh.vertices_count);
	logger.log('debug', 'Mesh #Faces: ' + mesh.faces_count);

	var src_json = {};

	// Initialize the JSON output
	src_json.accessors				  = {};
	src_json.accessors.indexViews	  = {};
	src_json.accessors.attributeViews = {};
	src_json.meta					  = {};
	src_json.meta.generator			  = "3DRepo";
	src_json.textureViews			  = {};
	src_json.textures				  = {};

	// Vertex Attribute
	src_json.accessors.attributeViews.a0			   = {};
	src_json.accessors.attributeViews.a0.bufferView    = 'b0';
	src_json.accessors.attributeViews.a0.byteOffset    = 0;
	src_json.accessors.attributeViews.a0.byteStride    = 12;
	src_json.accessors.attributeViews.a0.componentType = 5126;
	src_json.accessors.attributeViews.a0.type		   = 'VEC3';
	src_json.accessors.attributeViews.a0.count		   = mesh.vertices_count;
	src_json.accessors.attributeViews.a0.decodeOffset  = [0, 0, 0];
	src_json.accessors.attributeViews.a0.decodeScale   = [1, 1, 1];

	// Index Attribute
	src_json.accessors.indexViews.i0					   = {};
	src_json.accessors.indexViews.i0.bufferView			   = 'b1';
	src_json.accessors.indexViews.i0.byteOffset			   = 0;
	src_json.accessors.indexViews.i0.componentType		   = 5123;

	// Normal Attribute
	src_json.accessors.attributeViews.a1			   = {};
	src_json.accessors.attributeViews.a1.bufferView    = 'b2';
	src_json.accessors.attributeViews.a1.byteOffset    = 0;
	src_json.accessors.attributeViews.a1.byteStride    = 12;
	src_json.accessors.attributeViews.a1.componentType = 5126;
	src_json.accessors.attributeViews.a1.type		   = 'VEC3';
	src_json.accessors.attributeViews.a1.count		   = mesh.vertices_count;
	src_json.accessors.attributeViews.a1.decodeOffset  = [0, 0, 0];
	src_json.accessors.attributeViews.a1.decodeScale   = [1, 1, 1];

	//
	// Buffer Chunking
	//
	// For all buffer must initialize chunking
	// Byte Offset = Offset of previous chunk + Length of previous chunk
	//

	// Vertex Chunk
	src_json.bufferChunks					= {};
	src_json.bufferChunks.c0			= {};
	src_json.bufferChunks.c0.byteOffset = 0;
	src_json.bufferChunks.c0.byteLength = mesh.vertices_count * 3 * 4;

	// Faces Indices
	src_json.bufferChunks.c1			= {};
	src_json.bufferChunks.c1.byteOffset = src_json.bufferChunks.c0.byteLength;
	src_json.bufferChunks.c1.byteLength = mesh.faces_count * 3 * 2;

	// Normals
	src_json.bufferChunks.c2			= {};
	src_json.bufferChunks.c2.byteOffset = src_json.bufferChunks.c1.byteOffset + src_json.bufferChunks.c1.byteLength;
	src_json.bufferChunks.c2.byteLength = mesh.vertices_count * 3 * 4;

	// Texture
	if (tex_uuid != null) {
		src_json.bufferChunks.c3 = {};
		src_json.bufferChunks.c3.byteOffset = src_json.bufferChunks.c2.byteOffset + src_json.bufferChunks.c2.byteLength;
		src_json.bufferChunks.c3.byteLength = mesh.uv_channels_byte_count;
	}

	// Buffer Views
	//
	// Connects the chunk information with the bufferViews
	src_json.bufferViews					= {};
	src_json.bufferViews.b0		= {};
	src_json.bufferViews.b0.chunks = ['c0'];

	src_json.bufferViews.b1		= {};
	src_json.bufferViews.b1.chunks = ['c1'];

	src_json.bufferViews.b2		= {};
	src_json.bufferViews.b2.chunks = ['c2'];

	if (tex_uuid != null) {
		src_json.bufferViews.b3 = {};
		src_json.bufferViews.b3.chunks = ['c3'];
	}

	// Mesh Header
	src_json.meshes								 = {};
	src_json.meshes[project]					 = {};
	src_json.meshes[project].attributes			 = {};
	src_json.meshes[project].indices			 = "i0";
	src_json.meshes[project].primitive			 = 4;
	src_json.meshes[project].attributes.position = 'a0';
	src_json.meshes[project].attributes.normal	 = 'a1';

	var bbox = repoNodeMesh.extractBoundingBox(mesh);

	src_json.meshes[project].bboxCenter = bbox.center;
	src_json.meshes[project].bboxSize = bbox.size;

	var orig_idx = mesh['faces'].buffer;

	// Loop through the faces copying the byte information
	// to a buffer in the src.
	var buf = new Buffer(mesh.faces_count * 2 * 3);
	var faces_byte_count = mesh.faces_count * 2 * 3;
	var copy_ptr = 0;	  // Pointer to the place in SRC buffer to copy to
	var orig_idx_ptr = 0; // Pointer in the RepoGraphScene buffer to copy from
	var num_faces = 0;	  // Number of faces without non-triangle faces.

	// TODO: Currently just ignores non triangulated faces.
	for (var face_idx = 0; face_idx < mesh.faces_count; face_idx++) {
		var num_comp = orig_idx.readUInt16LE(orig_idx_ptr);

		if (num_comp != 3) {
			logger.log('error', 'Non triangulated face with ' + num_comp + ' vertices.');
		} else {

			num_faces += 1; // This is a triangulated face

			// Copy vertices across one by one, num_comp should be 3 :)
			for (var vert_comp = 0; vert_comp < num_comp; vert_comp++) {
				// First int32 is number of sides (i.e. 3 = Triangle)]
				// After that there Int32 for each index (0..2)
				var byte_position = orig_idx_ptr + (vert_comp + 1) * 4;
				var idx_val = orig_idx.readUInt16LE(byte_position);

				buf.writeUInt16LE(idx_val, copy_ptr);
				copy_ptr += 2;
			}
		}
		orig_idx_ptr += (num_comp + 1) * 4;
	}

	src_json.accessors.indexViews.i0.count = num_faces * 3; // Face Indices

	// If there is a texture attached then place it in the SRC JSON
	// Here we define the binary data for the UV coordinates
	if (tex_uuid != null) {

		src_json.accessors.attributeViews.a2			   = {};
		src_json.accessors.attributeViews.a2.bufferView    = 'b3';
		src_json.accessors.attributeViews.a2.byteOffset    = 0;
		src_json.accessors.attributeViews.a2.byteStride    = 8;
		src_json.accessors.attributeViews.a2.componentType = 5126;
		src_json.accessors.attributeViews.a2.type		   = 'VEC2';
		src_json.accessors.attributeViews.a2.count		   = mesh.vertices_count;
		src_json.accessors.attributeViews.a2.decodeOffset  = [0, 0];
		src_json.accessors.attributeViews.a2.decodeScale   = [1, 1];

		src_json.meshes[project].attributes.texcoord				   = 'a2';
	}

	// Directly embed the texture data in the SRC file ?
	// TODO: Fix this, may not work
	if (embedded_texture && (tex_uuid != null))
	{
		src_json.bufferChunks.c3			   = {};
		src_json.bufferChunks.c3.byteOffset    = src_json.bufferChunks.c2.byteOffset + mesh.vertices_count * 3 * 4;
		src_json.bufferChunks.c3.byteLength    = texture.data_byte_count;

		src_json.textureViews.t0				   = {};
		src_json.textureViews.t0.byteLength	   = texture.data_byte_count;
		src_json.textureViews.t0.chunks		   = ['c3'];
		src_json.textureViews.t0.format		   = texture.extension;

		src_json.textures.meshtex				   = {};
		src_json.textures.meshtex.textureView	   = 't0';
		src_json.textures.meshtex.imageByteLengths = [texture.data_byte_count];
		src_json.textures.meshtex.width			   = texture.width;
		src_json.textures.meshtex.height		   = texture.height;
		src_json.textures.meshtex.type			   = 5121;
		src_json.textures.meshtex.format		   = 6407;
		src_json.textures.meshtex.internalFormat   = 6407;

		src_json.bufferChunks.c4			   = {};
		src_json.bufferChunks.c4.byteOffset    = src_json.bufferChunks.chunk3.byteOffset + texture.data_byte_count;
		src_json.bufferChunks.c4.byteLength    = mesh.uv_channels_byte_count;
	}

	var json_str = JSON.stringify(src_json);

	var bufSize =
		4 // Magic Bit
		+ 4 // SRC Version
		+ 4 // Header length
		+ json_str.length // JSON String
		+ mesh['vertices'].buffer.length // Vertex information
		+ buf.length // Indices
		+ (("normals" in mesh) ? mesh['vertices'].buffer.length : 0)// Normal information
	;

	// Output optional texture bits
	if (tex_uuid != null) {
		if (embedded_texture)
			bufSize += texture.data.buffer.length;
		bufSize += mesh['uv_channels'].buffer.length;
	}

	var outputBuffer = new Buffer(bufSize);
	var bufPos = 0;

	// Magic bit to identify type of file
	outputBuffer.writeUInt32LE(23, bufPos);
	bufPos += 4;

	// SRC Version
	outputBuffer.writeUInt32LE(42, bufPos);
	bufPos += 4;

	// Header length
	outputBuffer.writeUInt32LE(json_str.length, bufPos);
	bufPos += 4;

	outputBuffer.write(json_str, bufPos);
	bufPos += json_str.length;

	mesh['vertices'].buffer.copy(outputBuffer, bufPos);
	bufPos += mesh['vertices'].buffer.length;

	buf.copy(outputBuffer, bufPos);
	bufPos += buf.length;

	if ('normals' in mesh)
	{
		mesh['normals'].buffer.copy(outputBuffer, bufPos);
		bufPos += mesh['normals'].buffer.length;
	}

	// Output optional texture bits
	if (tex_uuid != null) {
		if (embedded_texture)
		{
			texture.data.buffer.copy(outputBuffer, bufPos);
			bufPos += texture.data.buffer.length;
		}

		mesh['uv_channels'].buffer.copy(outputBuffer, bufPos);
		bufPos += mesh['uv_channels'].buffer.length;
	}

	return outputBuffer;
}

// Set up REST routing calls
exports.route = function(router)
{
	router.get('src', '/:account/:project/:uid', function(res, params, err_callback) {
		// Get object based on UID, check whether or not it is a mesh
		// and then output the result.
		router.dbInterface.getObject(params.account, params.project, params.uid, null, null, function(err, type, uid, obj)
		{
			if(err.value)
				return err_callback(err);

			if (type == "mesh")
			{
				var tex_uuid = null;

				if ("tex_uuid" in params.query)
				{
					tex_uuid = params.query.tex_uuid;
				}

				err_callback(responseCodes.OK, render(params.project, obj.meshes[uid], tex_uuid, false));
			} else {
				err_callback(responseCodes.OBJECT_TYPE_NOT_SUPPORTED);
			}
		});
	});

	router.get('src', '/:account/:project/revision/:rid/:sid', function(res, params, err_callback) {
		// Get object based on revision rid, and object shared_id sid. Check
		// whether or not it is a mesh and then output the result.
		router.dbInterface.getObject(params.account, params.project, null, params.rid, params.sid, function(err, type, uid, obj)
		{
			if(err.value)
				return err_callback(err);

			if (type == "mesh")
			{
				var tex_uuid = null;

				if ("tex_uuid" in params.query)
				{
					tex_uuid = params.query.tex_uuid;
				}

				err_callback(responseCodes.OK, render(params.project, obj.meshes[uid], tex_uuid, false));
			} else {
				err_callback(reponseCodes.OBJECT_TYPE_NOT_SUPPORTED);
			}
		});
	});
};


