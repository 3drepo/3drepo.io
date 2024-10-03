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

import { useEffect, useState } from 'react';
import { DrawingViewerService, DRAWING_VIEWER_EVENTS } from './drawingViewer.service';
import { Coord2D } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';

const useViewerEventEffect = <T>(event:string, callback:(params:T ) => void, deps) => {
	useEffect(() => {
		DrawingViewerService.on(event, callback);
		return () => {
			DrawingViewerService.off(event, callback);
		};

	}, deps);
};

const useViewerEventValue = <T>(event:string, defaultValue) => {
	const [value, setValue] = useState<T>(defaultValue);
	useViewerEventEffect(event, setValue, []);
	return value;
};

export const useMousePosition = () => useViewerEventValue<Coord2D>(DRAWING_VIEWER_EVENTS.MOUSE_CHANGED, DrawingViewerService.getMousePosition());

export const useScale = () => useViewerEventValue<number>(DRAWING_VIEWER_EVENTS.SCALE_CHANGED, DrawingViewerService.getScale());
export const useSnapping = () => useViewerEventValue<boolean>(DRAWING_VIEWER_EVENTS.SNAPPING_CHANGED, DrawingViewerService.getSnapping());

export const useClickEffect = (callback:(params: Coord2D) => void, deps?) => useViewerEventEffect<Coord2D>(DRAWING_VIEWER_EVENTS.MOUSE_CLICK, callback, deps);
