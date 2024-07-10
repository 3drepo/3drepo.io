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
import { Calibration2DStep } from './calibration2DStep/calibration2DStep.component';
import { ViewerCanvasesContext } from '@/v5/ui/routes/viewer/viewerCanvases.context';
import { Calibration3DHandler } from './calibration3DHandler/calibration3DHandler.component';
import { CalibrationHooksSelectors } from '@/v5/services/selectorsHooks';
import { VerticalSpatialBoundariesHandler } from './verticalSpatialBoundariesHandler/verticalSpatialBoundariesHandler.component';

export const CalibrationStep = () => {
	const step = CalibrationHooksSelectors.selectStep();
	const { setLeftPanelRatio, open2D, close2D } = useContext(ViewerCanvasesContext);
	const drawingId = CalibrationHooksSelectors.selectDrawingId(); 

	useEffect(() => {
		setLeftPanelRatio(.5);
	}, []);

	useEffect(() => {
		if (step < 2) {
			open2D(drawingId || 'dc1844d3-draw-4727-8187-6baef0e70957');
		} else {
			close2D();
		}
	}, [step]);
	return (
		<>
			<Calibration3DHandler />
			{step === 1 && <Calibration2DStep />}
			{step === 2 && <VerticalSpatialBoundariesHandler />}
		</>
	);
};