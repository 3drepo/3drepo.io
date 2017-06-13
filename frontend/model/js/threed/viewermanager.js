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

var ViewerManager = {};

(function() {
	"use strict";

	ViewerManager = function() {
		this.currentViewerName = "";
		this.currentViewer = null;
		this.linkedViewers = [];
		this.linkedFunctions = [];
		
		this.viewers = {};
		
		this.selectDefaultCurrentViewer = function()
		{
			var viewerNames = Object.keys(this.viewers);
			
			if (viewerNames.length)
			{
				this.currentViewer = this.viewers[viewerNames[0]];
			} else {
				this.currentViewer = null;
			}
		};
		
		//x3dom.runtime.ready = this.initRuntime;
	};
	
	ViewerManager.prototype.isValidViewerName = function(name) {
		return this.viewers.hasOwnProperty(name);
	};

	ViewerManager.prototype.reshape = function() {
		// TODO: Only splits horizontally at the moment
		var viewerSize = (100 / Object.keys(this.viewers).length);
		var i = 0;

		for (var name in this.viewers) {
			if (this.viewers.hasOwnProperty(name)) {
				this.viewers[name].viewer.style.width = viewerSize + "%";
				this.viewers[name].viewer.style.left = (i * viewerSize) + "%";

				i++;
			}
		}
	};

	ViewerManager.prototype.removeViewer = function(name) {
		if (this.isValidHandle(name)) {
			// Can't be left with nothing
			if (Object.keys(this.viewers).length === 1) {
				return;
			}

			if (this.viewers[name] === this.currentViewer) {
				this.selectDefaultCurrentViewer();
			}

			this.linkedViewers = this.linkedViewers.filter(function(linkedName) {
				return (linkedName !== name);
			});

			this.viewers[name].close();
			delete this.viewers[name];

			if (this.currentViewerName === name) {
				this.defaultViewerHandle = Object.keys(this.viewers)[0];
			}

			this.reshape();
		}
	};

	ViewerManager.prototype.close = function() {
		for (var name in this.viewers) {
			if (this.viewers.hasOwnProperty(name)) {
				this.removeViewer(name);
			}
		}
	};

	ViewerManager.prototype.registerMe = function(viewer) {
		this.viewers[viewer.name] = viewer;
		
		if (Object.keys(this.viewers).length === 1)
		{
			this.selectDefaultCurrentViewer();
		}
		
		this.reshape();
	};

	ViewerManager.prototype.linkMe = function(handle) {
		this.addMe(this.linkedViewers, handle);
	};

	ViewerManager.prototype.switchCurrent = function(name) {
		if (this.isValidHandle(name)) {
			this.viewMaster = this.viewers[name];
		}
	};

	ViewerManager.prototype.getCurrentViewer = function() {
		if (this.currentViewer) {
			return this.currentViewer;
		}
	};

	ViewerManager.prototype.linkFunction = function(callback) {
		this.linkedFunctions.push(callback);
	};

	ViewerManager.prototype.viewpointLinkFunction = function(newEvent, event) {
		if (!this.linkedViewers.length || !this.currentViewer) {
			return;
		}

		// Only updates to the master should do anything
		if (event.target !== this.currentViewer.getCurrentViewpoint()) {
			return;
		}

		event.orientation[1] = event.orientation[1] * -1;
		this.currentViewer.transformEvent(event, event.target, false);

		var i;

		for (i = 0; i < this.linkedViewers.length; i++) {
			var name = this.linkedViewers[i];

			if (this.currentViewer.handle === name) { // Don't need to update the master
				continue;
			}

			if (this.isValidName(name)) {
				//self.viewers[handle].transformEvent(event, self.viewers[handle].getCurrentViewpoint(), false);
				this.viewers[name].getCurrentViewpoint().setAttribute("position", event.position.toString());
				this.viewers[name].getCurrentViewpoint().setAttribute("orientation", event.orientation.toString());
				//self.viewers[handle].transformEvent(event, self.viewers[handle].getCurrentViewpoint(), true);
			}
		}

		for (i = 0; i < this.linkedFunctions.length; i++) {
			this.linkedFunctions[i](event);
		}
	};

	ViewerManager.prototype.initRuntime = function() {
		for (var name in this.viewers) {
			if (this.viewers.hasOwnProperty(name)) {
				if (!this.viewers[name].runtime) {
					this.viewers[name].initRuntime();
				}
			}
		}
	};

	/*
	this.diffHandle = null;
	this.diffView = function(enable) {
		if (enable) {
			if (!self.isValidHandle(self.diffHandle)) {
				self.diffHandle = self.addViewer("diffView");

				self.getDiffViewer().linkMe();
				self.getDefaultViewer().linkMe();
			}
		} else {
			if (self.isValidHandle(self.diffHandle)) {
				self.removeViewer(self.diffHandle);
			}
		}
	};

	this.setDiffColors = function(diffColors) {
		self.getDefaultViewer().setDiffColors(diffColors);
		self.getDiffViewer().setDiffColors(diffColors);
	};
	*/
}());
