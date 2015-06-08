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

angular.module('3drepo')
.service('TreeService', ['StateManager', 'serverConfig', function(StateManager, serverConfig){
	var self = this;
	self.rootElement = null;

	this.getKeyPath = function(obj) {
		if (obj.getAttribute("namespacename"))
			return "";

		if (obj.getAttribute("DEF") == "root")
		{
			if (!obj.parentElement)
				return "";
			else
				return self.getKeyPath(obj.parentElement);
		}

		return self.getKeyPath(obj.parentElement) + "/" + obj.getAttribute("DEF");
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

		self.onlyThis(parent);
	};

	this.clickedFromView = false;
	this.loading = false;

	this.getProject = function(projectName)
	{
		return $('inline')
			.filter(function() {
				return this.nameSpaceName == projectName;
			});
	}

	this.getNode = function(node)
	{
		if ('project' in node.data)
			return getProject(node.data.project)[0];
		else
			return document.getElementById(node.data.namespace + node.data.uuid);
	}

	this.treeURL = function(account, project, branch, revision, sid, depth)
	{
		var newURL = "";

		if (revision && (revision != 'head'))
		{
			newURL += account + '/' + project + '/revision/' + revision + '/tree/';
		} else {
			newURL += account + '/' + project + '/revision/' + branch + '/head/tree/';
		}
		if (sid)
		{
			newURL += sid
		} else {
			newURL += 'root';
		}

		newURL += '.json?';

		if (depth)
			newURL += "depth=" + depth + "&";

		newURL += 'htmlMode=true';

		return serverConfig.apiUrl(newURL);
	}

	this.onObjectSelected = function(object) {
		var tree = self.rootElement.fancytree("getTree");

		if(object)
		{
			tree.loadKeyPath(self.getKeyPath(object),
				function(node, status) {
					if(status === "ok") {
						self.clickedFromView = true;
						self.onlyThis(node);
						node.setActive();
					}
				}
			);
		} else {
			var rootNode = self.rootElement.fancytree("getRootNode");
			rootNode.setActive(false);
			rootNode.setExpanded(false);
		}
	}

	this.wasPartSelect = false;

	this.init = function (rootElement) {
		if (!self.intialized)
		{
			var account		= StateManager.state.account;
			var project		= StateManager.state.project;
			var branch		= StateManager.state.branch;
			var revision	= StateManager.state.sid;

			self.rootElement = rootElement;

			self.rootElement.fancytree({
				selectMode: 3,
				beforeSelect : function(event, data) {
					self.wasPartSelect = data.node.partsel;
				},
				select : function(event, data) {
					self.getNode(data.node).setAttribute("render", data.node.selected);

					var parent = data.node.getParent();
					if ((data.node.selected) && (data.node.selected != parent.selected))
					{
						var par_node = parent;

						while(par_node != null)
						{
							self.getNode(par_node).setAttribute("render", true);
							par_node = par_node.getParent();
						}

						var siblings = data.node.getParent().getChildren();

						for(var sib_idx = 0; sib_idx < siblings.length; sib_idx++)
						{
							self.getNode(siblings[sib_idx]).setAttribute("render", false);
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
						var rootObj = self.getNode(data.node);
						$(document).trigger("objectSelected", [ rootObj, !self.clickedFromView ] );
					}

					self.clickedFromView = false;
				},
				source: {
					url: self.treeURL(account, project, branch, revision, null, null)
				},
				checkbox: true,
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
						url:  self.treeURL(account, node.data.dbname, node.data.branch, node.data.revision, json_key, null),
						data: params,
						cache: false
					});
				}
			});

			$(document).on("objectSelected", function(event, object, zoom) {
				self.onObjectSelected(object);
			});
		}
	}

	this.refresh = function () {
		if(self.rootElement)
		{
			var account		= StateManager.state.account;
			var project		= StateManager.state.project;
			var branch		= StateManager.state.branch;
			var revision	= StateManager.state.revision;
			var sid			= StateManager.state.sid;

			var newURL = self.treeURL(account, project, branch, revision, sid);

			var tree = self.rootElement.fancytree("getTree");

			if (!self.loading)
			{
				self.loading = true;

				if (!tree.getRootNode().isLoading())
				{
					self.loadingPromise = tree.reload({
						url: newURL
					}).done(function() {
						self.loading = false;
					})
				}
			}
		}
	}
}]);

