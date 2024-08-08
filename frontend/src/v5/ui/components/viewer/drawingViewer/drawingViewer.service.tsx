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

import { Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { EventEmitter } from 'eventemitter3';
import { domToPng } from 'modern-screenshot';

export const DRAWING_VIEWER_EVENTS = {
	PICK_POINT: 'PICK_POINT',
};

type GetScreenshot = () => null | Promise<string>;
const DrawingViewerServiceCreator = () => {
	let imgContainer = null;
	const emitter = new EventEmitter();

	const on = (event, fn, ...args) => emitter.on(event, fn, ...args);
	const emit = (event, ...args) => emitter.emit(event, ...args);

	const getScreenshot: GetScreenshot = () => imgContainer ? domToPng(imgContainer) : null;
	const setImgContainer = (newImgContainer) => { imgContainer = newImgContainer; };
	
	const emitPickPointEvent = (position) => emit(DRAWING_VIEWER_EVENTS.PICK_POINT, position);

	const getClickPoint = async () => {
		return new Promise(async (resolve) => {
			ViewerService.getClickPoint().finally(() => resolve(undefined));
			on(DRAWING_VIEWER_EVENTS.PICK_POINT, resolve);
		});
	};

	return {
		getScreenshot,
		setImgContainer,
		emitPickPointEvent,
		getClickPoint,
	};
};
export const DrawingViewerService = DrawingViewerServiceCreator();
