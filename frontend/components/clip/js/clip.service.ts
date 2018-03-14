/**
 *	Copyright (C) 2017 3D Repo Ltd
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

export class ClipService {

	public static $inject: string[] = [
		"ClientConfigService",
		"ViewerService",
	];

	public state: any;

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
	public disableWatchSlider: boolean;
	public displayedAxis: string;
	public disableWatchAxis: boolean;
	public normal;

	constructor(
		private ClientConfigService: any,
		private ViewerService: any,
	) {
		this.state = {
			sliderMin: 0,
			sliderMax: 100,
			sliderStep: 0.005,
			displayDistance: 0.0,
			precision: 3,
			sliderPosition: 0,
			axes: ["X", "Y", "Z"],
			visible: false,
			bbox: null,
			direction: false,
			availableUnits: this.ClientConfigService.units,
			progressInfo: "Model loading...",
			normal: null
		};
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
		this.state.direction = !this.state.direction;
		this.updateClippingPlaneByModel();
	}

	public updateUnits(newUnits: string, oldUnits: string) {
		this.state.units = newUnits;
		if (newUnits && oldUnits) {
			const scaler = this.getScaler(newUnits, oldUnits);
			this.state.displayDistance = this.state.displayDistance * scaler;
		}
	}

	public setClippingPlane(params) {
		this.setDisplayValues(
			this.determineAxis(params.normal),
			params.distance,
			false,
			params.clipDirection === 1,
			undefined,
		);
	}

	public setBoundingBox(bbox: any) {
		if (bbox) {
			this.state.bbox = bbox;
			if(!this.state.normal) {				
				this.setDisplayValues(
					"X",
					this.state.bbox.max[0],
					this.state.visible,
					false,
					this.state.direction,
				);
			}
			this.updateDisplayedDistance(true, this.state.visible);
		}
	}

	public setDisplayedDistance(newDistance: number) {
		this.state.displayDistance = newDistance;
		if (!this.state.disableWatchDistance) {
			this.updateDisplaySlider(false, this.visible);
		}
	}

	public setDisplayedAxis(newAxis: string) {
		this.state.displayedAxis = newAxis;
		if (!this.state.disableWatchAxis) {
			this.updateDisplayedDistance(false, this.state.visible);
		}

		if (newAxis !== "") {
			this.state.normal = null;
		}

		this.state.disableWatchAxis = false;
	}

	public setSliderPosition(newPosition: number) {
		this.state.sliderPosition = newPosition;
		if (!this.state.disableWatchSlider) {
			this.updateDisplayedDistance(false, this.state.visible);
		}

		this.state.disableWatchSlider = false;
	}

	public setShow(newValue: boolean) {
		if (newValue !== undefined && newValue !== null) {
			this.state.visible = newValue;
		}
	}

	public updateClippingPlaneByModel(account?: string, model?: string) {

		const scaler = this.getScaler(this.state.modelUnits, this.state.units);
		const params = {
			account,
			model,
			clippingPlanes: [{
				clipDirection: this.state.direction ? 1 : -1,
				distance: this.state.displayDistance * scaler,
				normal: this.getNormal(),
			}],
			fromClipPanel: true,
		};

		this.updateClippingPlane(params);

		// this.EventService.send(
		// 	this.EventService.EVENT.VIEWER.UPDATE_CLIPPING_PLANES,
		// 	event,
		// );

	}

	public updateClippingPlane(params: any) {
		if (!params.fromClipPanel) {
			const clip = params.clippingPlanes[0];
			if (clip) {
				// this.visible = true;
				this.setDisplayValues(
					this.determineAxis(clip.normal),
					clip.distance,
					false,
					clip.clipDirection === 1,
					undefined,
				);
				this.updateDisplayedDistance(true, this.state.visible);
			} else {
				this.reset();
				this.ViewerService.clearClippingPlanes();
			}
		}

		this.ViewerService.updateClippingPlanes(params);
	}

	/**
	 * Determine axis based on normal provided
	 */
	public determineAxis(normal) {
		let res = null;
		if (normal.length === 3) {
			if (normal[1] === 0  && normal[2] === 0) {
				res = "X";
			} else if (normal[0] === 0 && normal[2] === 0) {
				res = "Z";
			} else if (normal[0] === 0 && normal[1] === 0) {
				res = "Y";
			}
		}

		if(!res) {
			this.state.normal = normal;
		}

		return res;
	}

	public reset() {
		const minMax = this.getMinMax();
		const scaler = this.getScaler(this.state.units, this.state.modelUnits);
		const dist = minMax.max * scaler;
		this.setDisplayValues(this.state.displayedAxis, dist, false, false, true);
	}

	/**
	 * Initialise display values
	 * This is called when we know the bounding box of our model
	 */
	public setDisplayValues(axis: string, distance: any, moveClip: boolean, direction: boolean, slider: any) {
		const scaler = this.getScaler(this.state.units, this.state.modelUnits);
		const newDistance = parseFloat(distance) * scaler;

		// We only want to disable watch if the value is going to change.
		// Otherwise we might be ignoring the next update.
		this.disableWatchAxis =  this.state.displayedAxis !== axis;
		this.disableWatchDistance = this.state.displayDistance !== newDistance;
		this.disableWatchSlider = this.state.disableWatchDistance && axis !== null;

		this.state.displayDistance = newDistance;
		this.state.direction = direction;
		if (axis) {
			this.state.displayedAxis = axis;
		} else {
			this.state.displayedAxis = "";
		}

		if (slider) {
			this.state.sliderPosition = slider;
			if (moveClip) {
				this.updateClippingPlaneByModel();
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
		if (this.state.normal) {
			normal = this.state.normal;
		} else if (this.state.displayedAxis) {
			if (this.state.displayedAxis === "Y") {
				normal = [0, 0, -1]; // Unity has flipped Z axis
			} else if (this.state.displayedAxis === "Z") {
				normal = [0, -1, 0];
			}
		}

		return normal;

	}

	public increment(percentage) {

		const minMax = this.getMinMax();
		const scaler = this.getScaler(this.state.units, this.state.modelUnits);
		const size = (minMax.max - minMax.min) * scaler;

		this.updateDistance( -(size * percentage) );
	}

	public decrement(percentage) {

		const minMax = this.getMinMax();
		const scaler = this.getScaler(this.state.units, this.state.modelUnits);
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
		this.state.displayDistance = parseFloat(this.state.displayDistance) + amount;
		this.cleanDisplayDistance();
		this.updateDisplaySlider(false, true);
	}

	/**
	 * Update displayed Distance based on slider position and axis
	 */
	public updateDisplayedDistance(updateSlider, moveClip) {
		if(this.state.normal) {
			return;
		}
		const minMax = this.getMinMax();
		const max = minMax.max;
		const min = minMax.min;

		const percentage = 1 - this.state.sliderPosition / 100;

		if (!updateSlider) {
			this.state.disableWatchDistance = true;
		}

		const scaler = this.getScaler(this.state.units, this.state.modelUnits);
		const newDistance = parseFloat((min + (Math.abs(max - min) * percentage))) * scaler;

		if (!isNaN(newDistance)) {
			this.state.displayDistance = newDistance;
			if (moveClip) {
				this.updateClippingPlaneByModel();
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
		const notMetric = !this.handleMetric(this.state.modelUnits);
		return unit === "ft" && notMetric;
	}

	/**
	 * Update display slider based on current internal distance
	 */
	public updateDisplaySlider(updateDistance, moveClip) {
		if (this.state.normal) {
			return;
		}
		const minMax = this.getMinMax();
		const max = minMax.max;
		const min = minMax.min;

		const scaler = this.getScaler(this.state.modelUnits, this.state.units);

		const percentage = ((this.state.displayDistance * scaler) - min) / ( Math.abs(max - min));

		if (!updateDistance) {
			this.state.disableWatchSlider = true;
		}

		let value = (1.0 - percentage) * 100;
		if (percentage > 100 || value < 0) {
			value = 0;
		}
		if (percentage < 0 || value > 100) {
			value = 100;
		}
		this.state.sliderPosition = value;

		if (moveClip) {
			this.updateClippingPlaneByModel();
		}

	}

	public getMinMax(): any {
		let min = 0;
		let max = 0;

		if (this.state.bbox) {
			if (this.state.displayedAxis === "X") {
				min = this.state.bbox.min[0];
				max = this.state.bbox.max[0];
			} else if (this.state.displayedAxis === "Y") {
				min = this.state.bbox.min[2];
				max = this.state.bbox.max[2];
			} else if (this.state.displayedAxis === "Z") {
				min = this.state.bbox.min[1];
				max = this.state.bbox.max[1];
			}
		}

		return {
			min,
			max,
		};
	}

	public cleanDisplayDistance() {
		const minMax = this.getMinMax();
		const scaler = this.getScaler(this.state.units, this.state.modelUnits);

		const scaledMin = minMax.min * scaler;
		const scaledMax = minMax.max * scaler;

		if (isNaN(this.state.displayDistance) && scaledMin) {
			this.state.displayDistance = scaledMin;
			return;
		}

		if (minMax.max && this.state.displayDistance > scaledMax) {
			this.state.displayDistance = scaledMax;
			return;
		}

		if (minMax.min && this.state.displayDistance < scaledMin) {
			this.state.displayDistance = scaledMin;
			return;
		}

	}

	public initClip(modelUnits) {
		console.log("initClip", modelUnits);
		this.state.modelUnits = modelUnits;
		this.state.units = modelUnits;
		this.updateDisplayedDistance(true, this.state.visible);
	}

}

export const ClipServiceModule = angular
	.module("3drepo")
	.service("ClipService", ClipService);
