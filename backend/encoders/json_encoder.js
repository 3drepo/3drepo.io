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
var repoGraphScene = require("../repo/repoGraphScene.js");
var async = require("async");
var search = require("./helper/search.js").search;
var log_iface = require("../logger.js");
var logger = log_iface.logger;
var C = require("../constants.js");
var repoNodeMesh = require("../repo/repoNodeMesh.js");

var _ = require("underscore");
var dbInterface = require("../db/db_interface.js");

var uuid = require("node-uuid");
var utils = require("../utils.js");

var responseCodes = require("../response_codes.js");


exports.route = function(router)
{


	router.get("json", "/:account/:project/revision/:rid/meta/:sid", function(req, res, params, err_callback) {
		var account		= params.account;
		var project		= params.project;

		var rid			= params.rid;

		var sid			= params.sid;

		dbInterface(req[C.REQ_REPO].logger).getMetadata(account, project, null, rid, sid, null, function (err, metadocs) {
			if (err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, {"meta" : metadocs});
		});
	});

	router.get("json", "/:account/:project/revision/:branch/head/meta/:sid", function(req, res, params, err_callback) {
		var account		= params.account;
		var project		= params.project;

		var	branch		= params.branch;

		var sid			= params.sid;

		dbInterface(req[C.REQ_REPO].logger).getMetadata(account, project, branch, null, sid, null, function (err, metadocs) {
			if (err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, {"meta" : metadocs});
		});
	});


	router.get("json", "/:account/:project/meta/:uid", function(req, res, params, err_callback) {
		var account		= params.account;
		var project		= params.project;

		var	branch		= params.branch;

		var uid			= params.uid;

		dbInterface(req[C.REQ_REPO].logger).getMetadata(account, project, null, null, null, uid, function (err, metadocs) {
			if (err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, {"meta" : metadocs});
		});
	});



	router.get("json", "/:account/:project/revision/:branch/head/:sid", function(req, res, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getHeadUUID(params.account, params.project, params.branch, function (err, uuid)
		{
			if (err.value)
			{
				return err_callback(err);
			}

			dbInterface(req[C.REQ_REPO].logger).getObject(params.account, params.project, null, utils.uuidToString(uuid.uuid), params.sid, true, {}, function (err, type, uid, obj) {
				if (err.value)
					err_callback(err);
				else
					err_callback(responseCodes.OK, obj);

			})
		});
	});


	router.get("json", "/:account/:project/:uid", function (req, res, params, err_callback) {
		if (params.subformat == "mpc") {
			dbInterface(req[C.REQ_REPO].logger).cacheFunction(params.account, params.project, req.url, "json_mpc", function (callback) {
				dbInterface(req[C.REQ_REPO].logger).getObject(params.account, params.project, params.uid, null, null, true, {}, function (err, type, uid, fromStash, scene) {
					if (err.value) {
						return callback(err);
					}

					if (type == "mesh") {
						var mesh = scene.meshes[params.uid];
						var meshCounter = 0;
						var vertsCount = 0;
						var bufferPosition = 0;

						if (mesh) {
							if (mesh[C.REPO_NODE_LABEL_COMBINED_MAP]) {
								// First sort the combined map in order of vertex ID
								mesh[C.REPO_NODE_LABEL_COMBINED_MAP].sort(repoNodeMesh.mergeMapSort);

								var subMeshes = mesh[C.REPO_NODE_LABEL_COMBINED_MAP];
								var subMeshKeys = mesh[C.REPO_NODE_LABEL_COMBINED_MAP].map(function (item) {
									return item[C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID]
								});

								var outJSON = {};

								outJSON["numberOfIDs"] = subMeshKeys.length;
								outJSON["maxGeoCount"] = subMeshKeys.length;

								dbInterface(req[C.REQ_REPO].logger).getChildrenByUID(params.account, params.project, params.uid, false, function (err, docs) {
									if (err.value) {
										return err_callback(err);
									}

									var children = repoGraphScene(req[C.REQ_REPO].logger).decode(docs);

									outJSON["appearance"] = [];

									if (children.materials_count) {
										for (var i = 0; i < children.materials_count; i++) {
											var childID = Object.keys(children.materials)[i];
											var child = children.materials[childID];

											var app = {};
											app["name"] = childID;

											var material = {};

											if ("diffuse" in child) {
												material["diffuseColor"] = child["diffuse"].join(" ");
											}

											if ("emissive" in child) {
												material["emissiveColor"] = child["emissive"].join(" ");
											}

											if ("shininess" in child) {
												material["shininess"] = child["shininess"];
											}

											if ("specular" in child) {
												material["specularColor"] = child["specular"].join(" ");
											}

											if ("opacity" in child) {
												material["transparency"] = 1.0 - child["opacity"];
											}

											app["material"] = material;

											outJSON["appearance"].push(app);
										}
									}

									var bbox = repoNodeMesh.extractBoundingBox(mesh);
									outJSON["mapping"] = [];

									for (var i = 0; i < subMeshKeys.length; i++) {
										var map = {};

										var currentMesh = mesh[C.REPO_NODE_LABEL_COMBINED_MAP][i];
										var currentMeshVFrom = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM];
										var currentMeshVTo = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_TO];
										var numVertices = currentMeshVTo - currentMeshVFrom;

										var currentMeshTFrom = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_FROM];
										var currentMeshTTo = currentMesh[C.REPO_NODE_LABEL_MERGE_MAP_TRIANGLE_TO];
										var numFaces = currentMeshTTo - currentMeshTFrom;

										vertsCount += numVertices;

										// If the number of vertices for this mesh is
										// in itself greater than the limit
										if (numVertices > C.SRC_VERTEX_LIMIT) {
											vertsCount = 0;

											var numActualVertices = 0;
											var reindexMap = {};

											for (var face_idx = 0; face_idx < numFaces; face_idx++) {
												// Get number of components in the next face
												var num_comp = mesh.faces.buffer.readInt32LE(bufferPosition);

												if (num_comp !== 3) {
													logger.logError("Non triangulated face with " + num_comp + " vertices.");
												} else {
													// Re-index faces
													for (var vert_comp = 0; vert_comp < num_comp; vert_comp++) {
														// First int32 is number of sides (i.e. 3 = Triangle)]
														// After that there Int32 for each index (0..2)
														var byte_position = bufferPosition + (vert_comp + 1) * 4;
														var idx_val = mesh.faces.buffer.readInt32LE(byte_position);

														if (!reindexMap.hasOwnProperty(idx_val)) {
															reindexMap[idx_val] = true;
															numActualVertices++;
														}
													}
												}

												bufferPosition += (num_comp + 1) * 4;
											}

										// We need to split the mesh into this many sub-meshes
										var numMeshesRequired = Math.ceil(numActualVertices / C.SRC_VERTEX_LIMIT);

										// Add an entry for all the created meshes
										for (var j = 0; j < numMeshesRequired; j++) {
											meshCounter += 1;

											map["name"] = utils.uuidToString(subMeshKeys[i]) + "_" + j;
											map["appearance"] = utils.uuidToString(subMeshes[i]["mat_id"]);
											map["min"] = subMeshes[i][C.REPO_NODE_LABEL_BOUNDING_BOX][0].join(" ");
											map["max"] = subMeshes[i][C.REPO_NODE_LABEL_BOUNDING_BOX][1].join(" ");
											map["usage"] = [params.uid + "_" + meshCounter]


											outJSON["mapping"].push(map);
											map = {};
										}

										meshCounter += 1;
									} else {
										// If this mesh pushes the combined mesh over the vertex limit
										// then start a new supermesh
										if (vertsCount > C.SRC_VERTEX_LIMIT) {
											meshCounter += 1;		  // Supermesh counter
											vertsCount = numVertices; // New supermesh has this many vertices in
										}

										map["name"] = utils.uuidToString(subMeshKeys[i]);
										map["appearance"] = utils.uuidToString(subMeshes[i]["mat_id"]);
										map["min"] = subMeshes[i][C.REPO_NODE_LABEL_BOUNDING_BOX][0].join(" ");
										map["max"] = subMeshes[i][C.REPO_NODE_LABEL_BOUNDING_BOX][1].join(" ");
										map["usage"] = [params.uid + "_" + meshCounter]

										outJSON["mapping"].push(map);

										bufferPosition += numFaces * 4 * 4;
										}
									}

									return callback(responseCodes.OK, JSON.stringify(outJSON));
								});
							}
						} else {
							return callback(responseCodes.OBJECT_NOT_FOUND);
						}
					}
				});
			}, err_callback);
		} else {
			err_callback(responseCodes.FORMAT_NOT_SUPPORTED);
		}
	});



};


