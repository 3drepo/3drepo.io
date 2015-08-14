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
 var C = require('../constants.js');
 var logger = logIface.logger;
 var uuidToString = require('../db_interface.js').uuidToString;
 var repoNodeMesh = require('../repoNodeMesh.js');
 var responseCodes = require('../response_codes.js');

/*******************************************************************************
 * Render SRC format of a mesh
 *
 * @param {string} project - The name of the project containing the mesh
 * @param {RepoGraphScene} - Render all meshes contained in RepoGraphScene object. 
 * @param {string} tex_uuid - A string representing the tex_uuid attached to the mesh
 * @param {boolean} embedded_texture - Determines whether or not the texture data is embedded in the SRC.
 * @param {string} subformat - Subformat, currently for Multipart
 * @param {Object} res - The http response object
 *******************************************************************************/
 function render(project, scene, tex_uuid, embedded_texture, subformat, result_callback)
 {
 	logger.log('debug', 'Passed ' + scene[C.REPO_SCENE_LABEL_MESHES_COUNT]);

 	var meshIDs = Object.keys(scene.meshes);
 	var meshIDX = 0;
 	var srcJSON = {};

 	var idx = 0;

 	var dataBuffers    = []; // Array of data buffers to concatenate at the end
	var bufferPosition = 0;  // Stores the position of the processing buffer object relative to the full buffer

	// Create placeholders for JSON output
	srcJSON.accessors				  = {};
	srcJSON.accessors.indexViews	  = {};
	srcJSON.accessors.attributeViews  = {};
	srcJSON.meta					  = {};
	srcJSON.meta.generator			  = "3DRepo";
	srcJSON.textureViews			  = {};
	srcJSON.textures				  = {};
	srcJSON.bufferViews               = {};
	srcJSON.bufferChunks              = {};

	// SRC Header
	srcJSON.meshes                    = {};

	for(var idx = 0; idx < meshIDs.length; idx++)
	{
		meshID = meshIDs[idx];

		var mesh = scene.meshes[meshID]; // Current mesh object

		logger.log('debug', 'Processing mesh' + meshID);
		logger.log('debug', 'Mesh #Verts: ' + mesh.vertices_count);
		logger.log('debug', 'Mesh #Faces: ' + mesh.faces_count);

		var subMeshArray    = [];

		// Is this mesh composed of several other meshes (through optimization) ?
		if (mesh[C.REPO_NODE_LABEL_COMBINED_MAP])
		{
			var subMeshes   = mesh[C.REPO_NODE_LABEL_COMBINED_MAP];
			var subMeshKeys = Object.keys(subMeshes);

			for (var i = 0; i < subMeshKeys.length; i++)
			{
				var currentSubMeshID = subMeshKeys[i];

				for (var j = 0; j < subMeshes[currentSubMeshID].length; j++)
				{
					var tmpObj       = subMeshes[currentSubMeshID][j];
					tmpObj["meshID"] = currentSubMeshID;

					subMeshArray.push(tmpObj);
				}
			}
		} else {
			subMeshArray[0] = {
				meshID:   meshID,
				vertFrom: 0,
				vertTo:   mesh.vertices_count,
				triFrom:  0,
				triTo:    mesh.faces_count,
				offset:   0
			};

		}

		var subMeshBuffers = [];
		var faceBuf = new Buffer(mesh.faces_count * 2 * 3); // Holder for buffer of face indices
		var copy_ptr = 0;	  								// Pointer to the place in SRC buffer to copy to
		var orig_idx = mesh['faces'].buffer;
		var orig_idx_ptr = 0; 								// Pointer in the RepoGraphScene buffer to copy from

		subMeshArray.sort(function(left, right) 
		{
			if (left.vertFrom < right.vertFrom)
				return -1;
			else if (left.vertFrom > right.vertFrom)
				return 1;
			else
				return 0;
		});

		// Positions where the mesh will eventually output
		var bufPos = 0;

		var vertexWritePosition = bufPos;
		if (mesh['vertices'])
			bufPos += mesh['vertices'].buffer.length;

		var normalWritePosition = bufPos;
		if (mesh['normals'])
			bufPos += mesh['normals'].buffer.length;

		var facesWritePosition  = bufPos;
			bufPos += mesh['faces'].buffer.length;
				
		var UVWritePosition     = bufPos; 

		var numSubMeshes = subMeshArray.length;

		// Loop through a set of possible submeshes
		for(var subMesh = 0; subMesh < numSubMeshes; subMesh++)
		{
			// ------------------------------------------------------------------------
			// In SRC each attribute has an associated attributeView.
			// Each attributeView has an associated bufferView
			// Each bufferView is composed of several chunks.
			// ------------------------------------------------------------------------

			meshIDX = idx + "_" + subMesh;

			var positionAttributeView = 'p' + meshIDX;
			var normalAttributeView   = 'n' + meshIDX;
			var uvAttributeView       = 'u' + meshIDX;
			var indexView             = 'i' + meshIDX;

			var positionBufferView    = 'pb' + meshIDX;
			var normalBufferView      = 'nb' + meshIDX;
			var texBufferView         = 'tb' + meshIDX;
			var uvBufferView          = 'ub' + meshIDX;
			var indexBufferView       = 'ib' + meshIDX;

			var positionBufferChunk = 'pc' + meshIDX;
			var indexBufferChunk 	= 'ic' + meshIDX;
			var normalBufferChunk   = 'nc' + meshIDX;
			var texBufferChunk      = 'tc' + meshIDX;
			var uvBufferChunk       = 'uc' + meshIDX;


			meshID = subMeshArray[subMesh]["meshID"];

			// SRC Header for this mesh
			srcJSON.meshes[meshID]            = {};
			srcJSON.meshes[meshID].attributes = {};

			// Extract and attach the bounding box
			var bbox = repoNodeMesh.extractBoundingBox(mesh);

			srcJSON.meshes[meshID].bboxCenter = bbox.center;
			srcJSON.meshes[meshID].bboxSize   = bbox.size;

			var subMeshVerticesCount = subMeshArray[subMesh].vertTo - subMeshArray[subMesh].vertFrom;
			var subMeshFacesCount    = subMeshArray[subMesh].triTo  - subMeshArray[subMesh].triFrom;

			// Vertices
			if (mesh["vertices"])
			{
				srcJSON.accessors.attributeViews[positionAttributeView]			   	  = {};
				srcJSON.accessors.attributeViews[positionAttributeView].bufferView    = positionBufferView;
				srcJSON.accessors.attributeViews[positionAttributeView].byteOffset    = 0;
				srcJSON.accessors.attributeViews[positionAttributeView].byteStride    = 12;
				srcJSON.accessors.attributeViews[positionAttributeView].componentType = C.X3DOM_SRC_FLOAT;
				srcJSON.accessors.attributeViews[positionAttributeView].type		  = 'VEC3';
				srcJSON.accessors.attributeViews[positionAttributeView].count		  = subMeshVerticesCount;
				srcJSON.accessors.attributeViews[positionAttributeView].decodeOffset  = [0, 0, 0];
				srcJSON.accessors.attributeViews[positionAttributeView].decodeScale   = [1, 1, 1];

				srcJSON.bufferChunks[positionBufferChunk]            = {};
				srcJSON.bufferChunks[positionBufferChunk].byteOffset = vertexWritePosition;
				srcJSON.bufferChunks[positionBufferChunk].byteLength = subMeshVerticesCount * 3 * 4;

				vertexWritePosition += srcJSON.bufferChunks[positionBufferChunk].byteLength;

				srcJSON.bufferViews[positionBufferView]        = {};
				srcJSON.bufferViews[positionBufferView].chunks = [positionBufferChunk];

				srcJSON.meshes[meshID].attributes.position  = positionAttributeView;
			}

			// Normal Attribute View
			if (mesh["normals"])
			{
				srcJSON.accessors.attributeViews[normalAttributeView]               = {};
				srcJSON.accessors.attributeViews[normalAttributeView].bufferView    = normalBufferView;
				srcJSON.accessors.attributeViews[normalAttributeView].byteOffset    = 0;
				srcJSON.accessors.attributeViews[normalAttributeView].byteStride    = 12;
				srcJSON.accessors.attributeViews[normalAttributeView].componentType = C.X3DOM_SRC_FLOAT;
				srcJSON.accessors.attributeViews[normalAttributeView].type		    = 'VEC3';
				srcJSON.accessors.attributeViews[normalAttributeView].count		    = subMeshVerticesCount;
				srcJSON.accessors.attributeViews[normalAttributeView].decodeOffset  = [0, 0, 0];
				srcJSON.accessors.attributeViews[normalAttributeView].decodeScale   = [1, 1, 1];

				srcJSON.meshes[meshID].attributes.normal = normalAttributeView;

				srcJSON.bufferChunks[normalBufferChunk]	           = {};
				srcJSON.bufferChunks[normalBufferChunk].byteOffset = normalWritePosition;
				srcJSON.bufferChunks[normalBufferChunk].byteLength = subMeshVerticesCount * 3 * 4;

				srcJSON.bufferViews[normalBufferView]        = {};
				srcJSON.bufferViews[normalBufferView].chunks = [normalBufferChunk];

				normalWritePosition += srcJSON.bufferChunks[normalBufferChunk].byteLength;
			}

			// Index View
			if (mesh["faces"])
			{
				srcJSON.accessors.indexViews[indexView]               = {};
				srcJSON.accessors.indexViews[indexView].bufferView    = indexBufferView;
				srcJSON.accessors.indexViews[indexView].byteOffset    = 0;
				srcJSON.accessors.indexViews[indexView].componentType = C.X3DOM_SRC_USHORT;

				srcJSON.bufferChunks[indexBufferChunk]            = {};
				srcJSON.bufferChunks[indexBufferChunk].byteOffset = facesWritePosition;
				srcJSON.bufferChunks[indexBufferChunk].byteLength = subMeshFacesCount * 3 * 2;

				srcJSON.bufferViews[indexBufferView]        = {};
				srcJSON.bufferViews[indexBufferView].chunks = [indexBufferChunk];

				srcJSON.meshes[meshID].indices   = indexView;
				srcJSON.meshes[meshID].primitive = C.X3DOM_SRC_TRIANGLE;

				facesWritePosition += srcJSON.bufferChunks[indexBufferChunk].byteLength;

				srcJSON.accessors.indexViews[indexView].count = subMeshFacesCount * 3; // Face Indices
			}

			// If there is a texture attached then place it in the SRC JSON
			// Here we define the binary data for the UV coordinates
			if (tex_uuid != null)
			{
				// UV coordinates
				srcJSON.accessors.attributeViews[uvAttributeView]               = {};
				srcJSON.accessors.attributeViews[uvAttributeView].bufferView    = uvBufferView;
				srcJSON.accessors.attributeViews[uvAttributeView].byteOffset    = 0;
				srcJSON.accessors.attributeViews[uvAttributeView].byteStride    = 8;
				srcJSON.accessors.attributeViews[uvAttributeView].componentType = C.X3DOM_SRC_FLOAT;
				srcJSON.accessors.attributeViews[uvAttributeView].type		    = 'VEC2';
				srcJSON.accessors.attributeViews[uvAttributeView].count		 	= subMeshVerticesCount;
				srcJSON.accessors.attributeViews[uvAttributeView].decodeOffset  = [0, 0];
				srcJSON.accessors.attributeViews[uvAttributeView].decodeScale   = [1, 1];

				srcJSON.meshes[meshID].attributes.texcoord = uvAttributeView;

				srcJSON.bufferViews[uvBufferView]        = {};
				srcJSON.bufferViews[uvBufferView].chunks = [textureBufferChunk];

				srcJSON.bufferChunks[uvBufferChunk]            = {};
				srcJSON.bufferChunks[uvBufferChunk].byteOffset = UVWritePosition;
				srcJSON.bufferChunks[uvBufferChunk].byteLength = subMeshVerticesCount * 4 * 2; 

				UVWritePosition += srcJSON.bufferChunks[uvBufferChunk].byteLength;

				// Directly embed the texture data in the SRC file ?
				// TODO: Fix this, may not work
				if (embedded_texture)
				{
					srcJSON.bufferChunks[texBufferChunk]            = {};
					srcJSON.bufferChunks[texBufferChunk].byteOffset = bufferPosition;
					srcJSON.bufferChunks[texBufferChunk].byteLength = texture.data_byte_count;

					srcJSON.textureViews[texBufferView]            = {};
					srcJSON.textureViews[texBufferView].byteLength = texture.data_byte_count;
					srcJSON.textureViews[texBufferView].chunks     = [texBufferChunk];
					srcJSON.textureViews[texBufferView].format     = texture.extension;

					srcJSON.textures.meshtex				  = {};
					srcJSON.textures.meshtex.textureView	  = texBufferView;
					srcJSON.textures.meshtex.imageByteLengths = [texture.data_byte_count];
					srcJSON.textures.meshtex.width            = texture.width;
					srcJSON.textures.meshtex.height           = texture.height;
					srcJSON.textures.meshtex.type             = C.X3DOM_SRC_USHORT;
					srcJSON.textures.meshtex.format		      = 6407;
					srcJSON.textures.meshtex.internalFormat   = 6407;

					bufferPosition += texture.data_byte_count;
				}
			}


			// Start writing to buffer
			if (mesh["faces"])
			{
				// Loop through the faces copying the byte information
				// to a buffer in the src.
				var num_faces = 0;	  // Number of faces without non-triangle faces.

				// TODO: Currently just ignores non triangulated faces.
				for (var face_idx = 0; face_idx < subMeshFacesCount; face_idx++) {
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

							idx_val -= subMeshArray[subMesh].offset;

							faceBuf.writeUInt16LE(idx_val, copy_ptr);
							copy_ptr += 2;
						}
					}

					orig_idx_ptr += (num_comp + 1) * 4;
				}
			}
		}

		var bufferSize = 
			(mesh['vertices'] ? (mesh.vertices_count * 4 * 3) : 0) +
			(mesh['normals'] ? (mesh.vertices_count * 4 * 3) : 0) +
			(mesh['faces'] ? (mesh.faces_count * 3 * 2) : 0) +
			((tex_uuid != null) ? (mesh.vertices_count * 4 * 2) : 0);

		dataBuffers[idx] = new Buffer(bufferSize);

		var bufPos = 0;

		// Output vertices
		if (mesh['vertices'])
		{
			mesh['vertices'].buffer.copy(dataBuffers[idx], bufPos);

			bufPos += mesh['vertices'].buffer.length;
		}

		// Output normals
		if (mesh["normals"])
		{
			mesh['normals'].buffer.copy(dataBuffers[idx], bufPos);
			bufPos += mesh['normals'].buffer.length;
		}

		// Output face indices
		if (mesh['faces'])
		{
			faceBuf.copy(dataBuffers[idx], bufPos);

			var tst = new Uint16Array(faceBuf);
			bufPos += faceBuf.length;
		}

		// Output optional texture bits
		if (tex_uuid != null) {
			if (embedded_texture)
			{
				texture.data.buffer.copy(dataBuffers[idx], bufPos);
				bufPos += texture.data.buffer.length;
			}

			mesh['uv_channels'].buffer.copy(dataBuffers[idx], bufPos);
			bufPos += mesh['uv_channels'].buffer.length;
		}
	}	

	// Generate header string
	var JSONstr = JSON.stringify(srcJSON);

	// First compute the buffer size
	var bufSize =
		4                  // Magic Bit
		+ 4                // SRC Version
		+ 4                // Header length
		+ JSONstr.length; // JSON String

	var headerBuffer = new Buffer(bufSize); // Buffer containing SRC header info
	var bufPos = 0;

	// Magic bit to identify type of file
	headerBuffer.writeUInt32LE(23, bufPos); bufPos += 4;

	// SRC Version
	headerBuffer.writeUInt32LE(42, bufPos); bufPos += 4;

	// Header length
	headerBuffer.writeUInt32LE(JSONstr.length, bufPos); bufPos += 4;

	// Output the header string
	headerBuffer.write(JSONstr, bufPos); bufPos += JSONstr.length;

	var dataBuffer = Buffer.concat(dataBuffers);
	var fullBuffer = Buffer.concat([headerBuffer, dataBuffer]);
	
	result_callback(responseCodes.OK, fullBuffer);
}

// Set up REST routing calls
exports.route = function(router)
{
	router.get('src', '/:account/:project/:uid', function(res, params, err_callback) {
		// Get object based on UID, check whether or not it is a mesh
		// and then output the result.
		router.dbInterface.getObject(params.account, params.project, params.uid, null, null, function(err, type, uid, fromStash, obj)
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

				render(params.project, obj, tex_uuid, false, params.subformat, function(err, renderedObj) {
					if (err.value)
						return err_callback(err);

					err_callback(responseCodes.OK, renderedObj);
				});
			} else {
				err_callback(responseCodes.OBJECT_TYPE_NOT_SUPPORTED);
			}
		});
	});

	router.get('src', '/:account/:project/revision/:rid/:sid', function(res, params, err_callback) {
		// Get object based on revision rid, and object shared_id sid. Check
		// whether or not it is a mesh and then output the result.
		router.dbInterface.getObject(params.account, params.project, null, params.rid, params.sid, function(err, type, uid, fromStash, obj)
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

				render(params.project, obj, tex_uuid, false, params.subformat, function(err, renderedObj) {
					if (err.value)
						return err_callback(err);

					err_callback(responseCodes.OK, renderedObj);
				});
			} else {
				err_callback(reponseCodes.OBJECT_TYPE_NOT_SUPPORTED);
			}
		});
	});
};


