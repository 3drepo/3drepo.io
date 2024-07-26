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

import { useContext, useEffect, useMemo } from 'react';
import { Viewer } from '@/v4/services/viewer/viewer';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { getDrawingImageSrc } from '@/v5/store/drawings/drawings.helpers';
import { CalibrationContext } from '../../calibrationContext';
import { PlaneType } from '../../calibration.types';
import { TreeActionsDispatchers, ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { getTransformationMatrix, removeZ } from '../../calibration.helpers';
import { Vector2 } from 'three';
import { isNull } from 'lodash';

export const VerticalSpatialBoundariesHandler = () => {
	const { verticalPlanes, setVerticalPlanes, vector3D, vector2D, isCalibratingPlanes, setIsCalibratingPlanes, drawingId,
		setSelectedPlane, selectedPlane, isAlignPlaneActive, setIsAlignPlaneActive } = useContext(CalibrationContext);

	// create element of the drawing to be passed to unity
	const i = new Image();
	i.crossOrigin = 'anonymous';
	i.src = getDrawingImageSrc(drawingId);

	const imageHeight = i.naturalHeight;
	const imageWidth = i.naturalWidth;
	
	const drawVecStart = new Vector2(...vector2D[0]);
	const drawVecEnd = new Vector2(...vector2D[1]);
	const modelVecStart = new Vector2(...removeZ(vector3D[0]));
	const modelVecEnd = new Vector2(...removeZ(vector3D[1]));
	const diff2D = new Vector2().subVectors(drawVecEnd, drawVecStart);
	const diff3D = new Vector2().subVectors(modelVecEnd, modelVecStart);

	const tMatrix = useMemo(() => getTransformationMatrix(diff2D, diff3D), [JSON.stringify({ diff2D, diff3D })]);
	
	useEffect(() => {
		if (isCalibratingPlanes) {
			Viewer.setCalibrationToolMode('Vertical');
			Viewer.on(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
			return () => {
				Viewer.setCalibrationToolMode('None');
				Viewer.off(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
			};
		}
	}, [isCalibratingPlanes]);

	useEffect(() => {
		if (isAlignPlaneActive) {
			const onPickPoint = (rest) => {
				Viewer.setCalibrationToolFloorToObject(rest.account, rest.model, rest.id);
				setSelectedPlane(PlaneType.UPPER);
				setIsAlignPlaneActive(false);
			};
			TreeActionsDispatchers.stopListenOnSelections();
			Viewer.on(VIEWER_EVENTS.OBJECT_SELECTED, onPickPoint);
			return () => {
				TreeActionsDispatchers.startListenOnSelections();
				Viewer.disableEdgeSnapping();
				Viewer.off(VIEWER_EVENTS.OBJECT_SELECTED, onPickPoint);
			};
		}
	}, [isAlignPlaneActive]);

	useEffect(() => {
		if (imageHeight && imageWidth) {
			const topLeft = drawVecStart.clone().negate(); // This applies the drawing vector offset
			const bottomRight = new Vector2(imageWidth, imageHeight).add(topLeft); // coord origin for drawing is at the top left
			const bottomLeft = new Vector2(topLeft.x, bottomRight.y);
			// transform points with transformation matrix, and then apply the model vector's offset
			[bottomLeft, bottomRight, topLeft].map((corner) => corner.applyMatrix3(tMatrix).add(modelVecStart));

			Viewer.setCalibrationToolDrawing(i, [...bottomLeft, ...bottomRight, ...topLeft]);
			return () => Viewer.setCalibrationToolDrawing(null, [...bottomLeft, ...bottomRight, ...topLeft]);
		}
	}, [imageHeight, imageWidth, tMatrix, JSON.stringify(drawVecStart)]);

	useEffect(() => {
		if (selectedPlane === PlaneType.LOWER) {
			Viewer.selectCalibrationToolLowerPlane();
		} else if (selectedPlane === PlaneType.UPPER) {
			Viewer.selectCalibrationToolUpperPlane();
		}
	}, [selectedPlane]);

	useEffect(() => {
		setIsCalibratingPlanes(true);
		setIsAlignPlaneActive(true);
		ViewerGuiActionsDispatchers.setClippingMode(null);

		if (!verticalPlanes.some(isNull)) Viewer.setCalibrationToolVerticalPlanes(...verticalPlanes);

		return () => setIsCalibratingPlanes(false);
	}, []);

	return null;
};
