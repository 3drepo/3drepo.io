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
		.component("panelCardOptionVisible", {
			restrict: "E",
			templateUrl: "panel-card-option-visible.html",
			bindings: {
				visible: "="
			},
			controller: PanelCardOptionVisibleCtrl,
			controllerAs: "vm"
		});

	function PanelCardOptionVisibleCtrl() {
		var vm = this;

		vm.icon = "visibility";

		vm.toggleVisible = function (event) {
			event.stopPropagation();
			vm.visible = !vm.visible;
			vm.icon = vm.visible ? "visibility" : "visibility_off";
		};
	}
}());
