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
.service('ViewerService', ['$window', 'StateManager', 'serverConfig', function($window, StateManager, serverConfig){
	var self = this;

	this.init = function() {
		// Viewer Manager controls layout of viewer
		self.viewerManager = new ViewerManager();
		self.defaultViewer = self.viewerManager.getDefaultViewer();
		self.defaultViewer.enableClicking();

		self.loadModel();

		// Comes free with oculus support and gamepad support :)
		self.oculus		= new Oculus(self.defaultViewer);
		self.gamepad	= new Gamepad(self.defaultViewer);
		self.gamepad.init();
	}

	this.loadModel = function() {
		var branch		= StateManager.state.branch ? StateManager.state.branch : "master";
		var revision	= StateManager.state.revision ? StateManager.state.revision : "head";
		var url = null;

		if (revision == "head")
		{
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + branch + '/head.x3d.src');
		} else {
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + revision + '.x3d.src');
		}

		self.defaultViewer.loadURL(url);
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

