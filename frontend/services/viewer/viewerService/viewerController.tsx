/**
 **  Copyright (C) 2020 3D Repo Ltd
 **
 **  This program is free software= you can redistribute it and/or modify
 **  it under the terms of the GNU Affero General Public License as
 **  published by the Free Software Foundation, either version 3 of the
 **  License, or (at your option) any later version.
 **
 **  This program is distributed in the hope that it will be useful,
 **  but WITHOUT ANY WARRANTY; without even the implied warranty of
 **  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 **  GNU Affero General Public License for more details.
 **
 **  You should have received a copy of the GNU Affero General Public License
 **  along with this program.  If not, see <http=//www.gnu.org/licenses/>.
 **/

import React from 'react';
import {IS_DEVELOPMENT} from '../../../constants/environment';
import {
	VIEWER_ERRORS,
	VIEWER_EVENTS,
	VIEWER_MAP_SOURCES,
	VIEWER_NAV_MODES,
	VIEWER_PIN_MODE
} from '../../../constants/viewer';
import { UnityUtil } from '../../../globals/unity-util';
import { DialogActions } from '../../../modules/dialog';
import {dispatch, getState} from '../../../modules/store';
import {selectMemory} from '../../../modules/viewer';
import {clientConfigService} from '../../clientConfig';
import {MultiSelect} from '../multiSelect';
import { Pin } from '../pin';
import { UnityController } from './unityController';

const UNITY_LOADER_PATH = 'unity/Build/UnityLoader.js';

declare const Module;

interface IViewerConstructor {
	name?: string;
}

export class ViewerService extends UnityController {
	public element: HTMLElement;
	public name: string;
	public viewer: HTMLElement;
	public previousHighLightedPin = null;
	public pins = {};
	public currentNavMode = null;
	public units = 'm';
	public convertToM = 1.0;
	public initialized = false;
	public measureMode = false;
	public modelString = null;
	public pinData = null;
	private newPinId = 'newPinId';
	private mode = VIEWER_PIN_MODE.NORMAL;
	public initialised: {
		promise: Promise<any>;
		resolve: () => void;
		reject: () => void;
	};

	public fullscreen: boolean;
	public pinDropMode: boolean;
	public unityLoaderReady: boolean;
	public unityLoaderScript: HTMLScriptElement;
	public settings: any;
	public options: any;
	public plugins: any;

	public constructor({ name = 'viewer', ...config}: IViewerConstructor) {
		super();
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

	public setupInstance = (container) => {
		this.element = container;
		this.startUnity();

		const unityHolder = document.createElement('div');
		unityHolder.className = 'emscripten';
		unityHolder.setAttribute('id', this.divId);
		unityHolder.removeAttribute('style');
		unityHolder.setAttribute('width', '100%');
		unityHolder.setAttribute('height', '100%');
		unityHolder.setAttribute('tabindex', '1'); // You need this for unityHolder to register keyboard events
		unityHolder.setAttribute('oncontextmenu', 'event.preventDefault()');

		unityHolder.onmousedown = () => {
			return false;
		};

		unityHolder.style['pointer-events'] = 'all';

		this.element.appendChild(this.viewer);
		this.viewer.appendChild(unityHolder);

		this.unityLoaderScript = document.createElement('script');
	}

	/**
	 * Initialization
	 */

	public get memory() {
		const MAX_MEMORY = 2130706432; // The maximum memory Unity can allocate
		const assignedMemory = selectMemory(getState()) * 1024 * 1024; // Memory is in Mb.
		return Math.min(assignedMemory, MAX_MEMORY);
	}

	public init = async () => {
		console.error('Initiating Viewer:');
		if (IS_DEVELOPMENT) {
			console.debug('Initiating Viewer');
		}

		this.setInitialisePromise();
		this.setUnity();

		try {
			await this.insertUnityLoader(this.memory);

			(async () => {
				await this.initUnity({
					getAPI: {
						hostNames: clientConfigService.apiUrls.all
					},
					showAll: true
				});

				this.initialised.resolve();
			})();
		} catch (error) {
			console.error('Error while initialising Unity script: ', error);
		}
	}

	public initUnity(options) {
		return new Promise((resolve, reject) => {
			if (this.initialized) {
				resolve();
			}
			console.error('options:', options);
			UnityUtil.setAPIHost(options.getAPI);

			// Set option param from viewerDirective
			this.options = options;
			this.emit(VIEWER_EVENTS.VIEWER_INIT);
			document.body.style.cursor = 'wait';

			// Shouldn't need this, but for something it is not being recognised from unitySettings!
			Module.errorhandler = UnityUtil.onUnityError;

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
				this.initialized = true;
				this.emit(VIEWER_EVENTS.UNITY_READY, {
					model: this.modelString,
					name: this.name
				});
				resolve();
			}).catch((error) => {
				this.emit(VIEWER_EVENTS.VIEWER_INIT, error);
				console.error('UnityUtil.onReady failed: ', error);
				reject(error);
			});

		});
	}

	public insertUnityLoader(memory) {
		if (document.querySelector('.unity-loader')) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			this.unityLoaderScript.addEventListener ('load', () => {
				// UnityUtil.loadUnity(this.divId, undefined, memory, this.onUnityProgress);
				(async () => {
					await this.loadUnity(memory);
					console.debug('Loaded UnityLoader.js succesfully');
					resolve();
				})();
			}, false);
			this.unityLoaderScript.addEventListener ('error', (error) => {
				console.error('Error loading UnityLoader.js', error);
				reject('Error loading UnityLoader.js');
			}, false);

			// Event handlers MUST come first before setting src
			this.unityLoaderScript.src = UNITY_LOADER_PATH;

			// This kicks off the actual loading of Unity
			this.unityLoaderScript.setAttribute('class', 'unity-loader');
			document.body.appendChild(this.unityLoaderScript);
		});
	}

	/**
	 * Resetting
	 */

	public async destroy() {
		this.removeAllListeners();
		await this.reset();
		this.element = null;
	}

	public async reset() {
		await this.disableMeasure();
		// if (this.viewer) {
		this.setPinDropMode(false);
		this.initialized = false;
		this.resetUnity();
	// }
	}

	/**
	 * Selecting
	 */

	public get canSelect() {
		return !this.pinDropMode && !this.measureMode;
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

	public async activateMeasure() {
		await this.isViewerReady();
		this.setMeasureMode(true);
	}

	public async disableMeasure() {
		await this.isViewerReady();
		this.setMeasureMode(false);
	}

	public setMeasureMode(on: boolean) {
		this.measureMode = on;
		if (on === true) {
			UnityUtil.enableMeasuringTool();
		} else {
			UnityUtil.disableMeasuringTool();
		}
	}

	/**
	 * Highlight
	 */

	public get canHighlight() {
		return this.initialized && !this.pinDropMode && !this.measureMode;
	}

	public async highlightObjects(params) {
		if (this.canHighlight) {
			if (params.idsIn) {
				const uniqueIds = Array.from(new Set(params.idsIn));
				if (uniqueIds.length) {
					await this.highlightAllObjects(
							params.account,
							params.model,
							params.id ? [params.id] : params.ids,
							params.colour,
							params.multi,
							params.forceReHighlightt);

					this.emit(VIEWER_EVENTS.HIGHLIGHT_OBJECTS, {account: params.account, model: params.model, uniqueIds });
					return;
				}
			}

			this.clearHighlights();
		}
	}

	public unhighlightObjects(params) {
		this.unhighlightAllObjects(
				params.account,
				params.model,
				params.id ? [params.id] : params.ids
		);
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
	 * Nav mode
	 */

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
// ???? this.mode ??
	// get isPinMode() {
	// 	return this.mode === VIEWER_PIN_MODE.PIN;
	// }

	public addPin({account, model, id, type, position, norm, colours, viewpoint, isSelected}) {
		this.pins[id] = new Pin({ id, type, position, norm, colors: colours, account, model });

		if (type === 'risk') {
			UnityUtil.dropRiskPin(id, position, norm, colours);
		} else {
			UnityUtil.dropIssuePin(id, position, norm, colours);
		}

		if (isSelected) {
			this.selectPin(id);
		}
	}

	public removePin({id}) {
		if (this.pins.hasOwnProperty(id)) {
			this.pins[id].remove();
			delete this.pins[id];
		}
	}

	public removeUnsavedPin() {
		this.removePin({ id: this.newPinId });
		this.setPin({ data: null });
	}

	public highlightPin(id) {
		// If a pin was previously highlighted switch it off
		if (this.previousHighLightedPin) {
			this.previousHighLightedPin.highlight();
			this.previousHighLightedPin = null;
		}

		// If the pin exists switch it on
		if (id && this.pins.hasOwnProperty(id)) {
			this.pins[id].highlight();
			this.previousHighLightedPin = this.pins[id];
		}
	}

	public changePinColor({id, colours}) {
		if (this.pins.hasOwnProperty(id)) {
			this.pins[id].changeColour(colours);
		}
	}

	public setPinDropMode(on: boolean) {
		this.pinDropMode = on;

		if (on) {
			MultiSelect.toggleAreaSelect(false);
		}
	}

	public setPin(data) {
		this.pinData = data;
	}

	public getPinData(): any {
		return this.pinData;
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
		this.initialised = initialised;
	}

	public async isViewerReady() {
		return await this.initialised.promise;
	}

	/**
	 * Load Model
	 */

	public async loadViewerModel(teamspace, model, branch, revision) {
		console.error('loadViewerModel:');
		if (!teamspace || !model) {
			console.error('Teamspace, model, branch or revision was not defined!', teamspace, model, branch, revision);
			await Promise.reject('Teamspace, model, branch or revision was not defined!');
		} else {
			await this.loadNewModel(teamspace, model, branch, revision);
			this.initialised.resolve();
		}
	}

	public async loadNewModel(account, model, branch, revision) {
		await UnityUtil.onReady();
		this.emit(VIEWER_EVENTS.MODEL_LOADING_START);
		this.initialized = true;
		// this.account = account;
		// this.model = model;
		// this.branch = branch;
		// this.revision = revision;
		document.body.style.cursor = 'wait';

		this.loadModel(account, model, branch, revision);

		this.onLoaded().then((bbox) => {
			document.body.style.cursor = 'initial';

			this.emit(VIEWER_EVENTS.MODEL_LOADED, 1);
			this.emit(VIEWER_EVENTS.BBOX_READY, bbox);
		}).catch((error) => {
			document.body.style.cursor = 'initial';
			if (error !== 'cancel') {
				console.error('Unity error loading model= ', error);
			}
		});

		return this.onLoading();
	}

	/**
	 * Model Ready
	 */

	public async isModelReady() {
		return await this.isModelLoaded();
	}

	/**
	 * Zooms
	 */

	public async zoomToHighlightedMeshes() {
		await this.isModelReady();
		this.zoomToHighlightedMeshes();
	}

	public async zoomToObjects(meshes) {
		await this.isModelReady();
		this.zoomToObjects(meshes);
	}

	/**
	 * Setters
	 */

	public setFarPlaneAlgorithm = (algorithm: string) => {
		switch (algorithm) {
			case 'box':
				this.useBoundingBoxFarPlaneAlgorithm();
				break;
			case 'sphere':
				this.useBoundingSphereFarPlaneAlgorithm();
				break;
		}
	}

	public setShading = (shading: string) => {
		switch (shading) {
			case 'standard':
				this.setRenderingQualityDefault();
				break;
			case 'architectural':
				this.setRenderingQualityHigh();
				break;
		}
	}

	public setXray = (xray: boolean) => {
		if (xray) {
			this.setXRayHighlightOn();
		} else {
			this.setXRayHighlightOff();
		}
	}

	/**
	 * Map
	 */

	public async resetMapSources() {
		await this.isViewerReady();
		this.resetMapSources();
	}

	public async addMapSource(source) {
		await this.isViewerReady();
		this.addMapSource(source);
	}

	public async removeMapSource(source) {
		await this.isViewerReady();
		this.removeMapSource(source);
	}

	public async mapInitialise(surveyPoints) {
		await this.isViewerReady();
		this.mapInitialise(surveyPoints);
	}

	public async mapStart() {
		await this.isViewerReady();
		this.mapStart();
	}

	public async mapStop() {
		await this.isViewerReady();
		this.mapStop();
	}

	/**
	 * MultiSelect
	 */

	// public getMultiSelectMode() {
	// 	if (this.viewer) {
	// 		return this.viewer.multiSelectMode;
	// 	}
	// 	return false;
	// }
	//
	// public setMultiSelectMode(value) {
	// 	if (this.viewer) {
	// 		this.viewer.setMultiSelectMode(value);
	// 	}
	// }

	public async goToExtent() {
		await this.isViewerReady();
		this.showAll();
	}

	/**
	 * Status
	 */

	public async getObjectsStatus({ teamspace, model } = { teamspace: '', model: '' }) {
		await this.isViewerReady();
		return this.getUnityObjectsStatus(teamspace, model);
	}

	/**
	 * Compare
	 */
	//
	// public diffToolSetAsComparator(teamspace: string, model: string) {
	// 	this.diffToolSetAsComparator(teamspace, model);
	// }
	//
	// public diffToolLoadComparator(teamspace: string, model: string, revision: string) {
	// 	return this.diffToolLoadComparator(teamspace, model, revision);
	// }
	//
	// public async diffToolEnableWithClashMode() {
	// 	await this.isViewerReady();
	// 	return this.diffToolEnableWithClashMode();
	// }
	//
	// public async diffToolEnableWithDiffMode() {
	// 	await this.isViewerReady();
	// 	return this.diffToolEnableWithDiffMode();
	// }
	//
	// public diffToolDisableAndClear = async () => {
	// 	await this.isViewerReady();
	// 	return this.diffToolDisableAndClear();
	// }
	//
	// public diffToolShowBaseModel = async () => {
	// 	await this.isViewerReady();
	// 	return this.diffToolShowBaseModel();
	// }
	//
	// public diffToolShowComparatorModel = async () => {
	// 	await this.isViewerReady();
	// 	return this.diffToolShowComparatorModel();
	// }
	//
	// public diffToolDiffView = async () => {
	// 	await this.isViewerReady();
	// 	return this.diffToolDiffView();
	// }

	public async getCurrentViewpoint({ teamspace, model }) {
		// if (this.viewer) {
			return await this.getCurrentViewpointInfo(teamspace, model);

		// }
		// return {};
	}

	public async goToDefaultViewpoint() {
		await this.isViewerReady();
		return this.showAll();
	}

	public async setCamera({ position, up, view_dir, look_at, animate, rollerCoasterMode }) {
		await this.isModelReady();

		return this.setCameraPosition(
			position, up, view_dir, look_at, animate !== undefined ? animate : true, rollerCoasterMode
		);
	}
}

export const Viewer = new ViewerService({});

export const withViewer = (WrappedComponent) => (props) => (
		<WrappedComponent viewer={Viewer} {...props} />
);
