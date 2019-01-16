import { Viewer as ViewerComponent } from '../globals/viewer';
import { getAngularService } from '../helpers/migration';

export class ViewerService {
	private viewerInstance = null;
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

	public async getObjectsStatus({ teamspace, model }) {
		await this.isViewerReady();
		this.viewer.getObjectsStatus(teamspace, model);
	}
}

export const Viewer = new ViewerService();
