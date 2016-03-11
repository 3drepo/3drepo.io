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

(function () {
	"use strict";

	var C = require("../constants.js");
	var repoNodeMesh = require("../repo/repoNodeMesh.js");
	var responseCodes = require("../response_codes.js");

	var utils = require("../utils.js");

	var dbInterface = require("../db/db_interface.js");

	function startSubMesh(mesh_id, subMeshArray, subMeshIDX, startVertIDX, startFaceIDX, useIDMap) {
		if (subMeshIDX > -1) // If there is a valid sub mesh ID
		{
			subMeshArray[subMeshIDX] = {};
			subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID] = mesh_id + "_" + subMeshIDX;

			subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM] = startVertIDX;
			subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM] = startFaceIDX;

			subMeshArray[subMeshIDX].reIndexMap = {};

			if (useIDMap) {
				subMeshArray[subMeshIDX].idMapBuf = [];
			}
		}
	}

	function finishSubMesh(subMeshArray, subMeshIDX, numVertices, numFaces, vertexPack, bbox, useIDMap) {
		if (subMeshIDX > -1) // If there is a valid sub mesh ID
		{
			subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_OFFSET] = 0;

			// Count of vertices
			subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_VERTICES_COUNT] = numVertices;
			subMeshArray[subMeshIDX].pack = vertexPack;
			subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_FACES_COUNT] = numFaces;

			// End vertex and triangle number
			subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO] =
				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM] + numVertices;
			subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO] =
				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM] + numFaces;

			// If we are using an ID Map the concatenate any built up ID Maps
			if (useIDMap) {
				subMeshArray[subMeshIDX].idMapBuf = Buffer.concat(subMeshArray[subMeshIDX].idMapBuf);
			}

			if (bbox) {
				var bboxMin = bbox[0];
				var bboxMax = bbox[1];
				var bboxCenter = [(bboxMin[0] + bboxMax[0]) / 2, (bboxMin[1] + bboxMax[1]) / 2, (bboxMin[2] + bboxMax[2]) / 2];
				var bboxSize = [(bboxMax[0] - bboxMin[0]), (bboxMax[1] - bboxMin[1]), (bboxMax[2] - bboxMin[2])];

				subMeshArray[subMeshIDX].bboxCenter = bboxCenter;
				subMeshArray[subMeshIDX].bboxSize = bboxSize;
			}
		}
	}

	function addIDMapArray(subMeshArray, subMeshIDX, vertexCount, runningIDX) {
		// Populate IDMap Buf
		var idMapArr = new Float32Array(vertexCount);
		idMapArr.fill(runningIDX);

		subMeshArray[subMeshIDX].idMapBuf.push(new Buffer(idMapArr.buffer));
	}

	// This function deals with a mesh that is in itself greater than the
	// vertex limit
	function splitLargeMesh(currentMesh, mesh, faceBuf, bufferPointer, subMeshArray, subMeshIDX, runningIDX, useIDMap, logger) {
		logger.logInfo("Splitting large meshes into smaller meshes");

		// Index from old vertex IDs to new ones
		var reindexMap = {};

		// The new vertex buffer will contain a list of
		var newVertices = [];

		var currentMeshVFrom = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM];
		var currentMeshVTo = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO];
		var currentMeshTFrom = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM];
		var currentMeshTTo = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO];

		var currentMeshNumVertices = currentMeshVTo - currentMeshVFrom;
		var currentMeshNumFaces = currentMeshTTo - currentMeshTFrom;

		var startedLargeMeshSplit = false;

		var totalVertexCount = 0;
		var totalFaceCount = 0;

		// Split mesh information
		var splitMeshVertexCount = 0;
		var splitMeshFaceCount = 0;
		var splitMeshBBox = [
			[],
			[]
		];

		var max_i = 0;

		// Perform quick and dirty splitting algorithm
		// Loop over all faces in the giant mesh
		for (var face_idx = 0; face_idx < currentMeshNumFaces; face_idx++) {

			// Get number of components in the next face
			var num_comp = mesh.faces.buffer.readInt32LE(bufferPointer);

			if (num_comp !== 3) {
				logger.logError("Non triangulated face with " + num_comp + " vertices.");
			} else {

				// If we haven't started yet, or the current number of vertices that we have
				// split is greater than the limit we need to start a new subMesh
				if (((splitMeshVertexCount + num_comp) > C.SRC_VERTEX_LIMIT) || !startedLargeMeshSplit) {
					// If we have started we must be here because we have created a split mesh
					// greater than the required number of vertices
					if (startedLargeMeshSplit) {
						if (useIDMap) {
							addIDMapArray(subMeshArray, subMeshIDX, splitMeshVertexCount, runningIDX);
						}

						finishSubMesh(subMeshArray, subMeshIDX, splitMeshVertexCount, splitMeshFaceCount, 0, splitMeshBBox, useIDMap);

						runningIDX++;
						subMeshIDX++;
					}

					startSubMesh(mesh.id, subMeshArray, subMeshIDX, totalVertexCount, totalFaceCount, useIDMap);

					totalVertexCount += splitMeshVertexCount;
					splitMeshVertexCount = 0;
					splitMeshFaceCount = 0;
					splitMeshBBox = [
						[],
						[]
					];
					reindexMap = {};
					max_i = 0;

					startedLargeMeshSplit = true;
				}

				// Re-index faces
				for (var vert_comp = 0; vert_comp < num_comp; vert_comp++) {
					// First int32 is number of sides (i.e. 3 = Triangle)]
					// After that there Int32 for each index (0..2)
					var byte_position = bufferPointer + (vert_comp + 1) * 4;
					var idx_val = mesh.faces.buffer.readInt32LE(byte_position);

					if (!reindexMap.hasOwnProperty(idx_val)) {
						reindexMap[idx_val] = splitMeshVertexCount;
						faceBuf.push(reindexMap[idx_val]);

						// Loop over all the vertex components and copy them
						for (var v_idx = 0; v_idx < 3; v_idx++) {
							var vertComp = mesh.vertices.buffer.readFloatLE(idx_val * 4 * 3 + v_idx * 4);

							if (v_idx >= splitMeshBBox[0].length) {
								splitMeshBBox[0][v_idx] = vertComp;
								splitMeshBBox[1][v_idx] = vertComp;
							} else {
								if (splitMeshBBox[0][v_idx] < vertComp) {
									splitMeshBBox[0][v_idx] = vertComp;
								}

								if (splitMeshBBox[1][v_idx] > vertComp) {
									splitMeshBBox[1][v_idx] = vertComp;
								}
							}

							newVertices.push(vertComp);
						}

						splitMeshVertexCount++;
					} else {
						faceBuf.push(reindexMap[idx_val]);
					}

					if (reindexMap[idx_val] > max_i) {
						max_i = reindexMap[idx_val];
					}
				}

				splitMeshFaceCount++;
			}

			bufferPointer += (num_comp + 1) * 4;
		}

		var newVerticesBuffer = new Buffer(new Float32Array(newVertices).buffer);
		newVerticesBuffer.copy(mesh.vertices.buffer, currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM] * 3 * 4);

		var vertexPack = currentMeshNumVertices - totalVertexCount - splitMeshVertexCount;

		if (useIDMap) {
			addIDMapArray(subMeshArray, subMeshArray.length - 1, splitMeshVertexCount, runningIDX);
		}

		finishSubMesh(subMeshArray, subMeshArray.length - 1, splitMeshVertexCount, splitMeshFaceCount, vertexPack, splitMeshBBox, useIDMap);

		return {
			bufferPointer: bufferPointer,
			subMeshIDX: subMeshIDX
		};
	}

	function performSplitting(mesh, subMeshArray, useIDMap, logger) {
		var subMeshIDX = -1;
		var finishedSubMesh = true;

		var subMeshVertexCount = 0;
		var subMeshFaceCount = 0;

		var totalVertexCount = 0;
		var totalFaceCount = 0;

		var faceBuf = [];
		var orig_idx_ptr = 0;

		var runningIDX = 0;

		var bbox = [
			[],
			[]
		];

		// Loop through all of the meshes in the multipart map
		for (var i = 0; i < mesh[C.REPO_NODE_LABEL_COMBINED_MAP].length; i++) {
			logger.logTrace("Running m_map #" + i);

			var currentMesh = mesh[C.REPO_NODE_LABEL_COMBINED_MAP][i];

			var currentMeshVFrom = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM];
			var currentMeshVTo = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO];
			var currentMeshTFrom = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM];
			var currentMeshTTo = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO];

			var currentMeshNumVertices = currentMeshVTo - currentMeshVFrom;
			var currentMeshNumFaces = currentMeshTTo - currentMeshTFrom;

			// If the current cumulative count of vertices is greater than the
			// vertex limit then start a new mesh.
			// If subMeshIDX === -1 we need to initialize the first mesh
			if (((subMeshVertexCount + currentMeshNumVertices) > C.SRC_VERTEX_LIMIT) || finishedSubMesh) {
				// Close off the previous sub mesh
				if (!finishedSubMesh) // Have we already finished this one
				{
					finishSubMesh(subMeshArray, subMeshIDX, subMeshVertexCount, subMeshFaceCount, 0, bbox, useIDMap);
				}

				// Reset the counters for the submesh vertex and face count
				// and begin a new sub mesh with a new ID
				subMeshVertexCount = 0;
				subMeshFaceCount = 0;
				subMeshIDX++;

				finishedSubMesh = false;

				startSubMesh(mesh.id, subMeshArray, subMeshIDX, totalVertexCount, totalFaceCount, useIDMap);
			}

			// Now we've started a new mesh is the mesh that we're trying to add greater than
			// the limit itself. In the case that it is, this will always flag as above.
			if (currentMeshNumVertices > C.SRC_VERTEX_LIMIT) {
				var largeSplitReturn = splitLargeMesh(currentMesh, mesh, faceBuf, orig_idx_ptr, subMeshArray, subMeshIDX, runningIDX, useIDMap, logger);

				subMeshIDX = largeSplitReturn.subMeshIDX;
				orig_idx_ptr = largeSplitReturn.bufferPointer;

				finishedSubMesh = true; // Indicate that we've need a new subMesh
			} else {
				logger.logTrace("Reindexing faces");

				for (var face_idx = 0; face_idx < currentMeshNumFaces; face_idx++) {
					var num_comp = mesh.faces.buffer.readInt32LE(orig_idx_ptr);

					if (num_comp !== 3) {
						logger.logError("Non triangulated face with " + num_comp + " vertices.");
					} else {
						for (var vert_comp = 0; vert_comp < num_comp; vert_comp++) {
							// First int32 is number of sides (i.e. 3 = Triangle)]
							// After that there Int32 for each index (0..2)
							var byte_position = orig_idx_ptr + (vert_comp + 1) * 4;
							var idx_val = mesh.faces.buffer.readInt32LE(byte_position);

							// Take currentMeshVFrom from Index Value to reset to zero start,
							// then add back in the current running total to append after
							// previous mesh.
							idx_val += (subMeshVertexCount - currentMeshVFrom);

							faceBuf.push(idx_val);
						}
					}

					orig_idx_ptr += (num_comp + 1) * 4;
				}

				if (useIDMap)
				{
					addIDMapArray(subMeshArray, subMeshIDX, currentMeshNumVertices, runningIDX);
				}

				runningIDX++;

				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO] = currentMeshVTo;
				subMeshArray[subMeshIDX][C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO] = currentMeshTTo;

				bbox = currentMesh[C.REPO_NODE_LABEL_BOUNDING_BOX];

				subMeshVertexCount += currentMeshNumVertices;
				subMeshFaceCount += currentMeshNumFaces;
			}
		}

		if (subMeshVertexCount) {
			finishSubMesh(subMeshArray, subMeshArray.length - 1, subMeshVertexCount, subMeshFaceCount, 0, bbox, useIDMap);
		}

		var newFaceBuffer = new Buffer(new Uint16Array(faceBuf).buffer);

		mesh.faces.buffer = newFaceBuffer;
	}

	/*******************************************************************************
	 * Render SRC format of a mesh
	 *
	 * @param {string} project - The name of the project containing the mesh
	 * @param {RepoGraphScene} - Render all meshes contained in RepoGraphScene object.
	 * @param {string} tex_uuid - A string representing the tex_uuid attached to the mesh
	 * @param {string} subformat - Subformat, currently for Multipart
	 * @param {Object} res - The http response object
	 *******************************************************************************/
	function render(project, scene, tex_uuid, subformat, logger, result_callback) {
		logger.logDebug("Passed " + scene[C.REPO_SCENE_LABEL_MESHES_COUNT]);

		var meshIDs = Object.keys(scene.meshes);
		console.log(meshIDs);
		var meshIDX = 0;
		var srcJSON = {};

		var idx = 0;

		// Positions where the mesh will eventually output
		var bufPos = 0;

		var dataBuffers = []; // Array of data buffers to concatenate at the end
		var idMapBuf = null;
		var needsIdMapBuf = true;

		// Create placeholders for JSON output
		srcJSON.accessors = {};
		srcJSON.accessors.indexViews = {};
		srcJSON.accessors.attributeViews = {};
		//srcJSON.meta					  = {};
		//srcJSON.meta.generator			  = "3DRepo";
		srcJSON.textureViews = {};
		srcJSON.textures = {};
		srcJSON.bufferViews = {};
		srcJSON.bufferChunks = {};

		// SRC Header
		srcJSON.meshes = {};
		//srcJSON.meta                      = {};
		//srcJSON.meta.idMaps               = {};

		for (idx = 0; idx < meshIDs.length; idx++) {
			meshID = meshIDs[idx];

			var mesh = scene.meshes[meshID]; // Current mesh object

			logger.logDebug("Processing mesh " + meshID);
			logger.logDebug("Mesh #Verts: " + mesh.vertices_count);
			logger.logDebug("Mesh #Faces: " + mesh.faces_count);

			var subMeshArray = [];
			var useIDMap = true;

			// Is this mesh composed of several other meshes (through optimization) ?
			if (!mesh[C.REPO_NODE_LABEL_COMBINED_MAP]) {
				// Submesh array consists of a single mesh (the entire thing)
				mesh[C.REPO_NODE_LABEL_COMBINED_MAP] = [];

				var fakeSubMesh = {};
				fakeSubMesh[C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID] = utils.stringToUUID(meshID);
				fakeSubMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM] = 0;
				fakeSubMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO] = mesh.vertices_count;
				fakeSubMesh[C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM] = 0;
				fakeSubMesh[C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO] = mesh.faces_count;
				fakeSubMesh[C.REPO_NODE_LABEL_VERTICES_COUNT] = mesh.vertices_count;
				fakeSubMesh[C.REPO_NODE_LABEL_FACES_COUNT] = mesh.faces_count;
				fakeSubMesh[C.REPO_NODE_LABEL_BOUNDING_BOX] = mesh.bounding_box;

				mesh[C.REPO_NODE_LABEL_COMBINED_MAP].push(fakeSubMesh);

				useIDMap = false;
			}

			// First sort the combined map in order of vertex ID
			mesh[C.REPO_NODE_LABEL_COMBINED_MAP].sort(repoNodeMesh.mergeMapSort);

			performSplitting(mesh, subMeshArray, useIDMap, logger);

			var vertexWritePosition = bufPos;
			if (mesh[C.REPO_NODE_LABEL_VERTICES]) {
				bufPos += mesh[C.REPO_NODE_LABEL_VERTICES].buffer.length;
			}

			var normalWritePosition = bufPos;
			if (mesh[C.REPO_NODE_LABEL_NORMALS]) {
				bufPos += mesh[C.REPO_NODE_LABEL_NORMALS].buffer.length;
			}

			var facesWritePosition = bufPos;
			if (mesh[C.REPO_NODE_LABEL_FACES]) {
				bufPos += mesh[C.REPO_NODE_LABEL_FACES].buffer.length;
			}

			var idMapWritePosition = bufPos;
			if (useIDMap && needsIdMapBuf) {
				bufPos += mesh.vertices_count * 4;
			}

			var uvWritePosition = bufPos;
			var numSubMeshes = subMeshArray.length;

			// Loop through a set of possible submeshes
			logger.logTrace("Looping through submeshes");
			for (var subMesh = 0; subMesh < numSubMeshes; subMesh++) {
				// ------------------------------------------------------------------------
				// In SRC each attribute has an associated attributeView.
				// Each attributeView has an associated bufferView
				// Each bufferView is composed of several chunks.
				// ------------------------------------------------------------------------

				logger.logTrace("Generating subMesh #" + subMesh);

				meshIDX = idx + "_" + subMesh;

				var positionAttributeView = "p" + meshIDX;
				var normalAttributeView = "n" + meshIDX;
				var uvAttributeView = "u" + meshIDX;
				var idMapAttributeView = "id" + meshIDX;
				var indexView = "i" + meshIDX;

				var positionBufferView = "pb" + meshIDX;
				var normalBufferView = "nb" + meshIDX;
				var uvBufferView = "ub" + meshIDX;
				var indexBufferView = "ib" + meshIDX;
				var idMapBufferView = "idb" + meshIDX;

				var positionBufferChunk = "pc" + meshIDX;
				var indexBufferChunk = "ic" + meshIDX;
				var normalBufferChunk = "nc" + meshIDX;
				var uvBufferChunk = "uc" + meshIDX;
				var idMapBufferChunk = "idc" + meshIDX;

				var meshID = subMeshArray[subMesh][C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID];

				// SRC Header for this mesh
				srcJSON.meshes[meshID] = {};
				srcJSON.meshes[meshID].attributes = {};

				// Extract and attach the bounding box
				/*
				var bbox = repoNodeMesh.extractBoundingBox(mesh);

				srcJSON.meshes[meshID].bboxCenter = bbox.center;
				srcJSON.meshes[meshID].bboxSize   = bbox.size;
				*/

				var subMeshVerticesCount = subMeshArray[subMesh][C.REPO_NODE_LABEL_VERTICES_COUNT];
				var subMeshVertexPack = subMeshArray[subMesh].pack;
				var subMeshFacesCount = subMeshArray[subMesh][C.REPO_NODE_LABEL_FACES_COUNT];

				// Vertices
				if (mesh[C.REPO_NODE_LABEL_VERTICES]) {
					srcJSON.accessors.attributeViews[positionAttributeView] = {};
					srcJSON.accessors.attributeViews[positionAttributeView].bufferView = positionBufferView;
					srcJSON.accessors.attributeViews[positionAttributeView].byteOffset = 0;
					srcJSON.accessors.attributeViews[positionAttributeView].byteStride = 12;
					srcJSON.accessors.attributeViews[positionAttributeView].componentType = C.X3DOM_SRC_FLOAT;
					srcJSON.accessors.attributeViews[positionAttributeView].type = "VEC3";
					srcJSON.accessors.attributeViews[positionAttributeView].count = subMeshVerticesCount;
					srcJSON.accessors.attributeViews[positionAttributeView].decodeOffset = [0, 0, 0];
					srcJSON.accessors.attributeViews[positionAttributeView].decodeScale = [1, 1, 1];

					srcJSON.bufferChunks[positionBufferChunk] = {};
					srcJSON.bufferChunks[positionBufferChunk].byteOffset = vertexWritePosition;
					srcJSON.bufferChunks[positionBufferChunk].byteLength = subMeshVerticesCount * 3 * 4;

					vertexWritePosition += (subMeshVerticesCount + subMeshVertexPack) * 3 * 4;

					srcJSON.bufferViews[positionBufferView] = {};
					srcJSON.bufferViews[positionBufferView].chunks = [positionBufferChunk];

					srcJSON.meshes[meshID].attributes.position = positionAttributeView;
				}

				// Normal Attribute View
				if (mesh[C.REPO_NODE_LABEL_NORMALS]) {
					srcJSON.accessors.attributeViews[normalAttributeView] = {};
					srcJSON.accessors.attributeViews[normalAttributeView].bufferView = normalBufferView;
					srcJSON.accessors.attributeViews[normalAttributeView].byteOffset = 0;
					srcJSON.accessors.attributeViews[normalAttributeView].byteStride = 12;
					srcJSON.accessors.attributeViews[normalAttributeView].componentType = C.X3DOM_SRC_FLOAT;
					srcJSON.accessors.attributeViews[normalAttributeView].type = "VEC3";
					srcJSON.accessors.attributeViews[normalAttributeView].count = subMeshVerticesCount;
					srcJSON.accessors.attributeViews[normalAttributeView].decodeOffset = [0, 0, 0];
					srcJSON.accessors.attributeViews[normalAttributeView].decodeScale = [1, 1, 1];

					srcJSON.meshes[meshID].attributes.normal = normalAttributeView;

					srcJSON.bufferChunks[normalBufferChunk] = {};
					srcJSON.bufferChunks[normalBufferChunk].byteOffset = normalWritePosition;
					srcJSON.bufferChunks[normalBufferChunk].byteLength = subMeshVerticesCount * 3 * 4;

					srcJSON.bufferViews[normalBufferView] = {};
					srcJSON.bufferViews[normalBufferView].chunks = [normalBufferChunk];

					normalWritePosition += srcJSON.bufferChunks[normalBufferChunk].byteLength;
				}

				// Index View
				if (mesh[C.REPO_NODE_LABEL_FACES]) {
					srcJSON.accessors.indexViews[indexView] = {};
					srcJSON.accessors.indexViews[indexView].bufferView = indexBufferView;
					srcJSON.accessors.indexViews[indexView].byteOffset = 0;
					srcJSON.accessors.indexViews[indexView].componentType = C.X3DOM_SRC_USHORT;

					srcJSON.bufferChunks[indexBufferChunk] = {};
					srcJSON.bufferChunks[indexBufferChunk].byteOffset = facesWritePosition;
					srcJSON.bufferChunks[indexBufferChunk].byteLength = subMeshFacesCount * 3 * 2;

					srcJSON.bufferViews[indexBufferView] = {};
					srcJSON.bufferViews[indexBufferView].chunks = [indexBufferChunk];

					srcJSON.meshes[meshID].indices = indexView;
					srcJSON.meshes[meshID].primitive = C.X3DOM_SRC_TRIANGLE;

					facesWritePosition += srcJSON.bufferChunks[indexBufferChunk].byteLength;

					srcJSON.accessors.indexViews[indexView].count = subMeshFacesCount * 3; // Face Indices
				}

				if (useIDMap && subMeshArray[subMesh].idMapBuf) {
					srcJSON.accessors.attributeViews[idMapAttributeView] = {};
					srcJSON.accessors.attributeViews[idMapAttributeView].bufferView = idMapBufferView;
					srcJSON.accessors.attributeViews[idMapAttributeView].byteOffset = 0;
					srcJSON.accessors.attributeViews[idMapAttributeView].byteStride = 4;
					srcJSON.accessors.attributeViews[idMapAttributeView].componentType = C.X3DOM_SRC_FLOAT;
					srcJSON.accessors.attributeViews[idMapAttributeView].type = "SCALAR";
					srcJSON.accessors.attributeViews[idMapAttributeView].count = subMeshVerticesCount;
					srcJSON.accessors.attributeViews[idMapAttributeView].decodeOffset = [0];
					srcJSON.accessors.attributeViews[idMapAttributeView].decodeScale = [1];

					srcJSON.meshes[meshID].attributes.id = idMapAttributeView;

					srcJSON.bufferChunks[idMapBufferChunk] = {};
					srcJSON.bufferChunks[idMapBufferChunk].byteOffset = idMapWritePosition;
					srcJSON.bufferChunks[idMapBufferChunk].byteLength = subMeshArray[subMesh].idMapBuf.length;

					srcJSON.bufferViews[idMapBufferView] = {};
					srcJSON.bufferViews[idMapBufferView].chunks = [idMapBufferChunk];

					idMapWritePosition += srcJSON.bufferChunks[idMapBufferChunk].byteLength;
				}

				// If there is a texture attached then place it in the SRC JSON
				// Here we define the binary data for the UV coordinates
				if (tex_uuid !== null) {
					// UV coordinates
					srcJSON.accessors.attributeViews[uvAttributeView] = {};
					srcJSON.accessors.attributeViews[uvAttributeView].bufferView = uvBufferView;
					srcJSON.accessors.attributeViews[uvAttributeView].byteOffset = 0;
					srcJSON.accessors.attributeViews[uvAttributeView].byteStride = 8;
					srcJSON.accessors.attributeViews[uvAttributeView].componentType = C.X3DOM_SRC_FLOAT;
					srcJSON.accessors.attributeViews[uvAttributeView].type = "VEC2";
					srcJSON.accessors.attributeViews[uvAttributeView].count = subMeshVerticesCount;
					srcJSON.accessors.attributeViews[uvAttributeView].decodeOffset = [0, 0];
					srcJSON.accessors.attributeViews[uvAttributeView].decodeScale = [1, 1];

					srcJSON.meshes[meshID].attributes.texcoord = uvAttributeView;

					srcJSON.bufferViews[uvBufferView] = {};
					srcJSON.bufferViews[uvBufferView].chunks = [uvBufferChunk];

					srcJSON.bufferChunks[uvBufferChunk] = {};
					srcJSON.bufferChunks[uvBufferChunk].byteOffset = uvWritePosition;
					srcJSON.bufferChunks[uvBufferChunk].byteLength = subMeshVerticesCount * 4 * 2;

					uvWritePosition += srcJSON.bufferChunks[uvBufferChunk].byteLength;
				}
			}

			logger.logTrace("Generating output buffer");

			if (useIDMap) {
				idMapBuf = new Buffer(0);

				for (var i = 0; i < subMeshArray.length; i++) {
					if (subMeshArray[i].idMapBuf) {
						idMapBuf = Buffer.concat([idMapBuf, subMeshArray[i].idMapBuf]);
					}
				}
			}

			var bufferSize =
				(mesh.vertices ? (mesh.vertices_count * 4 * 3) : 0) +
				(mesh.normals ? (mesh.vertices_count * 4 * 3) : 0) +
				(mesh.faces ? (mesh.faces_count * 3 * 2) : 0) +
				((useIDMap && idMapBuf) ? idMapBuf.length : 0) +
				((tex_uuid !== null) ? (mesh.vertices_count * 4 * 2) : 0);

			dataBuffers[idx] = new Buffer(bufferSize);

			bufPos = 0;

			// Output vertices
			if (mesh.vertices) {
				mesh.vertices.buffer.copy(dataBuffers[idx], bufPos);

				bufPos += mesh.vertices.buffer.length;
			}

			// Output normals
			if (mesh.normals) {
				mesh.normals.buffer.copy(dataBuffers[idx], bufPos);
				bufPos += mesh.normals.buffer.length;
			}

			// Output face indices
			if (mesh.faces) {
				mesh.faces.buffer.copy(dataBuffers[idx], bufPos);
				bufPos += mesh.faces.buffer.length;
			}

			if (useIDMap && idMapBuf) {
				idMapBuf.copy(dataBuffers[idx], bufPos);
				bufPos += idMapBuf.length;
			}

			// Output optional texture bits
			if (tex_uuid !== null) {

				mesh.uv_channels.buffer.copy(dataBuffers[idx], bufPos);
				bufPos += mesh.uv_channels.buffer.length;
			}
		}

		// Generate header string
		var JSONstr = JSON.stringify(srcJSON);

		// First compute the buffer size
		var bufSize =
			4 + // Magic Bit
			4 + // SRC Version
			4 + // Header length
			JSONstr.length; // JSON String

		var headerBuffer = new Buffer(bufSize); // Buffer containing SRC header info
		bufPos = 0;

		// Magic bit to identify type of file
		headerBuffer.writeUInt32LE(23, bufPos);
		bufPos += 4;

		// SRC Version
		headerBuffer.writeUInt32LE(42, bufPos);
		bufPos += 4;

		// Header length
		headerBuffer.writeUInt32LE(JSONstr.length, bufPos);
		bufPos += 4;

		// Output the header string
		headerBuffer.write(JSONstr, bufPos);
		bufPos += JSONstr.length;

		var dataBuffer = Buffer.concat(dataBuffers);
		var fullBuffer = Buffer.concat([headerBuffer, dataBuffer]);

		result_callback && result_callback(responseCodes.OK, fullBuffer);

		return fullBuffer;
	}

	exports.render = render;
	// Set up REST routing calls
	exports.route = function (router) {
		// router.get("src", "/:account/:project/:uid", function (req, res, params, err_callback) {
		// 	// Get object based on UID, check whether or not it is a mesh
		// 	// and then output the result.

		// 	dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, req.url, req.params[C.REPO_REST_API_FORMAT].toLowerCase(), function (callback) {
		// 		dbInterface(req[C.REQ_REPO].logger).getObject(params.account, params.project, params.uid, null, null, true, {}, function (err, type, uid, fromStash, obj) {
		// 			//console.log('sorry, no cache')
		// 			if (err.value) {
		// 				return callback(err);
		// 			}

		// 			if (type === C.REPO_NODE_TYPE_MESH) {
		// 				var tex_uuid = null;

		// 				if ("tex_uuid" in params.query) {
		// 					tex_uuid = params.query.tex_uuid;
		// 				}
				
		// 				render(params.project, obj, tex_uuid, params.subformat, req[C.REQ_REPO].logger, function (err, renderedObj) {
		// 					if (err.value) {
		// 						return callback(err);
		// 					}
		// 					//console.log('renderedObj', renderedObj);
		// 					callback(responseCodes.OK, renderedObj);
		// 				});
		// 			} else {
		// 				callback(responseCodes.OBJECT_TYPE_NOT_SUPPORTED);
		// 			}
		// 		});
		// 	}, err_callback);
		// });

		// router.get("src", "/:account/:project/revision/:rid/:sid", function (req, res, params, err_callback) {
		// 	// Get object based on revision rid, and object shared_id sid. Check
		// 	// whether or not it is a mesh and then output the result.

		// 	dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, req.url, req.params[C.REPO_REST_API_FORMAT].toLowerCase(), function (callback) {
		// 		dbInterface(req[C.REQ_REPO].logger).getObject(params.account, params.project, null, params.rid, params.sid, true, {}, function (err, type, uid, fromStash, obj) {
		// 			if (err.value) {
		// 				return callback(err);
		// 			}

		// 			if (type === C.REPO_NODE_TYPE_MESH) {
		// 				var tex_uuid = null;

		// 				if ("tex_uuid" in params.query) {
		// 					tex_uuid = params.query.tex_uuid;
		// 				}

		// 				render(params.project, obj, tex_uuid, params.subformat, req[C.REQ_REPO].logger, function (err, renderedObj) {
		// 					if (err.value) {
		// 						return err_callback(err);
		// 					}

		// 					callback(responseCodes.OK, renderedObj);
		// 				});
		// 			} else {
		// 				callback(responseCodes.OBJECT_TYPE_NOT_SUPPORTED);
		// 			}
		// 		});
		// 	}, err_callback);
		// });
	};

}());
