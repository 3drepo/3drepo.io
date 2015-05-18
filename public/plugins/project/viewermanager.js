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

	this.defaultViewerHandle = null;
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

	this.close = function() {
		var idxes = Object.keys(self.viewers).slice(0);

		for(var i = 0; i < idxes.length; i++)
		{
			var handle = parseInt(idxes[i]);

			self.removeViewer(handle);
		}
	}

	this.addViewer = function(name) {
		// TODO: Check for unique ID
		// TODO: Auto-generate ID for viewer
		self.newIdx += 1;
		self.viewers[self.newIdx] = new Viewer(name, self.newIdx, self.x3ddiv, self);
		self.viewers[self.newIdx].init();

		self.reshape();

		return self.newIdx;
	}

	this.isValidHandle = function(handle) {
		if(!handle) return false;

		// TODO: Too much, optimize to avoid calling this all the time
		// And also the function below this.
		var idx = Object.keys(self.viewers).map(function(v) { return parseInt(v); }).indexOf(handle);

		if (idx == -1)
			console.log('INVALID HANDLE ' + handle);

		return (idx > -1);
	}

	this.getHandleByName = function(name) {
		var match = Object.keys(self.viewers).filter(function(v) { return self.viewers[v].name == name; });

		if (match.length)
			return parseInt(match[0]);
		else
			return null;
	}

	this.getViewerByName = function(name) {
		var handle = self.getHandleByName(name);

		if (handle)
			return self.viewers[handle];
		else
			return null;
	}

	this.getViewer = function(handle) {
		if (self.isValidHandle(handle))
			return self.viewers[handle];
		else
			return null;
	}

	this.removeViewer = function(handle) {
		if (self.isValidHandle(handle))
		{
			// Can't be left with nothing
			if (Object.keys(self.viewers).length == 1)
				return;

			if (self.viewers[handle] == self.viewMaster)
				self.viewMaster = null;

			if (self.defaultViewerHandle == handle)
				self.defaultViewerHandle = parseInt(Object.keys(self.viewers)[0]);

			if (self.diffHandle == handle)
				self.diffHandle = null;

			self.linkedViewers = self.linkedViewers.filter(function(idx) { return (idx != handle); })

			self.viewers[handle].close();
			delete self.viewers[handle];

			self.reshape();
		}
	}

	this.addMe = function(array, handle)
	{
		if (self.isValidHandle(handle))
		{
			if (array.indexOf(handle) == -1)
				array.push(handle);
		}
	}

	this.linkedViewers = [];
	this.linkMe = function(handle) { self.addMe(self.linkedViewers, handle); }

	this.viewMaster = null;
	this.switchMaster = function(handle) {
		if (self.isValidHandle(handle))
			self.viewMaster = self.viewers[handle];
	}

	this.viewpointLinkFunction = function (newEvent, event) {
		if (!self.linkedViewers.length || !self.viewMaster)
			return;

		// Only updates to the master should do anything
		if (event.target != self.viewMaster.viewPoint)
			return;

		var newPos = event.position.x + "," + event.position.y + "," + event.position.z;
		var newOrient = event.orientation[0].x + "," + event.orientation[0].y + "," + event.orientation[0].z
			+ "," + event.orientation[1];

		for(var i = 0; i < self.linkedViewers.length; i++)
		{
			var handle = self.linkedViewers[i];

			if (self.viewMaster.handle == handle) // Don't need to update the master
				continue;

			if (self.isValidHandle(handle))
			{
				self.viewers[handle].viewPoint.setAttribute("position", newPos);
				self.viewers[handle].viewPoint.setAttribute("orientation", newOrient);
			}
		}
	};

	this.initRuntime = function () {
		for(handle in self.viewers)
			if(self.viewers[handle])
				if(!self.viewers[handle].runtime)
					self.viewers[handle].initRuntime();
	}

	x3dom.runtime.ready = this.initRuntime;

	this.diffHandle = null;
	this.diffView = function(enable) {
		if (enable)
		{
			if (!self.isValidHandle(self.diffHandle))
			{
				self.diffHandle = self.addViewer("diffView");

				self.getDiffViewer().linkMe();
				self.getDefaultViewer().linkMe();
			}
		} else {
			if (self.isValidHandle(self.diffHandle))
				self.removeViewer(self.diffHandle);
		}
	};

	this.setDiffColors = function(diffColors) {
		self.getDefaultViewer().setDiffColors(diffColors, true);
		self.getDiffViewer().setDiffColors(diffColors, false);
		self.getDiffViewer().disableClicking();
	};

	this.getDiffViewer = function() {
		if(self.diffHandle)
			return self.viewers[self.diffHandle];
	}

	this.getDefaultViewer = function() {
		if(self.defaultViewerHandle)
			return self.viewers[self.defaultViewerHandle];
	}

	// Helper function to load scene in viewers
	this.loadURL = function(handle, url)
	{
		if (self.isValidHandle(handle))
		{
			var viewer = self.viewers[handle];
			viewer.loadURL(url);
		}
	}

	this.messageBox = document.createElement('div');
	this.messageBox.setAttribute('id', 'viewerMessageBox');
	this.messageBox.className = "panel panel-default";
	this.messageBox.style["display"] = "none";
	this.messageBoxMessage = document.createElement('p');
	this.messageBoxMessage.innerHTML = "";
	this.messageBox.appendChild(this.messageBoxMessage);
	this.x3ddiv.appendChild(this.messageBox);

	this.displayMessage = function(text, textColor, timeout) {
		self.messageBoxMessage.innerHTML = text;
		self.messageBox.style["display"] = "";

		// Construct RGBA string
		var rgbstr = "RGB(" + textColor[0] + ", " + textColor[1] + ", " + textColor[2] + ")";
		self.messageBox.style["color"] = rgbstr;

		setTimeout( function() {
			self.messageBox.style["display"] = "none";
		}, timeout);
	}

	// Create the default viewer
	self.defaultViewerHandle = self.addViewer("viewer");
};


