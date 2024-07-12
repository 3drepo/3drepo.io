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
import { Viewer } from '@/v4/services/viewer/viewer';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { getDrawingImageSrc } from '@/v5/store/drawings/drawings.helpers';
import { addVectors, flipYAxis, getTransformationMatrix, getXYPlane, subtractVectors, transformAndTranslate } from '../../calibrationHelpers';
import { CalibrationContext } from '../../calibrationContext';
import { PlaneType } from '../../calibration.types';

export const VerticalSpatialBoundariesHandler = () => {
	const { setVerticalPlanes, vector3D, vector2D,
		isCalibratingPlanes, setIsCalibratingPlanes, drawingId, selectedPlane } = useContext(CalibrationContext);

	const i = new Image();
	i.crossOrigin = 'anonymous';
	i.src = getDrawingImageSrc(drawingId);

	const imageHeight = i.naturalHeight;
	const imageWidth = i.naturalWidth;

	const modelVector = getXYPlane(vector3D).map(flipYAxis); // TODO why is y flipped? 
	const drawingVector = vector2D.map(flipYAxis);
	const tMatrix = getTransformationMatrix(drawingVector, modelVector);
	
	useEffect(() => {
		Viewer.setCalibrationToolMode(isCalibratingPlanes ? 'Vertical' : 'None');
		if (!isCalibratingPlanes) return;
		Viewer.on(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
		return () => Viewer.off(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
	}, [isCalibratingPlanes]);

	useEffect(() => {
		if (!imageHeight || !imageWidth) return;
	
		const [xmin, ymin] = subtractVectors(drawingVector[0], [0, -imageHeight]); // !working
		const [xmax, ymax] = addVectors([xmin, ymin], [imageWidth, imageHeight]);

		// transform corners of drawing. Adding offset of model vector
		const bottomRight = transformAndTranslate([xmax, -ymin], tMatrix, modelVector[0]); // TODO why minuses?
		const topLeft = transformAndTranslate([xmin, -ymax], tMatrix, modelVector[0]);
		const bottomLeft = transformAndTranslate([xmin, -ymin], tMatrix, modelVector[0]);

		const imageDimensions = [ ...bottomLeft, ...bottomRight, ...topLeft];
		Viewer.setCalibrationToolDrawing(i, imageDimensions);
		return () => Viewer.setCalibrationToolDrawing(null, imageDimensions);
	}, [imageHeight, imageWidth]);

	useEffect(() => {
		if (selectedPlane === PlaneType.LOWER) {
			Viewer.selectCalibrationToolLowerPlane();
		} else {
			Viewer.selectCalibrationToolUpperPlane();
		}
	}, [selectedPlane]);
	
	useEffect(() => {
		setIsCalibratingPlanes(true);
		return () => setIsCalibratingPlanes(false);
	}, []);

	return null;
};
