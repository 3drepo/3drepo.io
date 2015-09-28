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
.service('ViewerService', ['$window', 'StateManager', 'serverConfig', '$http', '$q', function($window, StateManager, serverConfig, $http, $q){
	var self = this;
	var readyQ = $q.defer();

	self.ready = readyQ.promise;

	this.init = function() {
		// Viewer Manager controls layout of viewer
		self.viewerManager = new ViewerManager();
		self.defaultViewer = self.viewerManager.getDefaultViewer();
		self.defaultViewer.enableClicking();

		$window.viewer = self.defaultViewer;

		// TODO: Move this so that the attachment is contained
		// within the plugins themselves.
		// Comes free with oculus support and gamepad support
		self.oculus		= new Oculus(self.defaultViewer);
		self.gamepad	= new Gamepad(self.defaultViewer);
		self.gamepad.init();

		self.collision  = new Collision(self.defaultViewer);

		readyQ.resolve();
	}

	this.linkFunction = function (callback)
	{
		self.viewerManager.linkFunction(callback);
	}

	this.loadModel = function() {
		var branch		= StateManager.state.branch ? StateManager.state.branch : "master";
		var revision	= StateManager.state.revision ? StateManager.state.revision : "head";

		var url = null;

		if (revision == "head")
		{
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + branch + '/head.x3d.mp');
		} else {
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + revision + '.x3d.mp');
		}

		self.defaultViewer.loadURL(url);
		self.defaultViewer.setCurrentViewpoint("model__" + StateManager.state.account + "_" + StateManager.state.project + "_origin");
	}

	this.pickPoint = function(x,y)
	{
		self.defaultViewer.pickPoint(x,y);
		return self.defaultViewer.pickObject;
	}

	this.switchVR = function()
	{
		if(self.oculus)
			self.oculus.switchVR();
	}

	this.close = function() {
		// Close down oculus and gamepad support
		delete $window.oculus;
		delete $window.collision;

		// Close down the viewer manager
		self.viewerManager.close();
		delete $window.viewerManager;
		self.defaultViewer = null;
	}
}]);

