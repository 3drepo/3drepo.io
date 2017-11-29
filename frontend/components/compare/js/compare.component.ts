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
		"ViewerService",
		"RevisionsService",
		"CompareService",
	];

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

	constructor(
		private $scope: any,
		private $filter: any,
		private ViewerService: any,
		private RevisionsService: any,
		private CompareService: any,
	) {}

	public $onInit() {
		this.loadingInfo = "Loading comparision models...";
		this.compareTypes = this.CompareService.state.compareTypes;
		this.mode = this.CompareService.mode;
		this.modelType = this.CompareService.modelType;

		this.loadingInfo = "Loading comparision models...";

		this.watchers();
	}

	public $onDestroy() {
		this.ViewerService.diffToolDisableAndClear();
	}

	public watchers() {

		this.$scope.$watch(() => {
			return this.CompareService.state;
		}, (state) => {

			if (state) {
				angular.extend(this, state);
			}

		}, true);

		this.$scope.$watch("vm.modelSettings", () => {
			if (this.modelSettings) {
				this.modelSettingsReady();
			}
		});

	}

	public modelSettingsReady() {

		this.CompareService.state.isFed = this.modelSettings.federate;

		if (this.CompareService.state.isFed) {

			this.CompareService.addModelsForFederationCompare(
				this.modelSettings,
			);

		} else {

			this.CompareService.addModelsForModelCompare(
				this.account,
				this.model,
				this.modelSettings,
			);

		}

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

	public setRevision(model: string, revision: string) {
		this.CompareService.setRevision(model, revision);
	}

	public canCompare() {
		return this.CompareService.canCompare();
	}

	public isModelClash(type: string) {
		return this.CompareService.isModelClash();
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
		account: "=",
		model: "=",
		modelSettings: "=",
	},
	controller: CompareController,
	controllerAs: "vm",
	templateUrl: "templates/compare.html",
};

export const CompareComponentModule = angular
	.module("3drepo")
	.component("compare", CompareComponent);
