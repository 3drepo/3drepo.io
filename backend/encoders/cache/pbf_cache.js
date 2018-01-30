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

// var constants    = require('../constants.js');
let logIface     = require("../../logger.js");
let logger       = logIface.logger;
let repoNodeMesh = require("../../repo/repoNodeMesh.js");
// var pbf_levels   = 10;

function PBFCache() {
	"use strict";
	
	this.pbfCache = {};

	this.genPopCache = function(mesh) {

		if (!(mesh.id in pbfCache)) {
			let bbox             = repoNodeMesh.extractBoundingBox(mesh);
			let valid_tri        = new Array(mesh.faces_count);
			let vertex_map       = new Array(mesh.vertices_count);
			let vertex_quant_idx = new Array(mesh.vertices_count);
			let vertex_quant     = new Array(mesh.vertices_count);

			let new_vertex_id = 0;

			let vertex_values = new Array(mesh.vertices_count);
			let tri           = new Array(mesh.faces_count);
			let normal_values = new Array(mesh.vertices_count);
			let tex_coords    = new Array(mesh.vertices_count);

			let vertNum  = 0;
			let vertIdx  = 0;
			let comp_idx = 0;

			let has_tex = false;

			if ("uv_channels" in mesh) {
				if (mesh[C.REPO_NODE_LABEL_UV_CHANNELS_COUNT] === 2) {
					logging.log("error", "Only support two channels texture coordinates");
					return null;
				} else {
					has_tex = true;
				}
			}

			let minTexcoordU = 0;
			let maxTexcoordu = 0;
			let minTexcoordV = 0;
			let maxTexcoordV = 0;

			for (vertNum = 0; vertNum < mesh.vertices_count; vertNum++) {
				vertex_map[vertNum] = -1;

				vertex_values[vertNum] = [];
				normal_values[vertNum] = [];
				tex_coords[vertNum] = [];

				for (comp_idx = 0; comp_idx < 3; comp_idx++) {
					vertex_values[vertNum][comp_idx] = mesh.vertices.buffer.readFloatLE(12 * vertNum + 4 * comp_idx);
					normal_values[vertNum][comp_idx] = mesh.normals.buffer.readFloatLE(12 * vertNum + 4 * comp_idx);
				}

				if (has_tex) {
					for (comp_idx = 0; comp_idx < 2; comp_idx++) {
						tex_coords[vertNum][comp_idx] = mesh.uv_channels.buffer.readFloatLE(8 * vertNum + 4 * comp_idx);

						if (comp_idx === 0) {
							if (vertNum === 0) {
								minTexcoordU = tex_coords[vertNum][comp_idx];
								maxTexcoordu = tex_coords[vertNum][comp_idx];
							} else {
								if (tex_coords[vertNum][comp_idx] < minTexcoordU) { minTexcoordU = tex_coords[vertNum][comp_idx]; }
								if (tex_coords[vertNum][comp_idx] > maxTexcoordu) { maxTexcoordu = tex_coords[vertNum][comp_idx]; }
							}
						}

						if (comp_idx === 1) {
							if (vertNum === 0) {
								minTexcoordV = tex_coords[vertNum][comp_idx];
								maxTexcoordV = tex_coords[vertNum][comp_idx];
							} else {
								if (tex_coords[vertNum][comp_idx] < minTexcoordV) { minTexcoordV = tex_coords[vertNum][comp_idx]; }
								if (tex_coords[vertNum][comp_idx] > maxTexcoordV) { maxTexcoordV = tex_coords[vertNum][comp_idx]; }
							}
						}
					}
				}
			}

			for (var tri_num = 0; tri_num < mesh.faces_count; tri_num++) {
				valid_tri[tri_num] = false;

				tri[tri_num] = [];

				for (vertIdx = 0; vertIdx < 3; vertIdx++) {
					tri[tri_num][vertIdx] = mesh.faces.buffer.readInt32LE(16 * tri_num + 4 * (vertIdx + 1));
				}
			}

			pbfCache[mesh.id] = {};

			let lod = 0;
			let buf_offset = 0;

			let added_verts = 0;
			let prev_added_verts = 0;
			let max_bits = 16;
			let max_quant = Math.pow(2, max_bits) - 1;

			let stride = has_tex ? 16 : 12;
			pbfCache[mesh.id].stride = stride;

			pbfCache[mesh.id].minTexcoordU = minTexcoordU;
			pbfCache[mesh.id].maxTexcoordu = maxTexcoordu;
			pbfCache[mesh.id].minTexcoordV = minTexcoordV;
			pbfCache[mesh.id].maxTexcoordV = maxTexcoordV;

			if (has_tex) { pbfCache[mesh.id].has_tex = has_tex; }

			while ((new_vertex_id < mesh.vertices_count) && (lod < 16)) {
				logger.log("debug", "Mesh " + mesh.id + " - Generating LOD " + lod);
				let idxBuf = new Buffer.alloc(2 * 3 * mesh.faces_count);
				let vertBuf = new Buffer.alloc(stride * mesh.vertices_count);

				let vertBufPtr = 0;
				let idxBufPtr = 0;
				let dim = Math.pow(2, (max_bits - lod));

				// For all non mapped vertices compute quantization
				for (vertNum = 0; vertNum < mesh.vertices_count; vertNum++) {
					if (vertex_map[vertNum] === -1) {
						let vert_x_normal = Math.floor(((vertex_values[vertNum][0] - bbox.min[0]) / bbox.size[0]) * max_quant + 0.5);
						let vert_y_normal = Math.floor(((vertex_values[vertNum][1] - bbox.min[1]) / bbox.size[1]) * max_quant + 0.5);
						let vert_z_normal = Math.floor(((vertex_values[vertNum][2] - bbox.min[2]) / bbox.size[2]) * max_quant + 0.5);

						let vert_x = Math.floor(vert_x_normal / dim) * dim;
						let vert_y = Math.floor(vert_y_normal / dim) * dim;
						let vert_z = Math.floor(vert_z_normal / dim) * dim;

						let quant_idx = vert_x + vert_y * dim + vert_z * dim * dim;

						vertex_quant_idx[vertNum] = quant_idx;
						vertex_quant[vertNum] = [vert_x_normal, vert_y_normal, vert_z_normal];
					}
				}

				let num_indices = 0;

				for (tri_num = 0; tri_num < mesh.faces_count; tri_num++) {
					if (!valid_tri[tri_num]) {
						let quant_map = [-1, -1, -1];

						let is_valid = true;

						for (vertIdx = 0; vertIdx < 3; vertIdx++) {
							let curr_quant = vertex_quant_idx[tri[tri_num][vertIdx]];

							if (curr_quant in quant_map) {
								is_valid = false;
								break;
							} else {
								quant_map[vertIdx] = curr_quant;
							}
						}

						if (is_valid) {
							valid_tri[tri_num] = true;

							for (vertIdx = 0; vertIdx < 3; vertIdx++) {
								vertNum = tri[tri_num][vertIdx];

								if (vertex_map[vertNum] === -1) {

									// Store quantized coordinates
									for (comp_idx = 0; comp_idx < 3; comp_idx++) {
										vertBuf.writeUInt16LE(vertex_quant[vertNum][comp_idx], vertBufPtr);
										vertBufPtr += 2;
									}

									// Padding to align with 4 bytes
									vertBuf.writeUInt16LE(0, vertBufPtr);
									vertBufPtr += 2;

									// Write normals in 8-bit
									for (comp_idx = 0; comp_idx < 3; comp_idx++) {
										let comp = Math.floor((normal_values[vertNum][comp_idx] + 1) * 127 + 0.5);
										if (isNaN(comp)) { comp = 0; }

										vertBuf.writeUInt8(comp, vertBufPtr);
										vertBufPtr++;
									}

									// Padding to align with 4 bytes
									vertBuf.writeUInt8(0, vertBufPtr);
									vertBufPtr++;

									if (has_tex) {
										for (comp_idx = 0; comp_idx < 2; comp_idx++) {
											let wrap_tex = tex_coords[vertNum][comp_idx];

											if (comp_idx === 0) { 
												wrap_tex = (wrap_tex - minTexcoordU) / (maxTexcoordu - minTexcoordU); 
											} else {
												wrap_tex = (wrap_tex - minTexcoordV) / (maxTexcoordV - minTexcoordV);
											}

											if (isNaN(wrap_tex)) { wrap_tex = 0; }

											let comp = Math.floor((wrap_tex * 65535) + 0.5);

											vertBuf.writeUInt16LE(comp, vertBufPtr);
											vertBufPtr += 2;
										}
									}

									vertex_map[vertNum] = new_vertex_id;
									new_vertex_id += 1;
									added_verts += 1;
								}
							}

							for (vertIdx = 0; vertIdx < 3; vertIdx++) {
								vertNum = tri[tri_num][vertIdx];

								idxBuf.writeUInt16LE(vertex_map[vertNum], idxBufPtr);
								idxBufPtr += 2;
							}

							num_indices += 3;
						}
					}
				}

				pbfCache[mesh.id][lod]                = {};
				pbfCache[mesh.id][lod].numIdx         = num_indices;
				pbfCache[mesh.id][lod].idxBuf         = idxBuf.slice(0, idxBufPtr);
				pbfCache[mesh.id][lod].vertBuf        = vertBuf.slice(0, vertBufPtr);
				pbfCache[mesh.id][lod].vertBufOffset  = buf_offset;
				pbfCache[mesh.id][lod].numVertices    = prev_added_verts;
				prev_added_verts                         = added_verts;
				buf_offset                              += pbfCache[mesh.id][lod].vertBuf.length;

				lod += 1;

			}

			pbfCache[mesh.id].num_levels = lod;
			logger.log("debug", "#LEVELS : " + pbfCache[mesh.id].num_levels);
		}
	};

	this.getDBCache = function(dbInterface, project, meshId, getData, level, callback)
	{
		dbInterface.getCache(project, meshId, getData, level, function(err, coll) {
			if (err) { return callback(err); }
 
			let max_lod = 0;

			for (let idx = 0; idx < coll.length; idx++) {

				let cache_obj = coll[idx];
				if (cache_obj.type === "PopGeometry") {
					if ("stride" in cache_obj) { pbfCache[meshId].stride = cache_obj.stride; }

					if ("min_texcoordu" in cache_obj) {
						pbfCache[meshId].minTexcoordU = cache_obj.min_texcoordu;
						pbfCache[meshId].maxTexcoordu = cache_obj.max_texcoordu;
						pbfCache[meshId].minTexcoordV = cache_obj.min_texcoordv;
						pbfCache[meshId].maxTexcoordV = cache_obj.max_texcoordv;
						pbfCache[meshId].has_tex      = true;
					}
				} else if (cache_obj.type === "PopGeometryLevel") {
					let lod                                    = cache_obj.level;
					pbfCache[meshId][lod]               = {};
					pbfCache[meshId][lod].numIdx        = cache_obj.num_idx;
					pbfCache[meshId][lod].vertBufOffset = cache_obj.vert_buf_offset;
					pbfCache[meshId][lod].numVertices   = cache_obj.num_vertices;

					pbfCache[meshId][lod].has_data      = get_data;

					if (get_data) {
						pbfCache[meshId][lod].idxBuf  = cache_obj.idx_buf;
						pbfCache[meshId][lod].vertBuf = cache_obj.vert_buf;
					}

					if (lod > max_lod) { max_lod = lod; }
				}
			}

			if (!level) {
				pbfCache[meshId].num_levels = max_lod + 1;
			}

			callback(null, pbfCache[meshId]);
		});
	};

	this.getPopCache = function(dbInterface, project, getData, level, meshId, callback) {
		let alreadyHave = true;

		if (meshId in pbfCache) {
			// TODO: Lazy, if a level is not passed in when getting data
			// should only get necessary levels, rather than everything again.
			if (!level && getData)
			{
				alreadyHave = false;
				}
			else if (level) {
				if (!(level in pbfCache[meshId])) { 
					alreadyHave = false; 
				} else {
					alreadyHave = (pbfCache[meshId][level].has_data === getData);
				}
			}

			// Do we have an empty object
			if (!Object.keys(pbfCache[meshId]).length) {
				alreadyHave = false;
			}

		} else {
			pbfCache[meshId] = {};

			// If we don't have the skeleton, load the skeleton
			if (level)
			{
				getPopCache(dbInterface, project, false, null, meshId, function(err, cacheObj) {
					if(err) {
						return callback(err);
					}

					return callback(null, cacheObj);
				});
			}

			alreadyHave = false;
		}

		if (!alreadyHave) {
			getDBCache(dbInterface, project, meshId, getData, level, function(err, cacheObj) {
				if(err) { return callback(err); }

				return callback(null, cacheObj);
			});
		} else {
			return callback(null, pbfCache[meshId]);
		}
	};
}

module.exports = PBFCache;
