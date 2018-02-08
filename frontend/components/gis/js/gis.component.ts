/**
 *	Copyright (C) 2017 3D Repo Ltd
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

class GISController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$q",

		"GISService",
	];

	private selectedProvider: any;
	private providers: any[];
	private modelSettings: any;

	constructor(
		private $scope: any,
		private $q: any,

		private GISService: any,
	) {}

	public $onInit() {

		this.watchers();
		this.providers = this.GISService.getProviders();
		this.selectedProvider = this.providers[0];
	}

	public $onDestroy() {

	}

	public watchers() {
		this.$scope.$watch("vm.modelSettings", () => {
			console.log(this.modelSettings);
			if (
				this.modelSettings &&
				this.modelSettings.surveyPoints &&
				this.modelSettings.surveyPoints.length
			) {
				console.log("modelSettings.surveyPoints", this.modelSettings.surveyPoints)
				this.GISService.mapInitialise(this.modelSettings.surveyPoints);
			}
		});
	}

	public toggleLayerVisibility(layer: any) {
		this.GISService.toggleLayerVisibility(layer);
	}

}

export const GISComponent: ng.IComponentOptions = {
	bindings: {
		account: "<",
		model: "<",
		revision: "<",
		modelSettings: "<",
	},
	controller: GISController,
	controllerAs: "vm",
	templateUrl: "templates/gis.html",
};

export const GISComponentModule = angular
	.module("3drepo")
	.component("gis", GISComponent);
