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
	.directive("viewermanager", viewerManager);

	function viewerManager() {
		return {
			restrict: 'E',
			scope: {},
			controller : ViewerManagerCtrl,
			template: '<viewer class="project-viewport viewport" handle="{{vm.defaultHandle}}" manager="vm.manager" />',
			controllerAs: 'vm',
			bindToController: true
		};
	}

	ViewerManagerCtrl.$inject = ["$element"];

	function ViewerManagerCtrl ($element)
	{
		var vm = this;
		vm.manager = new ViewerManager($element[0]);
		vm.defaultHandle = vm.manager.defaultViewerHandle;
	}

}());