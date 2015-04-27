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

var Waypoint = function() {
	var self = this;

	this.recorder	= new Recorder();
	this.spheres	= new Spheres();
	this.arrow		= new Arrow();

	this.startpoints = [];
	this.endpoints = [];

	this.selectedStartPoint = 0;
	this.selectedEndPoint = 0;

	this.initialized = false; // Has the wayfinding mode initialized
	this.hasStarted = false; // Have we started the wayfinding

	this.blobRadius			= 1.0; // Radius of start and end blobs
	this.blobHeight			= 0.1; // Height of start and end blobs
	this.blobTransparency	= 0.1; // Transparency of the blobs

	this.currentNavMode		= null;

	this.hasStarted			= false;

	this.updateSettings = function(settings) {
		if('wayfinder' in settings)
		{
			if ('startpoints' in settings['wayfinder'])
				self.startpoints = settings['wayfinder']['startpoints'];

			if ('endpoints' in settings['wayfinder'])
				self.endpoints = settings['wayfinder']['endpoints'];

			if ('blobRadius' in settings['wayfinder'])
				self.blobRadius = settings['wayfinder']['blobRadius'];

			if ('blobHeight' in settings['wayfinder'])
				self.blobHeight = settings['wayfinder']['blobHeight'];

			if ('blobTransparency' in settings['wayfinder'])
				self.blobTransparency = settings['wayfinder']['blobTransparency'];
		}
	}

	this.resetViewer = function () {
		// TODO: In here, we should initialize the random starting position
		var currentStartPoint	= self.startpoints[self.selectedStartPoint].slice(0);

		currentStartPoint[1] += viewer.avatarHeight;
		currentStartPoint[2] += 10.0; // TODO: Should be smarter than this

		viewer.setCameraPosition(currentStartPoint[0], currentStartPoint[1], currentStartPoint[2]);
		viewer.disableClicking();
		self.hasStarted = false;
		self.initialized = false;

		// TODO: Should waypoint be accessing the internals
		viewer.nav.setAttribute('type', 'WALK');
	}

	this.checkFinished = function(event, objEvent) {
		if(self.hasStarted && self.initialized)
		{
			objEvent.position.y -= viewer.avatarHeight;

			var endDist = viewer.evDist(objEvent, self.endpoints[self.selectedEndPoint]);

			if (endDist < (self.blobRadius + viewer.avatarHeight))
			{
				viewer.displayMessage("Finished", [1, 0, 0], 2000);

				self.recorder.stopRecording();
				viewer.nav.setAttribute('type','NONE');
				setTimeout( function() { self.initRecordMode(); }, 3000);

				self.hasStarted = false;
			}
		}
	}

	this.checkStarted = function(event, objEvent) {
		if(!self.hasStarted && self.initialized)
		{
			var startDist = viewer.evDist(objEvent, self.startpoints[self.selectedStartPoint]);

			console.log("DIST: " + startDist);
			console.log(self.blobRadius + viewer.avatarHeight);

			if (startDist < (self.blobRadius + viewer.avatarHeight)) {
				viewer.displayMessage("Started", [0,1,0], 2000);

				self.hasStarted = true;
			}
		}
	}

	this.checkInit = function(event, objEvent) {
		// Potentially flying through the air after reset,
		// so need to check when we get back to the start.
		if (!self.initialized)
		{
			var currentStartPoint	= self.startpoints[self.selectedStartPoint].slice(0);

			currentStartPoint[1] += viewer.avatarHeight;
			currentStartPoint[2] += 10.0; // TODO: Should be smarter than this

			var initDist = viewer.evDist(objEvent, currentStartPoint);

			if (initDist < (self.blobRadius + viewer.avatarHeight)) {
				self.initialized = true;
				viewer.displayMessage('Step on pad to begin', [0, 255, 0], 2000);
			}
		}
	}

	this.initRecordMode = function() {
		var currentStartPoint	= self.startpoints[self.selectedStartPoint].slice(0);
		var currentEndPoint		= self.endpoints[self.selectedEndPoint].slice(0);

		self.spheres.addSphere(currentStartPoint, self.blobRadius, self.blobHeight, [0, 1, 0], self.blobTransparency);
		self.spheres.addSphere(currentEndPoint, self.blobRadius, self.blobHeight, [1, 0, 0], self.blobTransparency);
		self.arrow.addArrow(currentEndPoint, [1, 0, 0], 0.3);

		viewer.getViewArea()._mouseSensitivity = 360.0;
		self.resetViewer();

		$(document).on("onViewpointChange", self.checkStarted);
		$(document).on("onViewpointChange", self.checkFinished);
		$(document).on("onViewpointChange", self.checkInit);
	}

	this.clear = function() {
		if (self.initialized)
		{
			self.spheres.clearSpheres();
			self.arrow.clearArrow();
		}
	}

	this.setNavMode = function(mode) {
		self.clear();

		self.currentNavMode = mode;

		if (mode == 'RECORD') {
			self.initRecordMode();
		} else if (mode == 'VIEWING') {
			self.initViewingMode();
		} else if (mode == 'FLYTHROUGH') {
			self.initFlyThroughMode();
		}
	}

	this.init = function() {
		self.setNavMode('RECORD');
	}

	this.close = function() {
		self.clear();
		viewer.enableClicking();

		$(document).off("onViewpointChange", self.checkStarted);
		$(document).off("onViewpointChange", self.checkFinished);
		$(document).off("onViewpointChange", self.checkInit);
	}
}
