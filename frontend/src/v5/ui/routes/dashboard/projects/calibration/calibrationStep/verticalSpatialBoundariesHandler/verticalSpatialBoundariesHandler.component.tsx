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

import { useContext, useEffect, useState } from 'react';
import { Viewer } from '@/v4/services/viewer/viewer';
import { VIEWER_EVENTS } from '@/v4/constants/viewer';
import { getDrawingImageSrc } from '@/v5/store/drawings/drawings.helpers';
import { CalibrationContext } from '../../calibrationContext';
import { PlaneType } from '../../calibration.types';
import { TreeActionsDispatchers, ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { getTransformationMatrix } from '../../calibration.helpers';
import { Vector2 } from 'three';
import { isNull } from 'lodash';
import { COLOR, hexToOpacity } from '@/v5/ui/themes/theme';

export const VerticalSpatialBoundariesHandler = () => {
	const { verticalPlanes, setVerticalPlanes, vector3D, vector2D, isCalibratingPlanes, setIsCalibratingPlanes, drawingId,
		setSelectedPlane, selectedPlane, isAlignPlaneActive, setIsAlignPlaneActive } = useContext(CalibrationContext);
	const [imageApplied, setImageApplied] = useState(false);
	const planesAreSet = !verticalPlanes.some(isNull);
	
	const applyImageToPlane = () => {
		if (imageApplied) return;

		const i = new Image();
		i.crossOrigin = 'anonymous';
		i.src = getDrawingImageSrc(drawingId);
		const tMatrix = getTransformationMatrix(vector2D, vector3D);
		i.onload = () => {
			const topLeft =  new Vector2(0, 0); 
			const bottomRight = new Vector2(i.naturalWidth, i.naturalHeight);
			const bottomLeft = new Vector2(0, bottomRight.y);
			// transform points with transformation matrix, and then apply the model vector's offset
			[bottomLeft, bottomRight, topLeft].map((corner) => corner.applyMatrix3(tMatrix));
	
			Viewer.setCalibrationToolDrawing(i, [...bottomLeft, ...bottomRight, ...topLeft]);
			Viewer.setCalibrationToolSelectedColors(hexToOpacity(COLOR.PRIMARY_MAIN_CONTRAST, 40), COLOR.PRIMARY_MAIN);
			Viewer.setCalibrationToolUnselectedColors(hexToOpacity(COLOR.PRIMARY_MAIN_CONTRAST, 20), COLOR.PRIMARY_MAIN_CONTRAST);
			Viewer.SetCalibrationToolOcclusionOpacity(0.5);
			setImageApplied(true);
		};
	};
	
	useEffect(() => {
		if (isCalibratingPlanes) {
			Viewer.setCalibrationToolMode(planesAreSet ? 'Vertical' : 'None');
			Viewer.on(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, setVerticalPlanes);
			if (planesAreSet) applyImageToPlane();
			return () => {
				Viewer.setCalibrationToolMode('None');
				Viewer.off(VIEWER_EVENTS.UPDATE_CALIBRATION_PLANES, () => { });
				Viewer.clipToolDelete();
			};
		}
	}, [isCalibratingPlanes, planesAreSet]);

	useEffect(() => {
		if (isAlignPlaneActive) {
			const onPickPoint = ({ account, model, id }) => {
				Viewer.setCalibrationToolFloorToObject(account, model, id);
				setSelectedPlane(PlaneType.UPPER);
				setIsAlignPlaneActive(false);
			};
			TreeActionsDispatchers.stopListenOnSelections();
			Viewer.on(VIEWER_EVENTS.OBJECT_SELECTED, onPickPoint);
			return () => {
				TreeActionsDispatchers.startListenOnSelections();
				Viewer.off(VIEWER_EVENTS.OBJECT_SELECTED, () => { });
			};
		}
	}, [isAlignPlaneActive]);

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
		Viewer.setCalibrationToolVerticalPlanes(...verticalPlanes);

		return () => {
			setIsCalibratingPlanes(false);
			Viewer.setCalibrationToolDrawing(null, [0, 0, 1, 0, 0, 1]);
		};
	}, []);

	return null;
};
