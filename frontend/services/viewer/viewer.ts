import { getAngularService } from '../../helpers/migration';
import { MultiSelect } from './multiSelect';

const MODE = {
	NORMAL: 'NORMAL',
	PIN: 'PIN'
};

export class ViewerService {
	private viewerInstance = null;
	private mode = MODE.NORMAL;

	public pin: any;
	public pinData: any;
	public newPinId: string;
	public currentModel: any;
	public initialised: any;

	get viewer() {
		if (this.viewerInstance) {
			return this.viewerInstance;
		}

		const angularViewer = getAngularService('ViewerService', this) as any;
		this.viewerInstance = angularViewer.getViewer();
		this.initialised = angularViewer.initialised.promise;

		return this.viewerInstance;
	}

	get isPinMode() {
		return this.mode === MODE.PIN;
	}

	constructor() {
		this.newPinId = 'newPinId';
		this.pinData = null;

		this.currentModel = {
			model : null,
			promise : null
		};

		this.pin = {
			pinDropMode: false
		};
	}

	public async isViewerReady()  {
		await this.initialised;
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

	public on(...args) {
		this.viewer.on(...args);
	}

	public off(...args) {
		this.viewer.off(...args);
	}

	public async setCamera(params) {
		await this.isViewerReady();
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

	public removeUnsavedPin() {
		this.removePin({id: this.newPinId });
		this.setPin({data: null});
	}

	public async changePinColors(params) {
		await this.isViewerReady();
		return this.viewer.changePinColours(
			params.id,
			params.colours
		);
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
	 * PIN
	 */

	public toggleAreaSelect(on: boolean) {
		if (this.areaSelectMode !== on) {
			this.areaSelectMode = on;
			if (on) {
				Viewer.startAreaSelect();
			} else {
				Viewer.stopAreaSelect();
			}
			this.determineCursorIcon();
		}
	}

	public setPinDropMode(on: boolean) {
		this.pin.pinDropMode = on;

		if (on) {
			MultiSelect.toggleAreaSelect(false);
		}
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

	public async getObjectsStatus({ teamspace, model }) {
		await this.isViewerReady();
		this.viewer.getObjectsStatus(teamspace, model);
	}

	public startAreaSelect() {
		if (this.viewer) {
			this.viewer.startAreaSelect();
		}
	}

	public stopAreaSelect() {
		if (this.viewer) {
			this.viewer.stopAreaSelect();
		}
	}
}

export const Viewer = new ViewerService();
