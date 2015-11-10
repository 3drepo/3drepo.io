
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
.service('ViewpointService', ['ViewerService', function(ViewerService) {
	"use strict";

	var self = this;
	self.rootElement = null;

	this.init = function(rootElement) {
		self.rootElement = rootElement;
	};

	this.refresh = function () {
		var vps = ViewerService.defaultViewer.viewpoints;

		var treeStructure = [];

		var viewRoot = {};
		viewRoot["title"]    = "Viewpoints";
		viewRoot["folder"]   = true;
		viewRoot["children"] = [];

		treeStructure.push(viewRoot);

		for (var category in vps)
		{
			if (vps.hasOwnProperty(category)) {
				var catJSON         = {};
				catJSON["title"]    = category;
				catJSON["folder"]   = true;
				catJSON["children"] = [];

				for (var vp in vps[category]) {
					var childJSON      = {};
					childJSON["title"] = vp;
					childJSON["key"]   = vps[category][vp];

					catJSON["children"].push(childJSON);
				}

				viewRoot["children"].push(catJSON);
			}
		}

		self.rootElement.fancytree({
			source: treeStructure,
			activate: function(event, data) {
				ViewerService.defaultViewer.setCurrentViewpoint(data.node.key);
			}
		});
	};

	ViewerService.ready.then(function() {
		self.refresh();
	});

}]);
