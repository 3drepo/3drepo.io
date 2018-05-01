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

class ClipController implements ng.IController {

	public static $inject: string[] = [
		"$scope",
		"$timeout",
		"$element",

		"ClipService",
		"EventService",
		"ViewerService",
		"ClientConfigService"
	];

	public account: string;
	public model: string;

	public progressInfo: string;
	public sliderMin: number;
	public sliderMax: number;
	public sliderStep: number;
	public displayDistance: any;
	public precision: number;
	public sliderPosition: number;
	public axes: string[];
	public visible: boolean;
	public bbox: any;
	public direction: boolean;
	public availableUnits;
	public units: string;
	public modelUnits: string;
	public disableWatchDistance: boolean;
	// public offsetTrans;
	public modelTrans;
	public disableWatchSlider;
	public displayedAxis;
	public disableWatchAxis;
	public normal;

	public onContentHeightRequest;
	public show;

	constructor(
		private $scope: any,
		private $timeout: any,
		private $element: any,

		private ClipService: any,
		private EventService: any,
		private ViewerService: any,
		private ClientConfigService: any
	) {}

	public $onInit() {
		this.ClipService.reset();

		this.onContentHeightRequest({height: 130});

		this.$element.bind("DOMMouseScroll mousewheel onmousewheel", (event) => {
			this.handleScroll(event);
		});

		this.$element.bind("keydown", (event) => {
			this.handleUpDownArrow(event);
		});

		this.watchers();
	}

	public $onDestroy() {
		this.units = undefined;
		this.bbox = null;
		this.ClipService.setShow(false);
	}

	public watchers() {

		this.$scope.$watch(
			() => {
				return this.ClipService.state;
			},
			(state) => {
				angular.extend(this, state);
			},
			true
		);

		this.$scope.$watch("vm.displayDistance", (value) => {
			this.ClipService.setDisplayedDistance(value);
		});

		this.$scope.$watch("vm.units", (newUnits, oldUnits) => {
			this.ClipService.updateUnits(newUnits, oldUnits);
		});

		/*
		 * Watch for show/hide of card
		 */
		this.$scope.$watch("vm.show", (newValue)  =>  {
			this.ClipService.setShow(newValue);
		});

		/*
		 * Toggle the clipping plane
		 */
		this.$scope.$watch("vm.visible", (newVisibility) => {
			if (newVisibility !== undefined && newVisibility !== null) {
				if (newVisibility) {
					this.updateClippingPlane(this.account, this.model);
				} else {
					this.ViewerService.clearClippingPlanes();
				}
			}
		});

		/*
		 * Change the clipping plane axis
		 */
		this.$scope.$watch("vm.displayedAxis", (value) => {
			this.ClipService.setDisplayedAxis(value);
		});

		/*
		 * Watch the slider position
		 */
		this.$scope.$watch("vm.sliderPosition", (value) => {
			this.ClipService.setSliderPosition(value);
		});

		this.$scope.$watch(this.EventService.currentEvent, (event: any) => {
			this.handleClipEvent(event);
		});

	}

	public handleClipEvent(event) {
		switch (event.type) {
			case this.EventService.EVENT.VIEWER.CLIPPING_PLANE_BROADCAST:
				this.ClipService.setClippingPlane(event.value);
				break;

			case this.EventService.EVENT.VIEWER.BBOX_READY:
				this.ClipService.setBoundingBox(event.value.bbox);
				break;
		}

	}

	public handleUpDownArrow(event) {
		this.ClipService.handleUpDownArrow(event);
	}

	public handleScroll(event) {
		this.ClipService.handleScroll(event);
		this.$timeout();
	}

	public getScaler(targetUnit: string, currentUnit: string) {
		return this.ClipService.getScaler(targetUnit, currentUnit);
	}

	public invertDirection() {
		this.ClipService.invertDirection();
	}

	public updateClippingPlane(account, model) {
		this.ClipService.updateClippingPlaneByModel(account, model);
	}

	public determineAxis(normal) {
		return this.ClipService.determineAxis(normal);
	}

	public reset() {
		this.ClipService.reset();
	}

	public setDisplayValues(axis: string, distance: any, moveClip: boolean, direction: boolean, slider: any) {
		this.ClipService.setDisplayValues(axis, distance, moveClip, direction, slider);
	}

	public getNormal() {
		return this.ClipService.getNormal();
	}

	public increment(percentage) {
		this.ClipService.increment(percentage);
	}

	public decrement(percentage) {
		this.ClipService.decrement(percentage);
	}

	public decrementDiscrete() {
		this.ClipService.decrementDiscrete();
	}

	public incrementDiscrete() {
		this.ClipService.incrementDiscrete();
	}

	public updateDistance(amount: number) {
		this.ClipService.updateDistance(amount);
	}

	/**
	 * Update displayed Distance based on slider position and axis
	 */
	public updateDisplayedDistance(updateSlider, moveClip) {
		this.ClipService.updateDisplayedDistance(updateSlider, moveClip);
	}

	public unitShouldShow(unit) {
		return this.ClipService.unitShouldShow(unit);
	}

	public handleMetric(unit) {
		return this.ClipService.handleMetric(unit);
	}

	public handleFt(unit) {
		return this.ClipService.handleFt(unit);
	}

	public getMinMax(): any {
		return this.ClipService.getMinMax();
	}

	public cleanDisplayDistance() {
		this.ClipService.cleanDisplayDistance();

	}

}

export const ClipComponent: ng.IComponentOptions = {
	bindings: {
		show: "=",
		visible: "=",
		onContentHeightRequest: "&",
		account: "<",
		model: "<"
	},
	controller: ClipController,
	controllerAs: "vm",
	templateUrl: "templates/clip.html"
};

export const ClipComponentModule = angular
	.module("3drepo")
	.component("clip", ClipComponent);
