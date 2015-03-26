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
.service('Data', ['ProjectData', 'Branches', 'Comments', 'CurrentBranch', 'CurrentRevision',
		'Federation', 'Log', 'Readme', 'RevisionsByDay', 'UserData', 'Users',
		function (ProjectData, Branches, Comments, CurrentBranch, CurrentRevision, Federation,
			Log, Readme, RevisionsByDay, UserData, Users) {

			this.ProjectData		= ProjectData;
			this.Branches			= Branches;
			this.Comments			= Comments;
			this.CurrentBranch		= CurrentBranch;
			this.CurrentRevision	= CurrentRevision;
			this.Federation			= Federation;
			this.Log				= Log;
			this.Readme				= Readme;
			this.RevisionsByDay		= RevisionsByDay;
			this.UserData			= UserData;
			this.Users				= Users;

			this.account			= null;
			this.project			= null;
			this.user				= null;
			this.branch			= null;
			this.revision			= null;

			this.currentPage	= 0;
			this.totalItems		= 1;
			this.itemsPerPage	= 5;

			this.view = "info";

			var self = this;

			this.updatePaginatedView = function(view)
			{
				var first = (self.currentPage - 1) * self.itemsPerPage;
				var last  = Math.min(self.totalItems - 1, self.currentPage * self.itemsPerPage - 1);

				if (view == "comments")
					self.Comments.refresh(self.account, self.project, first, last);
				else if (view == "log")
					self.Log.refresh(self.account, self.project, first, last);
				else if (view == "revisions")
					self.RevisionsByDay.refresh(self.account, self.project, self.branch, first, last);
			}

			this.setBranch = function(branch)
			{
				self.branch = branch;
				self.CurrentBranch.refresh(self.account, self.project, self.branch);
			}

			this.changeView = function(state, view, stateParams)
			{
				if (state == "home")
				{
					self.account = stateParams.account;
					self.UserData.refresh(self.account);

				} else if (state == 'main') {
					// Account and project with no specific branch (i.e. master/head)

					self.account	= stateParams.account;
					self.project	= stateParams.project;
					self.branch		= 'master';
					self.revision	= 'head';

					self.ProjectData.refresh(self.account, self.project);
					self.CurrentBranch.refresh(self.account, self.project, self.branch);
					self.CurrentRevision.refresh(self.account, self.project, self.branch, self.revision);
					self.Branches.refresh(self.account, self.project);
				} else if ((state == 'main.view') || (state == 'main.branch.view') || (state == 'main.revision.view')) {
					self.view = view;

					// ["info", "comments", "revisions", "log", "settings"];
					self.currentPage = 1;
					self.totalItems  = 0;

					if (view == 'info')
					{
						self.Readme.refresh(self.account, self.project, self.branch, self.revision);
					} else if (view == 'comments') {
						self.Comments.getNumberOfComments(self.account, self.project)
						.then(function(n_comments) {
							self.totalItems = n_comments;
							self.updatePaginatedView('comments');
						});
					} else if (view == 'log') {
						self.Log.getNumberOfLogEntries(self.account, self.project)
						.then(function(n_logentries) {
							self.totalItems = n_logentries;
							self.updatePaginatedView('log');
						});
					} else if (view == 'revisions') {
						self.RevisionsByDay.getNumberOfRevisions(self.account, self.project, self.branch)
						.then(function(n_revisions) {
							self.totalItems = n_revisions;
							self.updatePaginatedView('revisions');
						});
					} else if (view == 'settings') {
						self.Users.refresh(self.account, self.project);
					}
				} else if (state == 'main.branch') {
					self.branch = stateParams.branch;
					self.revision = 'head';

					self.CurrentBranch.refresh(self.account, self.project, self.branch);
					self.CurrentRevision.refresh(self.account, self.project, self.branch, self.revision);
				} else if (state == 'main.revision') {
					self.revision = stateParams.rid;

					self.CurrentBranch.refresh(self.account, self.project, self.branch);
					self.CurrentRevision.refresh(self.account, self.project, self.branch, self.revision);
				}
			};
}]);

