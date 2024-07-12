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
import { ViewerCanvasesContext } from '@/v5/ui/routes/viewer/viewerCanvases.context';
import { isNull } from 'lodash';
import { addVectors, getTransformationMatrix, subtractVectors, transformAndTranslate } from '../../calibrationHelpers';
import { CalibrationContext } from '../../calibrationContext';
import { PlaneType, Vector2D } from '../../calibration.types';

export const VerticalSpatialBoundariesHandler = () => {
	const { setIsStepValid, setVerticalPlanes, vector3D: vector3DRaw, vector2D: vector2DRaw,
		isCalibratingPlanes, setIsCalibratingPlanes, verticalPlanes, drawingId, selectedPlane } = useContext(CalibrationContext);
	const { open2D } = useContext(ViewerCanvasesContext);
	const isValid = !isNull(verticalPlanes.lower) && !isNull(verticalPlanes.upper);

	const i = new Image();
	i.crossOrigin = 'anonymous';
	i.src = getDrawingImageSrc(drawingId);

	const imageHeight = i.naturalHeight;
	const imageWidth = i.naturalWidth;

	const vector3D: Vector2D = [[vector3DRaw[0][0], -vector3DRaw[0][2]], [vector3DRaw[1][0], -vector3DRaw[1][2]]]; // TODO why is y flipped? 
	const vector2D: Vector2D = [[vector2DRaw[0][0] - imageWidth / 2, imageHeight / 2 - vector2DRaw[0][1]],
		[vector2DRaw[1][0] - imageWidth / 2, imageHeight / 2 - vector2DRaw[1][1]]]; // !working
	const tMatrix = getTransformationMatrix(vector2D, vector3D);
	
	useEffect(() => {
		if (!isCalibratingPlanes) return;
		Viewer.setCalibrationToolMode(isCalibratingPlanes ? 'Vertical' : 'None');
		Viewer.on(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
		return () => {
			Viewer.setCalibrationToolMode('None');
			Viewer.setCalibrationToolDrawing(null, [0, 0, 0, 0, 0, 0]);
			Viewer.off(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
		};
	}, [isCalibratingPlanes]);

	useEffect(() => {
		setIsStepValid(true);
	}, [isValid]);

	useEffect(() => {
		if (!imageHeight || !imageWidth) return;
	
		const [xmin, ymin] = subtractVectors(vector2D[0], [-imageWidth / 2, -imageHeight / 2]); // !working
		const [xmax, ymax] = addVectors([xmin, ymin], [imageWidth, imageHeight]);

		// transform corners of drawing. Adding offset of model vector
		const bottomRight = transformAndTranslate([xmax, -ymin], tMatrix, vector3D[0]); // TODO why minuses?
		const topLeft = transformAndTranslate([xmin, -ymax], tMatrix, vector3D[0]);
		const bottomLeft = transformAndTranslate([xmin, -ymin], tMatrix, vector3D[0]);

		const imageDimensions = [ ...bottomLeft, ...bottomRight, ...topLeft];
		Viewer.setCalibrationToolDrawing(i, imageDimensions);
	}, [imageHeight + imageWidth, tMatrix]);

	useEffect(() => {
		if (selectedPlane === PlaneType.LOWER) {
			Viewer.selectCalibrationToolLowerPlane();
		} else {
			Viewer.selectCalibrationToolUpperPlane();
		}
	}, [selectedPlane]);
	
	useEffect(() => {
		ViewerService.setCalibrationToolMode('Vertical');
		return () => open2D(drawingId);
	}, [step]);

	return null;
};
