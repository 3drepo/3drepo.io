import { Measure } from '../../../services/viewer/measure';

/**
 *	Copyright (C) 2016 3D Repo Ltd
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

class RightPanelController implements ng.IController {

	public static $inject: string[] = [
		'$scope',
		'$timeout',
		'EventService',
		'DocsService'
	];

	private highlightBackground;
	private measureActive;
	private measureDisabled;
	private metaData;
	private showPanel;
	private measureBackground;
	private metaBackground;

	constructor(
		private $scope,
		private $timeout,
		private EventService,
		private DocsService
	) {}

	public $onInit() {

		this.highlightBackground = '#FF9800';
		this.measureActive = false;
		this.measureDisabled = false;

		this.metaData = false;
		this.showPanel = true;

		this.measureBackground = '';
		this.metaBackground = '';

		Measure.on(Measure.EVENTS.STATE_CHANGE, this.onMeasureStateChange);
	}

	public $onDestroy() {
		this.metaBackground = '';
		this.measureBackground = '';
		Measure.deactivateMeasure();
	}

	public onMeasureStateChange = ({ isActive, isDisabled }) => {
		this.$timeout(() => {
			if (this.measureActive !== isActive) {
				this.measureActive = isActive;

				// Clear the background of measure tooltip
				if (!this.measureActive) {
					this.measureBackground = '';
				} else {
					this.measureBackground = this.highlightBackground;
				}
			}

			if (this.measureDisabled !== isDisabled) {
				this.measureDisabled = isDisabled;
				if (this.measureDisabled) {
					this.measureBackground = '';
					this.measureActive = false;
				}
			}
		});
	}

	public disableOtherModes(setMode) {
		if (setMode === 'meta') {

			if (this.measureActive) {
				this.toggleMeasure();
			}

			if (!this.metaData) {
				this.toggleAutoMetaData();
			}

		} else if (setMode === 'measure') {

			if (!this.measureActive) {
				this.toggleMeasure();
			}

		}
	}

	public toggleMeasure() {

		// If not measure mode and metadata enabled
		if (!this.measureActive && this.metaData) {
			this.toggleAutoMetaData();
		}

		Measure.toggleMeasure();

	}

	public toggleAutoMetaData() {

		if (this.measureActive && !this.metaData) {
			this.toggleMeasure();
		}

		this.metaData = !this.metaData;
		this.metaBackground = this.metaData ? this.highlightBackground : '';
		this.DocsService.state.active = this.metaData;
		this.DocsService.state.show = false;

	}

}

export const RightPanelComponent: ng.IComponentOptions = {
	bindings: {},
	controller: RightPanelController,
	controllerAs: 'vm',
	templateUrl: 'templates/right-panel.html'
};

export const RightPanelComponentModule = angular
	.module('3drepo')
	.component('rightPanel', RightPanelComponent);
