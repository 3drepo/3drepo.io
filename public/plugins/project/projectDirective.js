/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
	"use strict";

	angular.module("3drepo")
	.config([
	'$stateProvider',
	'parentStates',
	function($stateProvider, parentStates) {
		var states = parentStates["project"];

		for(var i = 0; i < states.length; i++) {
			$stateProvider
			.state(states[i] + '.project', {
				url: '/:project',
				resolve: {
					auth: function authCheck(Auth) { return Auth.init(); },
					init: function(StateManager, $stateParams) {
						StateManager.setStateVar("branch", "master");
						StateManager.setStateVar("revision", "head");
						StateManager.setState($stateParams, {});
						StateManager.refresh("project");
					}
				},
				views: {
					"@" : {
						templateUrl: 'project.html'
					}
				}
			})
		}
	}])
	.run(['StateManager', function(StateManager) {
		StateManager.registerPlugin('project', 'ProjectData', function () {
			if (StateManager.state.project)
				return "project";
			else
				return null;
		});

		StateManager.setClearStateVars("project", ["project"]);
	}])
	.directive("project", project);

    function project() {
        return {
            restrict: 'E',
            scope: {},
            controller: ProjectCtrl
        };
    }

	ProjectCtrl.$inject = ["$timeout", "EventService", "ViewerService", "StateManager", "ProjectService"];

	function ProjectCtrl($timeout, EventService, ViewerService, StateManager, ProjectService) {
		var panelContent = {
			left: [],
			right: []
		};

		var state = StateManager.state,
			promise,
			i, length;

		panelContent.left.push({
			type: "tree",
			title: "Tree",
			show: true,
			help: "Model elements shown in a tree structure",
			icon: "fa-sitemap",
			hasFilter: true,
            minHeight: 100,
            maxHeight: 820
		});

		panelContent.right.push({
			type: "issues",
			title: "Issues",
			show: true,
			help: "List current issues",
			icon: "fa-map-marker",
			hasFilter: true,
			canAdd: true,
			options: [
				{
					value: "sortByDate",
					label: "Sort by Date",
					firstSelectedIcon: "fa-sort-amount-desc",
					secondSelectedIcon: "fa-sort-amount-asc",
					toggle: false,
					selected: true,
					firstSelected: true,
					secondSelected: false
				},
				{
					value: "showClosed",
					label: "Show closed issues",
					toggle: true,
					selected: false,
					firstSelected: false,
					secondSelected: false
				}
			],
            minHeight: 100,
            maxHeight: 820
		});
		panelContent.right.push({
			type: "clip",
			title: "Clip",
			show: false,
			help: "Clipping plane",
			icon: "fa-object-group",
            maxHeight: 190
		});
		panelContent.right.push({
			type: "docs",
			title: "Docs",
			show: false,
			help: "Documents",
			icon: "fa-clone",
			maxHeight: 290
		});

		// Add filtering options for the Issues panel
		promise = ProjectService.getRoles();
		promise.then(function (data) {
			console.log(data);
			for (i = 0, length = data.length; i < length; i += 1) {
				panelContent.right[0].options.push(
					{
						value: "filterRole_" + data[i].role,
						label: data[i].role,
						toggle: true,
						selected: true,
						firstSelected: false,
						secondSelected: false
					}
				);
			}
		});

		StateManager.setStateVar("branch", "master");
		StateManager.setStateVar("revision", "head");
		StateManager.updateState();		// Want to preserve URL structure

		StateManager.Data.ProjectData.loadingPromise.promise.then(function() {
			ViewerService.defaultViewer.updateSettings(StateManager.Data.ProjectData.settings);
		});

		$timeout(function () {
			EventService.send(EventService.EVENT.PANEL_CONTENT_SETUP, panelContent);
		});
	}
}());
