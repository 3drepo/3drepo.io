/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { subscribe } from '../../../helpers/migration';
import { selectShadowSetting, selectStatsSetting, selectNearPlaneSetting,
	selectFarPlaneAlgorithm, selectMaxShadowDistance, selectNumCacheThreads, selectShadingSetting, selectXraySetting,
	selectCacheSetting, selectFarPlaneSamplingPoints} from '../../../modules/viewer';
import { selectOverrides } from '../../../modules/groups';
import { overridesDiff,
	removeColorOverrides, addColorOverrides } from '../../../helpers/colorOverrides';

class ViewerController implements ng.IController {

	public static $inject: string[] = [
		'$scope',
		'$q',
		'$element',
		'$timeout',

		'ClientConfigService',
		'EventService',
		'ViewerService'
	];

	private account: any;
	private model: any;
	private branch: string;
	private revision: string;
	private pointerEvents: string;
	private measureMode: boolean;
	private viewer: any;
	private cancelPinWatcher: any;
	private cancelEventWatcher: any;
	private shadowsSetting: string;
	private statsSetting: boolean;
	private nearPlaneSetting: number;
	private farPlaneAlgorithm: string;
	private shadingSetting: string;
	private xraySetting: boolean;
	private cacheSetting: boolean;
	private farPlaneSamplingPoints: number;
	private maxShadowDistance: number;
	private maxCacheThreads: number;
	private colorOverrides: any[] = [];

	constructor(
		private $scope: ng.IScope,
		private $q: ng.IQProvider,
		private $element: ng.IRootElementService,
		private $timeout: ng.ITimeoutService,

		private ClientConfigService,
		private EventService,
		private ViewerService
	) {}

	public $onInit() {
		this.branch   = this.branch ? this.branch : 'master';
		this.revision = this.revision ? this.revision : 'head';

		this.pointerEvents = 'auto';
		this.measureMode = false;

		this.viewer = this.ViewerService.getViewer();
		this.watchers();

		subscribe(this, {
			shadowsSetting: selectShadowSetting,
			statsSetting: selectStatsSetting,
			nearPlaneSetting: selectNearPlaneSetting,
			farPlaneAlgorithm: selectFarPlaneAlgorithm,
			shadingSetting: selectShadingSetting,
			xraySetting: selectXraySetting,
			cacheSetting: selectCacheSetting,
			farPlaneSamplingPoints: selectFarPlaneSamplingPoints,
			maxShadowDistance : selectMaxShadowDistance,
			numCacheThreads : selectNumCacheThreads,
			colorOverrides: selectOverrides
		});
	}

	public $onDestroy() {
		this.$element.on('$destroy', () => {
			this.cancelPinWatcher();
			this.cancelEventWatcher();
			this.ViewerService.diffToolDisableAndClear();
			this.viewer.reset(); // Remove events watch
			this.viewer.destroy();
		});
	}

	public watchers() {
		this.cancelPinWatcher = this.$scope.$watch(() => {
			return this.ViewerService.pin;
		}, () => {
			if (this.viewer) {
				this.viewer.setPinDropMode(this.ViewerService.pin.pinDropMode);
			}
		}, true);

		this.cancelEventWatcher = this.$scope.$watch(this.EventService.currentEvent, (event: any) => {
			const validEvent = event !== undefined && event.type !== undefined;
			if (validEvent && this.ViewerService.initialised) {
				this.ViewerService.handleEvent(event, this.account, this.model);
			}
		});

		this.$scope.$watch(() => this.shadowsSetting, this.ViewerService.setShadows.bind(this.ViewerService));

		this.$scope.$watch(() => this.statsSetting, this.ViewerService.setStats.bind(this.ViewerService));

		this.$scope.$watch(() => this.nearPlaneSetting, this.ViewerService.setNearPlane.bind(this.ViewerService));

		this.$scope.$watch(() => this.farPlaneAlgorithm, this.ViewerService.setFarPlaneAlgorithm.bind(this.ViewerService));

		this.$scope.$watch(() => this.shadingSetting, this.ViewerService.setShading.bind(this.ViewerService) );

		this.$scope.$watch(() => this.xraySetting, this.ViewerService.setXray.bind(this.ViewerService));

		this.$scope.$watch(() => this.cacheSetting, this.ViewerService.setModelCache.bind(this.ViewerService));

		this.$scope.$watch(() => this.farPlaneSamplingPoints,
			this.ViewerService.setFarPlaneSamplingPoints.bind(this.ViewerService));

		this.$scope.$watch(() => this.maxShadowDistance,
			this.ViewerService.setMaxShadowDistance.bind(this.ViewerService));

		this.$scope.$watch(() => this.numCacheThreads,
			this.ViewerService.setNumCacheThreads.bind(this.ViewerService));

		this.$scope.$watch(() => this.colorOverrides,  async (overrides, prevOverrides) => {
			const toAdd = overridesDiff(overrides, prevOverrides);
			const toRemove = overridesDiff(prevOverrides, overrides );

			removeColorOverrides(toRemove);
			addColorOverrides(toAdd);
		});

	}
}

export const ViewerComponent: ng.IComponentOptions = {
		bindings: {
			account: '<',
			branch: '<',
			model: '<',
			revision: '<',
			shadowSetting: '<'
		},
		controller: ViewerController,
		controllerAs: 'vm'
};

export const ViewerComponentModule = angular
	.module('3drepo')
	.component('viewer', ViewerComponent);
