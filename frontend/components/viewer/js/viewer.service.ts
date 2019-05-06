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

import { UnityUtil } from '../../../globals/unity-util';
import { getState } from '../../../helpers/migration';
import { selectMemory } from '../../../modules/viewer';

declare const Viewer: any;

export class ViewerService {

	public static $inject: string[] = [
		'$q',
		'$timeout',

		'ClientConfigService',
		'APIService',
		'DialogService',
		'EventService'
	];

	public pin: any;
	public newPinId: string;
	public currentModel: any;
	public initialised: any;
	public currentModelInit: any;

	private pinData: any;
	private viewer: any;
	private Viewer: any;
	private model: string;
	private account: string;
	private heliSpeed: number = 1;

	private stats: boolean = false;

	constructor(
		public $q: ng.IQService,
		public $timeout: ng.ITimeoutService,

		public ClientConfigService: any,
		public APIService: any,
		public DialogService: any,
		public EventService: any
	) {

		this.newPinId = 'newPinId';
		this.pinData = null;
		this.viewer = undefined;

		this.currentModel = {
			model : null
		};

		this.pin = {
			pinDropMode: false
		};

		this.initialised = $q.defer();
	}

	public getPinData(): any {
		return this.pinData;
	}

	public setPin(newPinData) {
		this.pinData = newPinData.data;
	}

	public updateViewerSettings(settings) {
		this.initialised.promise.then(() => {
			this.viewer.updateSettings(settings);
		});
	}

	public updateClippingPlanes(params) {
		this.initialised.promise.then(() => {
			this.viewer.updateClippingPlanes(
				params.clippingPlanes,
				params.account,
				params.model
			);
		});
	}

	public getNumPlanes() {
		if (this.viewer) {
			return this.viewer.getNumPlanes();
		}
	}

	// TODO: More EventService to be removed, but these functions broadcast
	// across multiple watchers

	public handleEvent(event, account, model) {

		this.initialised.promise.then(() => {

			switch (event.type) {

			case this.EventService.EVENT.VIEWER.CLICK_PIN:
				if (this.newPinId === 'newPinId') {
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
		this.initialised.promise.then(() => {
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
		});
	}

	public removeUnsavedPin() {
		this.removePin({id: this.newPinId });
		this.setPin({data: null});
	}

	public changePinColours(params) {
		this.initialised.promise.then(() => {
			this.viewer.changePinColours(
				params.id,
				params.colours
			);
		});
	}

	public clearHighlights() {
		this.initialised.promise.then(() => {
			this.viewer.clearHighlights();
		});
	}

	public async getCurrentViewpoint({ account, model, promise }) {
		if (this.viewer) {
			const viewpoint = await this.viewer.getCurrentViewpointInfo(account, model);
			return promise.resolve(viewpoint);
		}

		return promise.resolve({});
	}

	public addPin(params) {
		this.initialised.promise.then(() => {
			this.viewer.addPin(
				params.account,
				params.model,
				params.id,
				params.type,
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

	public async getObjectsStatus({ account = '', model = '', promise }) {
		await this.initialised.promise;
		const objectStatus = await this.viewer.getObjectsStatus(account, model);
		return promise.resolve(objectStatus);
	}

	public highlightObjects(params)  {
		this.initialised.promise.then(() => {
			this.viewer.highlightObjects(
				params.account,
				params.model,
				params.id ? [params.id] : params.ids,
				params.zoom,
				params.colour,
				params.multi,
				params.forceReHighlight
			);
		});
	}

	public unhighlightObjects(params)  {
		this.initialised.promise.then(() => {
			this.viewer.unhighlightObjects(
				params.account,
				params.model,
				params.id ? [params.id] : params.ids
			);
		});
	}

	public getNavMode() {
		if (this.viewer) {
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
		this.initialised.promise.then(() => {
			this.viewer.switchObjectVisibility(account, model, ids, visibility);
		});
	}

	public hideHiddenByDefaultObjects() {
		this.initialised.promise.then(() => {
			this.viewer.hideHiddenByDefaultObjects();
		});
	}

	public showHiddenByDefaultObjects() {
		this.initialised.promise.then(() => {
			this.viewer.showHiddenByDefaultObjects();
		});
	}
/*
	public handleUnityError = (message: string, reload: boolean, isUnity: boolean) =>  {

		let errorType = '3D Repo Error';

		if (isUnity) {
			errorType = 'Unity Error';
		}

		this.DialogService.html(errorType, message, true)
			.then(() => {
				if (reload) {
					location.reload();
				}
			}, () => {
				console.error('Unity errored and user canceled reload', message);
			});

	} */

	public getModelInfo(account: string, model: string)  {
		const url = account + '/' + model + '.json';
		return this.APIService.get(url);
	}

	public reset() {
		if (this.viewer) {
			this.disableMeasure();
			this.viewer.reset();
		}
	}

	public async getScreenshot() {
		await this.initialised.promise;
		return this.viewer.getScreenshot();
	}

	public goToExtent() {
		this.initialised.promise.then(() => {
			this.viewer.showAll();
		});
	}

	public setNavMode(mode) {
		this.initialised.promise.then(() => {
			this.viewer.setNavMode(mode);
		});
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

			this.viewer = new Viewer({
				name: 'viewer',
				container: document.getElementById('viewer'),
				onEvent: this.EventService.send,
				onError: this.handleUnityError
			});

			this.viewer.setUnity();
		}

		return this.viewer;
	}

	public getMemory() {
		const MAX_MEMORY = 2130706432; // The maximum memory Unity can allocate
		const assignedMemory = selectMemory(getState()) * 1024 * 1024; // Memory is in Mb.
		return Math.min(assignedMemory, MAX_MEMORY);
	}

	public initViewer() {
		console.debug('Initiating Viewer');
		if (this.unityInserted() === true) {
			return this.callInit();
		} else if (this.viewer) {

			return this.viewer.insertUnityLoader(this.getMemory())
				.then(() => { this.callInit(); })
				.catch((error) => {
					console.error('Error inserting Unity script: ', error);
				});

		}

	}

	public activateMeasure() {
		this.initialised.promise.then(() => {
			this.viewer.setMeasureMode(true);
		});
	}

	public disableMeasure() {
		this.initialised.promise.then(() => {
			this.viewer.setMeasureMode(false);
		});
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
				console.error('Error creating Viewer Directive: ', error);
			});
	}

	public get isModelLoaded() {
		return this.viewer.isModelLoaded();
	}

	public async loadViewerModel(account, model, branch, revision) {
		if (!account || !model) {
			console.error('Account, model, branch or revision was not defined!', account, model, branch, revision);
			return Promise.reject('Account, model, branch or revision was not defined!');
		} else {
			this.account = account;
			this.model = model;
			await this.setHelicopterSpeed();

			return this.viewer.loadModel(account, model, branch, revision)
				.then(() => {
					// Set the current model in the viewer
					this.currentModel.model = model;
					this.initialised.resolve();
				})
				.catch((error) => {
					console.error('Error loading model: ', error);
				});
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
		this.initialised.promise.then(() => {
			this.viewer.diffToolEnableWithClashMode();
		});
	}

	public diffToolEnableWithDiffMode() {
		this.initialised.promise.then(() => {
			this.viewer.diffToolEnableWithDiffMode();
		});
	}

	public diffToolDisableAndClear() {
		this.initialised.promise.then(() => {
			this.viewer.diffToolDisableAndClear();
		});

	}

	public diffToolShowBaseModel() {
		this.initialised.promise.then(() => {
			this.viewer.diffToolShowBaseModel();
		});
	}

	public diffToolShowComparatorModel() {
		this.initialised.promise.then(() => {
			this.viewer.diffToolShowComparatorModel();
		});
	}

	public diffToolDiffView() {
		this.initialised.promise.then(() => {
			this.viewer.diffToolDiffView();
		});
	}

	public resetMapSources(source) {
		this.initialised.promise.then(() => {
			this.viewer.resetMapSources(source);
		});
	}

	public addMapSource(source) {
		this.initialised.promise.then(() => {
			this.viewer.addMapSource(source);
		});
	}

	public removeMapSource(source) {
		this.initialised.promise.then(() => {
			this.viewer.removeMapSource(source);
		});
	}

	public mapInitialise(surveyPoints) {
		this.initialised.promise.then(() => {
			this.viewer.mapInitialise(surveyPoints);
		});
	}

	public mapStart() {
		this.initialised.promise.then(() => {
			this.viewer.mapStart();
		});
	}

	public mapStop() {
		this.initialised.promise.then(() => {
			this.viewer.mapStop();
		});
	}

	public overrideMeshColor(account, model, meshIDs, color) {
		this.initialised.promise.then(() => {
			this.viewer.overrideMeshColor(account, model, meshIDs, color);
		});
	}

	public resetMeshColor(account, model, meshIDs) {
		this.initialised.promise.then(() => {
			this.viewer.resetMeshColor(account, model, meshIDs);
		});
	}

	public startAreaSelect() {
		if (this.viewer) {
			this.viewer.startAreaSelect();
		}
	}

	public startBoxClip() {
		this.initialised.promise.then(() => {
			this.viewer.startBoxClip();
		});
	}

	public startSingleClip() {
		this.initialised.promise.then(() => {
			this.viewer.startSingleClip();
		});
	}

	public startClipEdit() {
		this.initialised.promise.then(() => {
			this.viewer.startClipEdit();
		});
	}

	public stopClipEdit() {
		this.initialised.promise.then(() => {
			this.viewer.stopClipEdit();
		});
	}

	public stopAreaSelect() {
		if (this.viewer) {
			this.viewer.stopAreaSelect();
		}
	}
	public getDefaultHighlightColor() {
		if (this.viewer) {
			return this.viewer.getDefaultHighlightColor();
		}
	}

	public zoomToHighlightedMeshes() {
		this.initialised.promise.then(() => {
			this.viewer.zoomToHighlightedMeshes();
		});
	}

	public helicopterSpeedDown(value: number) {
		this.initialised.promise.then(() => {
			this.viewer.helicopterSpeedDown();
			this.helicopterSpeedUpdate(value);
		});
	}

	public helicopterSpeedUp(value: number) {
		this.initialised.promise.then(() => {
			this.viewer.helicopterSpeedUp();
			this.helicopterSpeedUpdate(value);
		});
	}

	public helicopterSpeedReset(updateDefaultSpeed: boolean) {
		this.initialised.promise.then(() => {
			this.viewer.helicopterSpeedReset();
			if (updateDefaultSpeed) {
				this.helicopterSpeedUpdate(1);
			}
		});
	}

	public getHeliSpeed() {
		return this.heliSpeed;
	}

	public on(...args) {
		this.viewer.on(...args);
	}

	public off(...args) {
		this.viewer.off(...args);
	}

	public setShadows(type: string) {
		switch (type) {
			case 'soft':
				UnityUtil.enableSoftShadows();
				break;
			case 'hard':
				UnityUtil.enableHardShadows();
				break;
			case 'none':
				UnityUtil.disableShadows();
				break;
		}
	}

	public setStats(val: boolean = false) {
		if (val !== this.stats) {
			UnityUtil.toggleStats();
			this.stats =  val;
		}
	}

	public setNearPlane(nearplane: number) {
		if (nearplane === undefined) { return; }
		UnityUtil.setDefaultNearPlane(nearplane);
	}

	public setFarPlaneSamplingPoints(farplaneSample: number) {
		if (farplaneSample === undefined) { return; }
		UnityUtil.setFarPlaneSampleSize(farplaneSample);
	}

	public setFarPlaneAlgorithm(algorithm: string) {
		switch (algorithm) {
			case 'box':
				UnityUtil.useBoundingBoxFarPlaneAlgorithm();
				break;
			case 'sphere':
				UnityUtil.useBoundingSphereFarPlaneAlgorithm();
				break;
		}
	}

	public setShading(shading: string) {
		switch (shading) {
			case 'standard':
				UnityUtil.setRenderingQualityDefault();
				break;
			case 'architectural':
				UnityUtil.setRenderingQualityHigh();
				break;
		}
	}

	public setXray(xray: boolean) {
		if (xray) {
			UnityUtil.setXRayHighlightOn();
		} else {
			UnityUtil.setXRayHighlightOff();
		}
	}

	private helicopterSpeedUpdate(value: number) {
		if (this.account && this.model && Number.isInteger(value)) {
			this.heliSpeed = value;
			this.APIService.put(this.account + '/' + this.model + '/settings/heliSpeed', {heliSpeed: value})
				.catch((err) => {
				console.error('Failed to update helicopter speed', err);
			});
		}
	}

	private async setHelicopterSpeed() {
		if (this.account && this.model) {
			await this.APIService.get(this.account + '/' + this.model + '/settings/heliSpeed')
				.then((res) => {
					this.heliSpeed = res.data.heliSpeed ? res.data.heliSpeed : 1;
				})
				.catch((err) => {
				console.error('Failed to fetch helicopter speed', err);
			});
		}
	}
}

export const ViewerServiceModule = angular
	.module('3drepo')
	.service('ViewerService', ViewerService);
