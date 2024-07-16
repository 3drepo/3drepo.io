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
import { CalibrationContext } from '../../calibrationContext';
import { PlaneType, Vector1D } from '../../calibration.types';
import { TreeActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { isNull, some } from 'lodash';
import { ModelHooksSelectors } from '@/v5/services/selectorsHooks';
import { UNITS_CONVERSION_FACTORS_TO_METRES, addVectors, getTransformationMatrix, getXYPlane, subtractVectors, transformAndTranslate } from '../../calibration.helpers';

export const VerticalSpatialBoundariesHandler = () => {
	const { verticalPlanes, setVerticalPlanes, vector3D, vector2D, isCalibratingPlanes, setIsCalibratingPlanes, drawingId,
		setSelectedPlane, selectedPlane, isAlignPlaneActive, setIsAlignPlaneActive } = useContext(CalibrationContext);

	// create element of the drawing to be passed to unity
	const i = new Image();
	i.crossOrigin = 'anonymous';
	i.src = getDrawingImageSrc(drawingId);

	const imageHeight = i.naturalHeight;
	const imageWidth = i.naturalWidth;
	
	const vector3DPlane = getXYPlane(vector3D);
	const tMatrix = getTransformationMatrix(vector2D, vector3DPlane);
	const modelUnit = ModelHooksSelectors.selectUnit();
	
	useEffect(() => {
		if (isCalibratingPlanes && !some(verticalPlanes, isNull)) {
			Viewer.setCalibrationToolMode(isCalibratingPlanes ? 'Vertical' : 'None');
			Viewer.on(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
			return () => {
				Viewer.setCalibrationToolMode('None');
				Viewer.off(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
			};
		}
	}, [isCalibratingPlanes, verticalPlanes]);

	useEffect(() => {
		Viewer.setCalibrationToolVerticalPlanes(verticalPlanes[0], verticalPlanes[1]);
	}, [verticalPlanes]);

	useEffect(() => {
		if (isAlignPlaneActive) {
			const onPickPoint = ({ position }) => {
				const initialRange = UNITS_CONVERSION_FACTORS_TO_METRES[modelUnit] * 2.5;
				const zCoord = position[1];
				if (selectedPlane === PlaneType.LOWER) {
					if (verticalPlanes[1] && zCoord > verticalPlanes[1]) return;
					if (isNull(verticalPlanes[1])) {
						setVerticalPlanes([ zCoord, zCoord + initialRange ]);
						setSelectedPlane(PlaneType.UPPER);
						return;
					}
				}
				if (selectedPlane === PlaneType.UPPER) {
					if (verticalPlanes[0] && zCoord < verticalPlanes[0]) return;
					if (isNull(verticalPlanes[0])) {
						setVerticalPlanes([ zCoord - initialRange, zCoord ]);
						setSelectedPlane(PlaneType.LOWER);
						return;
					}
				}
				const newValues = verticalPlanes.map((oldValue, idx) => {
					if (selectedPlane === PlaneType.LOWER && idx === 0) return zCoord;
					if (selectedPlane === PlaneType.UPPER && idx === 1) return zCoord;
					return oldValue;
				}) as Vector1D;
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
		if (selectedPlane === PlaneType.LOWER && verticalPlanes[0]) {
			Viewer.selectCalibrationToolLowerPlane();
		} else if (selectedPlane === PlaneType.UPPER && verticalPlanes[1]) {
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
