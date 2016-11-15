/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the issuesListItem of the GNU Affero General Public License as
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
		.component(
			"issuesListItem",
			{
				controller: IssuesListItemCtrl,
				templateUrl: "issuesListItem.html",
				bindings: {
					data: "<",
					userRoles: "<"
				}
			}
		);

	IssuesListItemCtrl.$inject = ["$element", "$timeout", "IssuesService"];

	function IssuesListItemCtrl ($element, $timeout, IssuesService) {
		var self = this,
			issueRoleIndicator = null;

		/*
		 * Init
		 */
		this.IssuesService = IssuesService;

		/**
		 * Init callback
		 */
		this.$onInit = function () {
			// Role indicator
			$timeout(function () {
				issueRoleIndicator = angular.element($element[0].querySelector('#issueRoleIndicator'));
				setRoleIndicatorColour();
			});
		};

		/**
		 * Monitor changes to parameters
		 * @param {Object} changes
		 */
		this.$onChanges = function (changes) {
			// Data
			if (changes.hasOwnProperty("data") && this.data) {
				setRoleIndicatorColour();

				// Title
				if (this.userRoles) {
					this.assignedToUserRole = (this.data.assigned_roles[0] === this.userRoles[0]);
				}
			}

			// User roles
			if (changes.hasOwnProperty("userRoles") && this.userRoles) {
				// Title
				if (this.data) {
					this.assignedToUserRole = (this.data.assigned_roles[0] === this.userRoles[0]);
				}
			}
		};

		/**
		 * Set role indicator colour
		 */
		function setRoleIndicatorColour () {
			var assignedRoleColour;

			if (self.data && issueRoleIndicator) {
				if (self.data.assigned_roles.length > 0) {
					assignedRoleColour = IssuesService.getRoleColor(self.data.assigned_roles[0]);
				}
				else {
					assignedRoleColour = IssuesService.getRoleColor(self.data.creator_role);
				}
				issueRoleIndicator.css("background", assignedRoleColour);
			}
		}
	}
}());
