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
var repoGraphScene = require('../repoGraphScene.js');
var async = require('async');
var uuidToString = require('../db_interface.js').uuidToString;
var search = require('./helper/search.js').search;
var log_iface = require('../logger.js');
var logger = log_iface.logger;

var responseCodes = require('../response_codes.js');

/*******************************************************************************
 * Recursively add JSON children
 *
 * @param {JSON} jsonNode - JSON node being built
 * @param {JSON} node - Current node from RepoSceneGraph
 *******************************************************************************/
function JSONAddChildren(jsonNode, node)
{
	if (!('children' in node))
		return;

	// Loop over all the children
	for(var chIdx = 0; chIdx < node['children'].length; chIdx++)
	{
		var child = node['children'][chIdx];

		if (child['type'] == 'mesh') {

			var newJsonNode       = {};
			newJsonNode['uuid']   = child['id'];
			newJsonNode['name']   = child['name'];
			newJsonNode['bid']    = 0;
			newJsonNode['nodes']  = [];
			jsonNode['nodes'].push(newJsonNode);

		} else if(child['type'] == 'transformation') {

			var newJsonNode       = {};
			newJsonNode['uuid']   = child['id'];
			newJsonNode['name']   = child['name'];
			newJsonNode['bid']    = 0;
			newJsonNode['nodes']  = [];
			JSONAddChildren(newJsonNode, child);
			jsonNode['nodes'].push(newJsonNode);

		} else {
			JSONAddChildren(jsonNode, child);
		}
	}
}

/*******************************************************************************
 * Append Metadata to child
 *
 * @param {Object} dbInterface - Database module from db_interface.js
 * @param {string} project - name of project containing child
 * @param {JSON} childNode - Child node JSON
 *******************************************************************************/
function treeChildMetadata(dbInterface, dbName, project, childNode, callback)
{
	var sharedId = childNode["key"];

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
 *******************************************************************************/
function processChild(child, project, selected, namespace)
{
	var childNode = {};

	// If a child is a ref then add project information to allow loading
	// of information from a different database , otherwise if
	// a mesh or a group (transformation) then add it as a normal node.
	if ((child['type'] == 'mesh') || (child['type'] == 'transformation') || child['type'] == 'map')
	{
		var uuid      = uuidToString(child["_id"]);
		var shared_id = uuidToString(child["shared_id"]);
		var name      = "";

		if("name" in child)
			name = child["name"];
		else
			name = uuid;

		childNode["key"]       = shared_id;
		childNode["title"]     = name;
		childNode["uuid"]      = uuid;
		childNode["folder"]    = ("children" in child);
		childNode["lazy"]      = true;
		childNode["selected"]  = (selected == "true");
		childNode["namespace"] = namespace;
		childNode["dbname"]    = project;

	} else if (child['type'] == 'ref') {

		childNode["project"]   = child["project"];
		childNode["title"]     = child["project"];
		childNode["namespace"] = child["project"] + "__";
		childNode["uuid"]      = uuid;
		childNode["folder"]    = true;
		childNode["lazy"]      = true;
		childNode["selected"]  = (selected == "true");
		childNode["dbname"]    = child["project"];
		childNode["key"]       = uuidToString(child["shared_id"]);

	}

	return childNode;
}

/*******************************************************************************
 * Render JSON tree
 *
 * @param {Object} dbInterface - Database interface object
 * @param {string} dbName - Company or database name containing project
 * @param {string} project - name of project containing tree
 * @param {uuid} revision - the id of the revision
 * @param {uuid} uuid - the uuid of the parent in the tree
 * @param {boolean} selected - Is the uuid
 * @param {RepoNodeMesh} mesh - The RepoNodeMesh object containing the mesh
 * @param {string} tex_uuid - A string representing the tex_uuid attached to the mesh
 * @param {boolean} embedded_texture - Determines whether or not the texture data is embedded in the SRC.
 * @param {Object} res - The http response object
 *******************************************************************************/
function render(dbInterface, dbName, project, revision, uuid, selected, namespace, res, err_callback)
{

	if (uuid == null)
	{
		dbInterface.getScene(dbName, project, revision, function(err, doc) {
			var head = [{}];
			var node = doc['mRootNode'];

			head[0]["title"]     = node["name"];
			head[0]["key"]       = uuidToString(node["shared_id"]);
			head[0]["folder"]    = true;
			head[0]["lazy"]      = true;
			head[0]["selected"]  = true;
			head[0]["uuid"]      = node["id"];
			head[0]["namespace"] = ((namespace != null) ? namespace : "model__");
			head[0]["dbname"]    = project;

			if (!("children" in node))
				head[0]["children"] = [];

			res.json(head);
		});
	} else {
		dbInterface.getChildren(dbName, project, uuid, function(err, doc) {
			async.map(doc, function(child, callback)
				{
					callback(err, processChild(child, project, selected, namespace));
				}, function(err, children) {
				async.map(children, function(id, callback) {
					treeChildMetadata(dbInterface, dbName, project, id, callback)
				}, function(err, childWithMeta)
				{
					res.json(childWithMeta);
				});
			});
		});
	}
}

exports.route = function(router)
{
	router.get('json', '/search', function(res, params, err_callback) {
		search(router.dbInterface, params.query, function(err, json)
		{
			if(err.value)
				err_callback(err);
			else
				res.json(json);
		});
	});

	router.get('json', '/:account', function(res, params, err_callback) {
		if(!("getPublic" in params))
		{
			err_callback(responseCodes.GET_PUBLIC_NOT_SPECIFIED);
		} else {
			dbInterface.getUserInfo(params.account, params.getPublic, function(err, user)
			{
				if(err.value) {
					err_callback(err);
				} else {
					console.log("debug", "USER: " + JSON.stringify(user));
					if(user)
					{
						user.username = params.account;
						err_callback(responseCodes.OK, user);
					}
					else
						err_callback(responseCodes.USER_NOT_FOUND);
				}
			});
		}
	});

	router.get('json', '/:account/:project', function(res, params, err_callback) {
		dbInterface.getProjectInfo(params.account, params.project, function(err, project)
		{
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, project);
		});
	});

	router.get('json', '/:account/:project/revision/:rid', function(res, params, err_callback) {
		router.dbInterface.getRevisionInfo(params.account, params.project, params.rid, function(err, revisionObj) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, revisionObj);
		});
	});

	router.get('json', '/:account/:project/revision/:branch/head', function(res, params, err_callback) {
		router.dbInterface.getHeadOf(params.account, params.project, params.branch, router.dbInterface.getRevisionInfo, function(err, revisionObj) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, revisionObj);
		});
	});

	router.get('json', '/:account/:project/revision/:rid/readme', function(res, params, err_callback) {
		router.dbInterface.getReadme(params.account, params.project, params.rid, function(err, readme) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, readme);
		});
	});

	router.get('json', '/:account/:project/revision/:branch/head/readme', function(res, params, err_callback) {
		router.dbInterface.getHeadOf(params.account, params.project, params.branch, router.dbInterface.getReadme, function(err, readme) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, readme);
		});
	});

	router.get('json', '/:account/:project/branches', function(res, params, err_callback) {
		router.dbInterface.getBranches(params.account, params.project, function(err, branchList) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, readme);
		});
	});

	router.get('json', '/:account/:project/revisions', function(res, params, err_callback) {
		router.dbInterface.getRevisions(params.account, params.project, null, params.start, params.end, params.full, function(err, revisionList) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, revisionList);
		});
	});

	router.get('json', '/:account/:project/revisions/:branch', function(res, params, err_callback) {
		router.dbInterface.getRevisions(params.account, params.project, params.branch, params.start, params.end, params.full, function(err, revisionList) {
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, revisionList);
		});
	});

	router.get('json', '/:account/:project/users', function(res, params, err_callback) {
		dbInterface.getProjectUsers(params.account, params.project, function(err, project)
		{
			if(err.value)
				err_callback(err);
			else
				err_callback(responseCodes.OK, project);
		});
	});

	router.get('json', '/:account/:project/revision/:rid/tree/:sid', function(res, params, err_callback) {
		var revision = (params.rid == "head") ? null : params.rid;
		var namespace = params.query.namespace;
		var selected  = params.query.selected;

		if (params.sid == "root")
		{
			router.dbInterface.getScene(params.account, params.project, revision, function(err, doc) {
				var head = [{}];
				var node = doc['mRootNode'];

				logger.log('debug', 'Found root node ' + node["id"]);

				head[0]["title"]     = params.project;
				head[0]["key"]       = uuidToString(node["shared_id"]);
				head[0]["folder"]    = true;
				head[0]["lazy"]      = true;
				head[0]["selected"]  = true;
				head[0]["uuid"]      = node["id"];
				head[0]["namespace"] = ((namespace != null) ? namespace : "model__");
				head[0]["dbname"]    = params.project;

				if (!("children" in node))
					head[0]["children"] = [];

				res.json(head);
			});
		} else {
			router.dbInterface.getChildren(params.account, params.project, params.sid, function(err, doc) {
				async.map(doc, function(child, callback)
					{
						callback(err, processChild(child, params.project, selected, namespace));
					}, function(err, children) {
					async.map(children, function(id, callback) {
						treeChildMetadata(router.dbInterface, params.account, params.project, id, callback)
					}, function(err, childWithMeta)
					{
						if(err)
							err_callback(err);
						else
							err_callback(responseCodes.OK, childWithMeta);
					});
				});
			});
		}

	});
};


