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
var repoGraphScene = require("../repoGraphScene.js");
var async = require("async");
var search = require("./helper/search.js").search;
var log_iface = require("../logger.js");
var logger = log_iface.logger;
var C = require("../constants.js");
var repoNodeMesh = require("../repoNodeMesh.js");

var _ = require("underscore");
var dbInterface = require("../db_interface.js");

var uuid = require("node-uuid");
var utils = require("../utils.js");

var responseCodes = require("../response_codes.js");

// Credit goes to http://stackoverflow.com/questions/1787322/htmlspecialchars-equivalent-in-javascript
function escapeHtml(text) {
	"use strict";

  var map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&quot;",
    "\"": "&#039;"
  };

  return text.replace(/[&<>""]/g, function(m) { return map[m]; });
}


/*******************************************************************************
 * Append Metadata to child
 *
 * @param {Object} dbInterface - Database module from db_interface.js
 * @param {string} project - name of project containing child
 * @param {JSON} childNode - Child node JSON
 *******************************************************************************/
function treeChildMetadata(dbInterface, dbName, project, sharedId, callback)
{
	dbInterface.getMetadata(dbName, project, sharedId, function(err, meta) {
		childNode["meta"] = meta;

		callback(null, childNode);
	});
}

/*******************************************************************************
 * Process child node and convert to tree node for display
 *
 * @param {JSON} child - JSON containing child information
 * @param {string} project - name of project containing child
 * @param {boolean} selected - Is the parent currently selected ?
 * @param {string} namespace - X3DOM Namespace in which the node exists
 * @param {boolean} htmlMode - In this mode HTML characters are escaped
 *******************************************************************************/
function processChild(child, branch, revision, account, project, selected, namespace, htmlMode)
{
	var childNode = {};

	// If a child is a ref then add project information to allow loading
	// of information from a different database , otherwise if
	// a mesh or a group (transformation) then add it as a normal node.
	if ((child["type"] == "mesh") || (child["type"] == "transformation") || child["type"] == "map")
	{
		var uuid      = utils.uuidToString(child["_id"]);
		var shared_id = utils.uuidToString(child["shared_id"]);
		var name      = "";

		if("name" in child)
			name = child["name"];
		else
			name = uuid;

		childNode["key"]       = shared_id;
		childNode["title"]     = htmlMode ? escapeHtml(name) : name;
		childNode["uuid"]      = uuid;
		childNode["folder"]    = ("children" in child);
		childNode["lazy"]      = true;
		childNode["selected"]  = (selected == "true");
		childNode["namespace"] = namespace;
		childNode["dbname"]    = project;
		childNode["branch"]    = branch;   // TODO: Find better way rather than duplicating
		childNode["revision"]  = revision;

	} else if (child["type"] == "ref") {

		childNode["account"]   = account;
		childNode["project"]   = child["project"];
		childNode["title"]     = htmlMode ? escapeHtml(child["project"]) : child["project"];

		// FIXME: Currently only federation within the same account is supported
		// Otherwise, account needs to be on the child
		childNode["namespace"] = account + "__" + child["project"] + "__";
		childNode["uuid"]      = uuid;
		childNode["folder"]    = true;
		childNode["lazy"]      = true;
		childNode["selected"]  = (selected == "true");
		childNode["dbname"]    = child["project"];
		childNode["branch"]    = branch;   // TODO: Find better way rather than duplicating
		childNode["revision"]  = revision;
		childNode["key"]       = utils.uuidToString(child["shared_id"]);
	}

	return childNode;
}

function getMultiMap(dbInterface, account, project, branch, revision, err_callback)
{
	"use strict";

	dbInterface.getScene(account, project, branch, revision, full, function(err, doc) {
		err_callback(responseCode.OK, null);
	});
}

function getTree(dbInterface, account, project, branch, revision, sid, namespace, selected, htmlMode, err_callback)
{
	"use strict";

	if (sid === "root")
	{
		dbInterface.getRootNode(account, project, branch, revision, false, function(err, dbObj) {
			if(err.value) {
				return err_callback(err);
			}

			var doc = repoGraphScene(dbInterface.logger).decode([dbObj]);

			var head = [{}];
			var node = doc["mRootNode"];

			if (!node) {
				return err_callback(responseCodes.ROOT_NODE_NOT_FOUND);
			}

			head[0]["title"]     = project;
			head[0]["key"]       = htmlMode ? escapeHtml(utils.uuidToString(node["shared_id"])) : utils.uuidToString(node["shared_id"]);
			head[0]["folder"]    = true;
			head[0]["lazy"]      = true;
			head[0]["selected"]  = true;
			head[0]["uuid"]      = node["id"];
			head[0]["namespace"] = ((namespace != null) ? namespace : "model__");
			head[0]["dbname"]    = project;
			head[0]["branch"]    = branch;
			head[0]["revision"]  = revision;

			if (!("children" in node))
				head[0]["children"] = [];

			err_callback(responseCodes.OK, head);
		});
	} else {
		dbInterface.getChildren(account, project, branch, revision, sid, function(err, doc) {
			if(err.value) return err_callback(err);

			async.map(doc,
				function(child, callback) { // Called for all children
					callback(null, processChild(child, branch, revision, account, project, selected, namespace, htmlMode));
				},
				function(err, children) { // Called when are children are ready
						if(err)
							err_callback(responseCodes.EXTERNAL_ERROR(err));
						else
							err_callback(responseCodes.OK, children);
				}
			);
		});
	}
};

function getFullTreeRecurse(sceneGraph, current, json) {
	var currentSID = current;

	if (current[C.REPO_NODE_LABEL_CHILDREN])
	{
		for(var i = 0; i < current[C.REPO_NODE_LABEL_CHILDREN].length; i++)
		{
			var childID = uuidToString(current[C.REPO_NODE_LABEL_CHILDREN][i]["shared_id"]);
			var child = sceneGraph.all[childID];

			var childJSON = {
				"name"      : child[C.REPO_NODE_LABEL_NAME],
				"_id"       : childID,
				"shared_id" : uuidToString(child[C.REPO_NODE_LABEL_SHARED_ID]),
				"children"  : []
			};

			json["children"].push(_.clone(childJSON));

			getFullTreeRecurse(sceneGraph, child, childJSON);
		}
	}
};

function getFullTree(dbInterface, account, project, branch, revision, callback) {
	dbInterface.getUnoptimizedScene(account, project, branch, revision, false, function(err, sceneGraph) {
		if (err.value) return callback(err);

		var root       = sceneGraph["mRootNode"];

		if (!root)
			return callback(responseCodes.ROOT_NODE_NOT_FOUND);

		var json       = {
			"name" :root[C.REPO_NODE_LABEL_NAME],
			"_id"  : uuidToString(root[C.REPO_NODE_LABEL_ID]),
			"shared_id" : uuidToString(root[C.REPO_NODE_LABEL_SHARED_ID]),
			"children" : []
		};

		getFullTreeRecurse(sceneGraph, root, json);

		callback(responseCodes.OK, json);
	});
};

function walkthrough(dbInterface, account, index, callback) {

    dbInterface.searchTree(account, project, index, function(err, data) {
        if (err.value) {
            return callback(err);
        }
        callback(responseCodes.OK, data);
    });
}

exports.route = function(router)
{
	router.get("json", "/search", function(res, req, params, err_callback) {
		search(dbInterface(req[C.REQ_REPO].logger), params.query, function(err, json)
		{
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, json);
		});
	});

	router.get("json", "/:account", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getUserInfo(params.account, function(err, user)
		{
			if(err.value) {
				err_callback(err);
			} else {
				if(user)
				{
					user.username = params.account;
					err_callback(responseCodes.OK, user);
				}
				else
					err_callback(responseCodes.USER_NOT_FOUND);
			}
		});
	});

	router.get("json", "/:account/:project", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getProjectInfo(params.account, params.project, function(err, project)
		{
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, project);
		});
	});

	router.get("json", "/:account/:project/revision/:rid", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getRevisionInfo(params.account, params.project, params.rid, function(err, revisionObj) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, revisionObj);
		});
	});

	router.get("json", "/:account/:project/revision/:branch/head", function(res, req, params, err_callback) {
		var dbInter = dbInterface(req[C.REQ_REPO].logger);

		dbInter.getHeadOf(params.account, params.project, params.branch, dbInter.getRevisionInfo, function(err, revisionObj) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, revisionObj);
		});
	});

	router.get("json", "/:account/:project/revision/:rid/readme", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getReadme(params.account, params.project, params.rid, function(err, readme) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, readme);
		});
	});

	router.get("json", "/:account/:project/revision/:branch/head/readme", function(res, req, params, err_callback) {
		var dbInter = dbInterface(req[C.REQ_REPO].logger);

		dbInter.getHeadOf(params.account, params.project, params.branch, dbInter.getReadme, function(err, readme) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, readme);
		});
	});

	router.get("json", "/:account/:project/branches", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getBranches(params.account, params.project, function(err, branchList) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, branchList);
		});
	});

	router.get("json", "/:account/:project/revisions", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getRevisions(params.account, params.project, null, params.start, params.end, params.full, function(err, revisionList) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, revisionList);
		});
	});

	router.get("json", "/:account/:project/revisions/:branch", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getRevisions(params.account, params.project, params.branch, params.start, params.end, params.full, function(err, revisionList) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, revisionList);
		});
	});

	router.get("json", "/:account/:project/issue/:uid", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getIssue(params.account, params.project, params.uid, false, function(err, issueList) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, issueList);
		});
	});

	router.get("json", "/:account/:project/issues", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getIssues(params.account, params.project, "master", null, true, function(err, issueList) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, issueList);
		});
	});

	router.get("json", "/:account/:project/issues/:sid", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getObjectIssues(params.account, params.project, params.sid, params.number, false, function(err, issueList) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, issueList);
		});
	});

	router.get("json", "/:account/:project/users", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getProjectUsers(params.account, params.project, function(err, project)
		{
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, project);
		});
	});

	router.get("json", "/:account/:project/revision/:branch/head/tree/:sid", function(res, req, params, err_callback) {
		var account		= params.account;
		var project		= params.project;

		var sid			= params.sid;

		var branch		= params.branch;

		var namespace	= params.query.namespace;
		var selected	= params.query.selected;

		var htmlMode	= params.query.htmlMode == "true";

		getTree(dbInterface(req[C.REQ_REPO].logger), account, project, branch, null, sid, namespace, selected, htmlMode, err_callback);
	});


	router.get("json", "/:account/:project/revision/:rid/tree/:sid", function(res, req, params, err_callback) {
		var account		= params.account;
		var project		= params.project;

		var sid			= params.sid;

		var revision	= params.rid;

		var namespace	= params.query.namespace;
		var selected	= params.query.selected;

		var htmlMode	= params.query.htmlMode == "true";

		getTree(dbInterface(req[C.REQ_REPO].logger), account, project, null, revision, sid, namespace, selected, htmlMode, err_callback);
	});

	router.get("json", "/:account/:project/revision/:rid/meta/:sid", function(res, req, params, err_callback) {
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

	router.get("json", "/:account/:project/revision/:branch/head/meta/:sid", function(res, req, params, err_callback) {
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

	router.get("json", "/:account/:project/revision/:rid/map", function(res, req, params, err_callback) {
		var account		= params.account;
		var project		= params.project;

		var rid			= params.rid;

		dbInterface(req[C.REQ_REPO].logger).getSIDMap(account, project, null, rid, function (err, mapobj, invMapObj) {
			if (err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, {"map" : mapobj, "invMap": invMapObj});
		});
	});

	router.get("json", "/:account/:project/revision/:branch/head/fulltree", function(res, params, err_callback) {
		getFullTree(dbInterface, params.account, params.project, params.branch, null, err_callback);
	});

	router.get("json", "/:account/:project/revision/:rid/fulltree", function(res, params, err_callback) {
		getFullTree(dbInterface, params.account, params.project, null, params.rid, err_callback);
	});

	router.get("json", "/:account/:project/revision/:branch/head/map", function(res, req, params, err_callback) {
		var account		= params.account;
		var project		= params.project;

		var	branch		= params.branch;

		dbInterface(req[C.REQ_REPO].logger).getSIDMap(account, project, branch, null, function (err, mapobj, invMapObj) {
			if (err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, {"map" : mapobj, "invMap": invMapObj});
		});
	});

	router.get("json", "/:account/:project/meta/:uid", function(res, req, params, err_callback) {
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

	router.get("json", "/:account/:project/revision/:rid/diff/:otherrid", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getDiff(params.account, params.project, null, params.rid, null, params.otherrid, function(err, diff) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, diff);
		});
	});

	router.get("json", "/:account/:project/revision/:branch/head/:sid", function(res, req, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getHeadUUID(params.account, params.project, params.branch, function (err, uuid)
		{
			dbInterface(req[C.REQ_REPO].logger).getObject(params.account, params.project, null, utils.uuidToString(uuid.uuid), params.sid, true, {}, function (err, type, uid, obj) {
				if (err.value)
					err_callback(err);
				else
					err_callback(responseCodes.OK, obj);

			})
		});
	});

	router.get("json", "/:account/:project/revision/:rid/tree/multimap", function(res, req, params, err_callback) {
		getMultiMap(dbInterface(req[C.REQ_REPO].logger), params.account, params.project, null, params.rid, req[C.REQ_REPO].logger, err_callback);
	});

	router.get("json", "/:account/:project/revision/:branch/head/tree/multimap", function(res, req, params, err_callback) {
		getMultiMap(dbInterface(req[C.REQ_REPO].logger), params.account, params.project, params.branch, null, req[C.REQ_REPO].logger, err_callback);
	});

	router.get("json", "/:account/:project/:uid", function(res, req, params, err_callback) {
		if(params.subformat == "mpc")
		{
			dbInterface(req[C.REQ_REPO].logger).getObject(params.account, params.project, params.uid, null, null, false, {}, function (err, type, uid, fromStash, scene) {
				if (err.value) return err_callback(err);

				if (type == "mesh")
				{
					var mesh = scene.meshes[params.uid];

					if (mesh)
					{
						if (mesh[C.REPO_NODE_LABEL_COMBINED_MAP])
						{
							// First sort the combined map in order of vertex ID
							mesh[C.REPO_NODE_LABEL_COMBINED_MAP].sort(function(left, right)
							{
								if (left[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM] < right[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM])
									return -1;
								else if (left[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM] > right[C.REPO_NODE_LABEL_MERGE_MAP_VERTEX_FROM]
								)
									return 1;
								else
									return 0;
							});

							var subMeshes   = mesh[C.REPO_NODE_LABEL_COMBINED_MAP];
							var subMeshKeys = mesh[C.REPO_NODE_LABEL_COMBINED_MAP].map(function (item) {
								return item[C.REPO_NODE_LABEL_MERGE_MAP_MESH_ID]
							});

							var outJSON = {};

							outJSON["numberOfIDs"] = subMeshKeys.length;
							outJSON["maxGeoCount"] = subMeshKeys.length;

							dbInterface(req[C.REQ_REPO].logger).getChildrenByUID(params.account, params.project, params.uid, false, function (err, docs) {
								if (err.value) return err_callback(err);

								var children = repoGraphScene(req[C.REQ_REPO].logger).decode(docs);

								outJSON["appearance"] = [];

								if (children.materials_count)
								{
									for (var i = 0; i < children.materials_count; i++)
									{
										var childID = Object.keys(children.materials)[i];
										var child   = children.materials[childID];

										var app = {};
										app["name"] = childID;

										var material = {};

										if ("diffuse" in child)
											material["diffuseColor"] = child["diffuse"].join(" ");

										if ("emissive" in child)
											material["emissiveColor"] = child["emissive"].join(" ");

										if ("shininess" in child)
											material["shininess"] = child["shininess"];

										if ("specular" in child)
											material["specularColor"] = child["specular"].join(" ");

										if ("opacity" in child)
											material["transparency"] = 1.0 - child["opacity"];

										app["material"] = material;

										outJSON["appearance"].push(app);
									}
								}

								var bbox = repoNodeMesh.extractBoundingBox(mesh);
								outJSON["mapping"] = [];

								for(var i = 0; i < subMeshKeys.length; i++)
								{
									var map = {};

									map["name"]       = subMeshKeys[i];
									map["appearance"] = utils.uuidToString(subMeshes[i]["mat_id"]);
									map["min"]        = subMeshes[i][C.REPO_NODE_LABEL_BOUNDING_BOX][0].join(" ");
									map["max"]        = subMeshes[i][C.REPO_NODE_LABEL_BOUNDING_BOX][1].join(" ");
									map["usage"]      = params.uid + "_0"

									outJSON["mapping"].push(map);
								}

								return err_callback(responseCodes.OK, outJSON);
							});
						}
					} else {
						return err_callback(responseCodes.OBJECT_NOT_FOUND);
					}
				}
			});
		} else {
			err_callback(responseCodes.FORMAT_NOT_SUPPORTED);
		}
	});

    router.get('json', '/:account/:project/:index/walkthrough', function(res, params, err_callback) {
        searchTree(dbInterface, params.account, params.project, params.index, err_callback);
    });
};


