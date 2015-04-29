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

var ViewerManager = function() {
	var self = this;

	this.defaultViewerHandle = 1;
	this.viewers = {};

	this.x3ddiv = $('#x3d')[0];

	this.newIdx = 0;

	this.reshape = function() {
		// TODO: Only splits horizontally at the moment
		var viewerSize = (100 / Object.keys(self.viewers).length);
		var idxes = Object.keys(self.viewers);

		for(var i = 0; i < idxes.length; i++)
		{
			var idx = idxes[i];

			self.viewers[idx].viewer.style.width = viewerSize + "%";
			self.viewers[idx].viewer.style.left = (i * viewerSize) + "%";
		}
	}

	this.addViewer = function(id) {
		// TODO: Check for unique ID
		// TODO: Auto-generate ID for viewer
		self.newIdx += 1;
		self.viewers[self.newIdx] = new Viewer(id, self.x3ddiv, self);

		self.reshape();
	}

	this.getViewerIdx = function(id) {
		return Object.keys(self.viewers).filter(function(v) { return self.viewers[v].id == id; })[0];
	}

	this.getViewer = function(id) {
		var viewerIdx = self.getViewerIdx(id);

		if (viewerIdx > -1)
			return self.viewers[viewerIdx];
		else
			return null;
	}

	this.removeViewer = function(id) {
		var viewerIdx = self.getViewerIdx(id);

		if (viewerIdx > -1)
		{
			// Can't be left with nothing
			if (Object.keys(self.viewers.length) == 1)
				return;

			if (self.viewers[viewerIdx] == self.viewMaster)
				self.viewMaster = null;

			if (viewerIdx == self.diffViewer)
				self.diffViewer = null;

			if (viewerIdx == self.defaultViewerHandle)
				self.defaultViewerHandle = parseInt(Object.keys(viewer.length)[0]);

			self.linkedViewers = self.linkedViewers.filter(function(idx) { return (idx != viewerIdx); })
			self.registeredRuntimes = self.registeredRuntimes.filter(function(idx) { return (idx != viewerIdx); })

			self.viewers[viewerIdx].close();
			self.viewers[viewerIdx] = null;

			self.reshape();
		}
	}

	this.addMe = function(array, id)
	{
		var viewerIdx = self.getViewerIdx(id);

		if (viewerIdx > -1)
		{
			if (array.indexOf(viewerIdx) == -1)
				array.push(viewerIdx);
		}
	}

	this.linkedViewers = [];
	this.linkMe = function(id) { self.addMe(self.linkedViewers, id); }

	this.viewMaster = null;
	this.switchMaster = function(id) {
		var viewer = self.getViewer(id);

		if (viewer)
		{
			if (self.viewMaster != viewer)
				self.viewMaster = viewer;
		}
	}

	this.viewpointLinkFunction = function (event) {
		debugger;

		var masterIdx = self.getViewerIdx(self.viewMaster);

		var newPos = event.position.x + "," + event.position.y + "," + event.position.z;
		var newOrient = event.orientation[0].x + "," + event.orientation[0].y + "," + event.orientation[0].z
			+ "," + event.orientation[1];

		for(var i = 0; i < self.linkedViewers.length; i++)
		{
			var viewerIdx = self.linkedViewers[i];

			if (viewerIdx == masterIdx)
				continue;

			self.viewers[viewerIdx].viewPoint.setAttribute("position", newPos);
			self.viewers[viewerIdx].viewPoint.setAttribute("orientation", newOrient);
		}
	};

	this.registeredRuntimes = [];
	this.registerInitRuntime = function (id) { self.addMe(self.registeredRuntimes, id); }

	this.initRuntime = function () {
		for (var i = 0; i < self.registeredRuntimes.length; i++)
		{
			if (i in self.viewers)
				self.viewers[i].initRuntime();
		}
	}

	x3dom.runtime.ready = this.initRuntime;

	this.diffViewer = null;
	this.diffView = function(enable) {
		if (enable)
		{
			if (!self.diffViewer)
			{
				self.diffViewer = self.addViewer("diffView");
				self.linkMe("diffView");
			} else {
				self.removeViewer("diffView");
			}
		}
	};

	this.getDiffViewer = function() {
		if(self.diffViewer)
			return self.viewers[self.diffViewer];
	}

	this.getDefaultViewer = function() {
		if(self.defaultViewerHandle)
			return self.viewers[self.defaultViewerHandle];
	}

	// Helper function to load scene in viewers
	this.loadURL = function(id, account, project, branch, revision)
	{
		var viewer = self.getViewer(id);

		if (revision && revision != 'head')
			viewer.loadURL(server_config.apiUrl(account + '/' + project + '/revision/' + revision + '.x3d.src'))
		else
			viewer.loadURL(server_config.apiUrl(account + '/' + project + '/revision/' + branch + '/head.x3d.src'))
	}

	this.messageBox = document.createElement('div');
	this.messageBox.setAttribute('id', 'viewerMessageBox');
	this.messageBox.className = "panel panel-default";
	this.messageBox.style["display"] = "none";
	this.messageBox.setAttribute('visible', 'false');
	this.messageBoxMessage = document.createElement('p');
	this.messageBoxMessage.innerHTML = "";
	this.messageBox.appendChild(this.messageBoxMessage);
	this.x3ddiv.appendChild(this.messageBox);

	this.displayMessage = function(text, textColor, timeout) {
		self.messageBoxMessage.innerHTML = text;
		self.messageBox.style["display"] = "";

		// Construct RGBA string
		var rgbstr = "RGB(" + textColor[0] + ", " + textColor[1] + ", " + textColor[2] + ")";
		self.messageBoxMessage.style["text-color"] = rgbstr;

		setTimeout( function() {
			self.messageBox.style["display"] = "none";
		}, timeout);
	}

	// Create the default viewer
	self.addViewer("viewer");
};


