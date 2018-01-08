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

class PanelCardOptionVisibleController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
	];

	private visible;
	private icon;

	constructor(
		private $scope: ng.IScope,
	) {
		this.icon = "visibility";
	}

	public $ngInit() {
		this.$scope.$watch("vm.visible", () => {
			console.log("vm.visible", this.visible);
			//
		});
	}

	public toggleVisible(event) {
		event.stopPropagation();
		this.visible = !this.visible;
		this.icon = this.visible ? "visibility" : "visibility_off";
	}

}

export const PanelCardOptionVisibleComponent: ng.IComponentOptions = {
	bindings: {
		visible: "=",
	},
	controller: PanelCardOptionVisibleController,
	controllerAs: "vm",
	templateUrl: "templates/panel-card-option-visible.html",
};

export const PanelCardOptionVisibleComponentModule = angular
	.module("3drepo")
	.component("panelCardOptionVisible", PanelCardOptionVisibleComponent);
