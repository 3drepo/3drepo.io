/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) a/exitny later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
 var logIface = require("../logger.js");
 var C = require("../constants.js");
 var uuidToString = require("../db_interface.js").uuidToString;
 var repoNodeMesh = require("../repoNodeMesh.js");
 var responseCodes = require("../response_codes.js");

 var utils         = require("../utils.js");

 var dbInterface   = require("../db_interface.js");

 var config       = require("app-config").config;

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
function render(project, scene, tex_uuid, embedded_texture, subformat, logger, result_callback)
{
	"use strict";

	logger.logDebug("Passed " + scene[C.REPO_SCENE_LABEL_MESHES_COUNT]);

	var meshIDs = Object.keys(scene.meshes);
	var meshIDX = 0;
	var srcJSON = {};

	var idx = 0;

	var dataBuffers		= []; // Array of data buffers to concatenate at the end
	var bufferPosition	= 0;  // Stores the position of the processing buffer object relative to the full buffer
	var idMapBuf		= null;
	var needsIdMapBuf	= true;

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
	srcJSON.meta                      = {};
	srcJSON.meta.idMaps               = {};

	for(idx = 0; idx < meshIDs.length; idx++)
	{
		meshID = meshIDs[idx];

		var orig_idx_ptr = 0;
		var mesh = scene.meshes[meshID]; // Current mesh object

		logger.logDebug("Processing mesh " + meshID);
		logger.logDebug("Mesh #Verts: " + mesh.vertices_count);
		logger.logDebug("Mesh #Faces: " + mesh.faces_count);

		var subMeshArray         = [];
		var subMeshKeys          = [];
		var subMeshBBoxCenters   = [];
		var subMeshBBoxSizes     = [];

		var useIDMap             = true;

		var faceBuf = new Buffer(mesh.faces_count * 2 * 3); // Holder for buffer of face indices
		var copy_ptr = 0;	  								// Pointer to the place in SRC buffer to copy to

		// Is this mesh composed of several other meshes (through optimization) ?
		if (!mesh[C.REPO_NODE_LABEL_COMBINED_MAP])
		{
			// Submesh array consists of a single mesh (the entire thing)
			mesh[C.REPO_NODE_LABEL_COMBINED_MAP]                       = [];

			var fakeSubMesh = {};
			fakeSubMesh[C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID]       = utils.stringToUUID(meshID);
			fakeSubMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM]   = 0;
			fakeSubMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO]     = mesh.vertices_count;
			fakeSubMesh[C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM] = 0;
			fakeSubMesh[C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO]   = mesh.faces_count;
			fakeSubMesh[C.REPO_NODE_LABEL_VERTICES_COUNT]          = mesh.vertices_count;
			fakeSubMesh[C.REPO_NODE_LABEL_FACES_COUNT]             = mesh.faces_count;
			fakeSubMesh[C.REPO_NODE_LABEL_BOUNDING_BOX]            = mesh.bounding_box;

			mesh[C.REPO_NODE_LABEL_COMBINED_MAP].push(fakeSubMesh);

			useIDMap = false;
		}

		// First sort the combined map in order of vertex ID
		mesh[C.REPO_NODE_LABEL_COMBINED_MAP].sort(repoNodeMesh.mergeMapSort);

		var subMeshIDX       = -1;
		var runningVertTotal = 0;
		var runningFaceTotal = 0;

		var prevVTo = 0;

		var runningIDX = 0;

		var startLargeMeshSplit = false;

		logger.logTrace("Generating idMap");

		// If this is multipart then generate the idMap
		for(var i = 0; i < mesh[C.REPO_NODE_LABEL_COMBINED_MAP].length; i++)
		{
			logger.logTrace("Running m_map #" + i);

			var currentMesh      = mesh[C.REPO_NODE_LABEL_COMBINED_MAP][i];

			var currentMeshVFrom = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM];
			var currentMeshVTo   = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO];
			var currentMeshTFrom = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM];
			var currentMeshTTo   = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO];

			prevVTo = currentMeshVTo;

			var currentMeshNumVertices = currentMeshVTo - currentMeshVFrom;
			var currentMeshNumFaces    = currentMeshTTo - currentMeshTFrom;

			// If the current cumulative count of vertices is greater than the
			// vertex limit that start a new mesh.
			// If subMeshIDX === -1 we need to initialize the first mesh
			if (((runningVertTotal + currentMeshNumVertices) > C.SRC_VERTEX_LIMIT) || (subMeshIDX === -1))
			{

				if  ((subMeshIDX !== -1) && !startLargeMeshSplit)
				{
					subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_OFFSET] = 0; //subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM];
					subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_VERTICES_COUNT]   = runningVertTotal;
					subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_FACES_COUNT]      = runningFaceTotal;
					subMeshArray[subMeshIDX].idMapBuf                            = Buffer.concat(subMeshArray[subMeshIDX].idMapBuf);
				}

				startLargeMeshSplit = false;

				subMeshIDX += 1;
				subMeshArray[subMeshIDX]                                            = {};
				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID]       = mesh["id"] + "_" + subMeshIDX;

				subMeshArray[subMeshIDX][C.SRC_IDX_LIST]                            = [];
				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM]   = currentMeshVFrom;
				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM] = currentMeshTFrom;

				subMeshArray[subMeshIDX].idMapBuf                            = [];
				subMeshBBoxCenters[subMeshIDX]                               = [];
				subMeshBBoxSizes[subMeshIDX]                                 = [];
				subMeshKeys[subMeshIDX]                                      = [];

				// Reset runnning values
				runningVertTotal = 0;
				runningFaceTotal = 0;
				runningIDX       = 0;
			}

			// Now we've started a new mesh is the mesh that we're trying to add greater than
			// the limit itself. In the case that it is, this will always flag as above.
			if (currentMeshNumVertices > C.SRC_VERTEX_LIMIT)
			{
				logger.logInfo("Splitting large meshes into smaller meshes");

				// Index from old vertex IDs to new ones
				var reindexMap      = {};

				// How many vertices have mapped so far ?
				var totalNumMappedVerts = 0;
				var newVertexBuffer = new Buffer(currentMeshNumVertices * 4 * 3);

				var splitBBox = [[],[]];

				// Perform quick and dirty splitting algorithm
				for (var face_idx = 0; face_idx < currentMeshNumFaces; face_idx++) {
					var num_comp = mesh["faces"].buffer.readInt32LE(orig_idx_ptr);

					if (num_comp !== 3) {
						logger.logError("Non triangulated face with " + num_comp + " vertices.");
						runningFaceTotal--;
						subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO]--;
					} else {
						if (((runningVertTotal + num_comp) > C.SRC_VERTEX_LIMIT) || !startLargeMeshSplit)
						{
							// If new meshes has at least one in, then we are updating
							// an old one
							if (startLargeMeshSplit) {
								subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO]     = currentMeshVFrom;
								subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO]   = currentMeshTFrom + face_idx;

								subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_FACES_COUNT]             =
									subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO] -
									subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM];

								subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_VERTICES_COUNT]          = runningVertTotal;
								subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_BOUNDING_BOX]            = splitBBox;

								if (useIDMap) {
									subMeshArray[subMeshIDX].idMapBuf = new Buffer(runningVertTotal * 4);
									logger.logTrace("Writing IDMapBuf");
									for(var k = 0; k < runningVertTotal; k++) {
										subMeshArray[subMeshIDX].idMapBuf.writeFloatLE(runningIDX, k * 4);
									}
								}

								var bbox = splitBBox;

								var bboxMin    = bbox[0];
								var bboxMax    = bbox[1];
								var bboxCenter = [(bboxMin[0] + bboxMax[0]) / 2, (bboxMin[1] + bboxMax[1]) / 2, (bboxMin[2] + bboxMax[2]) / 2];
								var bboxSize   = [(bboxMax[0] - bboxMin[0]), (bboxMax[1] - bboxMin[1]), (bboxMax[2] - bboxMin[2])];

								subMeshBBoxCenters[subMeshIDX] = [bboxCenter];
								subMeshBBoxSizes[subMeshIDX]   = [bboxSize];

								splitBBox = [[], []];

								subMeshIDX       += 1;
								
								subMeshKeys[subMeshIDX]  = [];
								subMeshArray[subMeshIDX] = {};

								reindexMap = {};
							}

							subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID]       = mesh["id"] + "_" + subMeshIDX;
							subMeshKeys[subMeshIDX].push(subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID]);

							currentMeshVFrom                                                    += runningVertTotal;

							subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM]   = currentMeshVFrom;
							subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM] = currentMeshTFrom + face_idx;

							runningVertTotal                                       = 0;

							startLargeMeshSplit = true;
						}

						for (var vert_comp = 0; vert_comp < num_comp; vert_comp++) {
							// First int32 is number of sides (i.e. 3 = Triangle)]
							// After that there Int32 for each index (0..2)
							var byte_position = orig_idx_ptr + (vert_comp + 1) * 4;
							var idx_val       = mesh["faces"].buffer.readInt32LE(byte_position);

							if (!reindexMap[idx_val])
							{
								reindexMap[idx_val] = runningVertTotal;
								faceBuf.writeUInt16LE(runningVertTotal, copy_ptr);

								// Loop over all the verex components and copy them
								for(var v_idx = 0; v_idx < 3; v_idx++)
								{
									var vertComp = mesh["vertices"].buffer.readFloatLE(idx_val * 4 * 3 + v_idx * 4);

									if (v_idx >= splitBBox[0].length)
									{
										splitBBox[0][v_idx] = vertComp;
										splitBBox[1][v_idx] = vertComp;
									} else {
										if (splitBBox[0][v_idx] < vertComp) {
											splitBBox[0][v_idx] = vertComp;
										}

										if (splitBBox[1][v_idx] > vertComp) {
											splitBBox[1][v_idx] = vertComp;
										}
									}

									newVertexBuffer.writeFloatLE(vertComp, totalNumMappedVerts * 4 * 3 + v_idx * 4);
								}

								runningVertTotal++;
								totalNumMappedVerts++;
							} else {
								faceBuf.writeUInt16LE(reindexMap[idx_val]);
							}

							copy_ptr += 2;
						}
					}

					orig_idx_ptr += (num_comp + 1) * 4;
				}

				newVertexBuffer.copy(mesh.vertices.buffer,  currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM] * 3 * 4);

				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO]     = currentMeshVFrom;
				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO]   = currentMeshTFrom + face_idx;

				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_FACES_COUNT]             =
					subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO] -
					subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM];

				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_VERTICES_COUNT]          = runningVertTotal;
				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_BOUNDING_BOX]            = splitBBox;

				subMeshArray[subMeshIDX].idMapBuf = new Buffer(runningVertTotal * 4);
				logger.logTrace("Writing IDMapBuf");
				for(var k = 0; k < runningVertTotal; k++) {
					subMeshArray[subMeshIDX].idMapBuf.writeFloatLE(runningIDX, k * 4);
				}

				runningVertTotal = 0;
			} else {
				logger.logTrace("Reindexing faces");

				/*
				for (var v_idx = 0; v_idx < 3; v_idx++) {
					if (currentBBox[0][v_idx] < subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_BOUNDING_BOX][0][v_idx])
					{
						subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_BOUNDING_BOX][0][v_idx] = currentBBox[0][v_idx];
					}

					if (currentBBox[1][v_idx] > subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_BOUNDING_BOX][1][v_idx])
					{
						subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_BOUNDING_BOX][1][v_idx] = currentBBox[1][v_idx];
					}
				}
				*/

				for (var face_idx = 0; face_idx < currentMeshNumFaces; face_idx++) {
					var num_comp = mesh["faces"].buffer.readInt32LE(orig_idx_ptr);

					if (num_comp !== 3) {
						logger.logError("Non triangulated face with " + num_comp + " vertices.");
						//runningFaceTotal--;
						//subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO]--;
					} else {
						for (var vert_comp = 0; vert_comp < num_comp; vert_comp++) {
							// First int32 is number of sides (i.e. 3 = Triangle)]
							// After that there Int32 for each index (0..2)
							var byte_position = orig_idx_ptr + (vert_comp + 1) * 4;
							var idx_val       = mesh["faces"].buffer.readInt32LE(byte_position);

							// Take currentMeshVFrom from Index Value to reset to zero start,
							// then add back in the current running total to append after
							// pervious mesh.
							idx_val          += (runningVertTotal - currentMeshVFrom);

							faceBuf.writeUInt16LE(idx_val, copy_ptr);
							copy_ptr += 2;
						}
					}

					orig_idx_ptr += (num_comp + 1) * 4;
				}

				subMeshKeys[subMeshIDX].push(utils.uuidToString(currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID]));

				if (useIDMap) {
					subMeshArray[subMeshIDX].idMapBuf.push(new Buffer(currentMeshNumVertices * 4));
				}

				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO]     = currentMeshVTo;
				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO]   = currentMeshTTo;

				var bbox = currentMesh[C.REPO_NODE_LABEL_BOUNDING_BOX];

				var bboxMin    = bbox[0];
				var bboxMax    = bbox[1];
				var bboxCenter = [(bboxMin[0] + bboxMax[0]) / 2, (bboxMin[1] + bboxMax[1]) / 2, (bboxMin[2] + bboxMax[2]) / 2];
				var bboxSize   = [(bboxMax[0] - bboxMin[0]), (bboxMax[1] - bboxMin[1]), (bboxMax[2] - bboxMin[2])];

				subMeshBBoxCenters[subMeshIDX].push(bboxCenter);
				subMeshBBoxSizes[subMeshIDX].push(bboxSize);

				if (useIDMap)
				{
					logger.logTrace("Writing IDMapBuf");
					for(var k = 0; k < currentMeshNumVertices; k++) {
						subMeshArray[subMeshIDX].idMapBuf[runningIDX].writeFloatLE(runningIDX, k * 4);
					}
				}

				runningIDX       += 1;
			}

			runningVertTotal += currentMeshNumVertices;
			runningFaceTotal += currentMeshNumFaces;

		}

		if (!startLargeMeshSplit) {
			subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_OFFSET] = 0; //subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM];
			subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_VERTICES_COUNT]   = runningVertTotal;
			subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_FACES_COUNT]      = runningFaceTotal;

			if (useIDMap) {
				subMeshArray[subMeshIDX].idMapBuf                            = Buffer.concat(subMeshArray[subMeshIDX].idMapBuf);
			}
		}

		var subMeshBuffers = [];

		// Positions where the mesh will eventually output
		var bufPos = 0;

		var vertexWritePosition = bufPos;
		if (mesh[C.REPO_NODE_LABEL_VERTICES]) {
			bufPos += mesh[C.REPO_NODE_LABEL_VERTICES].buffer.length;
		}

		var normalWritePosition = bufPos;
		if (mesh[C.REPO_NODE_LABEL_NORMALS]) {
			bufPos += mesh[C.REPO_NODE_LABEL_NORMALS].buffer.length;
		}

		var facesWritePosition  = bufPos;
		if (mesh[C.REPO_NODE_LABEL_FACES]) {
			bufPos += faceBuf.length;
		}

		var idMapWritePosition = bufPos;
		if (useIDMap && needsIdMapBuf) {
			bufPos += mesh.vertices_count * 4;
		}

		var uvWritePosition = bufPos;
		var numSubMeshes    = subMeshArray.length;

		// Loop through a set of possible submeshes
		logger.logTrace("Looping through submeshes");
		for(var subMesh = 0; subMesh < numSubMeshes; subMesh++)
		{
			// ------------------------------------------------------------------------
			// In SRC each attribute has an associated attributeView.
			// Each attributeView has an associated bufferView
			// Each bufferView is composed of several chunks.
			// ------------------------------------------------------------------------

			logger.logTrace("Generating subMesh #" + subMesh);

			meshIDX = idx + "_" + subMesh;

			var positionAttributeView = "p" + meshIDX;
			var normalAttributeView   = "n" + meshIDX;
			var uvAttributeView       = "u" + meshIDX;
			var idMapAttributeView    = "id" + meshIDX;
			var indexView             = "i" + meshIDX;

			var positionBufferView    = "pb" + meshIDX;
			var normalBufferView      = "nb" + meshIDX;
			var texBufferView         = "tb" + meshIDX;
			var uvBufferView          = "ub" + meshIDX;
			var indexBufferView       = "ib" + meshIDX;
			var idMapBufferView       = "idb" + meshIDX;

			var positionBufferChunk = "pc" + meshIDX;
			var indexBufferChunk 	= "ic" + meshIDX;
			var normalBufferChunk   = "nc" + meshIDX;
			var texBufferChunk      = "tc" + meshIDX;
			var uvBufferChunk       = "uc" + meshIDX;
			var idMapBufferChunk    = "idc" + meshIDX;

			var idMapID             = "idMap" + meshIDX;

			var meshID = subMeshArray[subMesh][C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID];

			// SRC Header for this mesh
			srcJSON.meshes[meshID]            = {};
			srcJSON.meshes[meshID].attributes = {};

			// Extract and attach the bounding box
			/*
			var bbox = repoNodeMesh.extractBoundingBox(mesh);

			srcJSON.meshes[meshID].bboxCenter = bbox.center;
			srcJSON.meshes[meshID].bboxSize   = bbox.size;
			*/

			var subMeshVerticesCount = subMeshArray[subMesh][C.REPO_NODE_LABEL_VERTICES_COUNT];
			var subMeshFacesCount    = subMeshArray[subMesh][C.REPO_NODE_LABEL_FACES_COUNT];

			// Vertices
			if (mesh[C.REPO_NODE_LABEL_VERTICES])
			{
				srcJSON.accessors.attributeViews[positionAttributeView]			   	  = {};
				srcJSON.accessors.attributeViews[positionAttributeView].bufferView    = positionBufferView;
				srcJSON.accessors.attributeViews[positionAttributeView].byteOffset    = 0;
				srcJSON.accessors.attributeViews[positionAttributeView].byteStride    = 12;
				srcJSON.accessors.attributeViews[positionAttributeView].componentType = C.X3DOM_SRC_FLOAT;
				srcJSON.accessors.attributeViews[positionAttributeView].type		  = "VEC3";
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
			if (mesh[C.REPO_NODE_LABEL_NORMALS])
			{
				srcJSON.accessors.attributeViews[normalAttributeView]               = {};
				srcJSON.accessors.attributeViews[normalAttributeView].bufferView    = normalBufferView;
				srcJSON.accessors.attributeViews[normalAttributeView].byteOffset    = 0;
				srcJSON.accessors.attributeViews[normalAttributeView].byteStride    = 12;
				srcJSON.accessors.attributeViews[normalAttributeView].componentType = C.X3DOM_SRC_FLOAT;
				srcJSON.accessors.attributeViews[normalAttributeView].type		    = "VEC3";
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
			if (mesh[C.REPO_NODE_LABEL_FACES])
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

			if (useIDMap && subMeshArray[subMesh].idMapBuf)
			{
				srcJSON.accessors.attributeViews[idMapAttributeView]               = {};
				srcJSON.accessors.attributeViews[idMapAttributeView].bufferView    = idMapBufferView;
				srcJSON.accessors.attributeViews[idMapAttributeView].byteOffset    = 0;
				srcJSON.accessors.attributeViews[idMapAttributeView].byteStride    = 4;
				srcJSON.accessors.attributeViews[idMapAttributeView].componentType = C.X3DOM_SRC_FLOAT;
				srcJSON.accessors.attributeViews[idMapAttributeView].type		   = "SCALAR";
				srcJSON.accessors.attributeViews[idMapAttributeView].count		   = subMeshVerticesCount;
				srcJSON.accessors.attributeViews[idMapAttributeView].decodeOffset  = [0];
				srcJSON.accessors.attributeViews[idMapAttributeView].decodeScale   = [1];

				srcJSON.meshes[meshID].attributes.id = idMapAttributeView;

				srcJSON.bufferChunks[idMapBufferChunk]            = {};
				srcJSON.bufferChunks[idMapBufferChunk].byteOffset = idMapWritePosition;
				srcJSON.bufferChunks[idMapBufferChunk].byteLength = subMeshArray[subMesh].idMapBuf.length;

				srcJSON.bufferViews[idMapBufferView]        = {};
				srcJSON.bufferViews[idMapBufferView].chunks = [idMapBufferChunk];

				srcJSON.meshes[meshID].meta               = {};
				srcJSON.meshes[meshID].meta.idMap         = idMapID;
				srcJSON.meshes[meshID].meta.subMeshLabels = subMeshKeys[subMesh];

				srcJSON.meta.idMaps[idMapID]             = {};
				srcJSON.meta.idMaps[idMapID].bboxCenters = subMeshBBoxCenters[subMesh];
				srcJSON.meta.idMaps[idMapID].bboxSizes   = subMeshBBoxSizes[subMesh];
				srcJSON.meta.idMaps[idMapID].labels      = subMeshKeys[subMesh];

				idMapWritePosition += srcJSON.bufferChunks[idMapBufferChunk].byteLength;
			}

			// If there is a texture attached then place it in the SRC JSON
			// Here we define the binary data for the UV coordinates
			if (tex_uuid !== null)
			{
				// UV coordinates
				srcJSON.accessors.attributeViews[uvAttributeView]               = {};
				srcJSON.accessors.attributeViews[uvAttributeView].bufferView    = uvBufferView;
				srcJSON.accessors.attributeViews[uvAttributeView].byteOffset    = 0;
				srcJSON.accessors.attributeViews[uvAttributeView].byteStride    = 8;
				srcJSON.accessors.attributeViews[uvAttributeView].componentType = C.X3DOM_SRC_FLOAT;
				srcJSON.accessors.attributeViews[uvAttributeView].type		    = "VEC2";
				srcJSON.accessors.attributeViews[uvAttributeView].count		 	= subMeshVerticesCount;
				srcJSON.accessors.attributeViews[uvAttributeView].decodeOffset  = [0, 0];
				srcJSON.accessors.attributeViews[uvAttributeView].decodeScale   = [1, 1];

				srcJSON.meshes[meshID].attributes.texcoord = uvAttributeView;

				srcJSON.bufferViews[uvBufferView]        = {};
				srcJSON.bufferViews[uvBufferView].chunks = [uvBufferChunk];

				srcJSON.bufferChunks[uvBufferChunk]            = {};
				srcJSON.bufferChunks[uvBufferChunk].byteOffset = uvWritePosition;
				srcJSON.bufferChunks[uvBufferChunk].byteLength = subMeshVerticesCount * 4 * 2;

				uvWritePosition += srcJSON.bufferChunks[uvBufferChunk].byteLength;

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
		}

		logger.logTrace("Generating output buffer");

		if (useIDMap)
		{
			idMapBuf = new Buffer(0);

			for(var i = 0; i < subMeshArray.length; i++)
			{
				if (subMeshArray[i].idMapBuf)
				{
					idMapBuf = Buffer.concat([idMapBuf, subMeshArray[i].idMapBuf]);
				}
			}
		}

		var bufferSize =
			(mesh["vertices"] ? (mesh.vertices_count * 4 * 3) : 0) +
			(mesh["normals"] ? (mesh.vertices_count * 4 * 3) : 0) +
			(mesh["faces"] ? (mesh.faces_count * 3 * 2) : 0) +
			((useIDMap && idMapBuf) ? idMapBuf.length : 0) +
			((tex_uuid != null) ? (mesh.vertices_count * 4 * 2) : 0);

		dataBuffers[idx] = new Buffer(bufferSize);

		var bufPos = 0;

		// Output vertices
		if (mesh["vertices"])
		{
			mesh["vertices"].buffer.copy(dataBuffers[idx], bufPos);

			bufPos += mesh["vertices"].buffer.length;
		}

		// Output normals
		if (mesh["normals"])
		{
			mesh["normals"].buffer.copy(dataBuffers[idx], bufPos);
			bufPos += mesh["normals"].buffer.length;
		}

		// Output face indices
		if (mesh["faces"])
		{
			faceBuf.copy(dataBuffers[idx], bufPos);
			bufPos += faceBuf.length;
		}

		if (useIDMap && idMapBuf)
		{
			idMapBuf.copy(dataBuffers[idx], bufPos);
			bufPos += idMapBuf.length;
		}

		// Output optional texture bits
		if (tex_uuid != null) {

			mesh["uv_channels"].buffer.copy(dataBuffers[idx], bufPos);
			bufPos += mesh["uv_channels"].buffer.length;

			if (embedded_texture)
			{
				texture.data.buffer.copy(dataBuffers[idx], bufPos);
				bufPos += texture.data.buffer.length;
			}
		}
	}

	// Generate header string
	var JSONstr = JSON.stringify(srcJSON);

	// First compute the buffer size
	var bufSize =
		4                  // Magic Bit
		+ 4                // SRC Version
		+ 4                // Header length
		+ JSONstr.length;  // JSON String

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
	router.get("src", "/:account/:project/:uid", function(req, res, params, err_callback) {
		// Get object based on UID, check whether or not it is a mesh
		// and then output the result.

		dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, req, function(callback) {
			dbInterface(req[C.REQ_REPO].logger).getObject(params.account, params.project, params.uid, null, null, true, {}, function(err, type, uid, fromStash, obj)
			{
				if(err.value) {
					return callback(err);
				}

				if (type === C.REPO_NODE_TYPE_MESH)
				{
					var tex_uuid = null;

					if ("tex_uuid" in params.query)
					{
						tex_uuid = params.query.tex_uuid;
					}

					render(params.project, obj, tex_uuid, false, params.subformat, req[C.REQ_REPO].logger, function(err, renderedObj) {
						if (err.value) {
							return callback(err);
						}

						callback(responseCodes.OK, renderedObj);
					});
				} else {
					callback(responseCodes.OBJECT_TYPE_NOT_SUPPORTED);
				}
			});
		}, err_callback);
	});

	router.get("src", "/:account/:project/revision/:rid/:sid", function(req, res, params, err_callback) {
		// Get object based on revision rid, and object shared_id sid. Check
		// whether or not it is a mesh and then output the result.

		dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, req, function(callback) {
			dbInterface(req[C.REQ_REPO].logger).getObject(params.account, params.project, null, params.rid, params.sid, true, {}, function(err, type, uid, fromStash, obj)
			{
				if(err.value) {
					return callback(err);
				}

				if (type === C.REPO_NODE_TYPE_MESH)
				{
					var tex_uuid = null;

					if ("tex_uuid" in params.query)
					{
						tex_uuid = params.query.tex_uuid;
					}

					render(params.project, obj, tex_uuid, false, params.subformat, req[C.REQ_REPO].logger, function(err, renderedObj) {
						if (err.value) {
							return err_callback(err);
						}

						callback(responseCodes.OK, renderedObj);
					});
				} else {
					callback(responseCodes.OBJECT_TYPE_NOT_SUPPORTED);
				}
			});
		}, err_callback);
	});
};


