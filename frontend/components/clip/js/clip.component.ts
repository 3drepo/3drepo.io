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

		"EventService",
		"ViewerService",
		"ClientConfigService",
	];

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
	public offsetTrans;
	public modelTrans;
	public disableWatchSlider;
	public displayedAxis;
	public disableWatchAxis;
	public displayedDistance;
	public normal;

	public onContentHeightRequest;

	constructor(
		private $scope: any,
		private $timeout: any,
		private $element: any,

		private EventService: any,
		private ViewerService: any,
		private ClientConfigService: any,
	) {}

	public $onInit() {
		this.progressInfo = "Model loading...";
		this.sliderMin = 0;
		this.sliderMax = 100;
		this.sliderStep = 0.005;
		this.displayDistance = 0.0;
		this.precision = 3;
		this.sliderPosition = this.sliderMin;
		this.axes = ["X", "Y", "Z"];
		this.visible = false;
		this.bbox = null;
		this.onContentHeightRequest({height: 130});
		this.direction = false;
		this.availableUnits = this.ClientConfigService.units;

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
	}

	public watchers() {

		this.$scope.$watch("vm.displayDistance", () => {
			this.updateDisplaySlider(false, this.visible);
		});

		this.$scope.$watch("vm.units", (newUnits, oldUnits) => {
			if (newUnits && oldUnits) {
				const scaler = this.getScaler(newUnits, oldUnits);
				this.displayDistance = this.displayDistance * scaler;
			}
		});

		/*
		 * Watch for show/hide of card
		 */
		this.$scope.$watch("vm.show", (newValue)  =>  {
			if (newValue !== undefined && newValue !== undefined) {
				this.visible = newValue;
			}
		});

		/*
		 * Toggle the clipping plane
		 */
		this.$scope.$watch("vm.visible", (newValue) => {
			if (newValue !== undefined && newValue !== undefined) {
				if (newValue) {
					this.updateClippingPlane();
				} else {
					this.ViewerService.clearClippingPlanes();
				}
			}
		});

		/*
		 * Change the clipping plane axis
		 */
		this.$scope.$watch("vm.displayedAxis", () => {
			if (!this.disableWatchAxis) {
				this.updateDisplayedDistance(false, this.visible);
			}

			this.disableWatchAxis = false;
		});

		/*
		 * Watch the slider position
		 */
		this.$scope.$watch("vm.sliderPosition", () => {
			if (!this.disableWatchSlider) {
				this.updateDisplayedDistance(false, this.visible);
			}

			this.disableWatchSlider = false;

		});

		this.$scope.$watch(this.EventService.currentEvent, (event: any) => {

			switch (event.type) {
			case this.EventService.EVENT.VIEWER.CLIPPING_PLANE_BROADCAST:
				this.setDisplayValues(
					this.determineAxis(event.value.normal),
					event.value.distance,
					false,
					event.value.clipDirection === 1,
					undefined,
				);
				this.updateDisplayedDistance(true, this.visible);
				break;

			case this.EventService.EVENT.VIEWER.SET_SUBMODEL_TRANS_INFO:
				this.modelTrans[event.value.modelNameSpace] = event.value.modelTrans;
				if (event.value.isMainModel) {
					this.offsetTrans = event.value.modelTrans;
				}
				break;

			case this.EventService.EVENT.VIEWER.BBOX_READY:
				this.bbox = event.value.bbox;
				this.setDisplayValues("X", this.bbox.max[0], this.visible, 0, this.direction);
				this.updateDisplayedDistance(true, this.visible);
				break;

			case this.EventService.EVENT.MODEL_SETTINGS_READY:
				this.initClip(event.value.properties.unit);
				break;
			}

		});
	}

	public handleUpDownArrow(event) {
		if (event.key) {
			if (event.key === "ArrowUp") {
				this.increment(0.005);
			} else if (event.key === "ArrowDown") {
				this.decrement(0.005);
			}
		}
	}

	public handleScroll(event) {

		// cross-browser wheel delta
		const delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));

		if (delta > 0) {
			this.decrement(0.005);
		} else if (delta < 0) {
			this.increment(0.005);
		}

	}

	public getScaler(targetUnit: string, currentUnit: string) {
		let scaler = 1;

		switch (targetUnit) {
		case "mm":
			if (currentUnit === "cm") {
				scaler = 10;
			}
			if (currentUnit === "dm") {
				scaler = 100;
			}
			if (currentUnit === "m") {
				scaler = 1000;
			}
			break;
		case "cm":
			if (currentUnit === "mm") {
				scaler = 0.1;
			}
			if (currentUnit === "dm") {
				scaler = 10;
			}
			if (currentUnit === "m") {
				scaler = 100;
			}
			break;
		case "dm":
			if (currentUnit === "mm") {
				scaler = 0.01;
			}
			if (currentUnit === "cm") {
				scaler = 0.1;
			}
			if (currentUnit === "m") {
				scaler = 10;
			}
			break;
		case "m":
			if (currentUnit === "mm") {
				scaler = 0.001;
			}
			if (currentUnit === "cm") {
				scaler = 0.01;
			}
			if (currentUnit === "dm") {
				scaler = 0.1;
			}
			break;
		}

		return scaler;

	}

	public invertDirection() {
		this.direction = !this.direction;
		this.updateClippingPlane();
	}

	public updateClippingPlane() {

		const scaler = this.getScaler(this.modelUnits, this.units);
		const event = {
			clippingPlanes: [{
				clipDirection: this.direction ? 1 : -1,
				distance: this.displayDistance * scaler,
				normal: this.getNormal(),
			}],
			fromClipPanel: true,
		};
		this.EventService.send(
			this.EventService.EVENT.VIEWER.UPDATE_CLIPPING_PLANES,
			event,
		);

	}

	/**
	 * Determine axis based on normal provided
	 */
	public determineAxis(normal) {
		let res = "";
		if (normal.length === 3) {
			if (normal[1] === 0  && normal[2] === 0) {
				res = "X";
			} else if (normal[0] === 0 && normal[2] === 0) {
				res = "Z";
			} else if (normal[0] === 0 && normal[1] === 0) {
				res = "Y";
			}
		}

		return res;
	}

	/**
	 * Initialise display values
	 * This is called when we know the bounding box of our model
	 */
	public setDisplayValues(axis, distance, moveClip, direction, slider) {
		const scaler = this.getScaler(this.units, this.modelUnits);
		const newDistance = parseFloat(distance) * scaler;

		// We only want to disable watch if the value is going to change.
		// Otherwise we might be ignoring the next update.
		this.disableWatchAxis = this.displayedAxis !== axis;
		this.disableWatchSlider = this.disableWatchDistance = this.displayedDistance !== newDistance;

		this.displayDistance = newDistance;
		this.direction = direction;

		this.displayedAxis = axis;
		if (slider != null) {
			this.sliderPosition = slider;
			if (moveClip) {
				this.updateClippingPlane();
			}
		} else {
			this.updateDisplaySlider(false, moveClip);
		}
	}

	/**
	 * Returns the normal value based on axis
	 */
	public getNormal() {

		let normal = [-1, 0, 0]; // X axis by default
		if (this.normal) {
			normal = this.normal;
		} else if (this.displayedAxis) {
			if (this.displayedAxis === "Y") {
				normal = [0, 0, -1]; // Unity has flipped Z axis
			} else if (this.displayedAxis === "Z") {
				normal = [0, -1, 0];
			}
		}

		return normal;

	}

	public increment(percentage) {

		const minMax = this.getMinMax();
		const scaler = this.getScaler(this.units, this.modelUnits);
		const size = (minMax.max - minMax.min) * scaler;

		this.updateDistance( -(size * percentage) );
	}

	public decrement(percentage) {

		const minMax = this.getMinMax();
		const scaler = this.getScaler(this.units, this.modelUnits);
		const size = (minMax.max - minMax.min) * scaler;

		this.updateDistance( (size * percentage) );
	}

	public decrementDiscrete() {
		this.updateDistance(-1);
	}

	public incrementDiscrete() {
		this.updateDistance(1);
	}

	public updateDistance(amount: number) {
		// ensure display distance is a float
		this.displayDistance = parseFloat(this.displayDistance) + amount;
		this.cleanDisplayDistance();
		this.updateDisplaySlider(false, true);
	}

	/**
	 * Update displayed Distance based on slider position and axis
	 */
	public updateDisplayedDistance(updateSlider, moveClip) {

		const minMax = this.getMinMax();
		const max = minMax.max;
		const min = minMax.min;

		const percentage = 1 - this.sliderPosition / 100;

		if (!updateSlider) {
			this.disableWatchDistance = true;
		}

		const scaler = this.getScaler(this.units, this.modelUnits);
		const newDistance = parseFloat((min + (Math.abs(max - min) * percentage))) * scaler;

		if (!isNaN(newDistance)) {
			this.displayDistance = newDistance;
			if (moveClip) {
				this.updateClippingPlane();
			}
		}

	}

	public unitShouldShow(unit) {
		return this.handleFt(unit.value) ||
				this.handleMetric(unit.value);
	}

	public handleMetric(unit) {
		const metric = ["cm", "dm", "mm", "m"];
		const isMetric = metric.indexOf(unit) !== -1;
		return unit !== "ft" && isMetric;
	}

	public handleFt(unit) {
		const notMetric = !this.handleMetric(this.modelUnits);
		return unit === "ft" && notMetric;
	}

	/**
	 * Update display slider based on current internal distance
	 */
	public updateDisplaySlider(updateDistance, moveClip) {

		const minMax = this.getMinMax();
		const max = minMax.max;
		const min = minMax.min;

		const scaler = this.getScaler(this.modelUnits, this.units);

		const percentage = ((this.displayDistance * scaler) - min) / ( Math.abs(max - min));

		if (!updateDistance) {
			this.disableWatchSlider = true;
		}

		let value = (1.0 - percentage) * 100;
		if (percentage > 100 || value < 0) {
			value = 0;
		}
		if (percentage < 0 || value > 100) {
			value = 100;
		}
		this.sliderPosition = value;

		if (moveClip) {
			this.updateClippingPlane();
		}

	}

	public getMinMax(): any {
		let min = 0;
		let max = 0;

		if (this.bbox) {
			if (this.displayedAxis === "X") {
				min = this.bbox.min[0];
				max = this.bbox.max[0];
			} else if (this.displayedAxis === "Y") {
				min = this.bbox.min[2];
				max = this.bbox.max[2];
			} else if (this.displayedAxis === "Z") {
				min = this.bbox.min[1];
				max = this.bbox.max[1];
			}
		}

		return {
			min,
			max,
		};
	}

	public cleanDisplayDistance() {
		const minMax = this.getMinMax();
		const scaler = this.getScaler(this.units, this.modelUnits);

		const scaledMin = minMax.min * scaler;
		const scaledMax = minMax.max * scaler;

		if (isNaN(this.displayDistance) && scaledMin) {
			this.displayDistance = scaledMin;
			return;
		}

		if (minMax.max && this.displayDistance > scaledMax) {
			this.displayDistance = scaledMax;
			return;
		}

		if (minMax.min && this.displayDistance < scaledMin) {
			this.displayDistance = scaledMin;
			return;
		}

	}

	public initClip(modelUnits) {
		this.modelUnits = modelUnits;
		this.units = modelUnits;
		this.updateDisplayedDistance(true, this.visible);
	}

}

export const ClipComponent: ng.IComponentOptions = {
	bindings: {
		show: "=",
		visible: "=",
		onContentHeightRequest: "&",
	},
	controller: ClipController,
	controllerAs: "vm",
	templateUrl: "templates/clip.html",
};

export const ClipComponentModule = angular
	.module("3drepo")
	.component("clip", ClipComponent);
