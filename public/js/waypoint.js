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

var Waypoint = function(viewer, account, project) {
	var self = this;

	this.viewer = viewer;

	this.account    = account;
	this.project    = project;

	this.recorder	= new Recorder(this.viewer, this.account, this.project);
	this.spheres	= new Spheres(this.viewer);
	this.arrow		= new Arrow(this.viewer);

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

	this.readmeFloat		= null;

	this.uids				= null;

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

			if ('speed' in settings['wayfinder'])
				self.viewer.setSpeed(settings['wayfinder']['speed']);
		}
	}

	this.resetViewer = function () {
		// TODO: In here, we should initialize the random starting position
		var currentStartPoint	= self.startpoints[self.selectedStartPoint].slice(0);

		currentStartPoint[1] += self.viewer.avatarHeight;
		currentStartPoint[2] += 10.0; // TODO: Should be smarter than this

		self.viewer.setCameraPosition(currentStartPoint[0], currentStartPoint[1], currentStartPoint[2]);
		self.viewer.disableClicking();
		self.hasStarted = false;
		self.initialized = false;

		// TODO: Should waypoint be accessing the internals
		self.viewer.nav.setAttribute('type', 'NONE');
	}

	this.checkFinished = function(event, objEvent) {
		if(self.hasStarted && self.initialized)
		{
			objEvent.position.y -= self.viewer.avatarHeight;

			var endDist = self.viewer.evDist(objEvent, self.endpoints[self.selectedEndPoint]);

			if (endDist < (self.blobRadius + self.viewer.avatarHeight))
			{
				self.viewer.displayMessage("Finished", [255.0, 0.0, 0.0], 2000);

				self.recorder.stopRecording();
				self.viewer.nav.setAttribute('type','NONE');
				setTimeout( function() { self.initRecordMode(); }, 3000);

				self.hasStarted = false;
			}
		}
	}

	this.checkStarted = function(event, objEvent) {
		if(!self.hasStarted && self.initialized)
		{
			var startDist = self.viewer.evDist(objEvent, self.startpoints[self.selectedStartPoint]);

			if (startDist < (self.blobRadius + self.viewer.avatarHeight)) {
				self.viewer.displayMessage("Started", [0.0, 255.0, 0.0], 2000);
				self.recorder.startRecording();
				self.hasStarted = true;
			}
		}
	}

	this.begin = function() {
		self.initialized = true;
		self.viewer.displayMessage('Step on green pad to begin', [0.0, 255.0, 0.0], 0);
		// TODO: Should waypoint be accessing the internals
		self.viewer.nav.setAttribute('type', 'WALK');
	}

	this.checkInit = function(event, objEvent) {
		// Potentially flying through the air after reset,
		// so need to check when we get back to the start.
		if (!self.initialized && !self.paused)
		{
			var currentStartPoint	= self.startpoints[self.selectedStartPoint].slice(0);

			currentStartPoint[1] += self.viewer.avatarHeight;
			currentStartPoint[2] += 10.0; // TODO: Should be smarter than this

			var initDist = self.viewer.evDist(objEvent, currentStartPoint);

			if (initDist < (self.blobRadius + self.viewer.avatarHeight)) {
				self.begin();
			}
		}
	}

	this.initRecordMode = function() {
		var currentStartPoint	= self.startpoints[self.selectedStartPoint].slice(0);
		var currentEndPoint		= self.endpoints[self.selectedEndPoint].slice(0);

		self.clear();

		self.spheres.addSphere(currentStartPoint, self.blobRadius, self.blobHeight, [0, 1, 0], self.blobTransparency);
		self.spheres.addSphere(currentEndPoint, self.blobRadius, self.blobHeight, [1, 0, 0], self.blobTransparency);
		self.arrow.addArrow(currentEndPoint, [1, 0, 0], 0.3);

		self.viewer.getViewArea()._mouseSensitivity = 360.0;
		self.resetViewer();

		self.viewer.onViewpointChanged(self.checkStarted);
		self.viewer.onViewpointChanged(self.checkFinished);
		self.viewer.onViewpointChanged(self.checkInit);
	}

	this.initViewingMode = function(pointdata) {
		self.clear();
		self.spheres.plotSpheres(pointdata);
		self.viewer.nav.type = 'EXAMINE';
	}

	this.clear = function() {
		self.spheres.clearSpheres();
		self.arrow.clearArrow();
	}

	this.paused = true;
	this.pause = function() { self.paused = true; }
	this.unpause = function() { self.paused = false; }

	this.init = function() {
		self.initRecordMode();
	}

	this.close = function() {
		self.clear();
		self.viewer.enableClicking();

		self.recorder.stopRecording(true);
		self.hasStarted = false;
		self.initialized = false;

		self.viewer.offViewpointChanged(self.checkStarted);
		self.viewer.offViewpointChanged(self.checkFinished);
		self.viewer.offViewpointChanged(self.checkInit);
	}
}
