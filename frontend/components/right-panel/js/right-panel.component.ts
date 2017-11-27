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
		"$scope",
		"$timeout",
		"EventService",
		"DocsService",
		"MeasureService",
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
		private DocsService,
		private MeasureService,
	) {}

	public $onInit() {

		this.highlightBackground = "#FF9800";
		this.measureActive = false;
		this.measureDisabled = false;

		this.metaData = false;
		this.showPanel = true;

		this.measureBackground = "";
		this.metaBackground = "";

		this.watchers();

	}

	public $onDestroy() {
		this.metaBackground = "";
		this.measureBackground = "";
		this.MeasureService.deactivateMeasure();
	}

	public watchers() {

		this.$scope.$watch(() => {
			return this.MeasureService;
		}, () => {

			if (this.measureActive !== this.MeasureService.state.active ) {
				this.measureActive = this.MeasureService.state.active;

				// Clear the background of measure tooltip
				if (!this.measureActive) {
					this.measureBackground = "";
				} else {
					this.measureBackground = this.highlightBackground;
				}
			}

			if (this.measureDisabled !== this.MeasureService.state.disabled ) {
				this.measureDisabled = this.MeasureService.state.disabled;
				if (this.measureDisabled) {
					this.measureBackground = "";
					this.measureActive = false;
				}
			}

		}, true);

		this.$scope.$watch(this.EventService.currentEvent, (event) => {
			if (event.type === this.EventService.EVENT.TOGGLE_ELEMENTS) {
				this.showPanel = !this.showPanel;
			}
		});

	}

	public disableOtherModes(setMode) {
		if (setMode === "meta") {

			if (this.measureActive) {
				this.toggleMeasure();
			}

			if (!this.metaData) {
				this.toggleAutoMetaData();
			}

		} else if (setMode === "measure") {

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

		this.MeasureService.toggleMeasure();

	}

	public toggleAutoMetaData() {

		if (this.measureActive && !this.metaData) {
			this.toggleMeasure();
		}

		this.metaData = !this.metaData;
		this.metaBackground = this.metaData ? this.highlightBackground : "";
		this.DocsService.state.active = this.metaData;
		this.DocsService.state.show = false;

	}

}

export const RightPanelComponent: ng.IComponentOptions = {
	bindings: {},
	controller: RightPanelController,
	controllerAs: "vm",
	templateUrl: "templates/right-panel.html",
};

export const RightPanelComponentModule = angular
	.module("3drepo")
	.component("rightPanel", RightPanelComponent);
