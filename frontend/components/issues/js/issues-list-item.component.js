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
 *	along with vm program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function () {
	"use strict";

	angular.module("3drepo")
		.component(
			"issuesListItem",
			{
				controller: IssuesListItemCtrl,
				templateUrl: "templates/issues-list-item.html",
				bindings: {
					data: "<",
					userJob: "<"
				},
				controllerAs: "vm"
			}
		);

	IssuesListItemCtrl.$inject = ["$scope", "IssuesService"];

	function IssuesListItemCtrl ($scope, IssuesService) {
		var vm = this;

		/**
		 * Init
		 */
		vm.$onInit = function () {
			vm.setRoleIndicatorColour();
		};

		/**
		 * Monitor changes to parameters
		 * @param {Object} changes
		 */
		$scope.$watch("data", function () {

			// Data
			if (vm.data) {
				vm.setRoleIndicatorColour();

				// Title
				if (vm.userJob) {
					vm.assignedToAUserRole = issueIsAssignedToAUserRole();
				}
			}

		});

		$scope.$watch("userJob", function () {
			
			// User roles
			if (vm.userJob) {
				// Title
				if (vm.data) {
					vm.assignedToAUserRole = issueIsAssignedToAUserRole();
				}
			}

		});

		vm.getStatusIcon = function(issueData) {
			return IssuesService.getStatusIcon(issueData).icon;
		};

		vm.getStatusColour = function(issueData) {
			return IssuesService.getStatusIcon(issueData).colour;
		};

		/**
		 * Set role indicator colour
		 */
		vm.setRoleIndicatorColour = function() {
			if (vm.data && (vm.data.assigned_roles.length > 0)) {
				var assignedRole = vm.data.assigned_roles[0];
				vm.issueRoleColor = vm.issueRoleColor = IssuesService.getJobColor(assignedRole);
			}
		}

		/**
		 * Check if the issue is assigned to one of the user's roles
		 */
		function issueIsAssignedToAUserRole () {
			return vm.data.assigned_roles.indexOf(vm.userJob._id) !==  -1;
		}

	}
}());
