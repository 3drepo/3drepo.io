import { UnityUtil } from "../../../_built/amd/globals/unity-util";

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

	newPinId: string;
	pinData: object;
	viewer: any;
	currentModel: any;
	pin: any;
	initialised: any;

	Viewer: any;

	static $inject: string[] = [
		"$q", 

		"ClientConfigService", 
		"APIService", 
		"DialogService", 
		"EventService", 
		"DocsService"
	];

	constructor(
		public $q: any, 
		
		public ClientConfigService: any, 
		public APIService: any, 
		public DialogService: any, 
		public EventService: any, 
		public DocsService: any

	) {
		this.newPinId = "newPinId";
		this.pinData = null;
		this.viewer = undefined;

		this.currentModel = {
			model : null,
			promise : null
		}

		this.pin = {
			pinDropMode : false
		}

		this.initialised = $q.defer()
	}

	getPinData() {
		return this.pinData;
	}

	setPin(newPinData) {
		this.pinData = newPinData.data;
	}

	// TODO: More EventService to be removed, but these functions broadcast 
	// across multiple watchers

	handleEvent(event, account, model) {

		this.initialised.promise.then(() => {

			switch(event.type) {
			
			case this.EventService.EVENT.MODEL_SETTINGS_READY:
				if (event.value.account === account && event.value.model === model) {
					this.viewer.updateSettings(event.value.settings);
					//mapTile && mapTile.updateSettings(event.value.settings);
				}
				break;

			case this.EventService.EVENT.VIEWER.CLICK_PIN:
				this.viewer.clickPin(event.value.id);
				break;

			case this.EventService.EVENT.VIEWER.CHANGE_PIN_COLOUR:
				this.viewer.changePinColours(
					event.value.id,
					event.value.colours
				);
				break;

			case this.EventService.EVENT.VIEWER.UPDATE_CLIPPING_PLANES:
				this.viewer.updateClippingPlanes(
					event.value.clippingPlanes, event.value.fromClipPanel,
					event.value.account, event.value.model
				);
				break;

			case this.EventService.EVENT.VIEWER.BACKGROUND_SELECTED:
				this.DocsService.state.show = false;
				this.viewer.clearHighlights();
				break;

			case this.EventService.EVENT.VIEWER.OBJECT_SELECTED:
				var valid = this.DocsService.state.active && !this.pin.pinDropMode;
				if (valid) {
					this.DocsService.handleObjectSelected(event);
				}
				break;

			case this.EventService.EVENT.VIEWER.SET_CAMERA:
				this.currentModel.promise.then(() => {
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
				}).catch((error) => {
					this.handleUnityError("Setting the camera errored because model failed to load: " + error);
				});
				break;

			}
			
		});

	}
	
	changePinColours(params) {
		this.viewer.changePinColours(
			params.id,
			params.colours
		);
	}

	clearHighlights() {
		this.viewer.clearHighlights();
	}

	getCurrentViewpoint(params) {
		// Note the Info suffix
		this.viewer.getCurrentViewpointInfo(
			params.account, 
			params.model, 
			params.promise
		);
	}

	addPin(params) {
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

	removePin(params) {
		this.initialised.promise.then(() => {
			this.viewer.removePin(
				params.id
			);
		});
	}

	clearClippingPlanes() {
		this.viewer.clearClippingPlanes();
	}

	getObjectsStatus(params) {
		this.viewer.getObjectsStatus(
			params.account,
			params.model,
			params.promise
		);
	}

	highlightObjects(params) {

		this.viewer.highlightObjects(
			params.account,
			params.model,
			params.id ? [params.id] : params.ids,
			params.zoom,
			params.colour,
			params.multi
		);
	}

	setMultiSelectMode(value) {
		this.viewer.setMultiSelectMode(value);
	}

	switchObjectVisibility(account, model, ids, visibility){
		this.viewer.switchObjectVisibility(account, model, ids, visibility);
	}

	handleUnityError(message) {

		this.DialogService.html("Unity Error", message, true)
			.then(() => {
				location.reload();
			}, () => {
				console.error("Unity errorered and user canceled reload", message);
			});
	
	}

	getModelInfo(account, model) {
		
		var url = account + "/" + model + ".json";

		return this.APIService.get(url);
	}

	reset() {
		if (this.viewer) {
			this.disableMeasure();
			this.viewer.reset();
		}
	}
	
	

	getScreenshot(promise) {
		if (promise) {
			this.viewer.getScreenshot(promise);
		}
	}

	goToExtent() {
		this.viewer.showAll();
	}

	setNavMode(mode) {
		this.viewer.setNavMode(mode);
	}

	unityInserted(): boolean {
		if (this.viewer === undefined) {
			return false;
		} else {
			return this.viewer.unityScriptInserted;
		}
		
	}

	getViewer() {

		console.log(this.EventService);
		
		if (this.viewer === undefined) {

			this.viewer = new Viewer(
				"viewer",
				document.getElementById("viewer"), 
				this.EventService.send, 
				function(){},
				"hello"
			);

			this.viewer.setUnity();
			
		} 

		return this.viewer;
	}

	initViewer() {

		if (this.unityInserted() === true) {
			return this.callInit();
		} else {
			return this.viewer.insertUnityLoader()
				.then(() => { this.callInit() })
				.catch((error) => {
					console.error("Error inserting Unity script: ", error);
				});
		}

	}

	activateMeasure() {
		this.viewer.setMeasureMode(true);
	}

	disableMeasure() {
		this.viewer.setMeasureMode(false);
	}

	callInit() {

		return this.getViewer()
			.init({
				showAll : true,
				getAPI: {
					hostNames: this.ClientConfigService.apiUrls["all"]
				}
			})
			.catch((error) => {
				console.error("Error creating Viewer Directive: ", error);
			});
		
	}

	loadViewerModel(account, model, branch, revision) {
		
		if (!account || !model) {
			console.error("Account, model, branch or revision was not defined!", account, model, branch, revision);
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
					this.fetchModelProperties(account, model, branch, revision);	
				})
				.catch((error) => {
					console.error("Error loading model: ", error);
				});
		}

	}

	fetchModelProperties(account, model, branch, revision) {
		
		if (account && model) {

			if(!branch) {
				branch = !revision ? "master" : "";
			}
				
			if(!revision || branch === "master") {
				//revision is master/head 
				revision = branch + "/head";
			}
				
			var url = account + "/" + model + "/revision/" + revision + "/modelProperties.json";

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
						var message = "No data properties returned. This was the response:";
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
	
	
}

export const ViewerServiceModule = angular
	.module('3drepo')
	.service('ViewerService', ViewerService);