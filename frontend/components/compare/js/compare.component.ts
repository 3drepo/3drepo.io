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

class CompareController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$filter",
		"$q",

		"ViewerService",
		"RevisionsService",
		"CompareService",
		"TreeService",
	];

	private revision: any;
	private mode: string;
	private modelType: string;
	private compareTypes: any;
	private compareEnabled: any;
	private account: any;
	private model: any;
	private modelSettings: any;
	private loadingComparision: boolean;
	private loadingInfo: string;
	private isFed: boolean;
	private compareState: string;
	private canChangeCompareState: boolean;
	private models: any[];
	private modelsReady;

	constructor(
		private $scope: any,
		private $filter: any,
		private $q: any,

		private ViewerService: any,
		private RevisionsService: any,
		private CompareService: any,
		private TreeService: any,
	) {}

	public $onInit() {

		this.CompareService.disableComparision();
		this.loadingInfo = "Loading comparision...";
		this.compareTypes = this.CompareService.state.compareTypes;
		this.mode = this.CompareService.mode;
		this.modelType = this.CompareService.modelType;
		this.modelsReady = this.$q.defer();
		this.models = [];

		this.watchers();
	}

	public $onDestroy() {
		this.CompareService.disableComparision();
	}

	public watchers() {

		this.$scope.$watch(() => {
			return this.CompareService.state;
		}, (state) => {

			if (state) {
				angular.extend(this, state);
			}

		}, true);

		// this.$scope.$watch(() => {
		// 	return this.revision;
		// }, () => {
		// 	if (this.revision) {
		// 		this.updateModels();
		// 	}
		// });

		this.$scope.$watch("vm.modelSettings", () => {
			if (this.modelSettings) {
				this.modelsReady.resolve(this.modelSettingsReady());
			}
		});

	}

	public revisionTimestamp(timestamp) {
		return this.RevisionsService.revisionDateFilter(timestamp);
	}

	public updateModels() {
		this.modelsReady.promise.then(() => {
			const models = this.TreeService.getNodesToShow();
			if (this.isFederation()) {
				models.forEach(this.compareToTreeState.bind(this));
			}
		});
	}

	public compareToTreeState(shownModel: any) {
		if (shownModel.level !== 1) {
			return;
		}

		for (const type in this.compareTypes) {

			if (!type) {
				continue;
			}

			const baseModels = this.compareTypes[type].baseModels;
			for (let j = 0; j < baseModels.length; j++) {
				const model = baseModels[j];
				if (model && shownModel.name === model.account + ":" + model.name) {
					console.log("Toggle State", shownModel.toggleState);
					model.visible = shownModel.toggleState || "visible";
					break;
				}
			}

		}

	}

	public modelSettingsReady() {

		this.CompareService.state.isFed = this.modelSettings.federate;

		const modelsReady = [];

		if (this.CompareService.state.isFed) {

			modelsReady.push(this.CompareService.addModelsForFederationCompare(
				this.modelSettings,
				this.revision,
			));

		} else {

			modelsReady.push(this.CompareService.addModelsForModelCompare(
				this.account,
				this.model,
				this.modelSettings,
				this.revision,
			));

		}
		return Promise.all(modelsReady);
	}

	public toggleModelVisibility(model) {
		this.CompareService.toggleModelVisibility(model);
	}

	public getModelTypeStyle(type: string, prop: string) {
		return this.CompareService.getModelTypeStyle(type, prop);
	}

	public getButtonColor() {
		return this.CompareService.getButtonColor();
	}

	public compareInNewMode(mode: string) {
		this.CompareService.compareInNewMode(mode);
	}

	public setModelType(type: string) {
		this.CompareService.setModelType(type);
	}

	public setBaseRevision(model: any, revision: any) {
		this.CompareService.setBaseRevision(model, revision);
	}

	public setTargetRevision(model: any, revision: any) {
		this.CompareService.setTargetRevision(model, revision);
	}

	public canCompare() {
		return this.CompareService.canCompare() && !!this.ViewerService.currentModel.model;
	}

	public isModelClash(type: string) {
		return this.CompareService.isModelClash(type);
	}

	public isFederation() {
		return this.CompareService.isFederation();
	}

	public changeCompareState(compareState: string) {
		this.CompareService.changeCompareState(compareState);
	}

	public compare() {
		this.CompareService.compare(this.account, this.model);
	}

}

export const CompareComponent: ng.IComponentOptions = {
	bindings: {
		account: "<",
		model: "<",
		revision: "<",
		modelSettings: "<",
	},
	controller: CompareController,
	controllerAs: "vm",
	templateUrl: "templates/compare.html",
};

export const CompareComponentModule = angular
	.module("3drepo")
	.component("compare", CompareComponent);
