import { getAngularService } from '../../helpers/migration';
import { MultiSelect } from './multiSelect';

const MODE = {
	NORMAL: 'NORMAL',
	PIN: 'PIN'
};

export class ViewerService {
	private viewerInstance = null;
	private viewerService = null;

	private mode = MODE.NORMAL;
	public initialised: any;

	get viewer() {
		if (this.viewerInstance) {
			return this.viewerInstance;
		}

		this.viewerService = getAngularService('ViewerService', this) as any;
		this.viewerInstance = this.viewerService.getViewer();
		this.initialised = this.viewerService.initialised.promise;

		return this.viewerInstance;
	}

	get isPinMode() {
		return this.mode === MODE.PIN;
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

	public once(...args) {
		this.viewer.once(...args);
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

	public async goToDefaultViewpoint() {
		await this.isViewerReady();
		return this.viewer.showAll();
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
		this.viewerService.pin.pinDropMode = on;

		if (on) {
			MultiSelect.toggleAreaSelect(false);
		}
	}

	public setPin(newPinData) {
		this.viewerService.pinData = newPinData;
	}

	public getPinData(): any {
		return this.viewerService.pinData;
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
