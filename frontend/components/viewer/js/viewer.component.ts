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
	private deviceMemory: any;
	private cancelPinWatcher: any;
	private cancelEventWatcher: any;

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

		if (this.deviceMemory) {
			const gigabyte = 1073741824;
			const MAX_MEMORY = 2130706432; // The maximum memory Unity can allocate
			const assignedMemory = gigabyte * (this.deviceMemory / 2);
			window.Module.TOTAL_MEMORY = (assignedMemory < MAX_MEMORY) ? assignedMemory : MAX_MEMORY;
		}

		this.viewer = this.ViewerService.getViewer();
		this.watchers();
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

		this.cancelModelWatcher = this.$scope.$watch(() => this.model, (newModel, oldModel) => {
			if (newModel !== oldModel) {
				this.cancelPinWatcher();
				this.cancelEventWatcher();
				this.ViewerService.diffToolDisableAndClear();
				this.viewer.reset(); // Remove events watch
				this.viewer.destroy();
			}
		});
	}
}

export const ViewerComponent: ng.IComponentOptions = {
		bindings: {
			account: '<',
			branch: '<',
			model: '<',
			revision: '<',
			deviceMemory: '<'
		},
		controller: ViewerController,
		controllerAs: 'vm'
};

export const ViewerComponentModule = angular
	.module('3drepo')
	.component('viewer', ViewerComponent);
