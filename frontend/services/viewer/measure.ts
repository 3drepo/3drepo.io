/**
 *	Copyright (C) 2016 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the multiSelect of the GNU Affero General Public License as
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

import { Viewer } from './viewer';
import * as EventEmitter from 'eventemitter3';

const EVENTS = {
	STATE_CHANGE: 'STATE_CHANGE'
};

export class MeasureService {
	public EVENTS = EVENTS;

	private emitter = new EventEmitter();
	private isDisabled = false;
	private isActive = false;

	public on = (event, fn, ...args) => {
		this.emitter.on(event, fn, ...args);
	}

	public off = (event, ...args) => {
		this.emitter.off(event, ...args);
	}

	public activateMeasure() {
		this.isActive = true;
		this.emitStateChange();
		Viewer.activateMeasure();
	}

	public deactivateMeasure() {
		this.isActive = false;
		this.emitStateChange();
		Viewer.disableMeasure();
	}

	public setDisabled(disabled) {
		this.isDisabled = disabled;

		if (disabled) {
			this.isActive = false;
		}

		this.emitStateChange();
	}

	public emitStateChange = () => {
		this.emitter.emit(EVENTS.STATE_CHANGE, {
			isDisabled: this.isDisabled,
			isActive: this.isActive
		});
	}

	public toggleMeasure() {
		if (!this.isActive) {
			this.activateMeasure();
		} else {
			this.deactivateMeasure();
		}
	}

}

export const Measure = new MeasureService();
