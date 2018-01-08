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

export class CompareService {

	public static $inject: string[] = [
		"$filter",
		"$q",

		"TreeService",
		"RevisionsService",
		"ViewerService",
	];

	public state: any;
	private readyDefer: any;
	private settingsPromises: any[];

	constructor(
		private $filter: any,
		private $q: any,

		private TreeService: any,
		private RevisionsService: any,
		private ViewerService: any,
	) {
		this.reset();
	}

	public reset() {
		this.settingsPromises = [];
		this.readyDefer = this.$q.defer();

		this.state = {
			compareTypes : {
				diff : {
					label: "3D Diff",
					baseModels: [],
					targetModels: [],
					type: "diff",
				},
				clash : {
					label: "3D Clash",
					baseModels: [],
					targetModels: [],
					type: "clash",
				},
			},
			mode : "diff",
			modelType : "base",
			ready : this.readyDefer.promise,
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

		const headRevision = modelSettings.headRevisions.master;
		const headRevisionObj = revisions.find((r) => {
			return r._id === headRevision;
		});
		const headRevisionTag = headRevisionObj.tag || headRevisionObj.name;

		let baseRevision;

		if (!this.isFederation()) {
			// If it's a model use the loaded revision
			baseRevision = revisions.find((rev) => rev._id === revision ) || revisions[0];
		} else {
			// If it's a federation just set the base to the first revision
			baseRevision = revisions[0];
		}

		const targetRevision = this.nextRevision(revisions, baseRevision.name);
		const baseTimestamp = this.RevisionsService.revisionDateFilter(baseRevision.timestamp);
		const targetTimestamp = this.RevisionsService.revisionDateFilter(targetRevision.timestamp);

		return {
			account: modelSettings.account,
			headRevision,
			headRevisionTag,
			model: modelSettings.model,
			name: modelSettings.name,
			revisions,
			baseRevision: baseRevision.name,
			baseRevisionTag: baseRevision.tag || baseTimestamp || baseRevision.name,
			targetRevision: targetRevision.name,
			targetRevisionTag: targetRevision.tag || targetTimestamp || targetRevision.name,
			visible: true,
		};
	}

	public getSettings(model: any) {
		return this.ViewerService.getModelInfo(
			model.database,
			model.model,
		);
	}

	public addModelsForModelCompare(account: string, model: string, modelSettings: any, revision: any) {
		return this.RevisionsService.listAll(account, model).then((revisions) => {

			this.state.compareTypes.diff.targetModels = [
				this.getCompareModelData(modelSettings, revisions, revision, "target"),
			];

			this.state.compareTypes.diff.baseModels = [
				this.getCompareModelData(modelSettings, revisions, revision, "base"),
			];

		});

	}

	public addModelsForFederationCompare(modelSettings: any, revision: any) {

		const promises = [];

		for (const type in this.state.compareTypes) {

			if (!this.state.compareTypes.hasOwnProperty(type)) {
				continue;
			}

			this.state.compareTypes[type].baseModels = [];
			this.state.compareTypes[type].targetModels = [];

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
					console.log("getRevisionModels - target", settings, revisions, revision);
					this.state.compareTypes[type].targetModels[i] = this.getCompareModelData(settings, revisions, revision, "target");
					console.log("getRevisionModels - base", settings, revisions, revision);
					this.state.compareTypes[type].baseModels[i] = this.getCompareModelData(settings, revisions, revision, "base");
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
		return loaded && !this.state.loadingComparision && notModelClash;
	}

	public modelsLoaded() {
		this.state.loadingComparision = false;
		this.state.canChangeCompareState = true;
		this.state.compareEnabled = true;
		this.useSetModeComparision();
	}

	public loadModels() {
		const allModels = [];
		this.state.compareTypes.diff.targetModels.forEach((model) => {
			if (model && model.visible === true) {

				this.state.loadingComparision = true;
				const loadModel = this.ViewerService.diffToolLoadComparator(
					model.account,
					model.model,
					model.targetRevision,
				)
					.catch((error) => {
						console.error(error);
					});

				allModels.push(loadModel);
			}
		});

		// console.log("loadModels - allModels", allModels);

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
			this.disableComparision();
		} else {
			this.enableComparision(account, model);
		}

	}

	public compareInNewMode(mode) {
		this.setMode(mode);
		this.useSetModeComparision();
	}

	public useSetModeComparision() {

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

	public disableComparision() {

		this.state.compareEnabled = false;
		this.state.canChangeCompareState = false;
		this.state.compareState = "";
		this.ViewerService.diffToolDisableAndClear();

	}

	public enableComparision(account: string, model: string) {

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

		const modelToDiff = this.state.compareTypes.diff.baseModels.find((m) => {
			return m.model === model;
		});
		const revision = modelToDiff.selectedRevision;

		this.state.loadingComparision = true;
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
		// console.log("diffFed - start")
		this.ViewerService.diffToolDisableAndClear();

		this.loadModels()
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

		this.loadModels()
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
		this.disableComparision();
	}

	private setBaseModelVisibility(model) {
		const nodes = this.TreeService.getAllNodes();
		if (nodes.length && nodes[0].children) {
			const childNodes = nodes[0].children;
			childNodes.forEach((node) => {
				if (node.name === model.account + ":" + model.name) {
					this.TreeService.toggleTreeNodeVisibility(node, false);
				}
			});
		}
	}

	private setTargetModelVisibility(model) {
		model.visible = !model.visible;
	}

}

export const CompareServiceModule = angular
	.module("3drepo")
	.service("CompareService", CompareService);
