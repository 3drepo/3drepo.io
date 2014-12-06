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
function treeChildMetadata(dbInterface, project, childNode, callback)
{
	var sharedId = childNode["key"];

	dbInterface.getMetadata(project, sharedId, function(err, meta) {
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
	if ((child['type'] == 'mesh') || (child['type'] == 'transformation'))
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
 * @param {string} project - name of project containing tree
 * @param {uuid} revision - the id of the revision
 * @param {uuid} uuid - the uuid of the parent in the tree
 * @param {boolean} selected - Is the uuid
 * @param {RepoNodeMesh} mesh - The RepoNodeMesh object containing the mesh
 * @param {string} tex_uuid - A string representing the tex_uuid attached to the mesh
 * @param {boolean} embedded_texture - Determines whether or not the texture data is embedded in the SRC.
 * @param {Object} res - The http response object
 *******************************************************************************/
function render(dbInterface, project, revision, uuid, selected, namespace, res, err_callback)
{

	if (uuid == null)
	{
		dbInterface.getScene(project, revision, function(err, doc) {
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
		dbInterface.getChildren(project, uuid, function(err, doc) {
			async.map(doc, function(child, callback)
				{
					callback(err, processChild(child, project, selected, namespace));
				}, function(err, children) {
				async.map(children, function(id, callback) {
					treeChildMetadata(dbInterface, project, id, callback)
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
	router.get('json', '/search', function(res, params) {
		search(router.dbInterface, params.query, function(err, json)
		{
			if(err) throw err;

			res.json(json);
		});
	});

	router.get('json', '/:account', function(res, params) {
		dbInterface.getUserInfo( params.user, function(err, user)
		{
			if(err) throw err;
			res.json(user);
		});
	});

	router.get('json', '/:account/:project', function(res, params) {
		// FIXME: Fill in
		res.status(415).send("Not supported");
	});

	router.get('json', '/:account/:project/revisions', function(res, params) {
		// FIXME: Fill in.
		res.status(415).send("Not supported");
	});

	router.get('json', '/:account/:project/revision/:rid', function(res, params) {
		// FIXME: Fill in.
	});

	router.get('json', '/:account/:project/revision/:rid/tree/:sid', function(res, params) {
		var revision = (params.rid == "head") ? null : params.rid;
		var namespace = params.query.namespace;
		var selected  = params.query.selected;

		if (params.sid == "root")
		{
			router.dbInterface.getScene(params.project, revision, function(err, doc) {
				var head = [{}];
				var node = doc['mRootNode'];

				head[0]["title"]     = node["name"];
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
			router.dbInterface.getChildren(params.project, params.sid, function(err, doc) {
				async.map(doc, function(child, callback)
					{
						callback(err, processChild(child, params.project, selected, namespace));
					}, function(err, children) {
					async.map(children, function(id, callback) {
						treeChildMetadata(router.dbInterface, params.project, id, callback)
					}, function(err, childWithMeta)
					{
						res.json(childWithMeta);
					});
				});
			});
		}

	});
};


