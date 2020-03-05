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

import EventEmitter from 'eventemitter3';
import { VIEWER_EVENTS } from '../../../constants/viewer';
import { DialogActions } from '../../../modules/dialog';
import { dispatch } from '../../../modules/store';
import { PIN_COLORS } from '../../../styles';

declare const UnityUtil;

export class UnityController {
	private emitter = new EventEmitter();
	private numClips = 0;
	private stats: boolean = false;
	public divId = 'unityViewer';

	public startUnity() {
		UnityUtil.init(this.handleUnityError, this.onUnityProgress, this.onModelProgress);
		UnityUtil.hideProgressBar();
	}

	private handleUnityError = (message: string, reload: boolean, isUnity: boolean) => {
		let errorType = '3D Repo Error';

		if (isUnity) {
			errorType = 'Unity Error';
		}

		dispatch(DialogActions.showDialog({
			title: errorType,
			content: message,
			onCancel: () => {
				if (reload) {
					location.reload();
				}
			}
		}));

		console.error('Unity errored and user canceled reload', message);
	}

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

	public loadUnity(memory) {
		return UnityUtil.loadUnity(this.divId, undefined, memory);
	}

	public pickPointEvent(pointInfo) {
		// User clicked a mesh
		this.emit(VIEWER_EVENTS.PICK_POINT, {
			id : pointInfo.id,
			normal : pointInfo.normal,
			position: pointInfo.position,
			screenPos : pointInfo.mousePos,
			selectColour : PIN_COLORS.YELLOW,
		});
	}

	public removeAllListeners() {
		this.emitter.removeAllListeners();
	}

	public showAll() {
		UnityUtil.resetCamera();
	}

	public centreToPoint(params) {
		UnityUtil.centreToPoint(params);
	}

	public getDefaultHighlightColor() {
		return UnityUtil.defaultHighlightColor;
	}

	public setUnity() {
		UnityUtil.viewer = this;
	}

	public getScreenshot() {
		return UnityUtil.requestScreenShot();
	}

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

	public hideHiddenByDefaultObjects() {
		UnityUtil.hideHiddenByDefaultObjects();
	}

	public showHiddenByDefaultObjects() {
		UnityUtil.showHiddenByDefaultObjects();
	}

	public clearHighlights() {
		UnityUtil.clearHighlights();
		this.emit(VIEWER_EVENTS.CLEAR_HIGHLIGHT_OBJECTS, {});
	}

	public unhighlightAllObjects(account, model, idsIn) {
		if (idsIn) {
			const uniqueIds = Array.from(new Set(idsIn));
			if (uniqueIds.length) {
				UnityUtil.unhighlightObjects(account, model, uniqueIds);
				this.emit(VIEWER_EVENTS.UNHIGHLIGHT_OBJECTS, {account, model, uniqueIds });
				return;
			}
		}
	}

	public async highlightAllObjects(account, model, id: string[], colour, multi, forceReHighlight) {
		await UnityUtil.highlightObjects(account, model, id, colour, multi, forceReHighlight);
	}

	public switchObjectVisibility(account, model, ids, visibility) {
		UnityUtil.toggleVisibility(account, model, ids, visibility);
	}

	public getUnityObjectsStatus(account, model) {
		return UnityUtil.getObjectsStatus(account, model);
	}

	public setCameraPosition(pos, up, viewDir, lookAt, account, model) {
		UnityUtil.setViewpoint(pos, up, viewDir, lookAt, account, model);
	}

	public cancelLoadModel() {
		document.body.style.cursor = 'initial';
		UnityUtil.cancelLoadModel();
		this.emit(VIEWER_EVENTS.MODEL_LOADING_CANCEL);
	}

	public async isModelLoaded() {
		await UnityUtil.onReady();
		return UnityUtil.onLoaded();
	}

	public getCurrentViewpointInfo(account, model) {
		return UnityUtil.requestViewpoint(account, model);
	}

	public loadModel(account, model, branch, revision) {
		return UnityUtil.loadModel(account, model, branch, revision);
	}

	public onLoaded() {
		return UnityUtil.onLoaded();
	}

	public onLoading() {
		return UnityUtil.onLoading();
	}

	public resetUnity() {
		return UnityUtil.reset();
	}

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

	public showCoordView() {
		UnityUtil.showCoordView();
	}

	public hideCoordView() {
		UnityUtil.hideCoordView();
	}

	public startAreaSelect() {
		UnityUtil.startAreaSelection();
	}

	public stopAreaSelect() {
		UnityUtil.stopAreaSelection();
	}

	public zoomToHighlightedMeshes() {
		UnityUtil.zoomToHighlightedMeshes();
	}

	public zoomToObjects(meshes) {
		UnityUtil.zoomToObjects(meshes);
	}

	public numClipPlanesUpdated(nPlanes) {
		this.numClips = nPlanes;
		this.emit(VIEWER_EVENTS.UPDATE_NUM_CLIP, nPlanes);
	}

	public getNumPlanes() {
		return this.numClips;
	}

	public clipBroadcast(clip) {
		this.emit(VIEWER_EVENTS.CLIPPING_PLANE_BROADCAST, clip);
	}

	public updateClippingPlanes({ clipPlanes, account, model }: any) {
		UnityUtil.updateClippingPlanes(clipPlanes ? clipPlanes : [], false, account, model);
	}

	public startClip(isSingle: boolean) {
		if (isSingle) {
			this.startSingleClip();
		} else {
			this.startBoxClip();
		}
	}

	public startBoxClip() {
		UnityUtil.startBoxClip();
	}

	public startSingleClip() {
		UnityUtil.startSingleClip();
	}

	public startClipEdit() {
		UnityUtil.startClipEdit();
	}

	public stopClipEdit() {
		UnityUtil.stopClipEdit();
	}

	public selectPin(id) {
		UnityUtil.selectPin(id);
	}

	public async dropRiskPin(id, position, norm, colours) {
		await this.isModelLoaded;
		return UnityUtil.dropRiskPin(id, position, norm, colours);
	}

	public async dropIssuePin(id, position, norm, colours) {
		await this.isModelLoaded;
		return UnityUtil.dropIssuePin(id, position, norm, colours);
	}

	/**
	 * Resets map sources
	 */
	public resetMapSources() {
		UnityUtil.resetMapSources();
	}

	/**
	 * Add map source
	 * @param source Map source
	 */
	public addMapSource(source) {
		UnityUtil.addMapSource(source);
	}

	/**
	 * Remove map source
	 * @param source Map source
	 */
	public removeMapSource(source) {
		UnityUtil.removeMapSource(source);
	}

	/**
	 * Initialise map creator within unity
	 * @param {Object[]} surveyPoints - array of survey points and it's respective latitude and longitude value
	 */
	public mapInitialise(surveyPoints) {
		UnityUtil.mapInitialise(surveyPoints);
	}

	/**
	 * Start map generation
	 */
	public mapStart() {
		UnityUtil.mapStart();
	}

	/**
	 * Stop map generation
	 */
	public mapStop() {
		UnityUtil.mapStop();
	}

	public overrideMeshColor(account, model, meshIDs, color) {
		UnityUtil.overrideMeshColor(account, model, meshIDs, color);

		if (color.length > 3) {
			UnityUtil.overrideMeshOpacity(account, model, meshIDs, color[3]);
		}
	}

	public resetMeshColor(account, model, meshIDs) {
		UnityUtil.resetMeshOpacity(account, model, meshIDs);
		UnityUtil.resetMeshColor(account, model, meshIDs);
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

	public setStats = (val: boolean = false) => {
		if (val !== this.stats) {
			this.toggleStats();
			this.stats = val;
		}
	}

	public toggleStats() {
		UnityUtil.toggleStats();
	}

	public setNearPlane = (nearplane: number) => {
		if (nearplane === undefined) { return; }
		UnityUtil.setDefaultNearPlane(nearplane);
	}

	public setFarPlaneSamplingPoints = (farplaneSample: number) => {
		if (farplaneSample === undefined) { return; }
		UnityUtil.setFarPlaneSampleSize(farplaneSample);
	}

	public setNumCacheThreads(value: number) {
		if (value === undefined) { return; }
		UnityUtil.setNumCacheThreads(value);
	}

	public setMaxShadowDistance(value: number) {
		if (value === undefined) { return; }
		UnityUtil.setMaxShadowDistance(value);
	}

	public setRenderingQualityDefault() {
		UnityUtil.setRenderingQualityDefault();
	}

	public setRenderingQualityHigh() {
		UnityUtil.setRenderingQualityHigh();
	}

	public setXRayHighlightOn() {
		UnityUtil.setXRayHighlightOn();
	}

	public setXRayHighlightOff() {
		UnityUtil.setXRayHighlightOff();
	}

	public setModelCache = (cache: boolean) => {
		if (cache) {
			this.enableCaching();
		} else {
			this.disableCaching();
		}
	}

	public enableCaching() {
		UnityUtil.enableCaching();
	}

	public disableCaching() {
		UnityUtil.disableCaching();
	}

	public useBoundingBoxFarPlaneAlgorithm() {
		UnityUtil.useBoundingBoxFarPlaneAlgorithm();
	}

	public useBoundingSphereFarPlaneAlgorithm() {
		UnityUtil.useBoundingSphereFarPlaneAlgorithm();
	}

	public pauseRendering() {
		UnityUtil.pauseRendering();
	}

	public resumeRendering() {
		UnityUtil.resumeRendering();
	}

	public setNavigation(mode) {
		UnityUtil.setNavigation(mode);
	}
}
