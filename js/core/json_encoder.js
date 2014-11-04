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
var repoGraphScene = require('./repoGraphScene.js');

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

exports.render = function(db_interface, db_name, format, sub_format, revision, uuid, selected, namespace, res, err_callback)
{
	if (uuid == null)
	{
		db_interface.get_mesh(null, db_name, revision, null, false, null, function(err, doc) {
			var head = [{}];
			var node = doc['mRootNode'];

			head[0]["title"]  = node["name"];
			head[0]["key"]    = db_interface.uuidToString(node["shared_id"]);
			head[0]["folder"] = true;
			head[0]["lazy"]   = true;
			head[0]["selected"] = true;
			head[0]["uuid"] = node["id"];
			head[0]["namespace"] = ((namespace != null) ? namespace : "model__");
			head[0]["dbname"] = db_name;

			if (!("children" in node))
				head[0]["children"] = [];

			res.json(head);
		});
	} else {
		db_interface.get_children(null, db_name, uuid, function(err, doc) {
			var children = [];

			for(var ch_idx = 0; ch_idx < doc.length; ch_idx++)
			{
				var child = doc[ch_idx];
				var child_node = {};

				if ((child['type'] == 'mesh') || (child['type'] == 'transformation'))
				{
					var uuid = db_interface.uuidToString(child["_id"]);
					var shared_id = db_interface.uuidToString(child["shared_id"]);
					var name = "";

					if("name" in child)
						name = child["name"];
					else
						name = uuid;

					child_node["key"] = shared_id;
					child_node["title"] = name;
					child_node["uuid"] = uuid;
					child_node["folder"] = ("children" in child);
					child_node["lazy"] = true;
					child_node["selected"] = (selected == "true");
					child_node["namespace"] = namespace;
					child_node["dbname"] = db_name;

				} else if (child['type'] == 'ref') {
					child_node["key"] = child["project"];
					child_node["project"] = child["project"];
					child_node["title"] = child["project"];
					child_node["namespace"] = child["project"] + "__";
					child_node["uuid"] = uuid;
					child_node["folder"] = true;
					child_node["lazy"] = true;
					child_node["selected"] = (selected == "true");
					child_node["dbname"] = child["project"];
					child_node["key"] = db_interface.uuidToString(child["shared_id"]);
				}

				children.push(child_node);
			}

			res.json(children);
		});
	}
}
