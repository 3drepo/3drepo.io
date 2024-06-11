/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import EventEmitter from 'eventemitter3';

import { UnityUtil } from '@/globals/unity-util';
import { isEmpty, isString } from 'lodash';
import { IS_DEVELOPMENT } from '../../constants/environment';
import {
	VIEWER_EVENTS,
	VIEWER_MEASURING_MODE,
	VIEWER_NAV_MODES,
	VIEWER_PROJECTION_MODES
} from '../../constants/viewer';
import { uuid as UUID } from '../../helpers/uuid';
import { clientConfigService } from '../clientConfig';
import { MultiSelect } from './multiSelect';

declare const Module;

interface IViewerConstructor {
	name?: string;
}

export interface IPin {
	id: string;
	type?: 'issue' | 'risk' | 'bookmark' | 'ticket' | null;
	position: number[];
	norm?: number[];
	colour: number[];
	isSelected?: boolean;
}

export class ViewerService {
	public element: HTMLElement;
	public name: string;
	public viewer: HTMLElement;
	public currentNavMode = null;
	public units = 'm';
	public convertToM = 1.0;
	public isInitialised = false;
	public measuringUnits = '';
	public modelString = null;
	public divId = 'unityViewer';
	public canvas = null;
	private numClips = 0;
	private stats: boolean = false;
	private emitter = new EventEmitter();
	public initialisedPromise: {
		promise: Promise<any>;
		resolve: () => void;
		reject: () => void;
	};

	public fullscreen: boolean;
	public unityLoaderReady: boolean;
	public unityLoaderScript: HTMLScriptElement;
	public settings: any;
	public options: any;
	public plugins: any;

	public measureMode: string;
	public measureModeLabels: boolean;

	public constructor({ name = 'viewer', ...config}: IViewerConstructor) {
		this.name = name;

		this.unityLoaderReady = false;

		this.viewer = document.createElement('div');
		this.viewer.className = 'viewer';
	}

	/**
	 * Setup Instance
	 */

	public get hasInstance() {
		return !!this.element;
	}

	public setupInstance = async (container, onError) => {
		this.element = container;

		UnityUtil.init(onError, this.onUnityProgress, this.onModelProgress);
		UnityUtil.hideProgressBar();

		const unityHolder = document.createElement('canvas');
		unityHolder.className = 'emscripten';
		unityHolder.setAttribute('id', this.divId);
		unityHolder.removeAttribute('style');
		unityHolder.setAttribute('width', '100%');
		unityHolder.setAttribute('height', '100%');
		unityHolder.setAttribute('tabindex', '1'); // You need this for unityHolder to register keyboard ts
		unityHolder.setAttribute('oncontextmenu', 'event.preventDefault()');

		unityHolder.onmousedown = () => {
			return false;
		};

		unityHolder.style['pointer-events'] = 'all';

		this.element.appendChild(this.viewer);

		if (!this.viewer.hasChildNodes()) {
			this.viewer.appendChild(unityHolder);
		}
		this.canvas = unityHolder;

		this.unityLoaderScript = document.createElement('script');
	}

	/**
	 * Initialization
	 */

	public init = async () => {
		if (IS_DEVELOPMENT) {
			console.debug('Initiating Viewer');
		}

		this.setInitialisePromise();
		UnityUtil.viewer = this;

		try {
			await this.insertUnityLoader();

			(async () => {
				await this.initUnity({
					getAPI: {
						hostNames: clientConfigService.apiUrls.all
					},
					showAll: true
				});

				this.initialisedPromise.resolve();
			})();
		} catch (error) {
			console.error('Error while initialising Unity script: ', error);
		}
	}

	public initUnity(options) {
		return new Promise((resolve, reject) => {
			if (this.isInitialised) {
				resolve(null);
			}

			UnityUtil.setAPIHost({hostNames: options.getAPI.hostNames});

			// Set option param from viewerDirective
			this.options = options;
			this.emit(VIEWER_EVENTS.VIEWER_INIT);
			document.body.style.cursor = 'wait';

			if (this.options && this.options.plugins) {
				this.plugins = this.options.plugins;
				Object.keys(this.plugins).forEach((key) => {
					if (this.plugins[key].initCallback) {
						this.plugins[key].initCallback(this);
					}
				});
			}

			this.setNavMode(VIEWER_NAV_MODES.TURNTABLE, false);

			UnityUtil.onReady().then(() => {
				this.isInitialised = true;
				this.emit(VIEWER_EVENTS.UNITY_READY, {
					model: this.modelString,
					name: this.name
				});
				resolve(null);
			}).catch((error) => {
				this.emit(VIEWER_EVENTS.VIEWER_INIT, error);
				console.error('UnityUtil.onReady failed: ', error);
				reject(error);
			});
		});
	}

	public insertUnityLoader() {
		if (document.querySelector('.unity-loader')) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			this.unityLoaderScript.addEventListener ('load', () => {
				(async () => {
					console.debug('Loaded unity.loader.js succesfully');
					await UnityUtil.loadUnity(this.canvas, undefined);
					resolve(null);
				})();
			}, false);
			this.unityLoaderScript.addEventListener ('error', (error) => {
				console.error('Error loading unity.loader.js', error);
				reject('Error loading unity.loader.js');
			}, false);

			// Event handlers MUST come first before setting src
			this.unityLoaderScript.src = UnityUtil.unityLoaderPath();

			// This kicks off the actual loading of Unity
			this.unityLoaderScript.setAttribute('class', 'unity-loader');
			document.body.appendChild(this.unityLoaderScript);
		});
	}

	/**
	 * Emitter
	 */

	public on = (event, fn, ...args) => {
		this.emitter.on(event, fn, ...args);
	}

	public once = (event, fn, ...args) => {
		this.emitter.once(event, fn, ...args);
	}

	public off = (event, ...args) => {
		this.emitter.off(event, ...args);
	}

	public emit = (event, ...args) => {
		this.emitter.emit(event, ...args);
	}

	public removeAllListeners() {
		this.emitter.removeAllListeners();
	}

	public pickPointEvent(pointInfo) {
		if (this.measureMode !== VIEWER_MEASURING_MODE.POINT) {
			return;
		}

		// User clicked a mesh
		const position  = pointInfo.trans ? pointInfo.trans.inverse().multMatrixPnt(pointInfo.position) : pointInfo.position;

		const measure = {
			uuid: UUID(),
			position,
			type: -1,
			color: [0, 1, 1, 1],
		};

		this.measurementAlertEvent(measure);
	}

	public moveMeshes(teamspace: string, modelId: string, meshes: string[], matrix: number[]) {
		UnityUtil.moveMeshes(teamspace, modelId, meshes, matrix);
	}

	public resetMovedMeshes(teamspace: string, modelId: string, meshes: string[]) {
		UnityUtil.resetMovedMeshes(teamspace, modelId, meshes);
	}

	/**
	 * Helpers
	 */

	public async isModelLoaded() {
		await UnityUtil.onReady();
		return UnityUtil.onLoaded();
	}

	public getDefaultHighlightColor() {
		return UnityUtil.defaultHighlightColor;
	}

	public getScreenshot() {
		return UnityUtil.requestScreenShot();
	}

	public getCurrentViewpointInfo() {
		return UnityUtil.requestViewpoint('', '');
	}

	public hideHiddenByDefaultObjects() {
		UnityUtil.hideHiddenByDefaultObjects();
	}

	public showHiddenByDefaultObjects() {
		UnityUtil.showHiddenByDefaultObjects();
	}

	public showCoordView() {
		UnityUtil.showCoordView();
	}

	public hideCoordView() {
		UnityUtil.hideCoordView();
	}

	public getUnityObjectsStatus(account, model) {
		return UnityUtil.getObjectsStatus(account, model);
	}

	/**
	 * Handlers
	 */

	private onUnityProgress = (progress) => {
		if (progress === 1) {
			this.emit(VIEWER_EVENTS.VIEWER_INIT_SUCCESS, progress);
		} else {
			this.emit(VIEWER_EVENTS.VIEWER_INIT_PROGRESS, progress);
		}
	}

	public onModelProgress = (progress) => {
		this.emit(VIEWER_EVENTS.MODEL_LOADING_PROGRESS, progress);
	}

	/**
	 * Destroying
	 */

	public async destroy() {
		UnityUtil.reset();
		this.isInitialised = false;
		this.removeAllListeners();
		this.clearMeasureMode();
	}

	/**
	 * Selecting
	 */

	public get canSelect() {
		return !Boolean(this.measureMode);
	}

	public objectSelected(pointInfo) {
		if (this.canSelect) {
			if (pointInfo.id) {
				if (pointInfo.pin) {
					// User clicked a pin
					this.emit(VIEWER_EVENTS.CLICK_PIN, {
						id: pointInfo.id
					});
				} else {
					this.emit(VIEWER_EVENTS.OBJECT_SELECTED, {
						account: pointInfo.database,
						id: pointInfo.id,
						model: pointInfo.model,
						source: 'viewer'
					});
				}
			} else {
				this.emit(VIEWER_EVENTS.BACKGROUND_SELECTED);
			}
		} else {
			if (!pointInfo.id) {
				this.emit(VIEWER_EVENTS.BACKGROUND_SELECTED_PIN_MODE);
			}
		}
	}

	public objectsSelected(nodes) {
		if (this.canSelect) {
			if (nodes) {
				this.emit(VIEWER_EVENTS.MULTI_OBJECTS_SELECTED, { selectedNodes: nodes });
			} else {
				this.emit(VIEWER_EVENTS.BACKGROUND_SELECTED);
			}
		}
	}

	/**
	 * Measure
	 */
	public async setMeasuringUnits(units) {
		this.measuringUnits = units;
		await this.isViewerReady();
		UnityUtil.setMeasureToolUnits(units);
	}

	public getMeasuringUnits() {
		return this.measuringUnits;
	}

	public async removeMeasurement(uuid) {
		await this.isViewerReady();
		UnityUtil.clearMeasureToolMeasurement(uuid);
	}

	public async setMeasurementColor(uuid, color) {
		await this.isViewerReady();
		UnityUtil.setMeasureToolMeasurementColor(uuid, color);
	}

	public async setMeasurementName(uuid, name) {
		await this.isViewerReady();
		UnityUtil.setMeasureToolMeasurementName(uuid, name);
	}

	public async enableEdgeSnapping() {
		await this.isViewerReady();
		UnityUtil.enableSnapping();
	}

	public async disableEdgeSnapping() {
		await this.isViewerReady();
		UnityUtil.disableSnapping();
	}

	public async enableMeasureXYZDisplay() {
		await this.isViewerReady();
		UnityUtil.enableMeasureToolXYZDisplay();
	}

	public async disableMeasureXYZDisplay() {
		await this.isViewerReady();
		UnityUtil.disableMeasureToolXYZDisplay();
	}

	public async clearMeasurements() {
		await this.isViewerReady();
		UnityUtil.clearAllMeasurements();
	}

	public measurementAlertEvent(measurement) {
		this.emit(VIEWER_EVENTS.MEASUREMENT_CREATED, measurement);
	}

	public measurementRemoved(measurementId) {
		this.emit(VIEWER_EVENTS.MEASUREMENT_REMOVED, measurementId);
	}

	public measurementsCleared() {
		this.emit(VIEWER_EVENTS.ALL_MEASUREMENTS_REMOVED);
	}

	public measurementModeChanged(mode) {
		this.emit(VIEWER_EVENTS.MEASUREMENT_MODE_CHANGED, mode);
	}

	public async setMeasureMode(mode: string, labels: boolean = true) {
		await this.isViewerReady();
		this.measureModeLabels = labels;
		if (this.measureMode) {
			this.clearMeasureMode();
		}
		if (!mode) {
			return;
		}

		this.measureMode = mode;


		this.setVisibilityOfMeasurementsLabels(labels);
		MultiSelect.toggleAreaSelect(false);

		// For point it only checks the pickPointEvent, so the actual measuring tool should be disabled.
		if (mode === VIEWER_MEASURING_MODE.POINT)  {
			UnityUtil.disableMeasuringTool();
		} else {
			UnityUtil.setMeasureToolMode(mode);
			UnityUtil.enableMeasuringTool();
		}

		this.measurementModeChanged(mode);
	}

	public clearMeasureMode() {
		if (!this.measureMode) {
			return;
		}

		UnityUtil.disableMeasuringTool();
		UnityUtil.disableSnapping();
		this.measureMode = '';
		this.measurementModeChanged('');
	}

	public async setVisibilityOfMeasurementsLabels(visible) {
		await this.isViewerReady();
		if (visible) {
			UnityUtil.showNewMeasurementsLabels();
		} else {
			UnityUtil.hideNewMeasurementsLabels();
		}
	}

	public async addMeasurements(measurements, hideLabels) {
		await this.isViewerReady();
		await this.isModelLoaded();
		await this.setVisibilityOfMeasurementsLabels(!hideLabels);

		measurements.forEach(UnityUtil.addMeasurement);

		this.setVisibilityOfMeasurementsLabels(this.measureModeLabels);
	}

	public async removeMeasurements(measurements) {
		await this.isViewerReady();
		await this.isModelLoaded();
		measurements.forEach(({uuid}) => this.removeMeasurement(uuid));
	}

	public async selectMeasurements(measurements) {
		await this.isViewerReady();
		await this.isModelLoaded();
		measurements.forEach(({uuid}) => UnityUtil.selectMeasurement(uuid));
	}

	public async deselectMeasurements(measurements) {
		await this.isViewerReady();
		await this.isModelLoaded();
		measurements.forEach(({uuid}) => UnityUtil.deselectMeasurement(uuid));
	}

	/**
	 * Highlight
	 */

	public get canHighlight() {
		return this.isInitialised && !Boolean(this.measureMode);
	}

	public async highlightObjects(
		account: string,
		model: string,
		colour: [number],
		multi: boolean,
		forceReHighlight: boolean,
		ids: string[]) {
			if (this.canHighlight) {
				if (ids) {
					const uniqueIds = Array.from(new Set(ids));
					if (uniqueIds.length) {
						// eslint-disable-next-line @typescript-eslint/await-thenable
						await UnityUtil.highlightObjects(account, model, uniqueIds, colour, multi, forceReHighlight);
						this.emit(VIEWER_EVENTS.HIGHLIGHT_OBJECTS, {account, model, uniqueIds });
						return;
					}
				}

				this.clearHighlights();
			}
	}

	public clearHighlights() {
		UnityUtil.clearHighlights();
		this.emit(VIEWER_EVENTS.CLEAR_HIGHLIGHT_OBJECTS, {});
	}

	public unhighlightObjects(account, model, ids: string[]) {
		if (ids) {
			const uniqueIds = Array.from(new Set(ids));
			if (uniqueIds.length) {
				UnityUtil.unhighlightObjects(account, model, uniqueIds);
				this.emit(VIEWER_EVENTS.UNHIGHLIGHT_OBJECTS, {account, model, uniqueIds });
				return;
			}
		}
	}

	/**
	 * Settings
	 */

	public updateViewerSettings(settings) {
		if (settings) {
			this.settings = settings;
			if (this.settings.properties && this.settings.properties.unit) {
				this.setUnits(this.settings.properties.unit);
			}
		}
	}

	public setUnits(units) {
		this.units = units;

		if (units === 'mm') {
			this.convertToM = 0.001;
		} else if (units === 'ft') {
			this.convertToM = 0.0032;
		}

		// Set the units in unity for the measure tool
		if (this.units) {
			UnityUtil.setUnits(this.units);
		}
	}

	/**
	 * Navigation
	 */

	public helicopterSpeedDown() {
		UnityUtil.helicopterSpeedDown();
	}

	public helicopterSpeedUp() {
		UnityUtil.helicopterSpeedUp();
	}

	public helicopterSpeedReset() {
		UnityUtil.helicopterSpeedReset();
	}

	public setNavigation(mode) {
		UnityUtil.setNavigation(mode);
	}

	public setNavigationMode(mode) {
		this.setNavMode(mode, false);
	}

	public setNavMode(mode, force) {
		if (this.currentNavMode !== mode || force) {
			this.currentNavMode = mode;
			this.setNavigation(mode);
		}
	}

	public navMethodChanged(newNavMode) {
		this.currentNavMode = newNavMode;
	}

	public get getNavMode() {
		return this.currentNavMode;
	}

	public async overrideMeshOpacity(account, model, meshIDs, opacity) {
		await this.isViewerReady();
		UnityUtil.overrideMeshOpacity(account, model, meshIDs, opacity);
	}

	public async resetMeshOpacity(account, model, meshIDs) {
		await this.isViewerReady();
		UnityUtil.resetMeshOpacity(account, model, meshIDs);
	}

	/**
	 * Fullscreen
	 */
	public switchFullScreen() {
		if (!this.fullscreen) {
			if (this.viewer.hasOwnProperty('mozRequestFullScreen')) {
			} else if (this.viewer.webkitRequestFullscreen) {
				this.viewer.webkitRequestFullscreen();
			}

			this.fullscreen = true;
		} else {
			if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}

			this.fullscreen = false;
		}
	}

	/**
	 * Pins
	 */
	public showPin = async ({id, position, norm, colour, type}: IPin) => {
		await this.isViewerReady();
		await this.isModelLoaded();
		switch (type) {
			case 'risk':
				UnityUtil.dropRiskPin(id, position, norm, colour);
				break;
			case 'issue':
				UnityUtil.dropIssuePin(id, position, norm, colour);
				break
			case 'ticket':
				UnityUtil.dropTicketPin(id, position, norm, colour);
				break
			default:
				UnityUtil.dropBookmarkPin(id, position, norm, colour);
				break;
		}
	}

	public setSelectionPin = async ({id, isSelected}) => {
		await this.isViewerReady();
		await this.isModelLoaded();
		if (isSelected) {
			UnityUtil.selectPin(id);
		} else {
			UnityUtil.deselectPin(id);
		}
	}

	public removePin = async (pin: IPin | string) => {
		await this.isViewerReady();
		await this.isModelLoaded();
		UnityUtil.removePin(isString(pin) ? pin : pin.id);
	}

	/**
	 * Diffs
	 */

	public diffToolSetAsComparator(account: string, model: string) {
		UnityUtil.diffToolSetAsComparator(account, model);
	}

	public diffToolLoadComparator(account: string, model: string, revision: string) {
		return UnityUtil.diffToolLoadComparator(account, model, revision);
	}

	public diffToolEnableWithDiffMode() {
		UnityUtil.diffToolEnableWithDiffMode();
	}

	public diffToolEnableWithClashMode() {
		UnityUtil.diffToolEnableWithClashMode();
	}

	public diffToolDisableAndClear() {
		UnityUtil.diffToolDisableAndClear();
	}

	public diffToolShowBaseModel() {
		UnityUtil.diffToolShowBaseModel();
	}

	public diffToolShowComparatorModel() {
		UnityUtil.diffToolShowComparatorModel();
	}

	public diffToolDiffView() {
		UnityUtil.diffToolDiffView();
	}

	/**
	 * Load
	 */

	public setInitialisePromise() {
		const initialised = {} as any;
		initialised.promise = new Promise((resolve, reject) => {
			initialised.resolve = resolve;
			initialised.reject = reject;
		});

		if (this.initialisedPromise) {
			this.initialisedPromise.reject();
		}

		this.initialisedPromise = initialised;
	}

	public async isViewerReady() {
		return await (this.initialisedPromise && this.initialisedPromise.promise);
	}

	/**
	 * Load Model
	 */

	public async isModelReady() {
		return await this.isModelLoaded();
	}

	public async loadViewerModel(teamspace, model, branch, revision, viewpoint) {
		if (!teamspace || !model) {
			console.error('Teamspace, model, branch or revision was not defined!', teamspace, model, branch, revision);
			await Promise.reject('Teamspace, model, branch or revision was not defined!');
		} else {
			await this.loadNewModel(teamspace, model, branch, revision, viewpoint);
			this.initialisedPromise.resolve();
		}
	}

	public async loadNewModel(account, model, branch, revision, viewpoint) {
		await UnityUtil.onReady();
		this.emit(VIEWER_EVENTS.MODEL_LOADING_START);
		document.body.style.cursor = 'wait';

		await UnityUtil.loadModel(account, model, branch, revision, viewpoint);

		await UnityUtil.onLoaded().then((bbox) => {
			document.body.style.cursor = 'initial';

			this.emit(VIEWER_EVENTS.MODEL_LOADED, 1);
			this.emit(VIEWER_EVENTS.BBOX_READY, bbox);
		}).catch((error) => {
			document.body.style.cursor = 'initial';
			if (error !== 'cancel') {
				console.error('Unity error loading model= ', error);
			}
		});

		return UnityUtil.onLoading();
	}

	/**
	 * Zooms
	 */

	public zoomToHighlightedMeshes() {
		UnityUtil.zoomToHighlightedMeshes();
	}

	public zoomToObjects(meshes) {
		UnityUtil.zoomToObjects(meshes);
	}

	/**
	 * Mesh Color
	 */

	public overrideMeshColor(account, model, meshIDs, color) {
		UnityUtil.overrideMeshColor(account, model, meshIDs, color);
	}

	public resetMeshColor(account, model, meshIDs) {
		UnityUtil.resetMeshColor(account, model, meshIDs);
	}

	/**
	 * Setters
	 */

	public setFarPlaneAlgorithm = (algorithm: string) => {
		switch (algorithm) {
			case 'box':
				UnityUtil.useBoundingBoxFarPlaneAlgorithm();
				break;
			case 'sphere':
				UnityUtil.useBoundingSphereFarPlaneAlgorithm();
				break;
		}
	}

	public async setViewerBackgroundColor(color) {
		if (color === undefined) {
			return;
		}
		UnityUtil.setBackgroundColor(color);
	}

	public setXray = (xray: boolean) => {
		if (xray) {
			UnityUtil.setXRayHighlightOn();
		} else {
			UnityUtil.setXRayHighlightOff();
		}
	}

	public setMaxShadowDistance(value: number) {
		if (value === undefined) {
 			return;
		}
		UnityUtil.setMaxShadowDistance(value);
	}

	public setNearPlane = (nearplane: number) => {
		if (nearplane === undefined) {
 			return;
		}
		UnityUtil.setDefaultNearPlane(nearplane);
	}

	public setMaxNearPlane = (nearplane: number) => {
		if (nearplane === undefined) {
 			return;
		}
		UnityUtil.setMaxNearPlane(nearplane);
	}

	public setMaxFarPlane = (farplane: number) => {
		if (farplane === undefined) {
 			return;
		}
		UnityUtil.setMaxFarPlane(farplane);
	}

	public setFarPlaneSamplingPoints = (farplaneSample: number) => {
		if (farplaneSample === undefined) {
 			return;
		}
		UnityUtil.setFarPlaneSampleSize(farplaneSample);
	}

	public setStats = (val: boolean = false) => {
		if (val !== this.stats) {
			UnityUtil.toggleStats();
			this.stats = val;
		}
	}

	public setPlaneBorderWidth = (width: number) => {
		if (width === undefined) {
 			return;
		}
		UnityUtil.setPlaneBorderWidth(width);
	}

	public setPlaneBorderColor = (color: number[]) => {
		if (color === undefined) {
 			return;
		}
		UnityUtil.setPlaneBorderColor(color);
	}

	public setStreamingMemoryThreshold = (thresholdMB: number) => {
		if (thresholdMB === undefined) {
 			return;
		}
		UnityUtil.setStreamingMemoryThreshold(thresholdMB);
	}

	public setStreamingMeshFactor = (factor: number) => {
		if (factor === undefined) {
 			return;
		}
		UnityUtil.setStreamingMeshFactor(factor);
	}

	public setStreamingFovWeight = (weight: number) => {
		if (weight === undefined) {
 			return;
		}
		UnityUtil.setStreamingFovWeight(weight);
	}

	public setStreamingBundlesFade = (distance: number, bias: number, power: number) => {
		if (distance === undefined || bias === undefined || power === undefined) {
 			return;
		}
		UnityUtil.setStreamingBundlesFade(distance, bias, power);
	}

	public setStreamingBundlesColor = (color: number[]) => {
		if (color === undefined) {
 			return;
		}
		UnityUtil.setStreamingBundlesColor(color);
	}

	public setStreamingElementsColor = (color: number[]) => {
		if (color === undefined) {
 			return;
		}
		UnityUtil.setStreamingElementsColor(color);
	}

	public setStreamingBundlesFacesAlpha = (alpha: number) => {
		if (alpha === undefined) {
 			return;
		}
		UnityUtil.setStreamingBundlesFacesAlpha(alpha);
	}

	public setStreamingBundlesLinesAlpha = (alpha: number) => {
		if (alpha === undefined) {
 			return;
		}
		UnityUtil.setStreamingBundlesLinesAlpha(alpha);
	}


	public setStreamingElementsFacesAlpha = (alpha: number) => {
		if (alpha === undefined) {
 			return;
		}
		UnityUtil.setStreamingElementsFacesAlpha(alpha);
	}

	public setStreamingElementsLinesAlpha = (alpha: number) => {
		if (alpha === undefined) {
 			return;
		}
		UnityUtil.setStreamingElementsLinesAlpha(alpha);
	}

	public setStreamingElementsRenderingRadius = (radius: number) => {
		if (radius === undefined) {
 			return;
		}
		UnityUtil.setStreamingElementsRadius(radius);
	}

	public setUnityMemory = (maxMemoryMb: number) => {
		if (maxMemoryMb === undefined) {
			return;
		}
		UnityUtil.setUnityMemory(maxMemoryMb);
	}

	/**
	 * Map
	 */

	public async resetMapSources() {
		await this.isViewerReady();
		UnityUtil.resetMapSources();
	}

	public async addMapSource(source) {
		await this.isViewerReady();
		UnityUtil.addMapSource(source);
	}

	public async removeMapSource(source) {
		await this.isViewerReady();
		UnityUtil.removeMapSource(source);
	}

	public async mapInitialise(surveyPoints) {
		await this.isViewerReady();
		UnityUtil.mapInitialise(surveyPoints);
	}

	public async mapStart() {
		await this.isViewerReady();
		UnityUtil.mapStart();
	}

	public async mapStop() {
		await this.isViewerReady();
		UnityUtil.mapStop();
	}

	public async setBackgroundColor(color) {
		await this.isViewerReady();
		UnityUtil.setBackgroundColor(color);
	}


	/**
	 * MultiSelect
	 */

	public async goToExtent() {
		await this.isViewerReady();
		this.showAll();
	}

	/**
	 * Status
	 */

	public async getObjectsStatus({ teamspace, model } = { teamspace: '', model: '' }) {
		await this.isViewerReady();
		return await this.getUnityObjectsStatus(teamspace, model);
	}

	public async getCurrentViewpoint() {
		await this.isViewerReady();
		return await this.getCurrentViewpointInfo();
	}

	// This is for v5, matching the view schema
	public async getViewpoint() {
		await this.isViewerReady();
		const { position, up, view_dir: forward, type, orthographicSize: size , clippingPlanes} = await this.getCurrentViewpointInfo();
		const camera: any = { position, up, forward, type };

		if (type !== 'perspective') {
			camera.size = size;
		}

		return {camera, clippingPlanes};
	}

	// This is for v5, matching the view schema
	public async setViewpoint(viewpoint) {
		if (!isEmpty(viewpoint.camera)) {
			const { position, up, forward: view_dir, type, size: orthographicSize } = viewpoint.camera;
			const camera =  { position, up, view_dir, type, orthographicSize, look_at: null,  account: null, model: null };
			await this.setCamera(camera);

			this.updateClippingPlanes(viewpoint.clippingPlanes, '', '');
		}
	}

	public async goToDefaultViewpoint() {
		await this.isViewerReady();
		return this.showAll();
	}

	public async setProjectionMode(mode) {
		await this.isModelReady();
		switch (mode) {
			case VIEWER_PROJECTION_MODES.ORTHOGRAPHIC:
				UnityUtil.useOrthographicProjection();
				this.emit(VIEWER_EVENTS.CAMERA_PROJECTION_SET, mode);
				break;
			default:
				UnityUtil.usePerspectiveProjection();
				this.emit(VIEWER_EVENTS.CAMERA_PROJECTION_SET, VIEWER_PROJECTION_MODES.PERSPECTIVE);
		}
	}

	public async setCamera({ position, up, view_dir, look_at, type, orthographicSize, account, model }) {
		await this.isModelReady();
		UnityUtil.setViewpoint(
			position,
			up,
			view_dir,
			look_at,
			type,
			orthographicSize,
			account,
			model
		);

		this.emit(VIEWER_EVENTS.CAMERA_PROJECTION_SET, type);
	}

	/**
	 * Camera
	 */

	public topView() {
		UnityUtil.topView();
	}

	public bottomView() {
		return UnityUtil.bottomView();
	}

	public frontView() {
		return UnityUtil.frontView();
	}

	public backView() {
		return UnityUtil.backView();
	}

	public leftView() {
		return UnityUtil.leftView();
	}

	public rightView() {
		return UnityUtil.rightView();
	}

	public showAll() {
		UnityUtil.resetCamera();
	}

	public centreToPoint(params) {
		UnityUtil.centreToPoint(params);
	}

	/**
	 * Controlling
	 */

	public pauseRendering() {
		UnityUtil.pauseRendering();
	}

	public resumeRendering() {
		UnityUtil.resumeRendering();
	}

	public setModelCache = (cache: boolean) => {
		if (cache) {
			UnityUtil.enableExternalWebRequestHandler();
		} else {
			UnityUtil.disableExternalWebRequestHandler();
		}
	}

	public switchObjectVisibility(account, model, ids, visibility) {
		UnityUtil.toggleVisibility(account, model, ids, visibility);
	}

	public setShadows = (type: string) => {
		switch (type) {
			case 'soft':
				this.enableSoftShadows();
				break;
			case 'hard':
				this.enableHardShadows();
				break;
			case 'none':
				this.disableShadows();
				break;
		}
	}

	public enableSoftShadows() {
		UnityUtil.enableSoftShadows();
	}

	public enableHardShadows() {
		UnityUtil.enableHardShadows();
	}

	public disableShadows() {
		UnityUtil.disableShadows();
	}

	/**
	 * Clip
	 */

	public getNumPlanes() {
		return this.numClips;
	}

	public clipBroadcast(clip) {
		this.emit(VIEWER_EVENTS.CLIPPING_PLANE_BROADCAST, clip);
	}

	public clipUpdated() {
		this.emit(VIEWER_EVENTS.UPDATE_CLIP);
	}

	public updateClippingPlanes( clipPlanes, account, model ) {
		UnityUtil.updateClippingPlanes(clipPlanes ? clipPlanes : [], false, account, model);
	}

	public startClip(isSingle: boolean) {
		if (isSingle) {
			this.startSingleClip();
		} else {
			this.startBoxClip();
		}
		this.emit(VIEWER_EVENTS.UPDATE_CLIP_EDIT, true);
	}

	public setClipMode(mode) {
		if (!mode) {
			this.clipToolDelete()
		}
		this.emit(VIEWER_EVENTS.UPDATE_CLIP_MODE, mode);
	}

	public startBoxClip() {
		UnityUtil.startBoxClip();
	}

	public startSingleClip() {
		UnityUtil.startSingleClip();
	}

	public startClipEdit() {
		UnityUtil.startClipEdit();
		this.emit(VIEWER_EVENTS.UPDATE_CLIP_EDIT, true);
	}

	public stopClipEdit() {
		UnityUtil.stopClipEdit();
		this.emit(VIEWER_EVENTS.UPDATE_CLIP_EDIT, false);
	}

	public clipToolFlip() {
		UnityUtil.clipToolFlip();
	}

	public clipToolRealign() {
		UnityUtil.clipToolRealign();
	}

	public clipToolClipToSelection() {
		UnityUtil.clipToolClipToSelection();
	}

	public clipToolDelete() {
		UnityUtil.clipToolDelete();
		this.emit(VIEWER_EVENTS.UPDATE_CLIP_MODE, null);
	}

	public clipToolRotate() {
		UnityUtil.clipToolRotate();
	}

	public clipToolScale() {
		UnityUtil.clipToolScale();
	}

	public clipToolTranslate() {
		UnityUtil.clipToolTranslate();
	}

	public setNavigationOn() {
		UnityUtil.setNavigationOn();
	}

	public setNavigationOff() {
		UnityUtil.setNavigationOff();
	}

	public async getClickPoint() {
		return new Promise(async (resolve) => {
			let pinDropped = false;

			const onModeChanged = (mode) => {
				this.off(VIEWER_EVENTS.MEASUREMENT_CREATED, onCreated);
				this.off(VIEWER_EVENTS.MEASUREMENT_MODE_CHANGED, onModeChanged);

				if (!pinDropped) {
					resolve(undefined);
				}
			}

			const onCreated = ({ position}) => {
				pinDropped = true;
				resolve(position);
				this.clearMeasureMode();
			};

			await this.setMeasureMode(VIEWER_MEASURING_MODE.POINT);
			await this.enableEdgeSnapping();

			this.on(VIEWER_EVENTS.MEASUREMENT_CREATED, onCreated);
			this.on(VIEWER_EVENTS.MEASUREMENT_MODE_CHANGED, onModeChanged);
		})

	}
}

export const Viewer = new ViewerService({});

export const withViewer = (WrappedComponent) => (props) => (
		<WrappedComponent viewer={Viewer} {...props} />
);
