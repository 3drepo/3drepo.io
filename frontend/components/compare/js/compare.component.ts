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
import { UnityUtil } from "../../../globals/unity-util";
class CompareController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$filter",
		"RevisionsService",
	];

	private mode: string;
	private modelType: string;
	private compareTypes: any[];
	private account: any;
	private model: any;
	private modelSettings: any;

	constructor(
		private $scope: ng.IScope,
		private $filter: any,
		private RevisionsService: any,
	) {}

	public $onInit() {
		this.compareTypes = [
			{
				label: "3D Diff",
				models: [],
				type: "diff",
			},
			{
				label: "3D Clash",
				models: [],
				type: "clash",
			},
		];

		this.mode = "diff";
		this.modelType = "base";
		this.watchers();
	}

	public setModelType(type: string) {
		this.modelType = type;
	}

	public getColor(type: string) {
		if (type === this.modelType) {
			return "black";
		}
		return "grey";
	}

	public setRevision(model, revision) {
		model.selectedRevision = revision.name;
	}

	public watchers() {
		this.$scope.$watch("vm.modelSettings", () => {
			if (this.modelSettings) {

				console.log(this.modelSettings);

				if (this.modelSettings.subModels && this.modelSettings.subModels.length) {
					this.compareTypes.forEach((type) => {
						type.models = this.modelSettings.subModels.slice();
					});
				} else {

					this.RevisionsService.listAll(this.account, this.model).then((revisions) => {

						console.log(revisions);

						this.compareTypes.forEach((compareType) => {
							if (compareType.type === "clash") {
								compareType.models = [{
									name: this.modelSettings.name,
									revisions,
									selectedRevision: revisions[0].name,
								}];
							}
						});
					});

				}

			}
		});

	}

	public prettyTimestamp(timestamp) {
		return this.$filter("prettyDate")(timestamp, {showSeconds: false});
	}

	public compare() {
		console.log("Compare");
		UnityUtil.diffToolEnableWithClashMode();
		UnityUtil.diffToolLoadComparator(this.account, this.model, this.compareTypes[1].models.selectedRevison).then(() => {
			console.log("diffToolLoadComparator");
			UnityUtil.diffToolDiffView();
		});
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
