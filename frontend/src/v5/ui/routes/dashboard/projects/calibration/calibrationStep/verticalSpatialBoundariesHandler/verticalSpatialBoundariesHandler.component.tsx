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
import { addVectors, getTransformationMatrix, subtractVectors, transformAndTranslate } from '../../calibrationHelpers';

export const VerticalSpatialBoundariesHandler = () => {
	const [drawingId] = useSearchParam('drawingId');
	const step = CalibrationHooksSelectors.selectStep();
	const isVerticallyCalibrating = CalibrationHooksSelectors.selectIsCalibratingPlanes();
	const planesValues = CalibrationHooksSelectors.selectPlanesValues();
	const { open2D, close2D } = useContext(ViewerCanvasesContext);
	const isValid = !isNull(planesValues.lower) && !isNull(planesValues.upper);

	const i = new Image();
	i.crossOrigin = 'anonymous';
	i.src = getDrawingImageSrc(drawingId || 'dc1844d3-draw-4727-8187-6baef0e70957');

	const imageHeight = i.naturalHeight;
	const imageWidth = i.naturalWidth;

	const vector3DRaw = CalibrationHooksSelectors.selectModelCalibration();
	const vector3D = { start: [vector3DRaw.start[0], -vector3DRaw.start[2]],  end: [vector3DRaw.end[0], -vector3DRaw.end[2]] }; // TODO why is y flipped? 
	const vector2DRaw = CalibrationHooksSelectors.selectDrawingCalibration();
	const vector2D = { start: [vector2DRaw.start[0] - imageWidth / 2, imageHeight / 2 - vector2DRaw.start[1]],
		end: [vector2DRaw.end[0] - imageWidth / 2, imageHeight / 2 - vector2DRaw.end[1]] }; // !working
	const tMatrix = getTransformationMatrix(vector2D, vector3D);
	
	useEffect(() => {
		if (!isVerticallyCalibrating) return;
		Viewer.setCalibrationToolMode(isVerticallyCalibrating ? 'Vertical' : 'None');
		Viewer.on(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, CalibrationActionsDispatchers.setPlanesValues);
		return () => {
			Viewer.setCalibrationToolMode('None');
			Viewer.setCalibrationToolDrawing(null, [0, 0, 0, 0, 0, 0]);
			Viewer.off(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, CalibrationActionsDispatchers.setPlanesValues);
		};
	}, [isVerticallyCalibrating]);

	useEffect(() => {
		CalibrationActionsDispatchers.setIsStepValid(true);
	}, [isValid]);

	useEffect(() => {
		if (!imageHeight || !imageWidth) return;
	
		const [xmin, ymin] = subtractVectors(vector2D.start, [-imageWidth / 2, -imageHeight / 2]); // !working
		const [xmax, ymax] = addVectors([xmin, ymin], [imageWidth, imageHeight]);

		// transform corners of drawing. Adding offset of model vector
		const bottomRight = transformAndTranslate([xmax, -ymin], tMatrix, vector3D.start); // TODO why minuses?
		const topLeft = transformAndTranslate([xmin, -ymax], tMatrix, vector3D.start);
		const bottomLeft = transformAndTranslate([xmin, -ymin], tMatrix, vector3D.start);

		const imageDimensions = [ ...bottomLeft, ...bottomRight, ...topLeft];
		Viewer.setCalibrationToolDrawing(i, imageDimensions);
	}, [imageHeight + imageWidth, tMatrix]);
	
	useEffect(() => {
		if (step !== 2) return;
		ViewerService.setCalibrationToolMode('Vertical');
		return () => open2D(drawingId);
	}, [step]);

	return null;
};
