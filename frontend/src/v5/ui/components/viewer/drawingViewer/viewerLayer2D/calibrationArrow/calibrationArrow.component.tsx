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
import { DrawingViewerService } from '../../drawingViewer.service';
import { EMPTY_VECTOR } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.constants';
import { isEqual } from 'lodash';
import { useClickEffect, useScale } from '../../drawingViewer.service.hooks';

export const CalibrationArrow = () => {
	const { isCalibrating2D,  vector2D, setVector2D } = useContext(CalibrationContext);
	const [offsetStart, setOffsetStart] = useState<Coord2D>(vector2D[0]);
	const [offsetEnd, setOffsetEnd] = useState<Coord2D>(vector2D[1]);
	const scale = useScale();

	useClickEffect((position) => {
		if (!isCalibrating2D) return;

		if (offsetEnd || (!offsetEnd && !offsetStart)) {
			setOffsetEnd(null);
			setOffsetStart(position);
			setVector2D(EMPTY_VECTOR);
		} else if (!isEqual(offsetStart, position)) {
			setOffsetEnd(position);
			setVector2D?.([offsetStart, position]);
		}
	}, [offsetEnd, offsetStart, isCalibrating2D]);

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