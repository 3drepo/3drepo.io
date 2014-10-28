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
		
			JSON_AddChildren(new_json_node, child);
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


exports.render = function(db_interface, db_name, format, sub_format, revision, res, err_callback)
{
	db_interface.get_mesh(null, db_name, revision, null, false, null, function(err, doc) {
		var dummyRoot = { children: [doc.mRootNode] };
		var output_json = {name:db_name, nodes: []};
		
		JSON_AddChildren(output_json, dummyRoot);
		res.write(JSON.stringify(output_json));
		res.end();
	});
}

