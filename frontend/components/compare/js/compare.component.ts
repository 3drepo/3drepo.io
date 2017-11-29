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
		private $scope: ng.IScope,
		private $filter: any,
		private ViewerService: any,
		private RevisionsService: any,
	) {}

	public $onInit() {
		this.compareTypes = {
			diff : {
				label: "3D Diff",
				models: [],
				type: "diff",
			},
			clash : {
				label: "3D Clash",
				models: [],
				type: "clash",
			},
		};

		this.loadingInfo = "Loading comparision models...";
		this.mode = "diff";
		this.modelType = "base";
		this.watchers();
	}

	public setMode(mode: any) {
		console.log(mode);
		this.mode = mode.type;
	}

	public setModelType(type: string) {
		this.modelType = type;
	}

	public getColor(type: string, prop: string) {
		if (prop === "background") {
			if (type === this.modelType) {
				return "white";
			}
			return "white";
		} else if (prop === "color") {
			if (type === this.modelType) {
				return "black";
			}
			return "grey";
		}
	}

	public isModelClash(type) {
		return type === "clash" && !this.isFed;
	}

	public setRevision(model, revision) {

		model.selectedRevision = revision._id;
		model.selectedRevisionTag = revision.tag || revision.name;

		if (this.compareEnabled) {
			this.compareEnabled = false;
		}
	}

	public getCompareModelData(modelSettings: any, revisions: any[]) {
		const headRevision = modelSettings.headRevisions.master;

		console.log("headREvision", headRevision);
		console.log(revisions);
		const headRevisionObj = revisions.find((r) => {
			return r._id === headRevision;
		});
		const headRevisionTag = headRevisionObj.tag || headRevisionObj.name;

		const revisionToUse = revisions[1] || revisions[0];

		return {
			account: modelSettings.account,
			headRevision,
			headRevisionTag,
			model: modelSettings.model,
			name: modelSettings.name,
			revisions,
			selectedRevision: revisionToUse.name,
			selectedRevisionTag: revisionToUse.tag || revisionToUse.name,
			visible: true,
		};
	}

	public addModelsForModelCompare() {
		this.RevisionsService.listAll(this.account, this.model).then((revisions) => {
			this.compareTypes.diff.models = [
				this.getCompareModelData(this.modelSettings, revisions),
			];
		});
	}

	public getSettings(model) {
		return this.ViewerService.getModelInfo(
			model.database,
			model.model,
		);
	}

	public addModelsForFederationCompare() {

		for (const type in this.compareTypes) {
			if (this.compareTypes.hasOwnProperty(type)) {

				this.compareTypes[type].models = [];
				let numModels = 0;

				this.modelSettings.subModels.forEach((model, i) => {
					if (model.database && model.model) {
						this.RevisionsService.listAll(model.database, model.model)
							.then((revisions) => {
								this.getSettings(model).then((response) => {
									const settings = response.data;
									const modelData = this.getCompareModelData(settings, revisions);
									this.compareTypes[type].models[numModels] = modelData;
									numModels++;
								});
							})
							.catch((error) => {
								console.error(error);
							});
					} else {
						console.error("Sub model data doesn't contain database and model ID: ", model);
					}

				});

			}
		}
	}

	public watchers() {

		this.$scope.$watch("vm.mode", () => {
			if (this.compareEnabled) {
				if (this.mode === "diff") {
					this.compareState = "compare";
					this.ViewerService.diffToolEnableWithDiffMode();
				} else if (this.mode === "clash") {

					if (this.isFed) {
						this.compareState = "compare";
						this.ViewerService.diffToolEnableWithClash();
					} else {
						this.compareState = "compare";
						this.ViewerService.diffToolShowBaseModel();
					}
					
				}
			}
		});

		this.$scope.$watch("vm.modelSettings", () => {
			if (this.modelSettings) {
				console.log(this.modelSettings);
				this.isFed = this.modelSettings.federate;

				if (this.isFed) {
					this.addModelsForFederationCompare();
				} else {
					this.addModelsForModelCompare();
				}
			}
		});

		this.$scope.$watch("vm.compareState", () => {

			switch (this.compareState) {
			case "base":
				this.ViewerService.diffToolShowBaseModel();
				break;

			case "compare":
				this.ViewerService.diffToolDiffView();
				break;

			case "target":
				this.ViewerService.diffToolShowComparatorModel();
				break;
			}

		});

	}

	public prettyTimestamp(timestamp) {
		return this.$filter("prettyDate")(timestamp, {showSeconds: false});
	}

	public canCompare() {
		const loaded = !!this.ViewerService.currentModel.model;
		const notModelClash = !this.isModelClash(this.mode);
		return loaded && !this.loadingComparision && notModelClash;
	}

	public modelsLoaded() {
		this.loadingComparision = false;
		this.canChangeCompareState = true;
		this.compareState = "compare";
		this.compareEnabled = true;
	}

	public loadModels() {
		const allModels = [];
		this.compareTypes.diff.models.forEach((model) => {

			this.loadingComparision = true;
			const loadModel = this.ViewerService.diffToolLoadComparator(model.account, model.model, model.selectedRevision)
				.then(() => {
					console.log("diffToolLoadComparator");
				})
				.catch((error) => {
					console.error(error);
				});

			allModels.push(loadModel);

		});

		return Promise.all(allModels);
	}

	public getButtonColor() {
		if (!this.canCompare()) {
			return "";
		} else {
			return this.compareEnabled ? "#FF9800" : "rgb(6,86,60)";
		}
	}

	public diffModel() {

		this.ViewerService.diffToolDisableAndClear();

		const model = this.compareTypes.diff.models.find((m) => {
			return m.model === this.model;
		});
		const revision = model.selectedRevision;
		console.log("Compare", this.account, this.model, revision);
		this.loadingComparision = true;
		this.ViewerService.diffToolLoadComparator(this.account, this.model, revision)
			.then(() => {
				this.ViewerService.diffToolEnableWithDiffMode();
				this.modelsLoaded();
				console.log("diffToolLoadComparator");
			})
			.catch((error) => {
				console.error(error);
			});
	}

	public diffFed() {

		this.ViewerService.diffToolDisableAndClear();
		console.log("diffFed");

		this.loadModels().then(() => {
			this.ViewerService.diffToolEnableWithDiffMode();
			this.modelsLoaded();
		});

	}

	public clashFed() {

		this.ViewerService.diffToolDisableAndClear();
		console.log("clashFed");

		this.loadModels().then(() => {
			this.ViewerService.diffToolEnableWithClashMode();
			this.modelsLoaded();
		});
	}

	public compare() {

		if (this.compareEnabled) {
			this.disableComparision();
		} else {
			this.performComparision();
		}

	}

	public disableComparision() {
		this.compareEnabled = false;
		this.canChangeCompareState = false;
		this.ViewerService.diffToolDisableAndClear();
	}

	public performComparision() {

		this.canChangeCompareState = false;

		if (this.mode === "clash") {
			if (this.isFed === true) {
				this.clashFed();
			}
		} else if (this.mode === "diff") {
			if (this.isFed === false) {
				this.diffModel();
			} else {
				this.diffFed();
			}
		}
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
