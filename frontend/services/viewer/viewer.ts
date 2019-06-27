
import { UnityUtil } from '../../globals/unity-util';
import { getState } from '../../helpers/migration';
import { selectMemory } from '../../modules/viewer';
import { MultiSelect } from './multiSelect';
import { INITIAL_HELICOPTER_SPEED, VIEWER_PIN_MODE } from '../../constants/viewer';
import { Viewer as ViewerInstance } from '../../globals/viewer';
import { clientConfigService } from '../clientConfig';

export class ViewerService {
	private viewerInstance = null;

	private mode = VIEWER_PIN_MODE.NORMAL;
	public pin: any;
	public newPinId: string;
	public currentModel: any;
	public initialised: any;
	public currentModelInit: any;

	private pinData: any;
	private model: string;
	private account: string;

	private stats: boolean = false;
	public helicopterSpeed = INITIAL_HELICOPTER_SPEED;

	constructor() {
		this.newPinId = 'newPinId';
		this.pinData = null;

		this.currentModel = {
			model: null
		};

		this.pin = {
			pinDropMode: false
		};
	}

	get viewer() {
		if (this.viewerInstance) {
			return this.viewerInstance;
		}

		this.viewerInstance = new ViewerInstance({
			name: 'viewer',
			container: document.getElementById('viewer'),
			onError: this.handleUnityError
		});

		this.viewerInstance.setUnity();
		return this.viewerInstance;
	}

	get isPinMode() {
		return this.mode === VIEWER_PIN_MODE.PIN;
	}

	public async isViewerReady() {
		await this.initialised.promise;
	}

	public async isModelReady() {
		await this.viewer.isModelLoaded();
	}

	public async updateViewerSettings(settings) {
		await this.isViewerReady();
		return this.viewer.updateSettings(settings);
	}

	public async updateClippingPlanes(params) {
		await this.isViewerReady();
		return this.viewer.updateClippingPlanes(
			params.clippingPlanes,
			params.account,
			params.model
		);
	}

	public getNumPlanes() {
		if (this.viewer) {
			return this.viewer.getNumPlanes();
		}
	}

	public centreToPoint(params: any) {
		if (this.viewer) {
			this.viewer.centreToPoint(params);
		}
	}

	public on(...args) {
		this.viewer.on(...args);
	}

	public once(...args) {
		this.viewer.once(...args);
	}

	public off(...args) {
		this.viewer.off(...args);
	}

	public async setCamera(params) {
		await this.isModelReady();

		return this.viewer.setCamera(
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

	public async goToDefaultViewpoint() {
		await this.isViewerReady();
		return this.viewer.showAll();
	}

	public removeUnsavedPin() {
		this.removePin({ id: this.newPinId });
		this.setPin({ data: null });
	}

	public async clearHighlights() {
		await this.isViewerReady();
		this.viewer.clearHighlights();
	}

	public async getCurrentViewpoint({ teamspace, model }) {
		if (this.viewer) {
			return await this.viewer.getCurrentViewpointInfo(teamspace, model);

		}
		return {};
	}

	public getScreenshot = async () => {
		await this.isViewerReady();
		return await this.viewer.getScreenshot();
	}

	/**
	 * Pins
	 */
	public setPinDropMode(on: boolean) {
		this.pin.pinDropMode = on;

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

	public async addPin(params) {
		await this.isViewerReady();
		return this.viewer.addPin(
			params.account,
			params.model,
			params.id,
			params.type,
			params.pickedPos,
			params.pickedNorm,
			params.colours,
			params.viewpoint
		);
	}

	public async removePin(params) {
		await this.isViewerReady();
		this.viewer.removePin(params.id);
	}

	public async changePinColor({ id, colours }) {
		await this.isViewerReady();
		this.viewer.changePinColours(id, colours);
	}

	/**
	 * Measure
	 */

	public async activateMeasure() {
		await this.isViewerReady();
		this.viewer.setMeasureMode(true);
	}

	public async disableMeasure() {
		await this.isViewerReady();
		this.viewer.setMeasureMode(false);
	}

	/**
	 * Compare
	 */

	public diffToolSetAsComparator(teamspace: string, model: string) {
		this.viewer.diffToolSetAsComparator(teamspace, model);
	}

	public diffToolLoadComparator(teamspace: string, model: string, revision: string) {
		return this.viewer.diffToolLoadComparator(teamspace, model, revision);
	}

	public async diffToolEnableWithClashMode() {
		await this.isViewerReady();
		return this.viewer.diffToolEnableWithClashMode();
	}

	public async diffToolEnableWithDiffMode() {
		await this.isViewerReady();
		return this.viewer.diffToolEnableWithDiffMode();
	}

	public diffToolDisableAndClear = async () => {
		await this.isViewerReady();
		return this.viewer.diffToolDisableAndClear();
	}

	public diffToolShowBaseModel = async () => {
		await this.isViewerReady();
		return this.viewer.diffToolShowBaseModel();
	}

	public diffToolShowComparatorModel = async () => {
		await this.isViewerReady();
		return this.viewer.diffToolShowComparatorModel();
	}

	public diffToolDiffView = async () => {
		await this.isViewerReady();
		return this.viewer.diffToolDiffView();
	}

	public async getObjectsStatus({ teamspace, model } = { teamspace: '', model: '' }) {
		await this.isViewerReady();
		return this.viewer.getObjectsStatus(teamspace, model);
	}

	public async highlightObjects(params) {
		await this.isViewerReady();
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

	public async unhighlightObjects(params) {
		await this.isViewerReady();
		this.viewer.unhighlightObjects(
			params.account,
			params.model,
			params.id ? [params.id] : params.ids
		);
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

	public setMultiSelectMode(value) {
		if (this.viewer) {
			this.viewer.setMultiSelectMode(value);
		}
	}

	public async startAreaSelect() {
		await this.isViewerReady();
		this.viewer.startAreaSelect();
	}

	public async stopAreaSelect() {
		await this.isViewerReady();
		this.viewer.stopAreaSelect();
	}

	public async getDefaultHighlightColor() {
		await this.isViewerReady();
		return this.viewer.getDefaultHighlightColor();
	}

	public async overrideMeshColor(account, model, meshIDs, color) {
		await this.isViewerReady();
		this.viewer.overrideMeshColor(account, model, meshIDs, color);
	}

	public async resetMeshColor(account, model, meshIDs) {
		await this.isViewerReady();
		this.viewer.resetMeshColor(account, model, meshIDs);
	}

	public async goToExtent() {
		await this.isViewerReady();
		this.viewer.showAll();
	}

	public async setNavigationMode(mode) {
		await this.isViewerReady();
		this.viewer.setNavMode(mode);
	}

	public async helicopterSpeedDown() {
		await this.isViewerReady();
		this.viewer.helicopterSpeedDown();
	}

	public async helicopterSpeedUp() {
		await this.isViewerReady();
		this.viewer.helicopterSpeedUp();
	}

	public async helicopterSpeedReset() {
		await this.isViewerReady();
		this.viewer.helicopterSpeedReset();
	}

	public async startClip(isSingle) {
		await this.isViewerReady();

		if (isSingle) {
			this.viewer.startSingleClip();
		} else {
			this.viewer.startBoxClip();
		}
	}

	public async startClipEdit() {
		await this.isViewerReady();
		this.viewer.startClipEdit();
	}

	public async stopClipEdit() {
		await this.isViewerReady();
		this.viewer.stopClipEdit();
	}

	public async getModelInfo({database, model}) {
		await this.isViewerReady();
		return this.viewerService.getModelInfo(database, model).then((response) => {
			return response.data;
		});
	}

	public async switchObjectVisibility(teamspace, modelId, objectIds, visibility) {
		await this.isViewerReady();
		this.viewer.switchObjectVisibility(teamspace, modelId, objectIds, visibility);
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

	public handleUnityError = (message: string, reload: boolean, isUnity: boolean) => {

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

	}

	public reset() {
		if (this.viewer) {
			this.disableMeasure();
			this.viewer.reset();
		}
	}

	public unityInserted(): boolean {
		if (this.viewer === undefined) {
			return false;
		} else {
			return this.viewer.unityScriptInserted;
		}
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

	public callInit() {
		return this.viewer.init({
				getAPI: {
					hostNames: clientConfigService.apiUrls.all
				},
				showAll: true
			})
			.catch((error) => {
				console.error('Error creating Viewer Directive: ', error);
			});
	}

	public async loadViewerModel(account, model, branch, revision) {
		if (!account || !model) {
			console.error('Account, model, branch or revision was not defined!', account, model, branch, revision);
			return Promise.reject('Account, model, branch or revision was not defined!');
		} else {
			this.account = account;
			this.model = model;
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

	public async zoomToHighlightedMeshes() {
		await this.isViewerReady();
		this.viewer.zoomToHighlightedMeshes();
	}

	public setShadows(type: string) {
		switch (type) {
			case 'soft':
				this.viewer.enableSoftShadows();
				break;
			case 'hard':
				this.viewer.enableHardShadows();
				break;
			case 'none':
				this.viewer.disableShadows();
				break;
		}
	}

	public setStats(val: boolean = false) {
		if (val !== this.stats) {
			this.viewer.toggleStats();
			this.stats = val;
		}
	}

	public setNearPlane(nearplane: number) {
		if (nearplane === undefined) { return; }
		this.viewer.setDefaultNearPlane(nearplane);
	}

	public setFarPlaneSamplingPoints(farplaneSample: number) {
		if (farplaneSample === undefined) { return; }
		this.viewer.setFarPlaneSampleSize(farplaneSample);
	}

	public setFarPlaneAlgorithm(algorithm: string) {
		switch (algorithm) {
			case 'box':
				this.viewer.useBoundingBoxFarPlaneAlgorithm();
				break;
			case 'sphere':
				this.viewer.useBoundingSphereFarPlaneAlgorithm();
				break;
		}
	}

	public setShading(shading: string) {
		switch (shading) {
			case 'standard':
				this.viewer.setRenderingQualityDefault();
				break;
			case 'architectural':
				this.viewer.setRenderingQualityHigh();
				break;
		}
	}

	public setXray(xray: boolean) {
		if (xray) {
			this.viewer.setXRayHighlightOn();
		} else {
			this.viewer.setXRayHighlightOff();
		}
	}

	public async resetMapSources(source) {
		await this.isViewerReady();
		this.viewer.resetMapSources(source);
	}

	public async addMapSource(source) {
		await this.isViewerReady();
		this.viewer.addMapSource(source);
	}

	public async removeMapSource(source) {
		await this.isViewerReady();
		this.viewer.removeMapSource(source);
	}

	public async mapInitialise(surveyPoints) {
		await this.isViewerReady();
		this.viewer.mapInitialise(surveyPoints);
	}

	public async mapStart() {
		await this.isViewerReady();
		this.viewer.mapStart();
	}

	public async mapStop() {
		await this.isViewerReady();
		this.viewer.mapStop();
	}
}

export const Viewer = new ViewerService();
