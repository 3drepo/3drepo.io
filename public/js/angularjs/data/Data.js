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
		'CurrentDiffBranch', 'CurrentDiffRevision', 'Federation', 'Log', 'Readme', 'RevisionsByDay', 'UserData', 'Users', 'Wayfinder', '$state',
		function (ProjectData, Branches, Comments, CurrentBranch, CurrentRevision, CurrentDiffBranch,
			CurrentDiffRevision, Federation, Log, Readme, RevisionsByDay, UserData, Users, Wayfinder, $state) {

			this.ProjectData			= ProjectData;
			this.Branches				= Branches;
			this.Comments				= Comments;
			this.CurrentBranch			= CurrentBranch;
			this.CurrentDiffBranch		= CurrentDiffBranch;
			this.CurrentRevision		= CurrentRevision;
			this.CurrentDiffRevision	= CurrentDiffRevision;
			this.Federation				= Federation;
			this.Log					= Log;
			this.Readme					= Readme;
			this.RevisionsByDay			= RevisionsByDay;
			this.UserData				= UserData;
			this.Users					= Users;
			this.Wayfinder				= Wayfinder;

			this.state	= {
				account:			null,
				project:			null,
				user:				null,
				branch:				null,
				revision:			null,

				// View and pagination
				view:				"info",
				currentPage:		1,
				totalItems:			0,
				itemsPerPage:		5,

				// Diff state
				diffEnabled:		false,
				diffBranch:			null,
				diffRevision:		null,

				// Wayfinder function
				wayfinderEnabled:	false
			}

			this.changed = {};

			for(var i in this.state)
				this.changed[i] = false;

			var self = this;

			this.updatePaginatedView = function()
			{
				var first = (self.state.currentPage - 1) * self.state.itemsPerPage;
				var last  = Math.min(self.state.totalItems - 1, self.state.currentPage * self.state.itemsPerPage - 1);

				if (self.state.view == "comments")
					self.Comments.refresh(self.state.account, self.state.project, first, last);
				else if (self.state.view == "log")
					self.Log.refresh(self.state.account, self.state.project, first, last);
				else if (self.view == "revisions")
					self.RevisionsByDay.refresh(self.state.account, self.state.project, self.state.branch, first, last);
			}

			this.genStateName = function()
			{
				var stateName = "";

				if (self.state.account && !self.state.project) {
					stateName = "home";
				} else if (self.state.account && self.state.project) {
					stateName = "main";

					if (self.state.revision)
						stateName += ".revision";
					else if (self.state.branch)
						stateName += ".branch";

					// Functions go here
					if (self.state.wayfinder)
						stateName += ".wayfinder";
					else if (self.state.diffEnabled)
						stateName += ".diff";

					if (self.state.view)
						stateName += ".view";
				}

				return stateName;
			}

			this.setStateVar = function(varName, value)
			{
				if (!(self.state[varName] == value))
					self.changed[varName] = true;

				self.state[varName] = value;
			}

			this.setState = function(stateParams, extraParams)
			{
				var stateObj = $.extend(stateParams, extraParams);

				console.log("PARAMS: " + JSON.stringify(stateParams) + " ...");

				// Copy all state parameters and extra parameters
				// to the state
				for(var i in stateObj)
					if (i in self.state)
						self.setStateVar(i, stateObj[i]);

				// Clear out anything that hasn't been set
				if ("clearState" in extraParams)
					if (extraParams["clearState"])
						for(var i in self.state)
							if (!(i in stateObj))
								if (typeof self.state[i] == 'boolean')
									self.setStateVar(i, false);
								else
									self.setStateVar(i, null);

				self.refresh();
			}

			this.clearChanged = function()
			{
				for(var i in self.changed)
					self.changed[i] = false;
			}

			this.refresh = function()
			{
				var stateName = self.genStateName();

				console.log("REFRESHING " + stateName + " ...");

				if (stateName.search("home") > -1)
				{
					// If only the home page then simply load user info
					self.UserData.refresh(self.state.account);
				} else {
					// For the main page load everything that you can
					if (self.changed.project) {
						self.ProjectData.refresh(self.state.account, self.state.project);
						self.Branches.refresh(self.state.account, self.state.project);

						// If we have changed the project but the branch
						// and revision aren't set, select master branch.
						if (!self.state.branch && !self.state.revision)
							self.setStateVar("branch", "master");
					}

					if (self.changed.branch)
					{
						self.CurrentBranch.refresh(self.state.account, self.state.project, self.state.branch);

						// If we have changed branch but not selected
						// a revision then select head.
						if (!self.state.revision)
							self.setStateVar("revision", "head");
					}

					if (self.changed.revision)
					{
						self.CurrentRevision.refresh(self.state.account, self.state.project, self.state.branch, self.state.revision)
						.then(function () {
							self.setStateVar("revision", self.CurrentRevision.revision);
						});
					}

					if (self.state.diffEnabled)
					{
						if (self.changed.diffBranch)
						{
							self.CurrentDiffBranch.refresh(self.state.account, self.state.project, self.state.diffBranch);

							// If we have changed branch but not selected
							// a revision then select head.
							if (!self.state.diffRevision)
								self.setStateVar("diffRevision", "head");
						}

						if (self.changed.diffRevision)
						{
							self.CurrentDiffRevision.refresh(self.state.account, self.state.project, self.state.diffBranch, self.state.diffRevision)
							.then(function () {
								self.setStateVar("diffRevision", self.CurrentDiffRevision.revision);
							});
						}
					}

					if (self.changed.view)
					{
						if (self.state.view == 'info')
						{
							self.Readme.refresh(self.state.account, self.state.project, self.state.branch, self.state.revision);
						} else if (self.state.view == 'comments') {
							self.Comments.getNumberOfComments(self.state.account, self.state.project)
							.then(function(n_comments) {
								self.state.totalItems = n_comments;
								self.updatePaginatedView();
							});
						} else if (self.state.view == 'log') {
							self.Log.getNumberOfLogEntries(self.state.account, self.state.project)
							.then(function(n_logentries) {
								self.state.totalItems = n_logentries;
								self.updatePaginatedView();
							});
						} else if (self.state.view == 'revisions') {
							self.RevisionsByDay.getNumberOfRevisions(self.state.account, self.state.project, self.state.branch)
							.then(function(n_revisions) {
								self.state.totalItems = n_revisions;
								self.updatePaginatedView('revisions');
							});
						} else if (self.state.view == 'settings') {
							self.Users.refresh(self.state.account, self.state.project);
						} else if (self.state.view) {
							// Unknown view
							self.setStateVar("view", null);
							return self.updateState();
						}
					}
				}

				self.clearChanged();
			}

			this.updateState = function()
			{
				$state.transitionTo(self.genStateName(), self.state, { location: true, inherit: true, relative: $state.$current, notify: false});
			}
}]);

