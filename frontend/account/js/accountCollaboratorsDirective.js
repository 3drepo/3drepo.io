/**
 *	Copyright (C) 2016 3D Repo Ltd
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
		.directive("accountCollaborators", accountCollaborators);

	function accountCollaborators() {
		return {
			restrict: 'EA',
			templateUrl: 'accountCollaborators.html',
			scope: {
				showPage: "&"
			},
			controller: AccountCollaboratorsCtrl,
			controllerAs: 'vm',
			bindToController: true
		};
	}

	AccountCollaboratorsCtrl.$inject = [];

	function AccountCollaboratorsCtrl() {
		var vm = this;

		/*
		 * Init
		 */
		vm.collaborators = {
			"jozefdobos": "",
			"timscully": ""
		};

		/**
		 * Remove a collaborator
		 *
		 * @param collaborator
		 */
		vm.removeCollaborator = function (collaborator) {
			delete vm.collaborators[collaborator];
		};
	}
}());
