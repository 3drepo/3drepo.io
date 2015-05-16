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
.factory('ViewData', ['StateManager', 'Readme', 'Comments', 'Log', 'RevisionsByDay', 'Users', function(StateManager, Readme, Comments, Log, RevisionsByDay, Users){
	var o = {
		Readme:				Readme,
		Comments:			Comments,
		Log:				Log,
		RevisionsByDay:		RevisionsByDay,
		Users:				Users,
		totalItems:			0,
		currentPage:		1,
		itemsPerPage:		0
	};

	o.genStateName = function () {
		if (StateManager.state.view)
			return "view";
		else
			return null;
	}

	o.updatePaginatedView = function(view)
	{
		var self = this;
		var first = (self.currentPage - 1) * self.itemsPerPage;
		var last  = Math.min(self.totalItems - 1, self.currentPage * self.itemsPerPage - 1);

		if (view == "comments")
			self.Comments.refresh(StateManager.state.account, StateManager.state.project, first, last);
		else if (view == "log")
			self.Log.refresh(StateManager.state.account, StateManager.state.project, first, last);
		else if (view == "revisions")
			self.RevisionsByDay.refresh(StateManager.state.account, StateManager.state.project, StateManager.state.branch, first, last);
	}

	o.refresh = function() {
		var self = this;
		var view = StateManager.state.view;

		if (view == 'info')
		{
			self.Readme.refresh(StateManager.state.account, StateManager.state.project, StateManager.state.branch, StateManager.state.revision);
		} else if (StateManager.state.view == 'comments') {
			self.Comments.getNumberOfComments(StateManager.state.account, StateManager.state.project)
			.then(function(n_comments) {
				self.totalItems = n_comments;
				self.updatePaginatedView();
			});
		} else if (view == 'log') {
			self.Log.getNumberOfLogEntries(StateManager.state.account, StateManager.state.project)
			.then(function(n_logentries) {
				self.totalItems = n_logentries;
				self.updatePaginatedView();
			});
		} else if (view == 'revisions') {
			self.RevisionsByDay.getNumberOfRevisions(StateManager.state.account, StateManager.state.project, StateManager.state.branch)
			.then(function(n_revisions) {
				self.totalItems = n_revisions;
				self.updatePaginatedView('revisions');
			});
		} else if (view == 'settings') {
			self.Users.refresh(StateManager.state.account, StateManager.state.project);
		} else if (view) {
			// Unknown view
			StateManager.setStateVar("view", null);
			return StateManager.updateState();
		}
	}

	return o;
}]);
