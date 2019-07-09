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

class ViewerController implements ng.IController {

	public static $inject: string[] = [
		'$scope',
		'$q',
		'$element',
		'$timeout',
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
	private farPlaneSamplingPoints: number;

	constructor(
		private $scope: ng.IScope,
		private $q: ng.IQProvider,
		private $element: ng.IRootElementService,
		private $timeout: ng.ITimeoutService,

		private ViewerService
	) {}

	public $onInit() {
		this.branch   = this.branch ? this.branch : 'master';
		this.revision = this.revision ? this.revision : 'head';

		this.pointerEvents = 'auto';
		this.measureMode = false;

/* 		this.viewer = this.ViewerService.getViewer(); */
		this.watchers();
	}

	public $onDestroy() {
		this.$element.on('$destroy', () => {
			this.cancelPinWatcher();
/* 			this.ViewerService.diffToolDisableAndClear();
			this.viewer.reset();
			this.viewer.destroy(); */
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
