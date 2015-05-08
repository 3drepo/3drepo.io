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
.service('StateManager', ['$injector', function($injector) {
		/*['ProjectData', 'Branches', 'Comments', 'CurrentBranch', 'CurrentRevision',
		'CurrentDiffBranch', 'CurrentDiffRevision', 'Federation', 'Log', 'Readme', 'RevisionsByDay', 'UserData', 'Users', 'Wayfinder', '$state',
		function (ProjectData, Branches, Comments, CurrentBranch, CurrentRevision, CurrentDiffBranch,
			CurrentDiffRevision, Federation, Log, Readme, RevisionsByDay, UserData, Users, Wayfinder, $state) {
		*/
			var self = this;

			this.Data = {};

			/*
			this.ProjectData			= ProjectData;

			// Revision
			this.Branches				= Branches;
			this.Comments				= Comments;
			this.CurrentBranch			= CurrentBranch;
			this.CurrentRevision		= CurrentRevision;
			this.Federation				= Federation;
			this.Log					= Log;
			this.Readme					= Readme;
			this.RevisionsByDay			= RevisionsByDay;
			this.UserData				= UserData;
			this.Users					= Users;

			// Diff
			this.CurrentDiffBranch		= CurrentDiffBranch;
			this.CurrentDiffRevision	= CurrentDiffRevision;

			// Wayfinding
			this.Wayfinder				= Wayfinder;
			*/

			this.enabled				= {},

			this.state	= {};

			/*
				account:			null,
				project:			null,

				user:				null,

				branch:				null,
				revision:			null,

				// View and pagination
				view:				"info",
				currentPage:		1,
				totalItems:			0,
				itemsPerPage:		5

				// Diff state
				diffBranch:			null,
				diffRevision:		null

				// Wayfinder function
				enabled:			false,
				uids:				null
			}
			*/

			this.ui = {};

			/*
			this.ui = {
				treeView:			true,
				metaView:			true,
				footerBar:			true,
				revisionSelector:	true,

				// TODO: Split this out into individual controllers
				// Wayfinding stuff
				wayfinder: {
					readme:			false,
					multiselect:	false,
					select:			false
				}
			};
			*/

			this.pluginLevel = {};

			this.changed = {};

			this.clearChanged = function()
			{
				for(var i in self.changed)
					self.changed[i] = false;
			}

			self.clearChanged();

			this.registerPlugin = function(dataFactory, level)
			{
				// Inject the data factory for a plugin
				this.Data[dataFactory] = $injector.get(dataFactory);

				if (!(level in self.pluginLevel))
					self.pluginLevel[level] = [];

				self.pluginLevel[level].push(this.Data[dataFactory]);
			}

			this.genStateName = function ()
			{
				var stateName = "";
				var levels = Object.keys(self.pluginLevel);

				for(var lvlidx = 0; lvlidx < levels.length; lvlidx++)
				{
					var validLevel = false;

					for (var pluginidx = 0; pluginidx < self.pluginLevel.length; pluginidx++)
					{
						var level = levels[lvlidx];
						var pluginStateName = self.pluginLevel[level][pluginidx].genStateName();

						if (stateName != null)
						{
							if (validLevel)
							{
								console.log('error', 'Conflicting plugins loaded at level ' + level);
								return null;
							} else {
								validLevel = true;
								stateName += pluginStateName;
							}
						}
					}

					if (!validLevel)
					{
						console.log('error', 'No valid plugin found for level ' + level);
						return null;
					} else {
						if (lvlidx != (levels.length - 1))
							stateName + ".";
					}
				}
			}

			this.refresh = function()
			{
				for(key in this.Data)
					this.Data[key].refresh();
			}

			this.createStateVar = function(varName, value)
			{
				// TODO: Check for duplication
				this.state.varName = value;
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

				// Copy all state parameters and extra parameters
				// to the state
				for(var i in stateObj)
				{
					if (!(i in self.state))
						self.createStateVar(i, stateObj[i]);

					self.setStateVar(i, stateObj[i]);
				}

				// Clear out anything that hasn't been set
				if (extraParams["clearState"])
					for(var i in self.state)
						if (!(i in stateObj))
							if (typeof self.state[i] == 'boolean')
								self.setStateVar(i, false);
							else
								self.setStateVar(i, null);

				self.refresh();
			}

			this.updateState = function()
			{
				console.log('Moving to ' + self.genStateName() + ' ...');
				$state.transitionTo(self.genStateName(), self.state, { location: true, inherit: true, relative: $state.$current, notify: false});
			}

			/*
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

					if (self.state.wayfinder)
						if (self.state.mode)
							stateName += "." + self.state.mode;
					else
						if (self.state.view)
							stateName += ".view";
				}

				return stateName;
			}
			*/

			/*
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

					// Cannot be in both diff and wayfinder mode at the same time
					if (self.state.wayfinder && self.state.diffEnabled)
					{
						if (self.changed.wayfinder)
							self.setStateVar("diffEnabled", false);
						else
							self.setStateVar("wayfinder", false);

						return self.updateState(); // Resolve this
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

					if (self.changed.wayfinder || self.changed.mode)
					{
						if (self.state.wayfinder)
						{
							self.ui.treeView			= false;
							self.ui.metaView			= false;
							self.ui.footerBar			= false;
							self.ui.revisionSelector	= false;
						} else  {
							self.ui.treeView			= true;
							self.ui.metaView			= true;
							self.ui.footerBar			= true;
							self.ui.revisionSelector	= true;
						}

						if (self.changed.mode)
						{
							self.Wayfinder.refresh(self.state.account, self.state.project);

							if(self.state.mode == "record")
							{
								self.ui.wayfinder.readme = true;
								self.ui.wayfinder.multiselect = false;
								self.ui.wayfinder.select = false;
								self.setStateVar("uids", null);
							} else if (self.state.mode == "visualize" || self.state.mode == "flythrough") {
								if (self.state.uids)
								{
									self.ui.wayfinder.multiselect = false;
									self.ui.wayfinder.readme = false;
									self.Wayfinder.loadUIDS(self.state.uids);
								} else {
									if(self.state.mode == "visualize")
										self.ui.wayfinder.multiselect = true;
									else
										self.ui.wayfinder.select = true;
								}
							}
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
			*/

}]);

