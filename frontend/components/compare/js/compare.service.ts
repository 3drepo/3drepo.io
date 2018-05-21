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

interface ICompareState {
	loadingComparison: boolean;
	compareTypes: ICompareTypes;
	baseModels: any[];
	targetModels: any[];
	mode: string;
	modelType: string;
	compareEnabled: boolean;
	ready: Promise<any>;
	isFed?: boolean;
	compareState?: string;
	canChangeCompareState?: boolean;
}

interface ICompareTypes {
	[key: string]: {
		label: string;
		type: string;
	};
}

export class CompareService {

	public static $inject: string[] = [
		"$filter",
		"$q",

		"TreeService",
		"RevisionsService",
		"ViewerService"
	];

	public state: ICompareState;
	private readyDefer: any;
	private settingsPromises: any[];

	constructor(
		private $filter: any,
		private $q: any,

		private TreeService: any,
		private RevisionsService: any,
		private ViewerService: any
	) {
		this.reset();
	}

	public reset() {
		this.settingsPromises = [];
		this.readyDefer = this.$q.defer();

		this.state = {
			compareEnabled: false,
			loadingComparison : false,
			compareTypes : {
				diff : {
					label: "3D Diff",
					type: "diff"
				},
				clash : {
					label: "3D Clash",
					type: "clash"
				}
			},
			baseModels: [],
			targetModels: [],
			mode : "diff",
			modelType : "base",
			ready : this.readyDefer.promise,
			isFed: false
		};

	}

	public setMode(mode: any) {
		this.state.mode = mode.type;
	}

	public setModelType(type: string) {
		this.state.modelType = type;
	}

	public getModelTypeStyle(type: string, prop: string) {

		switch (prop) {
		case "background":
			if (type === this.state.modelType) {
				return "white";
			}
			return "#fafafa";
		case "color":
			if (type === this.state.modelType) {
				return "black";
			}
			return "grey";
		}

	}

	public isFederation() {
		return this.state.isFed;
	}

	public isModelClash(type: string) {
		return type === "clash" && !this.state.isFed;
	}

	public setTargetRevision(model: any, revision: any) {

		const timestamp = this.RevisionsService.revisionDateFilter(revision.timestamp);

		model.targetRevision = revision._id;
		model.targetRevisionTag = revision.tag || timestamp || revision.name;

		if (this.state.compareEnabled) {
			this.state.compareEnabled = false;
		}
	}

	public nextRevision(revisions: any[], revision: any) {

		if (!revision) {
			return revisions[0];
		}

		const len = revisions.length;
		const index = revisions.findIndex((r) => r._id === revision);

		const lastRev = index + 1 === len;
		if (lastRev) {
			return revisions[index];
		}

		return revisions[index + 1];

	}

	public getCompareModelData(modelSettings: any, revisions: any[], revision: any, type: string) {

		// We can't access revisions, i.e. no permissions, missing file etc
		if (revisions.length === 0) {
			return null;
		}

		let baseRevision;

		if (!this.isFederation()) {
			// If it's a model use the loaded revision
			baseRevision = revisions.find((rev) => rev.tag === revision || rev._id === revision ) || revisions[0];
		} else {
			// If it's a federation just set the base to the first revision
			baseRevision = revisions[0];
		}

		const targetRevision = this.nextRevision(revisions, baseRevision.name);
		const baseTimestamp = this.RevisionsService.revisionDateFilter(baseRevision.timestamp);
		const targetTimestamp = this.RevisionsService.revisionDateFilter(targetRevision.timestamp);

		return {
			account: modelSettings.account,
			model: modelSettings.model,
			name: modelSettings.name,
			revisions,
			baseRevision: baseRevision.name,
			baseRevisionTag: baseRevision.tag || baseTimestamp || baseRevision.name,
			targetRevision: targetRevision.name,
			targetRevisionTag: targetRevision.tag || targetTimestamp || targetRevision.name,
			visible: "visible"
		};
	}

	public getSettings(model: any) {
		return this.ViewerService.getModelInfo(
			model.database,
			model.model
		);
	}

	public addModelsForModelCompare(account: string, model: string, modelSettings: any, revision: any) {

		this.state.targetModels = [];
		this.state.baseModels = [];

		return this.RevisionsService.listAll(account, model).then((revisions) => {
			this.state.targetModels = [
				this.getCompareModelData(modelSettings, revisions, revision, "target")
			];

			this.state.baseModels = [
				this.getCompareModelData(modelSettings, revisions, revision, "base")
			];

		});

	}

	public addModelsForFederationCompare(modelSettings: any, revision: any) {

		const promises = [];

		for (const type in this.state.compareTypes) {

			if (!this.state.compareTypes.hasOwnProperty(type)) {
				continue;
			}

			this.state.baseModels = [];
			this.state.targetModels = [];

			modelSettings.subModels.forEach((model, i) => {
				if (model.database && model.model) {
					const revisionPromise = this.getRevisionModels(model, type, i, revision);
					promises.push(revisionPromise);

				} else {
					console.error("Sub model data doesn't contain database and model ID: ", model);
				}

			});

		}

		return Promise.all(promises);
	}

	public getRevisionModels(model, type, i, revision) {

		return this.RevisionsService.listAll(model.database, model.model)
			.then((revisions) => {
				return this.getSettings(model).then((response) => {
					const settings = response.data;
					this.state.targetModels[i] = this.getCompareModelData(settings, revisions, revision, "target");
					this.state.baseModels[i] = this.getCompareModelData(settings, revisions, revision, "base");
				});
			})
			.catch((error) => {
				console.error(error);
			});
	}

	public changeCompareState(newCompareState: string) {

		this.state.compareState = newCompareState;

		switch (newCompareState) {
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

	}

	public prettyTimestamp(timestamp: string) {
		return this.$filter("prettyDate")(timestamp, {showSeconds: false});
	}

	public canCompare() {
		const loaded = !!this.ViewerService.currentModel.model;
		const notModelClash = !this.isModelClash(this.state.mode);
		return loaded && !this.state.loadingComparison && notModelClash;
	}

	public modelsLoaded() {
		this.state.loadingComparison = false;
		this.state.canChangeCompareState = true;
		this.state.compareEnabled = true;
		this.useSetModeComparison();
	}

	public loadModels(compareType: string) {
		const allModels = [];

		this.state.loadingComparison = true;

		this.state.targetModels.forEach((model) => {

			const sharedRevisionModel = this.state.baseModels.find((b) => b.baseRevision === model.targetRevision );
			const canReuseModel = sharedRevisionModel && sharedRevisionModel.visible === "invisible";
			let loadModel;

			if (canReuseModel) {

				this.setBaseModelVisibility(sharedRevisionModel);

				this.ViewerService.diffToolSetAsComparator(
					model.account,
					model.model,
					model.targetRevision
				);

				// TODO: This is a bit a hack as it doesn't sync with the tree
				// We set the compare panel model back invisible
				sharedRevisionModel.visible = "invisible";

			} else if (model && model.visible === "visible") {

				loadModel = this.ViewerService.diffToolLoadComparator(
					model.account,
					model.model,
					model.targetRevision
				)
					.catch((error) => {
						console.error(error);
					});

			}
			allModels.push(loadModel);
		});

		return Promise.all(allModels);
	}

	public getButtonColor() {
		if (!this.canCompare()) {
			return "";
		} else {
			return this.state.compareEnabled ? "#FF9800" : "rgb(6,86,60)";
		}
	}

	public compare(account, model) {

		if (this.state.compareEnabled) {
			this.disableComparison();
		} else {
			this.enableComparison(account, model);
		}

	}

	public compareInNewMode(mode) {
		this.setMode(mode);
		this.useSetModeComparison();
	}

	public useSetModeComparison() {

		if (!this.state.compareEnabled) {
			return;
		}

		if (this.state.mode === "diff") {

			this.ViewerService.diffToolEnableWithDiffMode();
			this.changeCompareState("compare");

		} else if (this.state.mode === "clash") {

			if (this.state.isFed) {
				this.ViewerService.diffToolEnableWithClashMode();
			} else {
				this.ViewerService.diffToolShowBaseModel();
			}

			this.changeCompareState("compare");

		}
	}

	public disableComparison() {

		this.state.compareEnabled = false;
		this.state.canChangeCompareState = false;
		this.state.compareState = "";
		this.ViewerService.diffToolDisableAndClear();

	}

	public enableComparison(account: string, model: string) {

		this.state.canChangeCompareState = false;
		this.state.compareState = "compare";

		if (this.state.mode === "clash") {
			if (this.state.isFed === true) {
				this.clashFed();
			}
		} else if (this.state.mode === "diff") {
			if (this.state.isFed === false) {
				this.diffModel(account, model);
			} else {
				this.diffFed();
			}
		}

	}

	public diffModel(account: string, model: string) {

		this.ViewerService.diffToolDisableAndClear();

		const modelToDiff = this.state.baseModels.find((m) => {
			return m.model === model;
		});
		const revision = modelToDiff.selectedRevision;

		this.state.loadingComparison = true;
		this.ViewerService.diffToolLoadComparator(account, model, revision)
			.then(() => {
				this.ViewerService.diffToolEnableWithDiffMode();
				this.modelsLoaded();
			})
			.catch((error) => {
				this.modelsLoaded();
				console.error(error);
			});
	}

	public diffFed() {
		this.ViewerService.diffToolDisableAndClear();

		this.loadModels("diff")
			.then(() => {
				this.ViewerService.diffToolEnableWithDiffMode();
				this.modelsLoaded();
			})
			.catch((error) => {
				this.modelsLoaded();
				console.error(error);
			});

	}

	public clashFed() {

		this.ViewerService.diffToolDisableAndClear();

		this.loadModels("clash")
			.then(() => {
				this.ViewerService.diffToolEnableWithClashMode();
				this.modelsLoaded();
			})
			.catch((error) => {
				this.modelsLoaded();
				console.error(error);
			});

	}

	public toggleModelVisibility(model) {
		if (this.state.modelType === "target") {
			this.setTargetModelVisibility(model);
		} else if (this.state.modelType === "base") {
			this.setBaseModelVisibility(model);

		}
		this.disableComparison();
	}

	private setBaseModelVisibility(model) {
		const nodes = this.TreeService.getAllNodes();
		if (nodes.length && nodes[0].children) {
			const childNodes = nodes[0].children;
			childNodes.forEach((node) => {
				if (node.name === model.account + ":" + model.name) {
					// TODO: Fix this
					if (model.visible === "invisible") {
						this.TreeService.showTreeNodes([node]);
					} else {
						this.TreeService.hideTreeNodes([node]);
					}

					// Keep the compare componetn and TreeService
					// in sync with regards to visibility
					model.visible = node.toggleState;
				}
			});
		}

	}

	private setTargetModelVisibility(model) {
		if (model.visible === "invisible") {
			model.visible = "visible";
		} else if (model.visible === "parentOfInvisible") {
			model.visible = "visible";
		} else {
			model.visible = "invisible";
		}
	}

}

export const CompareServiceModule = angular
	.module("3drepo")
	.service("CompareService", CompareService);
