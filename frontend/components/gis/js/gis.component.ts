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

		"ViewerService",
		"GISService"
	];

	private selectedProvider: any;
	private providers: any[];
	private modelSettings: any;
	private onContentHeightRequest: any;
	private account: string;
	private model: string;

	constructor(
		private $scope: any,
		private $q: any,

		private ViewerService: any,
		private GISService: any
	) {}

	public $onInit() {
		this.onContentHeightRequest({height: 130});
		this.watchers();
		this.GISService.getProviders(this.account, this.model)
			.then((providers) => {
				this.providers = providers;
				this.selectedProvider = this.providers[0];
				this.GISService.setMapSource(this.selectedProvider.source);
			});
	}

	public $onDestroy() {
		this.GISService.mapStop();
	}

	public watchers() {
		const modelsLoaded = this.$q.defer();

		this.$scope.$watch("vm.modelSettings", () => {

			if (
				this.modelSettings &&
				this.modelSettings.surveyPoints &&
				this.modelSettings.surveyPoints.length
			) {

				modelsLoaded.promise.then(() => {
					const surveySettings = {
						surveyPoints: this.modelSettings.surveyPoints,
						elevation: this.modelSettings.elevation || 0,
						angleFromNorth: this.modelSettings.angleFromNorth || 0
					};
					this.GISService.mapInitialise(surveySettings);
				});
			}
		});

		this.$scope.$watch(
			() => {
				return this.ViewerService.currentModel && !!this.ViewerService.currentModel.model;
			},
			(loaded) => {
				if (loaded) {
					modelsLoaded.resolve();
				}
			}
		);
	}

	public setMapSource(source: string) {
		if (this.selectedProvider.source !== source) {
			for (let i = 0; this.selectedProvider.layers && i < this.selectedProvider.layers.length; i++) {
				if (this.selectedProvider.layers[i].visibility === "visible") {
					this.GISService.toggleLayerVisibility(this.selectedProvider.layers[i]);
				}
			}
			this.GISService.setMapSource(source);
		}
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
		onContentHeightRequest: "&"
	},
	controller: GISController,
	controllerAs: "vm",
	templateUrl: "templates/gis.html"
};

export const GISComponentModule = angular
	.module("3drepo")
	.component("gis", GISComponent);
