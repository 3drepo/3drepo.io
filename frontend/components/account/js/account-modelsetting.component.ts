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

class AccountModelSettingController implements ng.IController {

	public static $inject: string[] =  [
		"$scope",
		"$location",

		"APIService",
		"ClientConfigService",
		"AccountService",
	];

	private accounts;
	private showPage;
	private units;
	private mapTile;
	private urlData;
	private modelId;
	private modelName;
	private targetAcct;
	private targetProj;

	private modelType;
	private topicTypes;
	private code;
	private unit;
	private oldUnit;
	private fourDSequenceTag;
	private message;
	private data;
	private loaded: boolean;

	private referencePoints: any;

	constructor(
		private $scope: any,
		private $location: any,

		private APIService: any,
		private ClientConfigService: any,
		private AccountService: any,
	) {}

	public $onInit() {

		this.loaded = false;
		this.units = this.ClientConfigService.units;
		this.mapTile = {};

		// TODO: We should use statemanager eventually
		this.urlData = this.$location.search();
		this.modelId = this.urlData.modelId;
		this.modelName = this.urlData.modelName;
		this.targetAcct = this.urlData.targetAcct;
		this.targetProj = this.urlData.targetProj;

		this.referencePoints = {
			latLong : {
				latitude: 0.0,
				longitude: 0.0,
			},
			angleFromNorth: 0.0,
			elevation: 0.0,
			position: {
				x : 0.0,
				y: 0.0,
				z: 0.0,
			},
		};

		this.fetchModelSettings();

	}

	public fetchModelSettings() {
		this.APIService.get(this.targetAcct + "/" + this.modelId + ".json")
			.then((response) => {

				if (response.status === 200 && response.data && response.data.properties) {

					const props = response.data.properties;
					console.log("data", response.data);

					if (response.data.surveyPoints && response.data.surveyPoints.length) {
						const reference = response.data.surveyPoints[0];
						if (reference.latLong) {
							this.referencePoints.latLong.latitude = reference.latLong[0];
							this.referencePoints.latLong.longitude = reference.latLong[1];
						}
						if (response.data.elevation) {
							this.referencePoints.elevation = response.data.elevation;
						}
						if (response.data.angleFromNorth) {
							this.referencePoints.angleFromNorth = response.data.angleFromNorth;
						}
						if (reference.position) {
							this.referencePoints.position.x = reference.position[0];
							this.referencePoints.position.z = reference.position[1];
							this.referencePoints.position.y = -1 * reference.position[2];
						}
					}

					if (response.data.type) {
						this.modelType = response.data.type;
					}
					if (props.topicTypes) {
						this.topicTypes = this.convertTopicTypesToString(props.topicTypes);
					}
					if (props.code) {
						this.code = props.code;
					}
					if (props.unit) {
						this.unit = props.unit;
						this.oldUnit = this.unit;
					}

					if (response.data.fourDSequenceTag) {
						this.fourDSequenceTag = response.data.fourDSequenceTag;
					}

				} else {
					this.message = response.data.message;
				}

				this.loaded = true;
			})
			.catch((error) => {
				console.error(error);
			});
	}

	/**
	 * Go back to the teamspaces page
	 */
	public goBack() {

		this.$location.search("modelId", null);
		this.$location.search("modelName", null);
		this.$location.search("targetAcct", null);
		this.$location.search("targetProj", null);
		this.$location.search("page", null);

		this.showPage({page: "teamspaces", data: this.data});
	}

	/**
	 * Convert a list of topic types to a string
	 */
	public convertTopicTypesToString(topicTypes) {

		const result = [];

		topicTypes.forEach((type) => {
			result.push(type.label);
		});

		return result.join("\n");
	}

	/**
	 * Update the view model name
	 */
	public updateModel() {

		const model = this.AccountService.getModel(
			this.accounts,
			this.targetAcct,
			this.targetProj,
			this.modelId,
		);

		model.name = this.modelName;

	}

	public getLatLong() {
		return [
			parseFloat(this.referencePoints.latLong.latitude) || 0.0,
			parseFloat(this.referencePoints.latLong.longitude) || 0.0,
		];
	}

	public getPosition() {

		// 3drepo.io expects coordinates to come in the format
		// (x,z,-y) so we need to do some massaging to our data

		return [
			parseFloat(this.referencePoints.position.x) || 0.0,
			parseFloat(this.referencePoints.position.z) || 0.0,
			-parseFloat(this.referencePoints.position.y) || 0.0,
		];

	}

	/**
	 * Save the model settings to the backend
	 */
	public save() {

		const data: any = {
			name: this.modelName,
			unit: this.unit,
			code: this.code,
			topicTypes: this.topicTypes.replace(/\r/g, "").split("\n"),
			fourDSequenceTag: this.fourDSequenceTag,
		};

		if (this.referencePoints.position) {
			if (!data.surveyPoints) {
				data.surveyPoints = [{
					position: this.getPosition(),
				}];
			} else {
				data.surveyPoints[0].position = this.getPosition();
			}
		}

		if (!data.elevation) {
			data.elevation = this.referencePoints.elevation || 0.0;
		}

		if (!data.angleFromNorth) {
			data.angleFromNorth = this.referencePoints.angleFromNorth || 0.0;
		}

		if (this.referencePoints.latLong) {
			if (!data.surveyPoints) {
				data.surveyPoints = [{
					latLong: this.getLatLong(),
				}];
			} else {
				data.surveyPoints[0].latLong = this.getLatLong();
			}
		}

		console.log("surveyPoints: ", data.surveyPoints);

		const saveUrl = this.targetAcct + "/" + this.modelId +  "/settings";

		this.APIService.put(saveUrl, data)
			.then((response) => {
				if (response.status === 200) {
					this.updateModel();
					this.message = "Saved";
					if (response.data && response.data.properties && response.data.properties.topicTypes) {
						this.topicTypes = this.convertTopicTypesToString(response.data.properties.topicTypes);
					}
					this.oldUnit = this.unit;
				} else {
					this.message = response.data.message;
				}
			})
			.catch((error) => {
				this.message = "There was an error saving model settings";
				console.error("Error saving model settings", error);
			});

	}

}

export const AccountModelSettingComponent: ng.IComponentOptions = {
	bindings: {
		account: "=",
		accounts: "=",
		model: "=",
		showPage: "&",
		subscriptions: "=",
		data: "=",
	},
	controller: AccountModelSettingController,
	controllerAs: "vm",
	templateUrl: "templates/account-modelsetting.html",
};

export const AccountModelSettingComponentModule = angular
	.module("3drepo")
	.component("accountModelsetting", AccountModelSettingComponent);
