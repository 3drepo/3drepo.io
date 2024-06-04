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

import { useContext, useEffect } from 'react';
import { CalibrationContext } from '../calibrationContext';
import { Calibration3DStep } from './calibration3DStep/calibration3DStep.component';
import { Calibration2DStep } from './calibration2DStep/calibration2DStep.component';
import { VerticalSpatialBoundariesStep } from './verticalSpatialBoundariesStep/verticalSpatialBoundariesStep.component';
import { ViewerCanvasesContext } from '@/v5/ui/routes/viewer/viewerCanvases.context';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';

export const CalibrationStep = () => {
	const { step, origin } = useContext(CalibrationContext);
	const { open2D, close2D } = useContext(ViewerCanvasesContext);
	const show2DViewer = step < 2;
	const [drawing] = useSearchParam('drawingId');

	useEffect(() => {
		if (show2DViewer) open2D(drawing);
		else close2D();
	}, [show2DViewer]);

	useEffect(() => () => {
		if (!origin.includes('?drawingId')) close2D();
	});

	switch (step) {
		case 0: return <Calibration3DStep />;
		case 1: return <Calibration2DStep />;
		default: return <VerticalSpatialBoundariesStep />;
	}
};
