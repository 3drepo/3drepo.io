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

export type ImageSrcReference = {
	src: string,
	width?: number,
	height?: number,
};

type GetScreenshot = () => null | Promise<string>;
type GetDrawingSrc = () => Promise<ImageSrcReference>;
const DrawingViewerServiceCreator = () => {
	let imgContainer = null;
	let mousePosition = [0,  0];
	let scale = 1;
	let snapping = false;

	const emitter = new EventEmitter();
	const on = emitter.on.bind(emitter);
	const off = emitter.off.bind(emitter);
	const emit = emitter.emit.bind(emitter);

	// The following options for domToPng ensure consistency between the viewers;
	// restoreScrollPosition ensures renders take into account scrollLeft and
	// scrollTop of any scroll view elements. We also filter out the the camera
	// icons and other transient annotations.

	const getScreenshot: GetScreenshot = () => imgContainer ? domToPng(imgContainer, {
		features: {
			restoreScrollPosition: true,
		},
		filter: (el: HTMLElement) => { return el.id != 'viewerLayer2d' && el.id != 'viewerLayer2dCameraOffSight'; },
	} ) : null;

	const setImgContainer = (newImgContainer) => { imgContainer = newImgContainer; };

	// A callback that should be set by the viewer2d that resolves to a URL
	// representing the full image. This may a URI, or a Blob URL if the
	// viewer needs to rasterise the drawing.
	let waitForDrawingSrc: GetDrawingSrc = null;
	
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

			let pinDropped = false;

			const onClickPoint = (point) => {
				pinDropped = true;
				setSnapping(false);
				accept(point);
			};

			const onSnappingChanged = () => {
				off(DRAWING_VIEWER_EVENTS.CLICK_POINT, onClickPoint);
				off(DRAWING_VIEWER_EVENTS.SNAPPING_CHANGED, onSnappingChanged);

				if (!pinDropped) {
					accept(undefined);
				}
			};

			on(DRAWING_VIEWER_EVENTS.CLICK_POINT, onClickPoint);
			on(DRAWING_VIEWER_EVENTS.SNAPPING_CHANGED, onSnappingChanged);
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
		waitForDrawingSrc,
	};
};
export const DrawingViewerService = DrawingViewerServiceCreator();