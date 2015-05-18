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
.service('DiffViewerService', ['StateManager', 'serverConfig', 'ViewerService', function(StateManager, serverConfig, ViewerService){
	var self = this;
	self.diffViewer = null;

	this.switchDiff = function (enable) {
		ViewerService.viewerManager.diffView(enable);

		self.diffViewer = ViewerService.viewerManager.getDiffViewer();
	}

	this.loadModel = function() {
		var branch		= StateManager.state.diffbranch ? StateManager.state.diffbranch : "master";
		var revision	= StateManager.state.diffrevision ? StateManager.state.diffrevision : "head";
		var url = null;

		if (revision == "head")
		{
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + branch + '/head.x3d.src');
		} else {
			url = serverConfig.apiUrl(StateManager.state.account + '/' + StateManager.state.project + '/revision/' + revision + '.x3d.src');
		}

		self.diffViewer.loadURL(url);
	}
}]);

