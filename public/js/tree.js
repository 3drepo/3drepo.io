/**
 **  Copyright (C) 2014 3D Repo Ltd
 **
 **  This program is free software: you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

var TreeControl = function() {
	this.getKeyPath = function(obj) {
		if (obj.hasAttribute("namespacename"))
			if (obj.getAttribute("namespacename") == "model")
				return "";

		return this.getKeyPath(obj.parentElement) + "/" + obj.getAttribute("DEF");
	};

	this.onlyThis = function(node)
	{
		var parent = node.getParent();

		if(parent == null)
			return;

		var siblings = parent.getChildren();

		for(var s_idx = 0; s_idx < siblings.length; s_idx++)
			if (!(siblings[s_idx] == node))
				siblings[s_idx].setExpanded(false);

		this.onlyThis(parent);
	};
};

$(document).on("bgroundClicked", function(event) {
	var rootNode = $("#scenetree").fancytree("getRootNode");
	rootNode.setExpanded(false);
};

$(document).on("clickObject", function(event, objEvent) {
	var tree = $("#scenetree").fancytree("getTree");

	tree.loadKeyPath(treeCtrl.getKeyPath(objEvent.target),
		function(node, status) {
			if(status === "ok") {
				treeCtrl.onlyThis(node);
				node.setActive();
			}
		}
	);
});

$(document).ready( function() {
	window.treeCtrl = new TreeControl();
});

$(function () {
	$("#scenetree").fancytree({
		selectMode: 3,
		beforeSelect : function(event, data) {
			window.wasPartSelect = data.node.partsel;
		},
		select : function(event, data) {
			$('#' + data.node.data.namespace + data.node.data.uuid)[0].setAttribute("render", data.node.selected);

			var parent = data.node.getParent();
			if ((data.node.selected) && (data.node.selected != parent.selected))
			{
				var par_node = parent;

				while(par_node != null)
				{
					$('#' + par_node.data.namespace + par_node.data.uuid)[0].setAttribute("render", true);
					par_node = par_node.getParent();
				}

				var siblings = data.node.getParent().getChildren();

				for(var sib_idx = 0; sib_idx < siblings.length; sib_idx++)
				{
					$('#' + siblings[sib_idx].data.namespace + siblings[sib_idx].data.uuid)[0].setAttribute("render", false);
				}
			}

			/*
			if (window.wasPartSelect)
			{
				var children = data.node.getChildren();

				for(var ch_idx = 0; ch_idx < children.length; ch_idx++)
				{
					$('#' + children[ch_idx].data.namespace + children[ch_idx].data.uuid)[0].setAttribute("render", data.node.selected);
				}
			}
			*/
			},
		activate: function(event, data) {
			if ("uuid" in data.node.data)
			{
				var rootObj = $('#' + data.node.data.namespace + data.node.data.uuid)[0];
				viewer.lookAtObject(rootObj);
				viewer.setApp(rootObj);
			}

			if (("meta" in data.node.data) && (data.node.data["meta"].length))
			{
				$("#meta-popup").css("visibility", "visible");
				$("#metadata").remove();

				$("#meta-popup").append("<table id=\"metadata\"></div>");

				$("#metadata").append("<tr><th c class=\"metadata-title\" colspan=\"2\">" + data.node["title"] + "</th></tr>");

				var meta = data.node.data["meta"][0];

				Object.keys(meta).forEach(function(key)
				{
					$("#metadata").append("<tr><td class=\"metadata-row\">" + key + "</td><td class=\"metadata-row\">" + meta[key] + "</td></tr>")
				});
			} else {
				$("#meta-popup").css("visibility", "hidden");
			}
		},
		checkbox: true,
		source: {
			url: '/' + account + '/' + project + '/revision/head/tree/root.json?depth=1'
		},
		lazyLoad: function(event, data) {
			var node = data.node;

			if ("project" in node.data)
			{
				var params = {selected: node.selected, namespace: node.data.namespace};
				var json_key = "root";
			} else {
				var params = {mode: "children", selected: node.selected, namespace: node.data.namespace};
				var json_key = node.key;
			}

			params.depth = 1;

			data.result = $.ajax({
				url:  '/' + account + '/' + node.data.dbname + '/revision/head/tree/' + json_key + '.json',
				data: params,
				cache: false
			});
		}
	});
});
