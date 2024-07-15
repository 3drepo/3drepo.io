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
import { addVectors, getTransformationMatrix, getXYPlane, subtractVectors, transformAndTranslate } from '../../calibrationHelpers';
import { CalibrationContext } from '../../calibrationContext';
import { PlaneType } from '../../calibration.types';
import { TreeActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { isNull } from 'lodash';

export const VerticalSpatialBoundariesHandler = () => {
	const { verticalPlanes, setVerticalPlanes, vector3D, vector2D, isCalibratingPlanes, setIsCalibratingPlanes, drawingId,
		setSelectedPlane, selectedPlane, isAlignPlaneActive, setIsAlignPlaneActive } = useContext(CalibrationContext);

	// create pseudo-element of the drawing to be passed to unity
	const i = new Image();
	i.crossOrigin = 'anonymous';
	i.src = getDrawingImageSrc(drawingId);

	const imageHeight = i.naturalHeight;
	const imageWidth = i.naturalWidth;

	const vector3DPlane = getXYPlane(vector3D);
	const tMatrix = getTransformationMatrix(vector2D, vector3DPlane);
	
	useEffect(() => {
		if (isCalibratingPlanes) {
			Viewer.setCalibrationToolMode(isCalibratingPlanes ? 'Vertical' : 'None');
			Viewer.on(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
			return () => {
				Viewer.setCalibrationToolMode('None');
				Viewer.off(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
			};
		}
	}, [isCalibratingPlanes]);

	useEffect(() => {
		if (isAlignPlaneActive) {
			const onPickPoint = ({ position }) => {
				const zIndex = position[1];
				if (selectedPlane === PlaneType.LOWER) {
					if (zIndex > verticalPlanes[PlaneType.UPPER]) return;
					if (isNull(verticalPlanes[PlaneType.LOWER])) setSelectedPlane(PlaneType.UPPER);
				}
				if (selectedPlane === PlaneType.UPPER) {
					if (zIndex < verticalPlanes[PlaneType.LOWER]) return;
					if (isNull(verticalPlanes[PlaneType.UPPER])) {
						setSelectedPlane(null);
						setIsAlignPlaneActive(false);
					}
				}
				const newValues = { ...verticalPlanes, [selectedPlane]: zIndex };
				Viewer.setCalibrationToolVerticalPlanes(newValues);
				setVerticalPlanes(newValues);
			};
			TreeActionsDispatchers.stopListenOnSelections();
			Viewer.enableEdgeSnapping();
			Viewer.on(VIEWER_EVENTS.PICK_POINT, onPickPoint);
			return () => {
				TreeActionsDispatchers.startListenOnSelections();
				Viewer.disableEdgeSnapping();
				Viewer.off(VIEWER_EVENTS.PICK_POINT, onPickPoint);
			};
		}
	}, [isAlignPlaneActive, selectedPlane, verticalPlanes]);

	useEffect(() => {
		if (imageHeight && imageWidth) {
			const [xmin, ymin] = subtractVectors([0, 0], vector2D[0]);
			const [xmax, ymax] = addVectors([xmin, ymin], [imageWidth, imageHeight]);
	
			// transform corners of drawing. Adding offset of model vector
			const bottomRight = transformAndTranslate([xmax, ymax], tMatrix, vector3DPlane[0]);
			const topLeft = transformAndTranslate([xmin, ymin], tMatrix, vector3DPlane[0]);
			const bottomLeft = transformAndTranslate([xmin, ymax], tMatrix, vector3DPlane[0]);
	
			const imageDimensions = [ ...bottomLeft, ...bottomRight, ...topLeft];
			Viewer.setCalibrationToolDrawing(i, imageDimensions);
			return () => Viewer.setCalibrationToolDrawing(null, imageDimensions);
		}
	}, [imageHeight, imageWidth, tMatrix]);

	useEffect(() => {
		if (selectedPlane === PlaneType.LOWER && verticalPlanes[PlaneType.LOWER]) {
			Viewer.selectCalibrationToolLowerPlane();
		} else if (selectedPlane === PlaneType.UPPER && verticalPlanes[PlaneType.UPPER]) {
			Viewer.selectCalibrationToolUpperPlane();
		}
	}, [selectedPlane]);

	useEffect(() => {
		setSelectedPlane(PlaneType.LOWER);
		setIsCalibratingPlanes(true);
		setIsAlignPlaneActive(true);
		return () => setIsCalibratingPlanes(false);
	}, []);

	return null;
};
