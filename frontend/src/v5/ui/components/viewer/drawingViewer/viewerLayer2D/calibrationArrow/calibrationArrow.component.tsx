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
import { CalibrationContext } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationContext';
import { useContext, useEffect, useState } from 'react';
import { Arrow } from '../arrow/arrow.component';
import { DRAWING_VIEWER_EVENTS, DrawingViewerService } from '../../drawingViewer.service';
import { EMPTY_VECTOR } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.constants';
import { isEqual } from 'lodash';

export const CalibrationArrow = ({ scale }) => {
	const { isCalibrating2D,  vector2D, setVector2D } = useContext(CalibrationContext);
	const [offsetStart, setOffsetStart] = useState<Coord2D>(vector2D[0]);
	const [offsetEnd, setOffsetEnd] = useState<Coord2D>(vector2D[1]);

	useEffect(() => {
		const onPositionChanged = ({ drawingPosition }) => {
			if (offsetStart && !vector2D[1]) {
				setOffsetEnd(drawingPosition);
			}
		};

		const onClickPoint = ({ drawingPosition }) => {
			if (!isCalibrating2D) return;

			if (offsetEnd || (!offsetEnd && !offsetStart)) {
				setOffsetEnd(null);
				setOffsetStart(drawingPosition);
				setVector2D(EMPTY_VECTOR);
			} else if (!isEqual(offsetStart, drawingPosition)) {
				setOffsetEnd(drawingPosition);
				setVector2D?.([offsetStart, drawingPosition]);
			}
		};

		DrawingViewerService.on(DRAWING_VIEWER_EVENTS.POINT_POSITION, onPositionChanged);
		DrawingViewerService.on(DRAWING_VIEWER_EVENTS.PICK_POINT, onClickPoint);

		return () => {
			DrawingViewerService.off(DRAWING_VIEWER_EVENTS.POINT_POSITION, onPositionChanged);
			DrawingViewerService.off(DRAWING_VIEWER_EVENTS.PICK_POINT, onClickPoint);
		};
	}, [isCalibrating2D, vector2D, offsetStart]);

	const resetArrow = () => {
		setOffsetStart(null);
		setOffsetEnd(null);
	};

	useEffect(() => {
		if (!isCalibrating2D && !offsetEnd) {
			resetArrow();
		}

		DrawingViewerService.setSnapping(isCalibrating2D);
	}, [isCalibrating2D]);



	if (!offsetStart) return null;
	return (<Arrow start={offsetStart} end={offsetEnd || offsetStart} scale={scale} />);
};