/**
 *  Copyright (C) 2017 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

declare const Viewer: any;

export class ViewerService {

	public static $inject: string[] = [
		"$q",
		"$timeout",

		"ClientConfigService",
		"APIService",
		"DialogService",
		"EventService"
	];

	private newPinId: string;
	private pinData: object;
	private viewer: any;
	private currentModel: any;
	private pin: any;
	private initialised: any;
	private Viewer: any;

	constructor(
		public $q: ng.IQService,
		public $timeout: ng.ITimeoutService,

		public ClientConfigService: any,
		public APIService: any,
		public DialogService: any,
		public EventService: any
	) {

		this.newPinId = "newPinId";
		this.pinData = null;
		this.viewer = undefined;

		this.currentModel = {
			model : null,
			promise : null
		};

		this.pin = {
			pinDropMode : false
		};

		this.initialised = $q.defer();
	}

	public getPinData() {
		return this.pinData;
	}

	public setPin(newPinData) {
		this.pinData = newPinData.data;
	}

	public updateViewerSettings(settings) {
		if (this.viewer) {
			this.viewer.updateSettings(settings);
		}
	}

	public updateClippingPlanes(params) {
		if (this.viewer) {
			this.viewer.updateClippingPlanes(
				params.clippingPlanes,
				params.fromClipPanel,
				params.account,
				params.model
			);
		}
	}

	// TODO: More EventService to be removed, but these functions broadcast
	// across multiple watchers

	public handleEvent(event, account, model) {

		this.initialised.promise.then(() => {

			switch (event.type) {

			// case this.EventService.EVENT.MODEL_SETTINGS_READY:
			// 	if (event.value.account === account && event.value.model === model) {
			// 		this.viewer.updateSettings(event.value);
			// 		// mapTile && mapTile.updateSettings(event.value.settings);
			// 	}
			// 	break;

			case this.EventService.EVENT.VIEWER.CLICK_PIN:
				if (this.newPinId === "newPinId") {
					this.removeUnsavedPin();
					return;
				}
				this.viewer.clickPin(event.value.id);
				break;

			case this.EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR:
				this.viewer.changePinColours(
					event.value.id,
					event.value.colours
				);
				break;

			case this.EventService.EVENT.VIEWER.BACKGROUND_SELECTED:
				this.viewer.clearHighlights();
				break;

			case this.EventService.EVENT.VIEWER.OBJECT_SELECTED:
				break;

			case this.EventService.EVENT.VIEWER.SET_CAMERA:
				this.viewer.setCamera(
					event.value.position,
					event.value.view_dir,
					event.value.up,
					event.value.look_at,
					event.value.animate !== undefined ? event.value.animate : true,
					event.value.rollerCoasterMode,
					event.value.account,
					event.value.model
				);
				break;

			case this.EventService.EVENT.VIEWER.PICK_POINT:

				if (
					event.value.hasOwnProperty("id") &&
					this.pin.pinDropMode
				) {

					this.removeUnsavedPin();

					const trans = event.value.trans;
					let position = event.value.position;
					const normal = event.value.normal;

					if (trans) {
						position = trans.inverse().multMatrixPnt(position);
					}

					const data = {
						account,
						colours: event.value.selectColour,
						id: this.newPinId,
						model,
						pickedNorm: normal,
						pickedPos: position,
						selectedObjectId: event.value.id
					};

					this.addPin(data);
					this.setPin({data});
				}
				break;

			case this.EventService.EVENT.VIEWER.BACKGROUND_SELECTED_PIN_MODE:
				if (this.pin.pinDropMode) {
					this.removeUnsavedPin();
				}
				break;

			}

		});

	}

	public centreToPoint(params: any) {
		if (this.viewer) {
			this.viewer.centreToPoint(params);
		}
	}

	public setCamera(params) {
		if (this.viewer) {
			this.viewer.setCamera(
				params.position,
				params.view_dir,
				params.up,
				params.look_at,
				params.animate !== undefined ? params.animate : true,
				params.rollerCoasterMode,
				params.account,
				params.model
			);
		}
	}

	public removeUnsavedPin() {
		this.removePin({id: this.newPinId });
		this.setPin({data: null});
	}

	public changePinColours(params) {
		if (this.viewer) {
			this.viewer.changePinColours(
				params.id,
				params.colours
			);
		}
	}

	public clearHighlights() {
		if (this.viewer) {
			this.viewer.clearHighlights();
		}
	}

	public getCurrentViewpoint(params) {
		if (this.viewer) {
			// Note the Info suffix
			this.viewer.getCurrentViewpointInfo(
				params.account,
				params.model,
				params.promise
			);
		}
	}

	public addPin(params) {
		this.initialised.promise.then(() => {
			this.viewer.addPin(
				params.account,
				params.model,
				params.id,
				params.pickedPos,
				params.pickedNorm,
				params.colours,
				params.viewpoint
			);
		});
	}

	public removePin(params) {
		this.initialised.promise.then(() => {
			this.viewer.removePin(
				params.id
			);
		});
	}

	public clearClippingPlanes() {
		if (this.viewer) {
			this.viewer.clearClippingPlanes();
		}
	}

	public getObjectsStatus(params) {
		if (this.viewer) {
			this.viewer.getObjectsStatus(
				params.account,
				params.model,
				params.promise
			);
		}
	}

	public highlightObjects(params)  {
		if (this.viewer) {
			this.viewer.highlightObjects(
				params.account,
				params.model,
				params.id ? [params.id] : params.ids,
				params.zoom,
				params.colour,
				params.multi,
				params.forceReHighlight
			);
		}
	}

	public unhighlightObjects(params)  {
		if (this.viewer) {
			this.viewer.unhighlightObjects(
				params.account,
				params.model,
				params.id ? [params.id] : params.ids
			);
		}
	}

	public getNavMode() {
		if (this.viewer) {
			// this.$timeout();
			return this.viewer.currentNavMode;
		}
	}

	public getMultiSelectMode() {
		if (this.viewer) {
			return this.viewer.multiSelectMode;
		}
		return false;
	}

	public setMultiSelectMode(value)  {
		if (this.viewer) {
			this.viewer.setMultiSelectMode(value);
		}
	}

	public switchObjectVisibility(account, model, ids, visibility)  {
		if (this.viewer) {
			this.viewer.switchObjectVisibility(account, model, ids, visibility);
		}
	}

	public hideHiddenByDefaultObjects() {
		if (this.viewer) {
			this.viewer.hideHiddenByDefaultObjects();
		}
	}

	public showHiddenByDefaultObjects() {
		if (this.viewer) {
			this.viewer.showHiddenByDefaultObjects();
		}
	}

	public handleUnityError(message: string, reload: boolean, isUnity: boolean)  {

		let errorType = "3D Repo Error";

		if (isUnity) {
			errorType = "Unity Error";
		}

		this.DialogService.html(errorType, message, true)
			.then(() => {
				if (reload) {
					location.reload();
				}
			}, () => {
				console.error("Unity errored and user canceled reload", message);
			});

	}

	public getModelInfo(account: string, model: string)  {
		const url = account + "/" + model + ".json";
		return this.APIService.get(url);
	}

	public reset() {
		if (this.viewer) {
			this.disableMeasure();
			this.viewer.reset();
		}
	}

	public getScreenshot(promise) {
		if (promise) {
			this.viewer.getScreenshot(promise);
		}
	}

	public goToExtent() {
		if (this.viewer) {
			this.viewer.showAll();
		}
	}

	public setNavMode(mode) {
		if (this.viewer) {
			this.viewer.setNavMode(mode);
		}
	}

	public unityInserted(): boolean {
		if (this.viewer === undefined) {
			return false;
		} else {
			return this.viewer.unityScriptInserted;
		}

	}

	public getViewer() {

		if (this.viewer === undefined) {

			this.viewer = new Viewer(
				"viewer",
				document.getElementById("viewer"),
				this.EventService.send,
				this.handleUnityError.bind(this)
			);

			this.viewer.setUnity();

		}

		return this.viewer;
	}

	public initViewer() {
		console.debug("Initiating Viewer");
		if (this.unityInserted() === true) {
			return this.callInit();
		} else if (this.viewer) {

			return this.viewer.insertUnityLoader()
				.then(() => { this.callInit(); })
				.catch((error) => {
					console.error("Error inserting Unity script: ", error);
				});

		}

	}

	public activateMeasure() {
		if (this.viewer) {
			this.viewer.setMeasureMode(true);
		}
	}

	public disableMeasure() {
		if (this.viewer) {
			this.viewer.setMeasureMode(false);
		}
	}

	public callInit() {

		return this.getViewer()
			.init({
				getAPI: {
					hostNames: this.ClientConfigService.apiUrls.all
				},
				showAll : true
			})
			.catch((error) => {
				console.error("Error creating Viewer Directive: ", error);
			});

	}

	public loadViewerModel(account, model, branch, revision) {

		if (!account || !model) {
			console.error("Account, model, branch or revision was not defined!", account, model, branch, revision);
			return Promise.reject("Account, model, branch or revision was not defined!");
		} else {
			this.currentModel.promise = this.viewer.loadModel(
				account,
				model,
				branch,
				revision
			)
				.then(() => {
					// Set the current model in the viewer
					this.currentModel.model = model;
					this.initialised.resolve();
				})
				.catch((error) => {
					console.error("Error loading model: ", error);
				});
			return this.currentModel.promise;
		}

	}

	public fetchModelProperties(account, model, branch, revision) {

		if (account && model) {

			if (!branch) {
				branch = !revision ? "master" : "";
			}

			if (!revision || branch === "master") {
				// revision is master/head
				revision = branch + "/head";
			}

			const url = account + "/" + model + "/revision/" + revision + "/modelProperties.json";

			this.APIService.get(url)
				.then((response) => {
					if (response.data && response.data.status) {
						if (response.data.status === "NOT_FOUND") {
							console.error("Model properties was not found from API");
						}
					}

					if (response.data && response.data.properties) {
						this.viewer.applyModelProperties(account, model, response.data.properties);
					} else {
						const message = "No data properties returned. This was the response:";
						console.error(message, response);
					}
				})
				.catch((error) => {
					console.error("Model properties failed to fetch", error);
				});

		} else {
			console.error("Account and model were not set correctly " +
			"for model property fetching: ", account, model);
		}
	}

	// DIFF

	public diffToolSetAsComparator(account: string, model: string) {
		this.viewer.diffToolSetAsComparator(account, model);
	}

	public diffToolLoadComparator(account: string, model: string, revision: string) {
		return this.viewer.diffToolLoadComparator(account, model, revision);
	}

	public diffToolEnableWithClashMode() {
		if (this.viewer) {
			this.viewer.diffToolEnableWithClashMode();
		}
	}

	public diffToolEnableWithDiffMode() {
		if (this.viewer) {
			this.viewer.diffToolEnableWithDiffMode();
		}
	}

	public diffToolDisableAndClear() {
		if (this.viewer) {
			this.viewer.diffToolDisableAndClear();
		}

	}

	public diffToolShowBaseModel() {
		if (this.viewer) {
			this.viewer.diffToolShowBaseModel();
		}
	}

	public diffToolShowComparatorModel() {
		if (this.viewer) {
			this.viewer.diffToolShowComparatorModel();
		}
	}

	public diffToolDiffView() {
		if (this.viewer) {
			this.viewer.diffToolDiffView();
		}
	}

	public mapInitialise(surveyPoints) {
		if (this.viewer) {
			this.viewer.mapInitialise(surveyPoints);
		}
	}

	public  mapStart() {
		if (this.viewer) {
			this.viewer.mapStart();
		}
	}

	public mapStop() {
		if (this.viewer) {
			this.viewer.mapStop();
		}
	}

	public overrideMeshColor(account, model, meshIDs, color) {
		if (this.viewer) {
			this.viewer.overrideMeshColor(account, model, meshIDs, color);
		}
	}

	public resetMeshColor(account, model, meshIDs) {
		if (this.viewer) {
			this.viewer.resetMeshColor(account, model, meshIDs);
		}
	}

	public getDefaultHighlightColor() {
		if (this.viewer) {
			return this.viewer.getDefaultHighlightColor();
		}
	}

	public zoomToHighlightedMeshes() {
		if (this.viewer) {
			this.viewer.zoomToHighlightedMeshes();
		}
	}

	public helicopterSpeedDown() {
		if (this.viewer) {
			this.viewer.helicopterSpeedDown();
		}
	}

	public helicopterSpeedUp() {
		if (this.viewer) {
			this.viewer.helicopterSpeedUp();
		}
	}

	public helicopterSpeedReset() {
		if (this.viewer) {
			this.viewer.helicopterSpeedReset();
		}
	}

}

export const ViewerServiceModule = angular
	.module("3drepo")
	.service("ViewerService", ViewerService);
