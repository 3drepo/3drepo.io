/**
 *  Copyright (C) 2024 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Coord2D } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';
import { EventEmitter } from 'eventemitter3';
import { domToPng } from 'modern-screenshot';

export const DRAWING_VIEWER_EVENTS = {
	MOUSE_CLICK: 'MOUSE_CLICK',
	MOUSE_CHANGED: 'MOUSE_CHANGED',
	SCALE_CHANGED: 'SCALE_CHANGED',
	SNAPPING_CHANGED: 'SNAPPING_CHANGED',
	CLICK_POINT: 'CLICK_POINT',
};

type GetScreenshot = () => null | Promise<string>;
const DrawingViewerServiceCreator = () => {
	let imgContainer = null;
	let mousePosition = [0,  0];
	let scale = 1;
	let snapping = false;

	const emitter = new EventEmitter();
	const on = emitter.on.bind(emitter);
	const off = emitter.off.bind(emitter);
	const emit = emitter.emit.bind(emitter);

	const getScreenshot: GetScreenshot = () => imgContainer ? domToPng(imgContainer) : null;
	const setImgContainer = (newImgContainer) => { imgContainer = newImgContainer; };
	
	const setMousePosition = (mp: Coord2D) => {
		mousePosition = mp ; 
		emit(DRAWING_VIEWER_EVENTS.MOUSE_CHANGED, mp);
	};

	const emitMouseClickEvent = (mp: Coord2D) => {
		setMousePosition(mp); 
		emit(DRAWING_VIEWER_EVENTS.MOUSE_CLICK, mp);
	};

	// This is use for the click in 3d coordinates within a calibrated drawing 
	const emitClickPointEvent = (mp) => {
		emit(DRAWING_VIEWER_EVENTS.CLICK_POINT, mp);
	};

	const setScale = (sc: number) => { 
		scale = sc ;
		emit(DRAWING_VIEWER_EVENTS.SCALE_CHANGED, sc); 
	};

	const setSnapping = (sp: boolean) =>{
		snapping = sp ;
		emit(DRAWING_VIEWER_EVENTS.SNAPPING_CHANGED, sp);
	};

	const getClickPoint = () => {
		return new Promise((accept) => {
			setSnapping(true);
			on(DRAWING_VIEWER_EVENTS.CLICK_POINT, (point) => {
				setSnapping(false);
				accept(point);
			});
		});
	};

	return {
		getScreenshot,
		setImgContainer,
		emitMouseClickEvent,
		emitClickPointEvent,
		setMousePosition,
		setScale,
		setSnapping,
		getMousePosition: () => mousePosition,
		getScale: () => scale,
		getSnapping: () => snapping,
		getClickPoint,
		on,
		off,
	};
};
export const DrawingViewerService = DrawingViewerServiceCreator();