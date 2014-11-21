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

function JSON_AddChildren(json_node, node)
{
	if (!('children' in node))
		return;

	for(var ch_idx = 0; ch_idx < node['children'].length; ch_idx++)
	{
		var child = node['children'][ch_idx];
		var new_node = null;

		if (child['type'] == 'mesh') {
			var new_json_node = {};
			new_json_node['uuid'] = child['id'];
			new_json_node['name'] = child['name'];
			new_json_node['bid'] = 0;
			new_json_node['nodes'] = [];
			json_node['nodes'].push(new_json_node);
		} else if(child['type'] == 'transformation') {
			var new_json_node = {};
			new_json_node['uuid'] = child['id'];
			new_json_node['name'] = child['name'];
			new_json_node['bid'] = 0;
			new_json_node['nodes'] = [];

			JSON_AddChildren(new_json_node, child);
			json_node['nodes'].push(new_json_node);
		} else {
			JSON_AddChildren(json_node, child);
		}
	}
}

function treeChildMetadata(db_interface, db_name, childNode, callback)
{
	var shared_id = childNode["key"];

	db_interface.get_metadata(null, db_name, shared_id, function(err, meta) {
		childNode["meta"] = meta;

		callback(null, childNode);
	});
}

function processChild(child, db_name, selected, namespace)
{
	var childNode = {};

	if ((child['type'] == 'mesh') || (child['type'] == 'transformation'))
	{
		var uuid = uuidToString(child["_id"]);
		var shared_id = uuidToString(child["shared_id"]);
		var name = "";

		if("name" in child)
			name = child["name"];
		else
			name = uuid;

		childNode["key"] = shared_id;
		childNode["title"] = name;
		childNode["uuid"] = uuid;
		childNode["folder"] = ("children" in child);
		childNode["lazy"] = true;
		childNode["selected"] = (selected == "true");
		childNode["namespace"] = namespace;
		childNode["dbname"] = db_name;
	} else if (child['type'] == 'ref') {
		childNode["project"] = child["project"];
		childNode["title"] = child["project"];
		childNode["namespace"] = child["project"] + "__";
		childNode["uuid"] = uuid;
		childNode["folder"] = true;
		childNode["lazy"] = true;
		childNode["selected"] = (selected == "true");
		childNode["dbname"] = child["project"];
		childNode["key"] = uuidToString(child["shared_id"]);
	}

	return childNode;
}

function render(db_interface, project, revision, uuid, selected, namespace, res, err_callback)
{
	if (uuid == null)
	{
		db_interface.getScene(null, db_name, revision, function(err, doc) {
			var head = [{}];
			var node = doc['mRootNode'];

			head[0]["title"]  = node["name"];
			head[0]["key"]    = uuidToString(node["shared_id"]);
			head[0]["folder"] = true;
			head[0]["lazy"]   = true;
			head[0]["selected"] = true;
			head[0]["uuid"] = node["id"];
			head[0]["namespace"] = ((namespace != null) ? namespace : "model__");
			head[0]["dbname"] = project;

			if (!("children" in node))
				head[0]["children"] = [];

			res.json(head);
		});
	} else {
		db_interface.get_children(null, project, uuid, function(err, doc) {
			async.map(doc, function(child, callback)
				{
					callback(err, processChild(child, project, selected, namespace));
				}, function(err, children) {
				async.map(children, function(id, callback) {
					treeChildMetadata(db_interface, project, id, callback)
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
	router.get('json', '/:account', function(res, params) {
		db_interface.getUserInfo(err, params.user, function(err, user)
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

	});
};


