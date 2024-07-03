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
import { Viewer, Viewer as ViewerService } from '@/v4/services/viewer/viewer';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { getDrawingImageSrc } from '@/v5/store/drawings/drawings.helpers';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { ViewerCanvasesContext } from '@/v5/ui/routes/viewer/viewerCanvases.context';
import { isNull } from 'lodash';
import { CalibrationHooksSelectors } from '@/v5/services/selectorsHooks';
import { CalibrationActionsDispatchers } from '@/v5/services/actionsDispatchers';

export const VerticalSpatialBoundariesHandler = () => {
	const [drawingId] = useSearchParam('drawingId');
	const step = CalibrationHooksSelectors.selectStep();
	const isVerticallyCalibrating = CalibrationHooksSelectors.selectIsCalibratingPlanes();
	const planesValues = CalibrationHooksSelectors.selectPlanesValues();
	const { open2D, close2D } = useContext(ViewerCanvasesContext);
	const isValid = !isNull(planesValues.lower) && !isNull(planesValues.upper);

	const u = 8000;

	const i = new Image();
	i.crossOrigin = 'anonymous';
	i.src = getDrawingImageSrc(drawingId);

	useEffect(() => {
		if (!isVerticallyCalibrating) return;
		Viewer.setCalibrationToolMode(isVerticallyCalibrating ? 'Vertical' : 'None');
		Viewer.setCalibrationToolDrawing(i, [0, 0, u, 0, 0, -u]);
		close2D();
		Viewer.on(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, CalibrationActionsDispatchers.setPlanesValues);
		return () => {
			Viewer.setCalibrationToolMode('None');
			Viewer.setCalibrationToolDrawing(null, [0, 0, 0, 0, 0, 0]);
			open2D(drawingId);
			Viewer.off(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, CalibrationActionsDispatchers.setPlanesValues);
		};
	}, [isVerticallyCalibrating]);

	useEffect(() => {
		CalibrationActionsDispatchers.setIsStepValid(true);
	}, [isValid]);
	
	useEffect(() => {
		if (step !== 2) return;
		close2D();
		ViewerService.setCalibrationToolMode('Vertical');
		return () => open2D(drawingId);
	}, [step]);

	return null;
};
